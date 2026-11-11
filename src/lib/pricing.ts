import type { OrderItemCode, PaymentMethod, SubscriptionTier } from './types';

export interface PricingPlan {
  id: Exclude<OrderItemCode, 'hwid_reset'>;
  tier: Exclude<SubscriptionTier, 'free'>;
  badgeIcon: 'calendar' | 'calendar-range' | 'infinity';
  title: string;
  subtitle: string;
  price: number;
  currency: 'RUB' | 'MANDARINS';
  priceDisplay: string;
  unitLabel: string;
  durationDays: number | null; // null = lifetime
  description: string;
  features: string[];
  highlighted?: boolean;
  specialNote?: string;
  requiresClarification?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'month',
    tier: 'month',
    badgeIcon: 'calendar',
    title: '30 дней',
    subtitle: 'Month',
    price: 150,
    currency: 'RUB',
    priceDisplay: '150 ₽',
    unitLabel: 'разовый платёж за 30 дней',
    durationDays: 30,
    description: 'Полный доступ к клиенту, обновлениям и закрытому чату покупателей.',
    features: [
      'Все модули клиента Wire DLC',
      'Регулярные обновления под 1.21.11 Fabric',
      'Доступ к закрытому чату покупателей',
      'Облачные конфиги и профили',
    ],
  },
  {
    id: 'quarter',
    tier: 'quarter',
    badgeIcon: 'calendar-range',
    title: '90 дней',
    subtitle: '3 Months',
    price: 200,
    currency: 'MANDARINS',
    priceDisplay: '200 🍊',
    unitLabel: 'цена в мандаринах',
    durationDays: 90,
    description: 'Трёхмесячный доступ к клиенту, обновлениям и закрытому чату.',
    features: [
      'Все модули клиента Wire DLC на 90 дней',
      'Приоритетные апдейты совместимости',
      'Доступ в закрытый чат покупателей',
      'Особый расчёт — 200 мандаринов',
    ],
    specialNote: 'Цена указана в мандаринах — уточняйте способ передачи и эквивалент при заказе.',
    requiresClarification: true,
  },
  {
    id: 'lifetime',
    tier: 'lifetime',
    badgeIcon: 'infinity',
    title: 'Навсегда',
    subtitle: 'Lifetime',
    price: 500,
    currency: 'RUB',
    priceDisplay: '500 ₽',
    unitLabel: 'единоразово, без продлений',
    durationDays: null,
    description: 'Лайфтайм сабка — бессрочный доступ ко всем текущим и будущим апдейтам.',
    features: [
      'Бессрочный доступ ко всем версиям Wire DLC',
      'Все будущие релизы на Fabric 1.21.11+',
      'Закрытый чат покупателей и приоритет поддержки',
      'Максимальная выгода без повторных оплат',
    ],
    highlighted: true,
  },
];

export const HWID_RESET_PRODUCT = {
  id: 'hwid_reset' as const,
  title: 'Сброс HWID',
  price: 170,
  currency: 'RUB' as const,
  priceDisplay: '170 ₽',
  description: 'Разовая отвязка привязки устройства при смене ПК, материнской платы или ОС.',
};

export interface PaymentMethodInfo {
  id: PaymentMethod;
  label: string;
  shortLabel: string;
  category: 'fast' | 'crypto' | 'support' | 'special';
  details: string;
  placeholderRequisite: string;
}

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: 'sbp',
    label: 'СБП (Система быстрых платежей)',
    shortLabel: 'СБП',
    category: 'fast',
    details: 'Мгновенный перевод по номеру телефона без комиссии.',
    placeholderRequisite: 'PLACEHOLDER: +7 (900) 000-00-00 • Т-Банк / Сбер (укажите реальный реквизит в .env)',
  },
  {
    id: 'rf_card',
    label: 'Карты РФ (МИР / Visa / MC)',
    shortLabel: 'Карты РФ',
    category: 'fast',
    details: 'Прямой перевод на банковскую карту РФ или через платёжный шлюз.',
    placeholderRequisite: 'PLACEHOLDER: 2200 •••• •••• 0000 (подключите платёжный агрегатор перед продом)',
  },
  {
    id: 'usdt',
    label: 'USDT (TRC-20 / TON)',
    shortLabel: 'USDT',
    category: 'crypto',
    details: 'Стейблкоин без привязки к региону.',
    placeholderRequisite: 'PLACEHOLDER_USDT_TRC20_WALLET_ADDRESS',
  },
  {
    id: 'ton',
    label: 'TON (Toncoin)',
    shortLabel: 'TON',
    category: 'crypto',
    details: 'Быстрый перевод в сети The Open Network.',
    placeholderRequisite: 'PLACEHOLDER_TON_WALLET_ADDRESS',
  },
  {
    id: 'ltc',
    label: 'LTC (Litecoin)',
    shortLabel: 'LTC',
    category: 'crypto',
    details: 'Классическая криптовалюта с минимальной комиссией.',
    placeholderRequisite: 'PLACEHOLDER_LTC_WALLET_ADDRESS',
  },
  {
    id: 'ua_support',
    label: 'UA карты (через поддержку)',
    shortLabel: 'UA карты',
    category: 'support',
    details: 'Оформление оплаты украинской картой вручную через тикет поддержки.',
    placeholderRequisite: 'Напишите в поддержку Telegram/Discord с ID заявки — менеджер выдаст актуальные реквизиты.',
  },
  {
    id: 'mandarins',
    label: 'Мандарины (спец-тариф 90 дней)',
    shortLabel: 'Мандарины 🍊',
    category: 'special',
    details: 'Для тарифа 90 дней: уточните способ передачи или рублевый/крипто-эквивалент в комментарии.',
    placeholderRequisite: 'Согласование курса/передачи 200 мандаринов в закрытом тикете с администрацией.',
  },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.id, m.shortLabel]),
) as Record<PaymentMethod, string>;

export const SUBSCRIPTION_TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Бесплатная (Free)',
  month: '30 дней (Month)',
  quarter: '90 дней (3 Months)',
  lifetime: 'Навсегда (Lifetime)',
};
