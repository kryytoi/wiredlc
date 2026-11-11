'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShieldCheck, User, LogOut, Sparkles } from 'lucide-react';
import type { PublicUser } from '@/lib/types';
import { LogoMark } from './LogoMark';

interface NavbarProps {
  user: PublicUser | null;
  logoUrl?: string;
  onBuyClick?: () => void;
}

export function Navbar({ user, logoUrl = '/brand/wire-logo.png', onBuyClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navLinks = [
    { href: '/#features', label: 'Возможности' },
    { href: '/#preview', label: 'Интерфейс' },
    { href: '/pricing', label: 'Тарифы' },
    { href: '/#faq', label: 'FAQ' },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <LogoMark logoUrl={logoUrl} size="sm" />
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-lg font-bold tracking-tight text-[#F4F4F8] transition-colors group-hover:text-violet-300">
              Wire
            </span>
            <span className="font-mono text-xs font-medium uppercase tracking-widest text-violet-400">
              DLC
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  active
                    ? 'font-medium text-white'
                    : 'text-[#9CA3AF] hover:text-[#F4F4F8]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition hover:border-violet-400/60 hover:bg-violet-500/20"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Админка
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-[#1E1E2B] bg-[#0C0C12] px-3.5 py-2 text-sm font-medium text-[#F4F4F8] transition hover:border-[#2D2B42] hover:bg-[#12121B]"
              >
                <User className="h-4 w-4 text-violet-400" />
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Выйти"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E1E2B] bg-[#0C0C12] text-[#9CA3AF] transition hover:border-red-500/40 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#9CA3AF] transition hover:text-[#F4F4F8]"
              >
                Войти
              </Link>
              {onBuyClick ? (
                <button
                  onClick={onBuyClick}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.3)] transition hover:bg-[#7C3AED]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Купить
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.3)] transition hover:bg-[#7C3AED]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Купить
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E1E2B] bg-[#0C0C12] text-[#F4F4F8] md:hidden"
          aria-label="Меню"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-[#08080D] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-[#9CA3AF] transition hover:bg-white/[0.04] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-white/[0.06]" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-[#12121B] px-3 py-2.5 text-sm font-medium text-white"
                >
                  Кабинет ({user.username})
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2.5 text-sm font-medium text-violet-300"
                  >
                    Админ-панель
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                >
                  Выйти
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-[#1E1E2B] bg-[#0C0C12] px-3 py-2.5 text-center text-sm font-medium text-white"
                >
                  Войти
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-[#8B5CF6] px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Купить
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
