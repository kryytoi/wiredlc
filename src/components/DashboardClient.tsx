'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Cpu,
  Copy,
  Check,
  RefreshCw,
  Crown,
  Clock,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  HWID_RESET_PRODUCT,
  PAYMENT_METHOD_LABELS,
  SUBSCRIPTION_TIER_LABELS,
} from '@/lib/pricing';
import type { OrderRecord, PaymentMethod, PublicUser, SiteSettings } from '@/lib/types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface DashboardClientProps {
  initialUser: PublicUser;
  initialOrders: OrderRecord[];
  settings: SiteSettings;
  adminOnlyError?: boolean;
}

export function DashboardClient({
  initialUser,
  initialOrders,
  settings,
  adminOnlyError = false,
}: DashboardClientProps) {
  const [user, setUser] = useState<PublicUser>(initialUser);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [copiedHwid, setCopiedHwid] = useState(false);
  const [hwidPaymentMethod, setHwidPaymentMethod] = useState<PaymentMethod>('sbp');
  const [hwidLoading, setHwidLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    adminOnlyError
      ? {
          type: 'err',
          text: 'Раздел /admin доступен только администратору MrDarko (role = admin).',
        }
      : null,
  );

  const isPaidActive =
    user.subscriptionTier === 'lifetime' ||
    (user.subscriptionTier !== 'free' &&
      (!user.subscriptionExpiresAt ||
        new Date(user.subscriptionExpiresAt).getTime() > Date.now()));

  function copyHwid() {
    if (!user.hwid) return;
    navigator.clipboard?.writeText(user.hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 1800);
  }

  async function handleHwidAction(mode: 'order' | 'demo_reset') {
    setHwidLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/user/hwid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          paymentMethod: hwidPaymentMethod,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        user?: PublicUser;
        order?: OrderRecord;
      };
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'Не удалось выполнить операцию' });
        return;
      }
      if (data.user) {
        setUser(data.user);
      }
      if (data.order) {
        setOrders((prev) => [data.order!, ...prev]);
      }
      setFeedback({ type: 'ok', text: data.message || 'Операция выполнена' });
    } catch {
      setFeedback({ type: 'err', text: 'Ошибка сети при обращении к серверу' });
    } finally {
      setHwidLoading(false);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function renderOrderStatus(status: OrderRecord['status']) {
    if (status === 'paid') {
      return (
        <span className="inline-flex rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
          Оплачен
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span className="inline-flex rounded-full border border-red-500/35 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-300">
          Отменён
        </span>
      );
    }
    return (
      <span className="inline-flex rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
        Ожидает
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#F4F4F8]">
      <Navbar user={user} logoUrl={settings.logoUrl} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Заголовок кабинета */}
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-violet-400">
              Личный кабинет
            </span>
            <h1 className="mt-1 font-display text-3xl font-bold text-white">
              Привет, {user.username}
            </h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              {user.email} · Регистрация {formatDate(user.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/25"
              >
                <ShieldCheck className="h-4 w-4" />
                Панель MrDarko
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7C3AED]"
            >
              <Sparkles className="h-4 w-4" />
              Тарифы
            </Link>
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-6 flex items-center gap-2.5 rounded-xl border p-4 text-sm ${
              feedback.type === 'err'
                ? 'border-red-500/35 bg-red-500/10 text-red-200'
                : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Верхняя сетка: Подписка + Загрузки */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Карточка подписки */}
          <div className="rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                <Crown className="h-4 w-4 text-violet-400" />
                Статус подписки
              </div>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                  isPaidActive
                    ? 'border border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                    : 'border border-white/10 bg-white/5 text-[#9CA3AF]'
                }`}
              >
                {isPaidActive ? 'Активна (Premium)' : 'Free Tier'}
              </span>
            </div>

            <div className="mt-5">
              <div className="font-display text-2xl font-bold text-white">
                {SUBSCRIPTION_TIER_LABELS[user.subscriptionTier]}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-[#9CA3AF]">
                <Clock className="h-4 w-4 text-[#64687A]" />
                {user.subscriptionTier === 'lifetime'
                  ? 'Бессрочная лицензия (Lifetime)'
                  : user.subscriptionTier === 'free'
                    ? 'Доступна базовая бесплатная сборка'
                    : `Действует до: ${formatDate(user.subscriptionExpiresAt)}`}
              </div>
            </div>

            {!isPaidActive && (
              <div className="mt-6 rounded-xl border border-violet-500/25 bg-violet-500/[0.07] p-4">
                <p className="text-xs leading-relaxed text-[#D1D5DB]">
                  Откройте все обходы, закрытый чат покупателей и регулярные апдейты под Minecraft{' '}
                  {settings.minecraftVersion} {settings.loaderName} — от 150 ₽ за 30 дней.
                </p>
                <Link
                  href="/pricing"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200"
                >
                  Выбрать тариф →
                </Link>
              </div>
            )}
          </div>

          {/* Карточка загрузки клиента */}
          <div className="rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                <Download className="h-4 w-4 text-violet-400" />
                Загрузка клиента
              </div>
              <span className="font-mono text-xs text-violet-300">
                {settings.minecraftVersion} {settings.loaderName}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#9CA3AF]">
              {settings.freeDownloadNote}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/api/download/free"
                download
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#272738] bg-[#12121B] px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500/50"
              >
                <Download className="h-4 w-4 text-violet-400" />
                Скачать Free (.jar)
              </a>

              {isPaidActive ? (
                <a
                  href="/api/download/premium"
                  download
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.3)] transition hover:bg-[#7C3AED]"
                >
                  <Download className="h-4 w-4" />
                  Скачать Full Loader
                </a>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8B5CF6]/20 px-4 py-3 text-sm font-semibold text-violet-200 ring-1 ring-inset ring-violet-500/35 transition hover:bg-[#8B5CF6]/30"
                >
                  Нужна подписка
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Раздел HWID */}
        <div className="mt-6 rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                <Cpu className="h-4 w-4 text-violet-400" />
                Привязка устройства (HWID)
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <code className="rounded-xl border border-[#272738] bg-[#06060A] px-4 py-2.5 font-mono text-sm text-violet-200">
                  {user.hwid || 'UNBOUND (привяжется при следующем запуске)'}
                </code>
                {user.hwid && (
                  <button
                    type="button"
                    onClick={copyHwid}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E1E2B] bg-[#12121B] px-3 py-2 text-xs font-medium text-[#D1D5DB] transition hover:border-violet-500/40"
                  >
                    {copiedHwid ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Скопировано
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Копировать
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-[#64687A]">
                Выполнено сбросов HWID: {user.hwidResetsCount} · Стоимость сброса:{' '}
                <span className="text-[#D1D5DB]">{HWID_RESET_PRODUCT.priceDisplay}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <select
                value={hwidPaymentMethod}
                onChange={(e) => setHwidPaymentMethod(e.target.value as PaymentMethod)}
                className="h-10 rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
              >
                <option value="sbp">СБП</option>
                <option value="rf_card">Карты РФ</option>
                <option value="usdt">USDT</option>
                <option value="ton">TON</option>
                <option value="ltc">LTC</option>
                <option value="ua_support">UA карты (поддержка)</option>
              </select>

              <button
                type="button"
                disabled={hwidLoading}
                onClick={() => handleHwidAction('order')}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-4 text-xs font-semibold text-white transition hover:bg-[#7C3AED] disabled:opacity-60"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Сбросить HWID ({HWID_RESET_PRODUCT.priceDisplay})
              </button>

              <button
                type="button"
                disabled={hwidLoading}
                onClick={() => handleHwidAction('demo_reset')}
                title="Мгновенная симуляция сброса HWID для проверки MVP-интерфейса"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#272738] bg-[#12121B] px-3.5 text-xs font-medium text-[#9CA3AF] transition hover:border-violet-500/40 hover:text-white disabled:opacity-60"
              >
                Демо-сброс (MVP)
              </button>
            </div>
          </div>
        </div>

        {/* История заказов */}
        <div className="mt-6 rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              <Receipt className="h-4 w-4 text-violet-400" />
              История заказов
            </div>
            <span className="font-mono text-xs text-[#64687A]">Всего: {orders.length}</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#64687A]">
              У вас пока нет заявок. Выберите тариф на{' '}
              <Link href="/pricing" className="text-violet-400 hover:underline">
                странице прайс-листа
              </Link>
              .
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs text-[#64687A]">
                    <th className="pb-3 font-medium">Услуга</th>
                    <th className="pb-3 font-medium">Сумма</th>
                    <th className="pb-3 font-medium">Способ</th>
                    <th className="pb-3 font-medium">Статус</th>
                    <th className="pb-3 font-medium">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {orders.map((order) => (
                    <tr key={order.id} className="text-[#D1D5DB]">
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-white">{order.itemTitle}</div>
                        {order.note && (
                          <div className="mt-0.5 text-xs text-[#64687A]">{order.note}</div>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-white">
                        {order.amount}{' '}
                        {order.currency === 'MANDARINS' ? '🍊 (мандаринов)' : '₽'}
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-[#9CA3AF]">
                        {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                      </td>
                      <td className="py-3.5 pr-4">{renderOrderStatus(order.status)}</td>
                      <td className="py-3.5 text-xs text-[#64687A]">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
