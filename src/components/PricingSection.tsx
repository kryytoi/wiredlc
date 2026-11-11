'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar,
  CalendarRange,
  Infinity as InfinityIcon,
  Check,
  CreditCard,
  Coins,
  Smartphone,
  LifeBuoy,
  RefreshCw,
  Cpu,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  HWID_RESET_PRODUCT,
  PAYMENT_METHODS,
  PRICING_PLANS,
  type PricingPlan,
} from '@/lib/pricing';
import type { OrderItemCode, PaymentMethod, PublicUser } from '@/lib/types';

interface PricingSectionProps {
  user: PublicUser | null;
  minecraftVersion: string;
  loaderName: string;
  mandarinNote: string;
  supportTelegram: string;
  initialItem?: OrderItemCode | null;
}

export function PricingSection({
  user,
  minecraftVersion,
  loaderName,
  mandarinNote,
  supportTelegram,
  initialItem = null,
}: PricingSectionProps) {
  const [selectedItem, setSelectedItem] = useState<OrderItemCode | null>(initialItem);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sbp');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const selectedPlan: PricingPlan | null =
    selectedItem && selectedItem !== 'hwid_reset'
      ? PRICING_PLANS.find((p) => p.id === selectedItem) ?? null
      : null;

  const isHwidReset = selectedItem === 'hwid_reset';

  function openCheckout(item: OrderItemCode) {
    setSelectedItem(item);
    setCreatedOrderId(null);
    setError(null);
    setNote('');
    if (item === 'quarter') {
      setPaymentMethod('mandarins');
    } else {
      setPaymentMethod('sbp');
    }
  }

  async function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/user/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemCode: selectedItem,
          paymentMethod,
          note: note.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { order?: { id: string }; error?: string };
      if (!res.ok) {
        setError(data.error || 'Не удалось оформить заявку');
        return;
      }
      setCreatedOrderId(data.order?.id ?? 'created');
    } catch {
      setError('Ошибка сети при создании заказа');
    } finally {
      setSubmitting(false);
    }
  }

  const activeMethodInfo = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  function renderPlanIcon(icon: PricingPlan['badgeIcon']) {
    if (icon === 'calendar') return <Calendar className="h-4 w-4 text-violet-400" />;
    if (icon === 'calendar-range') return <CalendarRange className="h-4 w-4 text-amber-400" />;
    return <InfinityIcon className="h-4 w-4 text-violet-300" />;
  }

  return (
    <div id="pricing" className="space-y-10">
      {/* Сетка из 3 тарифов */}
      <div className="grid gap-6 lg:grid-cols-3">
        {PRICING_PLANS.map((plan) => {
          const isQuarter = plan.id === 'quarter';
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-6 transition-all duration-200 ${
                plan.highlighted
                  ? 'border border-violet-500/60 bg-gradient-to-b from-[#141024] via-[#0D0C15] to-[#0A0A10] shadow-[0_0_50px_rgba(139,92,246,0.16)]'
                  : 'border border-[#1E1E2B] bg-[#0B0B11] hover:border-[#2D2B42]'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 right-5 rounded-full border border-violet-400/50 bg-[#8B5CF6] px-3 py-0.5 text-[11px] font-semibold text-white shadow-lg">
                  Лучший выбор
                </span>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    {renderPlanIcon(plan.badgeIcon)}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{plan.title}</h3>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#64687A]">
                      {plan.subtitle}
                    </p>
                  </div>
                </div>
                {isQuarter && (
                  <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                    🍊 В мандаринах
                  </span>
                )}
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tracking-tight text-white">
                  {plan.priceDisplay}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#64687A]">{plan.unitLabel}</p>

              <p className="mt-4 text-sm leading-relaxed text-[#9CA3AF]">{plan.description}</p>

              {isQuarter && (
                <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3 text-xs leading-relaxed text-amber-200/90">
                  {mandarinNote}
                </div>
              )}

              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[#D1D5DB]">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => openCheckout(plan.id)}
                className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:bg-[#7C3AED]'
                    : 'border border-[#272738] bg-[#12121B] text-white hover:border-violet-500/50 hover:bg-[#171724]'
                }`}
              >
                Купить {plan.title}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Блок «Дополнительно» + Способы оплаты */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Дополнительно */}
        <div className="rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
            <Cpu className="h-4 w-4" />
            Дополнительно
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#07070B] px-4 py-3.5">
              <div>
                <div className="text-sm font-medium text-white">Целевая версия Minecraft</div>
                <div className="text-xs text-[#64687A]">Актуальный загрузчик и совместимость</div>
              </div>
              <span className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-xs font-medium text-violet-300">
                {minecraftVersion} {loaderName.toLowerCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-[#07070B] px-4 py-3.5">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <RefreshCw className="h-4 w-4 text-violet-400" />
                  Сброс HWID
                </div>
                <div className="mt-0.5 text-xs text-[#64687A]">
                  Отвязка старого ПК для переноса подписки на новое устройство
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-xl font-bold text-white">
                  {HWID_RESET_PRODUCT.priceDisplay}
                </span>
                <button
                  type="button"
                  onClick={() => openCheckout('hwid_reset')}
                  className="rounded-lg border border-[#272738] bg-[#12121B] px-3 py-1.5 text-xs font-semibold text-white transition hover:border-violet-500/50"
                >
                  Оформить
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Способы оплаты */}
        <div className="rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
            <CreditCard className="h-4 w-4" />
            Способы оплаты
          </div>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Поддерживаем быстрые локальные переводы, криптовалюту и ручное оформление для пользователей из разных стран.
          </p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#07070B] p-3">
              <Smartphone className="h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-white">СБП / Карты РФ</div>
                <div className="text-[11px] text-[#64687A]">МИР, Visa, Mastercard</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#07070B] p-3">
              <Coins className="h-4 w-4 shrink-0 text-violet-400" />
              <div>
                <div className="text-xs font-semibold text-white">Криптовалюта</div>
                <div className="text-[11px] text-[#64687A]">USDT, TON, LTC</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#07070B] p-3 sm:col-span-2">
              <LifeBuoy className="h-4 w-4 shrink-0 text-sky-400" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-white">UA карты — через поддержку</div>
                <div className="text-[11px] text-[#64687A]">
                  Создайте заявку и напишите в{' '}
                  <a
                    href={supportTelegram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-300 underline-offset-2 hover:underline"
                  >
                    Telegram-поддержку
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно оформления заказа */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-[#272738] bg-[#0B0B11] p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-violet-400">
                    Оформление заказа
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-white">
                    {isHwidReset
                      ? `${HWID_RESET_PRODUCT.title} — ${HWID_RESET_PRODUCT.priceDisplay}`
                      : `${selectedPlan?.title} (${selectedPlan?.subtitle}) — ${selectedPlan?.priceDisplay}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-lg border border-white/[0.08] p-1.5 text-[#9CA3AF] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!user ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4 text-sm text-[#D1D5DB]">
                    Чтобы покупка автоматически привязалась к вашему аккаунту и появилась в истории заказов, выполните вход или создайте аккаунт.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/login?redirect=${encodeURIComponent('/pricing')}`}
                      className="rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#7C3AED]"
                    >
                      Войти
                    </Link>
                    <Link
                      href={`/register?redirect=${encodeURIComponent('/pricing')}`}
                      className="rounded-xl border border-[#272738] bg-[#12121B] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:border-violet-500/50"
                    >
                      Регистрация
                    </Link>
                  </div>
                </div>
              ) : createdOrderId ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Заявка создана!
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#D1D5DB]">
                      ID заявки: <code className="text-white">{createdOrderId}</code>. Заказ отображается в вашем личном кабинете и у администратора для подтверждения.
                    </p>
                  </div>
                  {activeMethodInfo && (
                    <div className="rounded-xl border border-[#1E1E2B] bg-[#06060A] p-3.5 text-xs text-[#9CA3AF]">
                      <div className="font-medium text-white">Реквизиты (MVP-плейсхолдер):</div>
                      <div className="mt-1 font-mono text-violet-300">
                        {activeMethodInfo.placeholderRequisite}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Link
                      href="/dashboard"
                      className="flex-1 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#7C3AED]"
                    >
                      Перейти в кабинет
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="rounded-xl border border-[#272738] bg-[#12121B] px-4 py-2.5 text-sm font-medium text-white"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrder} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9CA3AF]">
                      Способ оплаты
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.filter((m) =>
                        selectedItem === 'quarter' ? true : m.id !== 'mandarins',
                      ).map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                            paymentMethod === method.id
                              ? 'border-violet-500 bg-violet-500/15 text-white'
                              : 'border-[#1E1E2B] bg-[#07070B] text-[#9CA3AF] hover:border-[#2D2B42]'
                          }`}
                        >
                          <div className="font-semibold">{method.shortLabel}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeMethodInfo && (
                    <div className="rounded-xl border border-[#1E1E2B] bg-[#07070B] p-3 text-xs text-[#9CA3AF]">
                      <div>{activeMethodInfo.details}</div>
                      <div className="mt-1.5 font-mono text-[11px] text-violet-300">
                        {activeMethodInfo.placeholderRequisite}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#9CA3AF]">
                      {selectedItem === 'quarter'
                        ? 'Уточнение по 200 мандаринам (обязательно при нестандартной передаче)'
                        : 'Комментарий к заказу (необязательно)'}
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        selectedItem === 'quarter'
                          ? 'Например: передаю 200 мандаринов через @telegram или прошу уточнить курс в RUB'
                          : 'Ник в Telegram / Discord или последние 4 цифры перевода'
                      }
                      className="mt-1.5 w-full rounded-xl border border-[#1E1E2B] bg-[#07070B] px-3 py-2 text-sm text-white placeholder:text-[#64687A] focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.3)] transition hover:bg-[#7C3AED] disabled:opacity-60"
                  >
                    {submitting ? 'Создание заявки...' : 'Создать заявку на оплату'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
