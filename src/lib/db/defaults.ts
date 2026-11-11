import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { OrderRecord, SiteSettings, UserRecord } from '../types';

export function getDefaultSiteSettings(): SiteSettings {
  return {
    heroBadge: 'Minecraft 1.21.11 · Fabric',
    heroTitle: 'Минимализм и контроль в каждом кадре.',
    heroSubtitle:
      'Wire DLC — чистый модульный клиент для Minecraft 1.21.11 на базе Fabric. Адаптивные обходы актуальных античитов, плавный рендер и мгновенный отклик без перегруженного интерфейса.',
    minecraftVersion: '1.21.11',
    loaderName: 'Fabric',
    freeDownloadNote:
      'Бесплатная сборка (заглушка MVP): wiredlc-free-1.21.11-fabric.jar — базовые визуалы и оптимизация FPS.',
    mandarinNote:
      'Тариф 90 дней оценён в 200 мандаринов — уточните курс или формат передачи в комментарии к заявке.',
    supportTelegram: 'https://t.me/wiredlc_support_placeholder',
    supportDiscord: 'https://discord.gg/wiredlc-placeholder',
    logoUrl: '/brand/wire-logo.png',
    updatedAt: new Date().toISOString(),
  };
}

export function createSeedUsersAndOrders(): {
  users: UserRecord[];
  orders: OrderRecord[];
} {
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'MrDarkoAdmin!2026';
  const adminHash = bcrypt.hashSync(adminPassword, 10);
  const demoUserHash = bcrypt.hashSync('PlayerPass!2026', 10);

  const adminId = crypto.randomUUID();
  const player1Id = crypto.randomUUID();
  const player2Id = crypto.randomUUID();
  const player3Id = crypto.randomUUID();

  const users: UserRecord[] = [
    {
      id: adminId,
      username: 'MrDarko',
      email: 'mrdarko@wiredlc.dev',
      passwordHash: adminHash,
      role: 'admin',
      subscriptionTier: 'lifetime',
      subscriptionExpiresAt: null,
      hwid: 'WDLC-DARK-0001-ADMN',
      hwidResetsCount: 0,
      discordId: null,
      discordUsername: 'MrDarko#0001',
      emailVerified: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
    {
      id: player1Id,
      username: 'kairo_pvp',
      email: 'kairo@example.com',
      passwordHash: demoUserHash,
      role: 'user',
      subscriptionTier: 'month',
      subscriptionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 24).toISOString(),
      hwid: 'WDLC-8F2A-19C4-E01B',
      hwidResetsCount: 1,
      discordId: null,
      discordUsername: 'kairo_pvp',
      emailVerified: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
    {
      id: player2Id,
      username: 'velvet_fabric',
      email: 'velvet@example.com',
      passwordHash: demoUserHash,
      role: 'user',
      subscriptionTier: 'lifetime',
      subscriptionExpiresAt: null,
      hwid: 'WDLC-3A77-B102-99FD',
      hwidResetsCount: 0,
      discordId: null,
      discordUsername: null,
      emailVerified: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    },
    {
      id: player3Id,
      username: 'frost_free',
      email: 'frost@example.com',
      passwordHash: demoUserHash,
      role: 'user',
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      hwid: null,
      hwidResetsCount: 0,
      discordId: null,
      discordUsername: null,
      emailVerified: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
  ];

  const orders: OrderRecord[] = [
    {
      id: crypto.randomUUID(),
      userId: player1Id,
      userEmail: 'kairo@example.com',
      username: 'kairo_pvp',
      itemCode: 'month',
      itemTitle: 'Подписка 30 дней (Month)',
      amount: 150,
      currency: 'RUB',
      paymentMethod: 'sbp',
      status: 'paid',
      note: 'Оплата СБП подтверждена',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: player1Id,
      userEmail: 'kairo@example.com',
      username: 'kairo_pvp',
      itemCode: 'hwid_reset',
      itemTitle: 'Сброс HWID',
      amount: 170,
      currency: 'RUB',
      paymentMethod: 'rf_card',
      status: 'paid',
      note: 'Замена SSD / переустановка Windows',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: player2Id,
      userEmail: 'velvet@example.com',
      username: 'velvet_fabric',
      itemCode: 'lifetime',
      itemTitle: 'Подписка Навсегда (Lifetime)',
      amount: 500,
      currency: 'RUB',
      paymentMethod: 'usdt',
      status: 'paid',
      note: 'USDT TRC-20',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: player3Id,
      userEmail: 'frost@example.com',
      username: 'frost_free',
      itemCode: 'quarter',
      itemTitle: 'Подписка 90 дней (3 Months)',
      amount: 200,
      currency: 'MANDARINS',
      paymentMethod: 'mandarins',
      status: 'pending',
      note: 'Уточнение: передача 200 мандаринов через поддержку в Telegram',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
  ];

  return { users, orders };
}
