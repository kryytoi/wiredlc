import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import type {
  OrderRecord,
  OrderStatus,
  SiteSettings,
  SubscriptionTier,
  UserRecord,
  UserRole,
} from '../types';
import type { CreateOrderInput, CreateUserInput, DatabaseAdapter } from './adapter';
import { createSeedUsersAndOrders, getDefaultSiteSettings } from './defaults';

type SqliteModule = typeof import('node:sqlite');

interface GlobalSqliteCache {
  __wiredlcSqliteDb?: InstanceType<SqliteModule['DatabaseSync']>;
  __wiredlcSqliteReady?: boolean;
  __wiredlcSqliteAvailable?: boolean;
}

const globalCache = globalThis as unknown as GlobalSqliteCache;

function loadSqliteModule(): SqliteModule | null {
  try {
    const req = createRequire(import.meta.url);
    return req('node:sqlite') as SqliteModule;
  } catch {
    return null;
  }
}

function resolveWritableDbPath(): string {
  // На Vercel/Serverless корень проекта /var/task открыт только для чтения, поэтому используем /tmp
  const isServerless = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.READ_ONLY_FS,
  );
  const dataDir = isServerless ? os.tmpdir() : path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'wiredlc.db');
}

export function isSqliteSupported(): boolean {
  if (typeof globalCache.__wiredlcSqliteAvailable === 'boolean') {
    return globalCache.__wiredlcSqliteAvailable;
  }
  try {
    const sqlite = loadSqliteModule();
    if (!sqlite?.DatabaseSync) {
      globalCache.__wiredlcSqliteAvailable = false;
      return false;
    }
    // Проверяем, что можно создать/открыть БД в выбранной директории
    getSqliteInstance();
    globalCache.__wiredlcSqliteAvailable = true;
    return true;
  } catch {
    globalCache.__wiredlcSqliteAvailable = false;
    return false;
  }
}

function getSqliteInstance() {
  if (!globalCache.__wiredlcSqliteDb) {
    const sqlite = loadSqliteModule();
    if (!sqlite?.DatabaseSync) {
      throw new Error('node:sqlite недоступен в текущей версии Node.js');
    }
    const db = new sqlite.DatabaseSync(resolveWritableDbPath());
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    globalCache.__wiredlcSqliteDb = db;
  }

  const db = globalCache.__wiredlcSqliteDb;
  if (!globalCache.__wiredlcSqliteReady) {
    initSchemaAndSeed(db);
    globalCache.__wiredlcSqliteReady = true;
  }
  return db;
}

function initSchemaAndSeed(db: InstanceType<SqliteModule['DatabaseSync']>) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      subscription_tier TEXT NOT NULL DEFAULT 'free',
      subscription_expires_at TEXT NULL,
      hwid TEXT NULL,
      hwid_resets_count INTEGER NOT NULL DEFAULT 0,
      discord_id TEXT NULL,
      discord_username TEXT NULL,
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_code TEXT NOT NULL,
      item_title TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'RUB',
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      note TEXT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_badge TEXT NOT NULL,
      hero_title TEXT NOT NULL,
      hero_subtitle TEXT NOT NULL,
      minecraft_version TEXT NOT NULL,
      loader_name TEXT NOT NULL,
      free_download_note TEXT NOT NULL,
      mandarin_note TEXT NOT NULL,
      support_telegram TEXT NOT NULL,
      support_discord TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const existingSettings = db.prepare('SELECT id FROM site_settings WHERE id = 1').get();
  if (!existingSettings) {
    const defaults = getDefaultSiteSettings();
    db.prepare(`
      INSERT INTO site_settings (
        id, hero_badge, hero_title, hero_subtitle, minecraft_version, loader_name,
        free_download_note, mandarin_note, support_telegram, support_discord, logo_url, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      1,
      defaults.heroBadge,
      defaults.heroTitle,
      defaults.heroSubtitle,
      defaults.minecraftVersion,
      defaults.loaderName,
      defaults.freeDownloadNote,
      defaults.mandarinNote,
      defaults.supportTelegram,
      defaults.supportDiscord,
      defaults.logoUrl,
      defaults.updatedAt,
    );
  }

  const userCountRow = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  if (userCountRow.cnt === 0) {
    const seed = createSeedUsersAndOrders();

    const insertUser = db.prepare(`
      INSERT INTO users (
        id, username, email, password_hash, role, subscription_tier,
        subscription_expires_at, hwid, hwid_resets_count, discord_id,
        discord_username, email_verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of seed.users) {
      insertUser.run(
        u.id,
        u.username,
        u.email,
        u.passwordHash,
        u.role,
        u.subscriptionTier,
        u.subscriptionExpiresAt,
        u.hwid,
        u.hwidResetsCount,
        u.discordId,
        u.discordUsername,
        u.emailVerified ? 1 : 0,
        u.createdAt,
      );
    }

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, user_id, item_code, item_title, amount, currency,
        payment_method, status, note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const o of seed.orders) {
      insertOrder.run(
        o.id,
        o.userId,
        o.itemCode,
        o.itemTitle,
        o.amount,
        o.currency,
        o.paymentMethod,
        o.status,
        o.note,
        o.createdAt,
      );
    }
  }
}

