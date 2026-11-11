import type { OrderRecord, OrderStatus, SiteSettings, SubscriptionTier, UserRecord, UserRole } from '../types';
import type { CreateOrderInput, CreateUserInput, DatabaseAdapter } from './adapter';

/**
 * Архитектурная заготовка для подключения реального Supabase (PostgreSQL).
 * Для активации:
 * 1. Выполните миграцию из supabase/schema.sql в вашем проекте Supabase.
 * 2. Установите @supabase/supabase-js и укажите ключи в .env.
 * 3. Задайте DB_PROVIDER="supabase".
 */
export class SupabaseAdapter implements DatabaseAdapter {
  private notConfigured(): never {
    throw new Error(
      'SupabaseAdapter выбран через DB_PROVIDER=supabase, но не настроен. Проверьте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  findUserById(_id: string): Promise<UserRecord | null> {
    return this.notConfigured();
  }
  findUserByEmailOrUsername(_identifier: string): Promise<UserRecord | null> {
    return this.notConfigured();
  }
  createUser(_input: CreateUserInput): Promise<UserRecord> {
    return this.notConfigured();
  }
  listUsers(): Promise<UserRecord[]> {
    return this.notConfigured();
  }
  updateUserSubscription(
    _userId: string,
    _tier: SubscriptionTier,
    _expiresAt: string | null,
  ): Promise<UserRecord | null> {
    return this.notConfigured();
  }
  updateUserRole(_userId: string, _role: UserRole): Promise<UserRecord | null> {
    return this.notConfigured();
  }
  resetUserHwid(_userId: string, _newHwid: string | null): Promise<UserRecord | null> {
    return this.notConfigured();
  }
  createOrder(_input: CreateOrderInput): Promise<OrderRecord> {
    return this.notConfigured();
  }
  listOrdersByUser(_userId: string): Promise<OrderRecord[]> {
    return this.notConfigured();
  }
  listAllOrders(): Promise<OrderRecord[]> {
    return this.notConfigured();
  }
  updateOrderStatus(_orderId: string, _status: OrderStatus): Promise<OrderRecord | null> {
    return this.notConfigured();
  }
  getSiteSettings(): Promise<SiteSettings> {
    return this.notConfigured();
  }
  updateSiteSettings(_settings: Omit<SiteSettings, 'updatedAt'>): Promise<SiteSettings> {
    return this.notConfigured();
  }
}
