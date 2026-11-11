import type { PublicUser, UserRecord } from '../types';
import type { DatabaseAdapter } from './adapter';
import { SqliteAdapter } from './sqlite';
import { SupabaseAdapter } from './supabase';

function createDbAdapter(): DatabaseAdapter {
  const provider = process.env.DB_PROVIDER || 'sqlite';
  if (
    provider === 'supabase' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return new SupabaseAdapter();
  }
  return new SqliteAdapter();
}

export const db: DatabaseAdapter = createDbAdapter();

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash: _removed, ...rest } = user;
  return rest;
}