interface RawUserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  subscription_tier: string;
  subscription_expires_at: string | null;
  hwid: string | null;
  hwid_resets_count: number;
  discord_id: string | null;
  discord_username: string | null;
  email_verified: number;
  created_at: string;
}

interface RawOrderRow {
  id: string;
  user_id: string;
  user_email?: string;
  username?: string;
  item_code: string;
  item_title: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  note: string | null;
  created_at: string;
}

interface RawSettingsRow {
  id: number;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  minecraft_version: string;
  loader_name: string;
  free_download_note: string;
  mandarin_note: string;
  support_telegram: string;
  support_discord: string;
  logo_url: string;
  updated_at: string;
}

function mapUser(row: RawUserRow): UserRecord {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    subscriptionTier: row.subscription_tier as SubscriptionTier,
    subscriptionExpiresAt: row.subscription_expires_at,
    hwid: row.hwid,
    hwidResetsCount: row.hwid_resets_count,
    discordId: row.discord_id,
    discordUsername: row.discord_username,
    emailVerified: Boolean(row.email_verified),
    createdAt: row.created_at,
  };
}

function mapOrder(row: RawOrderRow): OrderRecord {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    username: row.username,
    itemCode: row.item_code as OrderRecord['itemCode'],
    itemTitle: row.item_title,
    amount: row.amount,
    currency: row.currency as OrderRecord['currency'],
    paymentMethod: row.payment_method as OrderRecord['paymentMethod'],
    status: row.status as OrderStatus,
    note: row.note,
    createdAt: row.created_at,
  };
}

function mapSettings(row: RawSettingsRow): SiteSettings {
  return {
    heroBadge: row.hero_badge,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    minecraftVersion: row.minecraft_version,
    loaderName: row.loader_name,
    freeDownloadNote: row.free_download_note,
    mandarinNote: row.mandarin_note,
    supportTelegram: row.support_telegram,
    supportDiscord: row.support_discord,
    logoUrl: row.logo_url,
    updatedAt: row.updated_at,
  };
}

export class SqliteAdapter implements DatabaseAdapter {
  async findUserById(id: string): Promise<UserRecord | null> {
    const db = getSqliteInstance();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as RawUserRow | undefined;
    return row ? mapUser(row) : null;
  }

  async findUserByEmailOrUsername(identifier: string): Promise<UserRecord | null> {
    const db = getSqliteInstance();
    const trimmed = identifier.trim();
    const row = db
      .prepare('SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1')
      .get(trimmed, trimmed) as RawUserRow | undefined;
    return row ? mapUser(row) : null;
  }

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    const db = getSqliteInstance();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (
        id, username, email, password_hash, role, subscription_tier,
        subscription_expires_at, hwid, hwid_resets_count, discord_id,
        discord_username, email_verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.username,
      input.email.toLowerCase(),
      input.passwordHash,
      input.role,
      input.subscriptionTier ?? 'free',
      input.subscriptionExpiresAt ?? null,
      input.hwid ?? null,
      0,
      input.discordId ?? null,
      input.discordUsername ?? null,
      0,
      createdAt,
    );

