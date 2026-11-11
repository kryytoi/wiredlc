import type { PublicUser, SiteSettings, UserRecord } from '../types';
import type { DatabaseAdapter } from './adapter';
import { getDefaultSiteSettings } from './defaults';
import { MemoryAdapter } from './memory';
import { isSqliteSupported, SqliteAdapter } from './sqlite';
import { SupabaseAdapter } from './supabase';

export type DbProviderKind = 'supabase' | 'sqlite' | 'memory';

function resolveAdapter(): { adapter: DatabaseAdapter; provider: DbProviderKind } {
  const explicitProvider = process.env.DB_PROVIDER;
  const hasSupabaseCreds = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // 1. Если настроены ключи Supabase (и явно не форсирован sqlite), работаем через Supabase
  if (hasSupabaseCreds && explicitProvider !== 'sqlite') {
    return { adapter: new SupabaseAdapter(), provider: 'supabase' };
  }

  // 2. Пробуем локальный SQLite (если доступен node:sqlite и есть запись)
  if (explicitProvider !== 'memory' && isSqliteSupported()) {
    return { adapter: new SqliteAdapter(), provider: 'sqlite' };
  }

  // 3. Безопасный fallback для Vercel Serverless без Supabase и read-only ФС
  return { adapter: new MemoryAdapter(), provider: 'memory' };
}

let cachedResolved: { adapter: DatabaseAdapter; provider: DbProviderKind } | null = null;

function getResolved() {
  if (!cachedResolved) {
    cachedResolved = resolveAdapter();
  }
  return cachedResolved;
}

export function getActiveDbProvider(): DbProviderKind {
  return getResolved().provider;
}

export const db: DatabaseAdapter = {
  findUserById: (id) => getResolved().adapter.findUserById(id),
  findUserByEmailOrUsername: (identifier) =>
    getResolved().adapter.findUserByEmailOrUsername(identifier),
  createUser: (input) => getResolved().adapter.createUser(input),
  listUsers: () => getResolved().adapter.listUsers(),
  updateUserSubscription: (userId, tier, expiresAt) =>
    getResolved().adapter.updateUserSubscription(userId, tier, expiresAt),
  updateUserRole: (userId, role) => getResolved().adapter.updateUserRole(userId, role),
  resetUserHwid: (userId, newHwid) => getResolved().adapter.resetUserHwid(userId, newHwid),
  createOrder: (input) => getResolved().adapter.createOrder(input),
  listOrdersByUser: (userId) => getResolved().adapter.listOrdersByUser(userId),
  listAllOrders: () => getResolved().adapter.listAllOrders(),
  updateOrderStatus: (orderId, status) =>
    getResolved().adapter.updateOrderStatus(orderId, status),
  getSiteSettings: async (): Promise<SiteSettings> => {
    try {
      return await getResolved().adapter.getSiteSettings();
    } catch (err) {
      console.error('[db.getSiteSettings fallback]', err);
      return getDefaultSiteSettings();
    }
  },
  updateSiteSettings: (settings) => getResolved().adapter.updateSiteSettings(settings),
};

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash: _removed, ...rest } = user;
  return rest;
}
