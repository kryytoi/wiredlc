import type {
  OrderItemCode,
  OrderRecord,
  OrderStatus,
  PaymentMethod,
  SiteSettings,
  SubscriptionTier,
  UserRecord,
  UserRole,
} from '../types';

export interface CreateUserInput {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiresAt?: string | null;
  hwid?: string | null;
  discordId?: string | null;
  discordUsername?: string | null;
}

export interface CreateOrderInput {
  userId: string;
  itemCode: OrderItemCode;
  itemTitle: string;
  amount: number;
  currency: 'RUB' | 'MANDARINS';
  paymentMethod: PaymentMethod;
  status?: OrderStatus;
  note?: string | null;
}

export interface DatabaseAdapter {
  findUserById(id: string): Promise<UserRecord | null>;
  findUserByEmailOrUsername(identifier: string): Promise<UserRecord | null>;
  createUser(input: CreateUserInput): Promise<UserRecord>;
  listUsers(): Promise<UserRecord[]>;
  updateUserSubscription(
    userId: string,
    tier: SubscriptionTier,
    expiresAt: string | null,
  ): Promise<UserRecord | null>;
  updateUserRole(userId: string, role: UserRole): Promise<UserRecord | null>;
  resetUserHwid(userId: string, newHwid: string | null): Promise<UserRecord | null>;

  createOrder(input: CreateOrderInput): Promise<OrderRecord>;
  listOrdersByUser(userId: string): Promise<OrderRecord[]>;
  listAllOrders(): Promise<OrderRecord[]>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderRecord | null>;

  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: Omit<SiteSettings, 'updatedAt'>): Promise<SiteSettings>;
}