    const created = await this.findUserById(id);
    if (!created) throw new Error('Не удалось создать пользователя');
    return created;
  }

  async listUsers(): Promise<UserRecord[]> {
    const db = getSqliteInstance();
    const rows = db
      .prepare('SELECT * FROM users ORDER BY datetime(created_at) DESC')
      .all() as unknown as RawUserRow[];
    return rows.map(mapUser);
  }

  async updateUserSubscription(
    userId: string,
    tier: SubscriptionTier,
    expiresAt: string | null,
  ): Promise<UserRecord | null> {
    const db = getSqliteInstance();
    db.prepare(
      'UPDATE users SET subscription_tier = ?, subscription_expires_at = ? WHERE id = ?',
    ).run(tier, expiresAt, userId);
    return this.findUserById(userId);
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserRecord | null> {
    const db = getSqliteInstance();
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
    return this.findUserById(userId);
  }

  async resetUserHwid(userId: string, newHwid: string | null): Promise<UserRecord | null> {
    const db = getSqliteInstance();
    db.prepare(
      'UPDATE users SET hwid = ?, hwid_resets_count = hwid_resets_count + 1 WHERE id = ?',
    ).run(newHwid, userId);
    return this.findUserById(userId);
  }

  async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    const db = getSqliteInstance();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO orders (
        id, user_id, item_code, item_title, amount, currency,
        payment_method, status, note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.userId,
      input.itemCode,
      input.itemTitle,
      input.amount,
      input.currency,
      input.paymentMethod,
      input.status ?? 'pending',
      input.note ?? null,
      createdAt,
    );

    const row = db
      .prepare(`
        SELECT o.*, u.email as user_email, u.username as username
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.id = ?
      `)
      .get(id) as unknown as RawOrderRow | undefined;

    if (!row) throw new Error('Не удалось создать заказ');
    return mapOrder(row);
  }

  async listOrdersByUser(userId: string): Promise<OrderRecord[]> {
    const db = getSqliteInstance();
    const rows = db
      .prepare(`
        SELECT o.*, u.email as user_email, u.username as username
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.user_id = ?
        ORDER BY datetime(o.created_at) DESC
      `)
      .all(userId) as unknown as RawOrderRow[];
    return rows.map(mapOrder);
  }

  async listAllOrders(): Promise<OrderRecord[]> {
    const db = getSqliteInstance();
    const rows = db
      .prepare(`
        SELECT o.*, u.email as user_email, u.username as username
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        ORDER BY datetime(o.created_at) DESC
      `)
      .all() as unknown as RawOrderRow[];
    return rows.map(mapOrder);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderRecord | null> {
    const db = getSqliteInstance();
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);
    const row = db
      .prepare(`
        SELECT o.*, u.email as user_email, u.username as username
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.id = ?
      `)
      .get(orderId) as unknown as RawOrderRow | undefined;
    return row ? mapOrder(row) : null;
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const db = getSqliteInstance();
    const row = db
      .prepare('SELECT * FROM site_settings WHERE id = 1')
      .get() as unknown as RawSettingsRow;
    return mapSettings(row);
  }

  async updateSiteSettings(settings: Omit<SiteSettings, 'updatedAt'>): Promise<SiteSettings> {
    const db = getSqliteInstance();
    const updatedAt = new Date().toISOString();
    db.prepare(`
      UPDATE site_settings
      SET hero_badge = ?, hero_title = ?, hero_subtitle = ?, minecraft_version = ?,
          loader_name = ?, free_download_note = ?, mandarin_note = ?,
          support_telegram = ?, support_discord = ?, logo_url = ?, updated_at = ?
      WHERE id = 1
    `).run(
      settings.heroBadge,
      settings.heroTitle,
      settings.heroSubtitle,
      settings.minecraftVersion,
      settings.loaderName,
      settings.freeDownloadNote,
      settings.mandarinNote,
      settings.supportTelegram,
      settings.supportDiscord,
      settings.logoUrl,
      updatedAt,
    );
    return this.getSiteSettings();
  }
}
