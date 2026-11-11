import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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

interface SupabaseUserRow {
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
  email_verified: boolean;
  created_at: string;
}

interface SupabaseOrderRow {
  id: string;
  user_id: string;
  item_code: string;
  item_title: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  note: string | null;
  created_at: string;
  users?: { email?: string; username?: string } | Array<{ email?: string; username?: string }> | null;
}

interface SupabaseSettingsRow {
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

function mapUser(row: SupabaseUserRow): UserRecord {
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

function mapOrder(row: SupabaseOrderRow): OrderRecord {
  const joinedUser = Array.isArray(row.users) ? row.users[0] : row.users;
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: joinedUser?.email,
    username: joinedUser?.username,
    itemCode: row.item_code as OrderRecord['itemCode'],
    itemTitle: row.item_title,
    amount: Number(row.amount),
    currency: row.currency as OrderRecord['currency'],
    paymentMethod: row.payment_method as OrderRecord['paymentMethod'],
    status: row.status as OrderStatus,
    note: row.note,
    createdAt: row.created_at,
  };
}

function mapSettings(row: SupabaseSettingsRow): SiteSettings {
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

function escapeIlike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

/**
 * Полноценный облачный адаптер для Supabase (PostgreSQL).
 * Активируется автоматически при наличии NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.
 */
export class SupabaseAdapter implements DatabaseAdapter {
  private client: SupabaseClient | null = null;
  private seededPromise: Promise<void> | null = null;

  private getClient(): SupabaseClient {
    if (!this.client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceKey) {
        throw new Error(
          'Отсутствуют NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY для SupabaseAdapter.',
        );
      }
      this.client = createClient(url, serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return this.client;
  }

  private async ensureSeeded(): Promise<void> {
    if (this.seededPromise) return this.seededPromise;

    this.seededPromise = (async () => {
      try {
        const supabase = this.getClient();

        const { data: settingsRow } = await supabase
          .from('site_settings')
          .select('id')
          .eq('id', 1)
          .maybeSingle();

        if (!settingsRow) {
          const d = getDefaultSiteSettings();
          await supabase.from('site_settings').upsert({
            id: 1,
            hero_badge: d.heroBadge,
            hero_title: d.heroTitle,
            hero_subtitle: d.heroSubtitle,
            minecraft_version: d.minecraftVersion,
            loader_name: d.loaderName,
            free_download_note: d.freeDownloadNote,
            mandarin_note: d.mandarinNote,
            support_telegram: d.supportTelegram,
            support_discord: d.supportDiscord,
            logo_url: d.logoUrl,
            updated_at: d.updatedAt,
          });
        }

        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true });

        if (count === 0) {
          const seed = createSeedUsersAndOrders();
          await supabase.from('users').insert(
            seed.users.map((u) => ({
              id: u.id,
              username: u.username,
              email: u.email,
              password_hash: u.passwordHash,
              role: u.role,
              subscription_tier: u.subscriptionTier,
              subscription_expires_at: u.subscriptionExpiresAt,
              hwid: u.hwid,
              hwid_resets_count: u.hwidResetsCount,
              discord_id: u.discordId,
              discord_username: u.discordUsername,
              email_verified: u.emailVerified,
              created_at: u.createdAt,
            })),
          );
          await supabase.from('orders').insert(
            seed.orders.map((o) => ({
              id: o.id,
              user_id: o.userId,
              item_code: o.itemCode,
              item_title: o.itemTitle,
              amount: o.amount,
              currency: o.currency,
              payment_method: o.paymentMethod,
              status: o.status,
              note: o.note,
              created_at: o.createdAt,
            })),
          );
        }
      } catch (err) {
        console.error('[SupabaseAdapter.ensureSeeded]', err);
      }
    })();

    return this.seededPromise;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    await this.ensureSeeded();
    const { data, error } = await this.getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return mapUser(data as SupabaseUserRow);
  }

  async findUserByEmailOrUsername(identifier: string): Promise<UserRecord | null> {
    await this.ensureSeeded();
    const escaped = escapeIlike(identifier.trim());
    const supabase = this.getClient();

    const { data: byEmail } = await supabase
      .from('users')
      .select('*')
      .ilike('email', escaped)
      .maybeSingle();
    if (byEmail) return mapUser(byEmail as SupabaseUserRow);

    const { data: byUsername } = await supabase
      .from('users')
      .select('*')
      .ilike('username', escaped)
      .maybeSingle();
    return byUsername ? mapUser(byUsername as SupabaseUserRow) : null;
  }

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    await this.ensureSeeded();
    const { data, error } = await this.getClient()
      .from('users')
      .insert({
        username: input.username,
        email: input.email.toLowerCase(),
        password_hash: input.passwordHash,
        role: input.role,
        subscription_tier: input.subscriptionTier ?? 'free',
        subscription_expires_at: input.subscriptionExpiresAt ?? null,
        hwid: input.hwid ?? null,
        hwid_resets_count: 0,
        discord_id: input.discordId ?? null,
        discord_username: input.discordUsername ?? null,
        email_verified: false,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Не удалось создать пользователя в Supabase');
    }
    return mapUser(data as SupabaseUserRow);
  }

  async listUsers(): Promise<UserRecord[]> {
    await this.ensureSeeded();
    const { data, error } = await this.getClient()
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as SupabaseUserRow[]).map(mapUser);
  }

