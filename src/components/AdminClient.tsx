'use client';

import { useState } from 'react';
import {
  Users,
  Receipt,
  Settings,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  AlertCircle,
} from 'lucide-react';
import { PAYMENT_METHOD_LABELS, SUBSCRIPTION_TIER_LABELS } from '@/lib/pricing';
import type {
  OrderRecord,
  OrderStatus,
  PublicUser,
  SiteSettings,
  SubscriptionTier,
  UserRole,
} from '@/lib/types';
import { Navbar } from './Navbar';

interface AdminClientProps {
  currentUser: PublicUser;
  initialUsers: PublicUser[];
  initialOrders: OrderRecord[];
  initialSettings: SiteSettings;
}

type AdminTab = 'users' | 'orders' | 'content';

export function AdminClient({
  currentUser,
  initialUsers,
  initialOrders,
  initialSettings,
}: AdminClientProps) {
  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<PublicUser[]>(initialUsers);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [userSearch, setUserSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [selectedTiers, setSelectedTiers] = useState<Record<string, SubscriptionTier>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const filteredOrders = orders.filter((o) =>
    orderFilter === 'all' ? true : o.status === orderFilter,
  );

  async function mutateUser(
    userId: string,
    payload: {
      action: 'set_subscription' | 'revoke_subscription' | 'set_role' | 'reset_hwid';
      subscriptionTier?: SubscriptionTier;
      role?: UserRole;
    },
  ) {
    setBusyId(userId);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...payload }),
      });
      const data = (await res.json()) as { user?: PublicUser; error?: string };
      if (!res.ok) {
        setNotice({ type: 'err', text: data.error || 'Не удалось обновить пользователя' });
        return;
      }
      if (data.user) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? data.user! : u)));
        setNotice({ type: 'ok', text: `Пользователь ${data.user.username} обновлён` });
      }
    } catch {
      setNotice({ type: 'err', text: 'Ошибка сети при обновлении пользователя' });
    } finally {
      setBusyId(null);
    }
  }

  async function mutateOrder(orderId: string, status: OrderStatus) {
    setBusyId(orderId);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      const data = (await res.json()) as { order?: OrderRecord; error?: string };
      if (!res.ok) {
        setNotice({ type: 'err', text: data.error || 'Не удалось обновить заказ' });
        return;
      }
      if (data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order! : o)));
        // Обновим также список пользователей, если оплата активировала подписку или сбросила HWID
        const usersRes = await fetch('/api/admin/users');
        if (usersRes.ok) {
          const uData = (await usersRes.json()) as { users: PublicUser[] };
          setUsers(uData.users);
        }
        setNotice({
          type: 'ok',
          text:
            status === 'paid'
              ? 'Оплата подтверждена, права/сброс применены к аккаунту.'
              : 'Статус заказа обновлён.',
        });
      }
    } catch {
      setNotice({ type: 'err', text: 'Ошибка сети при обновлении заказа' });
    } finally {
      setBusyId(null);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setBusyId('settings');
    setNotice(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBadge: settings.heroBadge,
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          minecraftVersion: settings.minecraftVersion,
          loaderName: settings.loaderName,
          freeDownloadNote: settings.freeDownloadNote,
          mandarinNote: settings.mandarinNote,
          supportTelegram: settings.supportTelegram,
          supportDiscord: settings.supportDiscord,
          logoUrl: settings.logoUrl,
        }),
      });
      const data = (await res.json()) as { settings?: SiteSettings; error?: string };
      if (!res.ok) {
        setNotice({ type: 'err', text: data.error || 'Ошибка сохранения настроек' });
        return;
      }
      if (data.settings) setSettings(data.settings);
      setNotice({ type: 'ok', text: 'Контент лендинга обновлён и сразу применён на /' });
    } catch {
      setNotice({ type: 'err', text: 'Ошибка сети при сохранении настроек' });
    } finally {
      setBusyId(null);
    }
  }

  const paidUsersCount = users.filter((u) => u.subscriptionTier !== 'free').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#050507] text-[#F4F4F8]">
      <Navbar user={currentUser} logoUrl={settings.logoUrl} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/35 bg-violet-500/10 px-3 py-0.5 font-mono text-[11px] text-violet-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              ADMIN ACCESS · {currentUser.username}
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">
              Админ-панель Wire DLC
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-[#1E1E2B] bg-[#0B0B11] px-4 py-2.5">
              <div className="font-display text-lg font-bold text-white">{users.length}</div>
              <div className="text-[11px] text-[#64687A]">Юзеров</div>
            </div>
            <div className="rounded-xl border border-[#1E1E2B] bg-[#0B0B11] px-4 py-2.5">
              <div className="font-display text-lg font-bold text-emerald-300">
                {paidUsersCount}
              </div>
              <div className="text-[11px] text-[#64687A]">С подпиской</div>
            </div>
            <div className="rounded-xl border border-[#1E1E2B] bg-[#0B0B11] px-4 py-2.5">
              <div className="font-display text-lg font-bold text-amber-300">
                {pendingOrdersCount}
              </div>
              <div className="text-[11px] text-[#64687A]">Ожидают</div>
            </div>
          </div>
        </div>

        {/* Переключатель вкладок */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { id: 'users' as const, label: 'Пользователи', icon: Users },
            { id: 'orders' as const, label: 'Заказы и платежи', icon: Receipt },
            { id: 'content' as const, label: 'Контент лендинга', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                    : 'border border-[#1E1E2B] bg-[#0B0B11] text-[#9CA3AF] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {notice && (
          <div
            className={`mt-5 flex items-center gap-2.5 rounded-xl border p-3.5 text-sm ${
              notice.type === 'err'
                ? 'border-red-500/35 bg-red-500/10 text-red-200'
                : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{notice.text}</span>
          </div>
        )}

        {/* TAB 1: USERS */}
        {tab === 'users' && (
          <div className="mt-6 rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="font-display text-lg font-bold text-white">
                Список пользователей
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64687A]" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Поиск по нику или email..."
                  className="h-10 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] pl-9 pr-3 text-sm text-white placeholder:text-[#64687A] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs text-[#64687A]">
                    <th className="pb-3 font-medium">Пользователь</th>
                    <th className="pb-3 font-medium">Подписка</th>
                    <th className="pb-3 font-medium">Роль</th>
                    <th className="pb-3 font-medium">Дата</th>
                    <th className="pb-3 font-medium">Управление подпиской и доступом</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredUsers.map((u) => {
                    const chosenTier = selectedTiers[u.id] || 'month';
                    const isSelfMrDarko = u.username.toLowerCase() === 'mrdarko';
                    return (
                      <tr key={u.id} className="align-middle">
                        <td className="py-4 pr-4">
                          <div className="font-semibold text-white">{u.username}</div>
                          <div className="text-xs text-[#9CA3AF]">{u.email}</div>
                          <div className="mt-0.5 font-mono text-[11px] text-[#64687A]">
                            HWID: {u.hwid || 'UNBOUND'}
                          </div>
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              u.subscriptionTier === 'free'
                                ? 'border border-white/10 bg-white/5 text-[#9CA3AF]'
                                : 'border border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                            }`}
                          >
                            {SUBSCRIPTION_TIER_LABELS[u.subscriptionTier]}
                          </span>
                          {u.subscriptionExpiresAt && (
                            <div className="mt-1 text-[11px] text-[#64687A]">
                              до{' '}
                              {new Date(u.subscriptionExpiresAt).toLocaleDateString('ru-RU')}
                            </div>
                          )}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 font-mono text-xs ${
                              u.role === 'admin'
                                ? 'border border-violet-500/40 bg-violet-500/15 text-violet-300'
                                : 'border border-white/10 bg-white/5 text-[#9CA3AF]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-4 pr-4 text-xs text-[#64687A]">
                          {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                        </td>

                        <td className="py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={chosenTier}
                              onChange={(e) =>
                                setSelectedTiers((prev) => ({
                                  ...prev,
                                  [u.id]: e.target.value as SubscriptionTier,
                                }))
                              }
                              className="h-8 rounded-lg border border-[#1E1E2B] bg-[#06060A] px-2 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
                            >
                              <option value="month">30 дней (Month)</option>
                              <option value="quarter">90 дней (3 Months)</option>
                              <option value="lifetime">Навсегда (Lifetime)</option>
                            </select>

                            <button
                              type="button"
                              disabled={busyId === u.id}
                              onClick={() =>
                                mutateUser(u.id, {
                                  action: 'set_subscription',
                                  subscriptionTier: chosenTier,
                                })
                              }
                              className="h-8 rounded-lg bg-[#8B5CF6] px-2.5 text-xs font-semibold text-white transition hover:bg-[#7C3AED] disabled:opacity-50"
                            >
                              Выдать
                            </button>

                            {u.subscriptionTier !== 'free' && (
                              <button
                                type="button"
                                disabled={busyId === u.id}
                                onClick={() =>
                                  mutateUser(u.id, { action: 'revoke_subscription' })
                                }
                                className="h-8 rounded-lg border border-red-500/35 bg-red-500/10 px-2.5 text-xs font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                              >
                                Отозвать
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={busyId === u.id}
                              onClick={() => mutateUser(u.id, { action: 'reset_hwid' })}
                              title="Сбросить привязку HWID"
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#272738] bg-[#12121B] px-2.5 text-xs text-[#D1D5DB] hover:border-violet-500/50 disabled:opacity-50"
                            >
                              <RefreshCw className="h-3 w-3" />
                              HWID
                            </button>

                            {!isSelfMrDarko && (
                              <button
                                type="button"
                                disabled={busyId === u.id}
                                onClick={() =>
                                  mutateUser(u.id, {
                                    action: 'set_role',
                                    role: u.role === 'admin' ? 'user' : 'admin',
                                  })
                                }
                                className="h-8 rounded-lg border border-[#272738] bg-[#12121B] px-2.5 text-xs text-[#9CA3AF] hover:text-white disabled:opacity-50"
                              >
                                {u.role === 'admin' ? 'Сделать user' : 'Сделать admin'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {tab === 'orders' && (
          <div className="mt-6 rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-white">
                Заказы и платежи (заглушки / ручное подтверждение)
              </h2>
              <div className="flex gap-1.5">
                {(['all', 'pending', 'paid', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderFilter(st)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      orderFilter === st
                        ? 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/40'
                        : 'bg-[#06060A] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {st === 'all'
                      ? 'Все'
                      : st === 'pending'
                        ? 'Ожидают'
                        : st === 'paid'
                          ? 'Оплачены'
                          : 'Отменены'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs text-[#64687A]">
                    <th className="pb-3 font-medium">Покупатель</th>
                    <th className="pb-3 font-medium">Товар / Тариф</th>
                    <th className="pb-3 font-medium">Сумма</th>
                    <th className="pb-3 font-medium">Способ</th>
                    <th className="pb-3 font-medium">Статус</th>
                    <th className="pb-3 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-4 pr-4">
                        <div className="font-medium text-white">
                          {order.username || '—'}
                        </div>
                        <div className="text-xs text-[#64687A]">{order.userEmail}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-medium text-white">{order.itemTitle}</div>
                        {order.note && (
                          <div className="mt-0.5 max-w-xs text-xs text-[#9CA3AF]">
                            {order.note}
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4 font-mono text-white">
                        {order.amount}{' '}
                        {order.currency === 'MANDARINS' ? '🍊 мандаринов' : '₽'}
                      </td>
                      <td className="py-4 pr-4 text-xs text-[#9CA3AF]">
                        {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === 'paid'
                              ? 'border border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                              : order.status === 'cancelled'
                                ? 'border border-red-500/35 bg-red-500/10 text-red-300'
                                : 'border border-amber-500/35 bg-amber-500/10 text-amber-300'
                          }`}
                        >
                          {order.status === 'paid'
                            ? 'Оплачен'
                            : order.status === 'cancelled'
                              ? 'Отменён'
                              : 'Ожидает'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {order.status !== 'paid' && (
                            <button
                              type="button"
                              disabled={busyId === order.id}
                              onClick={() => mutateOrder(order.id, 'paid')}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600/80 px-2.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Подтвердить
                            </button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button
                              type="button"
                              disabled={busyId === order.id}
                              onClick={() => mutateOrder(order.id, 'cancelled')}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-500/35 bg-red-500/10 px-2.5 text-xs font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Отмена
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LANDING CONTENT EDITOR */}
        {tab === 'content' && (
          <form
            onSubmit={saveSettings}
            className="mt-6 space-y-5 rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6"
          >
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Редактирование контента лендинга
              </h2>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Изменения сохраняются в БД и сразу отображаются на главной странице и странице тарифов.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">Hero Badge</label>
                <input
                  type="text"
                  value={settings.heroBadge}
                  onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">
                  URL логотипа (по умолчанию /brand/wire-logo.png)
                </label>
                <input
                  type="text"
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">
                  Версия Minecraft
                </label>
                <input
                  type="text"
                  value={settings.minecraftVersion}
                  onChange={(e) =>
                    setSettings({ ...settings, minecraftVersion: e.target.value })
                  }
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">Загрузчик</label>
                <input
                  type="text"
                  value={settings.loaderName}
                  onChange={(e) => setSettings({ ...settings, loaderName: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF]">
                Заголовок Hero (H1)
              </label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF]">Подзаголовок Hero</label>
              <textarea
                rows={3}
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 py-2 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">
                  Пометка бесплатной сборки
                </label>
                <textarea
                  rows={2}
                  value={settings.freeDownloadNote}
                  onChange={(e) =>
                    setSettings({ ...settings, freeDownloadNote: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 py-2 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">
                  Пометка тарифа 90 дней (мандарины)
                </label>
                <textarea
                  rows={2}
                  value={settings.mandarinNote}
                  onChange={(e) => setSettings({ ...settings, mandarinNote: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 py-2 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">
                  Telegram поддержки
                </label>
                <input
                  type="text"
                  value={settings.supportTelegram}
                  onChange={(e) =>
                    setSettings({ ...settings, supportTelegram: e.target.value })
                  }
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">
                  Discord сервера
                </label>
                <input
                  type="text"
                  value={settings.supportDiscord}
                  onChange={(e) =>
                    setSettings({ ...settings, supportDiscord: e.target.value })
                  }
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={busyId === 'settings'}
                className="inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition hover:bg-[#7C3AED] disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {busyId === 'settings' ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
