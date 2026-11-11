import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(2, 'Введите email или никнейм')
    .max(120, 'Слишком длинное значение'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(128, 'Пароль слишком длинный'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Никнейм должен содержать от 3 символов')
    .max(24, 'Никнейм не должен превышать 24 символа')
    .regex(/^[a-zA-Z0-9_]+$/, 'Допустимы только латинские буквы, цифры и _'),
  email: z
    .string()
    .trim()
    .email('Введите корректный email')
    .max(120, 'Email слишком длинный')
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, 'Пароль должен быть не короче 8 символов')
    .max(128, 'Пароль слишком длинный'),
  inviteCode: z.string().trim().optional(),
});

export const createOrderSchema = z.object({
  itemCode: z.enum(['month', 'quarter', 'lifetime', 'hwid_reset']),
  paymentMethod: z.enum(['sbp', 'rf_card', 'usdt', 'ton', 'ltc', 'ua_support', 'mandarins']),
  note: z.string().trim().max(400, 'Комментарий не должен превышать 400 символов').optional(),
});

export const adminUpdateUserSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(['set_subscription', 'revoke_subscription', 'set_role', 'reset_hwid']),
  subscriptionTier: z.enum(['free', 'month', 'quarter', 'lifetime']).optional(),
  days: z.number().int().min(1).max(3650).optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export const adminUpdateOrderSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['pending', 'paid', 'cancelled']),
});

export const adminUpdateSettingsSchema = z.object({
  heroBadge: z.string().trim().min(2).max(100),
  heroTitle: z.string().trim().min(4).max(160),
  heroSubtitle: z.string().trim().min(10).max(500),
  minecraftVersion: z.string().trim().min(2).max(40),
  loaderName: z.string().trim().min(2).max(40),
  freeDownloadNote: z.string().trim().min(4).max(300),
  mandarinNote: z.string().trim().min(4).max(300),
  supportTelegram: z.string().trim().min(2).max(200),
  supportDiscord: z.string().trim().min(2).max(200),
  logoUrl: z.string().trim().min(1).max(300),
});
