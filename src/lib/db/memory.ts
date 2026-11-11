import crypto from 'node:crypto';
import fs from 'node:fs';
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

interface MemoryStoreState {
  users: UserRecord[];
  orders: OrderRecord[];
  settings: SiteSettings;
}

interface GlobalMemoryCache {
  __wiredlcMemoryStore?: MemoryStoreState;
}

const globalCache = globalThis as unknown as GlobalMemoryCache;

function getTmpSnapshotPath(): string {
  return path.join(os.tmpdir(), 'wiredlc-demo-store.json');
}

function loadOrCreateStore(): MemoryStoreState {
  if (globalCache.__wiredlcMemoryStore) {
    return globalCache.__wiredlcMemoryStore;
  }

  // Пробуем загрузить эфемерный снимок из /tmp (работает в serverless-окружении без read-only ошибок)
  try {
    const tmpPath = getTmpSnapshotPath();
    if (fs.existsSync(tmpPath)) {
      const raw = fs.readFileSync(tmpPath, 'utf8');
      const parsed = JSON.parse(raw) as MemoryStoreState;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.orders) && parsed.settings) {
        globalCache.__wiredlcMemoryStore = parsed;
        return parsed;
      }
    }
  } catch {
    // Игнорируем ошибки чтения /tmp — переходим к чистому in-memory состоянию
  }

  const seed = createSeedUsersAndOrders();
  const initialState: MemoryStoreState = {
    users: seed.users,
    orders: seed.orders,
    settings: getDefaultSiteSettings(),
  };

  globalCache.__wiredlcMemoryStore = initialState;
  persistBestEffort(initialState);
  return initialState;
}

function persistBestEffort(state: MemoryStoreState) {
  try {
    fs.writeFileSync(getTmpSnapshotPath(), JSON.stringify(state), 'utf8');
  } catch {
    // Безопасно игнорируем, если ФС полностью запрещает запись
  }
}

/**
 * Безопасный in-memory (+ best-effort /tmp) адаптер для serverless-платформ (например, Vercel)
 * на случай, если Supabase ещё не подключён и node:sqlite/диск недоступны.
 */
export class MemoryAdapter implements DatabaseAdapter {
  private getStore(): MemoryStoreState {
    return loadOrCreateStore();
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const store = this.getStore();
    return store.users.find((u) => u.id === id) ?? null;
  }

  async findUserByEmailOrUsername(identifier: string): Promise<UserRecord | null> {
    const store = this.getStore();
    const needle = identifier.trim().toLowerCase();
    return (
      store.users.find(
        (u) => u.email.toLowerCase() === needle || u.username.toLowerCase() === needle,
      ) ?? null
    );
  }

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    const store = this.getStore();
    const user: UserRecord = {
      id: crypto.randomUUID(),
      username: input.username,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
      subscriptionTier: input.subscriptionTier ?? 'free',
      subscriptionExpiresAt: input.subscriptionExpiresAt ?? null,
      hwid: input.hwid ?? null,
      hwidResetsCount: 0,
      discordId: input.discordId ?? null,
      discordUsername: input.discordUsername ?? null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    store.users.unshift(user);
    persistBestEffort(store);
    return user;
  }

  async listUsers(): Promise<UserRecord[]> {
    const store = this.getStore();
    return [...store.users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async updateUserSubscription(
    userId: string,
    tier: SubscriptionTier,
    expiresAt: string | null,
  ): Promise<UserRecord | null> {
    const store = this.getStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return null;
    user.subscriptionTier = tier;
    user.subscriptionExpiresAt = expiresAt;
    persistBestEffort(store);
    return user;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserRecord | null> {
    const store = this.getStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return null;
    user.role = role;
    persistBestEffort(store);
    return user;
  }

  async resetUserHwid(userId: string, newHwid: string | null): Promise<UserRecord | null> {
    const store = this.getStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return null;
    user.hwid = newHwid;
    user.hwidResetsCount += 1;
    persistBestEffort(store);
    return user;
  }

  async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    const store = this.getStore();
    const owner = store.users.find((u) => u.id === input.userId);
    const order: OrderRecord = {
      id: crypto.randomUUID(),
      userId: input.userId,
      userEmail: owner?.email,
      username: owner?.username,
      itemCode: input.itemCode,
      itemTitle: input.itemTitle,
      amount: input.amount,
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      status: input.status ?? 'pending',
      note: input.note ?? null,
      createdAt: new Date().toISOString(),
    };
    store.orders.unshift(order);
    persistBestEffort(store);
    return order;
  }

  async listOrdersByUser(userId: string): Promise<OrderRecord[]> {
    const store = this.getStore();
    return store.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listAllOrders(): Promise<OrderRecord[]> {
    const store = this.getStore();
    return [...store.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderRecord | null> {
    const store = this.getStore();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = status;
    persistBestEffort(store);
    return order;
  }

  async getSiteSettings(): Promise<SiteSettings> {
    return this.getStore().settings;
  }

  async updateSiteSettings(settings: Omit<SiteSettings, 'updatedAt'>): Promise<SiteSettings> {
    const store = this.getStore();
    store.settings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    persistBestEffort(store);
    return store.settings;
  }
}
