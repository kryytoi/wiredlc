import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';
import { LogoMark } from './LogoMark';

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050507]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark logoUrl={settings.logoUrl} size="sm" />
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Wire <span className="font-mono text-xs uppercase text-violet-400">DLC</span>
              </span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#9CA3AF]">
              Минималистичный модульный клиент для Minecraft {settings.minecraftVersion}{' '}
              ({settings.loaderName}). Чистый интерфейс, аккуратная оптимизация и стабильная работа.
            </p>
            <p className="mt-4 text-xs text-[#64687A]">
              Wire DLC не аффилирован с Mojang AB или Microsoft.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64687A]">
              Навигация
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#9CA3AF]">
              <li>
                <Link href="/#features" className="transition hover:text-white">
                  Возможности
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition hover:text-white">
                  Тарифы и оплата
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition hover:text-white">
                  Личный кабинет
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-white">
                  Вход в аккаунт
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64687A]">
              Поддержка
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#9CA3AF]">
              <li>
                <a
                  href={settings.supportTelegram}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-violet-300"
                >
                  Telegram (UA карты / вопросы)
                </a>
              </li>
              <li>
                <a
                  href={settings.supportDiscord}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-violet-300"
                >
                  Discord сообщество
                </a>
              </li>
              <li className="pt-1 font-mono text-xs text-[#64687A]">
                Версия: {settings.minecraftVersion} {settings.loaderName}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-[#64687A] sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Wire DLC. Все права защищены.</span>
          <span className="font-mono">Build Target: Fabric {settings.minecraftVersion}</span>
        </div>
      </div>
    </footer>
  );
}
