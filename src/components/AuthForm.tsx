'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, KeyRound, Mail, User, Lock } from 'lucide-react';
import { LogoMark } from './LogoMark';
import { loginSchema, registerSchema } from '@/lib/validation';

interface AuthFormProps {
  mode: 'login' | 'register';
  logoUrl?: string;
}

export function AuthForm({ mode, logoUrl = '/brand/wire-logo.png' }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const discordNotice = searchParams.get('discord');
  const urlInvite = searchParams.get('invite') || '';

  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(urlInvite);
  const [showInviteField, setShowInviteField] = useState(Boolean(urlInvite));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    discordNotice === 'unconfigured'
      ? 'Discord OAuth2 в этом окружении пока не подключён (требуется DISCORD_CLIENT_ID в .env). Войдите через Email / пароль.'
      : null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      const check = loginSchema.safeParse({ identifier, password });
      if (!check.success) {
        setError(check.error.issues[0]?.message || 'Проверьте поля входа');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(check.data),
        });
        const data = (await res.json()) as { error?: string; redirectTo?: string };
        if (!res.ok) {
          setError(data.error || 'Не удалось войти');
          return;
        }
        const destination =
          redirectTarget && redirectTarget.startsWith('/')
            ? redirectTarget
            : data.redirectTo || '/dashboard';
        router.push(destination);
        router.refresh();
      } catch {
        setError('Ошибка сети при входе');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Регистрация
    const check = registerSchema.safeParse({
      username,
      email,
      password,
      inviteCode: inviteCode.trim() || undefined,
    });
    if (!check.success) {
      setError(check.error.issues[0]?.message || 'Проверьте данные регистрации');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(check.data),
      });
      const data = (await res.json()) as { error?: string; redirectTo?: string };
      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
        return;
      }
      const destination =
        redirectTarget && redirectTarget.startsWith('/')
          ? redirectTarget
          : data.redirectTo || '/dashboard';
      router.push(destination);
      router.refresh();
    } catch {
      setError('Ошибка сети при регистрации');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#050507] bg-obsidian-grid px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[110px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#1E1E2B] bg-[#0B0B11]/95 p-7 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-3">
            <LogoMark logoUrl={logoUrl} size="lg" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-white">
            {mode === 'login' ? 'Вход в Wire DLC' : 'Создать аккаунт'}
          </h1>
          <p className="mt-1.5 text-sm text-[#9CA3AF]">
            {mode === 'login'
              ? 'Доступ к загрузке клиента, HWID и подпискам'
              : 'После регистрации сразу откроется личный кабинет'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'login' ? (
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF]">
                Email или никнейм
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64687A]" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="player@example.com или MrDarko"
                  className="h-11 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] pl-10 pr-3.5 text-sm text-white placeholder:text-[#64687A] focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">Никнейм</label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64687A]" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="wire_player"
                    className="h-11 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] pl-10 pr-3.5 text-sm text-white placeholder:text-[#64687A] focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF]">Email</label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64687A]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] pl-10 pr-3.5 text-sm text-white placeholder:text-[#64687A] focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF]">Пароль</label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64687A]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 8 символов"
                className="h-11 w-full rounded-xl border border-[#1E1E2B] bg-[#06060A] pl-10 pr-3.5 text-sm text-white placeholder:text-[#64687A] focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          {mode === 'register' && showInviteField && (
            <div>
              <label className="block text-xs font-medium text-violet-300">
                Скрытый инвайт-код (опционально)
              </label>
              <div className="relative mt-1.5">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Код доступа (если выдан)"
                  className="h-11 w-full rounded-xl border border-violet-500/35 bg-[#06060A] pl-10 pr-3.5 text-sm text-white placeholder:text-[#64687A] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-relaxed text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.3)] transition hover:bg-[#7C3AED] disabled:opacity-60"
          >
            {loading
              ? 'Обработка...'
              : mode === 'login'
                ? 'Войти в кабинет'
                : 'Зарегистрироваться'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-[11px] uppercase tracking-wider text-[#64687A]">или</span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        {/* Задел под Discord OAuth2 */}
        <a
          href="/api/auth/discord"
          className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#272738] bg-[#12121B] text-sm font-medium text-white transition hover:border-[#5865F2]/60 hover:bg-[#5865F2]/10"
        >
          <svg className="h-4 w-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
          </svg>
          Войти через Discord
        </a>

        <div className="mt-6 flex items-center justify-between text-xs text-[#9CA3AF]">
          {mode === 'login' ? (
            <>
              <span>Нет аккаунта?</span>
              <Link href="/register" className="font-semibold text-violet-400 hover:text-violet-300">
                Создать аккаунт →
              </Link>
            </>
          ) : (
            <>
              <span>Уже есть аккаунт?</span>
              <div className="flex items-center gap-3">
                {!showInviteField && (
                  <button
                    type="button"
                    onClick={() => setShowInviteField(true)}
                    className="text-[#64687A] hover:text-violet-300"
                    title="Ввести инвайт-код"
                  >
                    Инвайт
                  </button>
                )}
                <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300">
                  Войти →
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>

      <Link
        href="/"
        className="relative z-10 mt-6 text-xs text-[#64687A] transition hover:text-[#9CA3AF]"
      >
        ← Вернуться на главную
      </Link>
    </div>
  );
}
