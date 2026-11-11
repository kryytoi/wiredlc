export type UserRole = 'user' | 'admin';

export type SubscriptionTier = 'free' | 'month' | 'quarter' | 'lifetime';

export type OrderItemCode = 'month' | 'quarter' | 'lifetime' | 'hwid_reset';

export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export type PaymentMethod =
  | 'sbp'
  | 'rf_card'
  | 'usdt'
  | 'ton'
  | 'ltc'
  | 'ua_support'
  | 'mandarins';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: string | null;
  hwid: string | null;
  hwidResetsCount: number;
  discordId: string | null;
  discordUsername: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

export interface OrderRecord {
  id: string;
  userId: string;
  userEmail?: string;
  username?: string;
  itemCode: OrderItemCode;
  itemTitle: string;
  amount: number;
  currency: 'RUB' | 'MANDARINS';
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface SiteSettings {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  minecraftVersion: string;
  loaderName: string;
  freeDownloadNote: string;
  mandarinNote: string;
  supportTelegram: string;
  supportDiscord: string;
  logoUrl: string;
  updatedAt: string;
}

export interface SessionPayload {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