  async updateUserSubscription(
    userId: string,
    tier: SubscriptionTier,
    expiresAt: string | null,
  ): Promise<UserRecord | null> {
    const { data, error } = await this.getClient()
      .from('users')
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt,
      })
      .eq('id', userId)
      .select('*')
      .maybeSingle();
    if (error || !data) return null;
    return mapUser(data as SupabaseUserRow);
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserRecord | null> {
    const { data, error } = await this.getClient()
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select('*')
      .maybeSingle();
    if (error || !data) return null;
    return mapUser(data as SupabaseUserRow);
  }

  async resetUserHwid(userId: string, newHwid: string | null): Promise<UserRecord | null> {
    const current = await this.findUserById(userId);
    if (!current) return null;

    const { data, error } = await this.getClient()
      .from('users')
      .update({
        hwid: newHwid,
        hwid_resets_count: current.hwidResetsCount + 1,
      })
      .eq('id', userId)
      .select('*')
      .maybeSingle();
    if (error || !data) return null;
    return mapUser(data as SupabaseUserRow);
  }

  async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    await this.ensureSeeded();
    const { data, error } = await this.getClient()
      .from('orders')
      .insert({
        user_id: input.userId,
        item_code: input.itemCode,
        item_title: input.itemTitle,
        amount: input.amount,
        currency: input.currency,
        payment_method: input.paymentMethod,
        status: input.status ?? 'pending',
        note: input.note ?? null,
      })
      .select('*, users(email, username)')
      .single();
    if (error || !data) {
      throw new Error(error?.message || 'Не удалось создать заказ в Supabase');
    }
    return mapOrder(data as SupabaseOrderRow);
  }

  async listOrdersByUser(userId: string): Promise<OrderRecord[]> {
    await this.ensureSeeded();
    const { data, error } = await this.getClient()
      .from('orders')
      .select('*, users(email, username)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as SupabaseOrderRow[]).map(mapOrder);
  }

  async listAllOrders(): Promise<OrderRecord[]> {
    await this.ensureSeeded();
    const { data, error } = await this.getClient()
      .from('orders')
      .select('*, users(email, username)')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as SupabaseOrderRow[]).map(mapOrder);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderRecord | null> {
    const { data, error } = await this.getClient()
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select('*, users(email, username)')
      .maybeSingle();
    if (error || !data) return null;
    return mapOrder(data as SupabaseOrderRow);
  }

  async getSiteSettings(): Promise<SiteSettings> {
    try {
      await this.ensureSeeded();
      const { data, error } = await this.getClient()
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error || !data) return getDefaultSiteSettings();
      return mapSettings(data as SupabaseSettingsRow);
    } catch {
      return getDefaultSiteSettings();
    }
  }

  async updateSiteSettings(settings: Omit<SiteSettings, 'updatedAt'>): Promise<SiteSettings> {
    const updatedAt = new Date().toISOString();
    const { data, error } = await this.getClient()
      .from('site_settings')
      .upsert({
        id: 1,
        hero_badge: settings.heroBadge,
        hero_title: settings.heroTitle,
        hero_subtitle: settings.heroSubtitle,
        minecraft_version: settings.minecraftVersion,
        loader_name: settings.loaderName,
        free_download_note: settings.freeDownloadNote,
        mandarin_note: settings.mandarinNote,
        support_telegram: settings.supportTelegram,
        support_discord: settings.supportDiscord,
        logo_url: settings.logoUrl,
        updated_at: updatedAt,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Ошибка сохранения настроек в Supabase');
    }
    return mapSettings(data as SupabaseSettingsRow);
  }
}
