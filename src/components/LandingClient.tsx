'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  ShoppingBag,
  Shield,
  Zap,
  Sliders,
  Lock,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { PublicUser, SiteSettings } from '@/lib/types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LogoMark } from './LogoMark';
import { FadeUp, HoverCard, EASE_OBSIDIAN } from './MotionPrimitives';
import { ClickGuiShowcase } from './ClickGuiShowcase';
import { PricingSection } from './PricingSection';
import { DownloadFreeModal } from './DownloadFreeModal';

interface LandingClientProps {
  user: PublicUser | null;
  settings: SiteSettings;
}

const FEATURES = [
  {
    icon: Shield,
    title: 'Аккуратные обходы античитов',
    description:
      'Сбалансированные профили совместимости под популярные серверные античиты с регулярными обновлениями без агрессивного спама пакетами.',
    tag: 'Stability',
  },
  {
    icon: Zap,
    title: 'Нативная база 1.21.11 Fabric',
    description:
      'Лёгкая архитектура без лишнего оверхеда: клиент плавно работает поверх современного Fabric Loader и сохраняет высокий FPS.',
    tag: 'Performance',
  },
  {
    icon: Sliders,
    title: 'Минималистичный ClickGUI',
    description:
      'Логичная структура категорий, быстрый поиск, бинды клавиш и облачные конфиги — всё настраивается за пару кликов.',
    tag: 'Interface',
  },
  {
    icon: Lock,
    title: 'HWID-защита и закрытый чат',
    description:
      'Персональная привязка аккаунта по HWID, оперативный сброс при смене ПК и доступ в закрытое комьюнити покупателей.',
    tag: 'Security',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Для какой версии игры предназначен Wire DLC?',
    a: 'Клиент разрабатывается исключительно под актуальную версию Minecraft 1.21.11 на загрузчике Fabric. Это позволяет поддерживать стабильный FPS и чистую совместимость с современными модами оптимизации.',
  },
  {
    q: 'Чем бесплатная версия отличается от платной подписки?',
    a: 'Бесплатная версия содержит базовый набор визуальных модулей, HUD и оптимизацию производительности для ознакомления с клиентом. Платные тарифы (30 дней, 90 дней, Навсегда) открывают полный функционал, регулярные обновления обходов и доступ в закрытый чат покупателей.',
  },
  {
    q: 'Как работает тариф на 90 дней за 200 мандаринов?',
    a: 'Это специальный сезонный тариф с расчётом в мандаринах. При оформлении заявки выберите способ оплаты и укажите в комментарии удобный формат передачи или уточните актуальный курс через поддержку.',
  },
  {
    q: 'Как оплатить украинской картой (UA) или криптовалютой?',
    a: 'Криптовалюта (USDT, TON, LTC), СБП и карты РФ доступны напрямую при оформлении заявки. Для оплаты UA-картой выберите пункт «UA карты через поддержку» — заявка создастся в кабинете, а менеджер выдаст реквизиты в Telegram.',
  },
  {
    q: 'Что делать, если я сменил ПК или переустановил систему?',
    a: 'В личном кабинете доступен раздел HWID. Стоимость разового сброса привязки устройства составляет 170 ₽. Вы можете оформить заявку на сброс прямо из кабинета или на странице тарифов.',
  },
];

export function LandingClient({ user, settings }: LandingClientProps) {
  const [freeModalOpen, setFreeModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  function scrollToPricing() {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#F4F4F8]">
      <Navbar user={user} logoUrl={settings.logoUrl} onBuyClick={scrollToPricing} />

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-white/[0.06] bg-obsidian-grid">
          {/* Фоновое радиальное свечение */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.14] blur-[140px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OBSIDIAN }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-200">
                  <Layers className="h-3.5 w-3.5 text-violet-400" />
                  <span className="font-mono">{settings.heroBadge}</span>
                </div>

                <h1 className="mt-6 font-display text-4xl font-bold leading-[1.06] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                  {settings.heroTitle}
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#9CA3AF] sm:text-lg">
                  {settings.heroSubtitle}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={scrollToPricing}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_32px_rgba(139,92,246,0.38)] transition hover:bg-[#7C3AED]"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Купить
                  </button>

                  <button
                    type="button"
                    onClick={() => setFreeModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#272738] bg-[#0C0C12] px-6 py-3.5 text-sm font-semibold text-[#F4F4F8] transition hover:border-violet-500/50 hover:bg-[#12121B]"
                  >
                    <Download className="h-4 w-4 text-violet-400" />
                    Скачать бесплатно
                  </button>
                </div>

                {/* Сдержанные технические характеристики */}
                <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/[0.07] pt-6">
                  <div>
                    <div className="font-mono text-sm font-semibold text-white">
                      {settings.minecraftVersion} {settings.loaderName}
                    </div>
                    <div className="mt-0.5 text-xs text-[#64687A]">Актуальная база</div>
                  </div>
                  <div>
                    <div className="font-mono text-sm font-semibold text-white">от 150 ₽</div>
                    <div className="mt-0.5 text-xs text-[#64687A]">Доступ без подписок</div>
                  </div>
                  <div>
                    <div className="font-mono text-sm font-semibold text-white">HWID Lock</div>
                    <div className="mt-0.5 text-xs text-[#64687A]">Сброс за 170 ₽</div>
                  </div>
                </div>
              </motion.div>

              {/* Логотип Wire DLC (3D "W") с плавным свечением */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE_OBSIDIAN }}
                className="relative flex items-center justify-center"
              >
                <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl border border-white/[0.06] bg-[#050507] shadow-[0_0_80px_rgba(139,92,246,0.16)] sm:h-80 sm:w-80">
                  <div
                    aria-hidden="true"
                    className="absolute inset-6 rounded-full bg-violet-600/20 blur-3xl"
                  />
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10"
                  >
                    <LogoMark logoUrl={settings.logoUrl} size="hero" />
                  </motion.div>
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0B0B11]/85 px-3 py-2 backdrop-blur-md">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#9CA3AF]">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      Build Ready
                    </span>
                    <span className="font-mono text-[11px] text-violet-300">
                      {settings.minecraftVersion} · {settings.loaderName}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeUp>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-violet-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Преимущества
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ничего лишнего. Только контроль.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-[#9CA3AF]">
                Мы убрали визуальный шум и оставили то, что важно в игре: отзывчивость, стабильный FPS и предсказуемую работу модулей.
              </p>
            </div>
          </FadeUp>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {FEATURES.map((item, index) => {
              const Icon = item.icon;
              return (
                <FadeUp key={item.title} delay={index * 0.06}>
                  <HoverCard className="h-full rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-6 transition-colors hover:border-[#2D2B42]">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#64687A]">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                      {item.description}
                    </p>
                  </HoverCard>
                </FadeUp>
              );
            })}
          </div>
        </section>

        {/* INTERACTIVE UI PREVIEW */}
        <section id="preview" className="border-y border-white/[0.06] bg-[#07070B]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <FadeUp>
              <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-violet-400">
                    Визуал и интерфейс
                  </span>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Интерактивный прототип ClickGUI
                  </h2>
                </div>
                <p className="max-w-md text-sm text-[#9CA3AF]">
                  Попробуйте переключение категорий и ползунки прямо на сайте до загрузки клиента.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <ClickGuiShowcase
                minecraftVersion={settings.minecraftVersion}
                loaderName={settings.loaderName}
              />
            </FadeUp>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeUp>
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-violet-400">
                  Прайс-лист
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Прозрачные тарифы Wire DLC
                </h2>
              </div>
              <p className="max-w-md text-sm text-[#9CA3AF]">
                Никаких скрытых автосписаний. Выбирайте удобный срок и подходящий способ оплаты.
              </p>
            </div>
          </FadeUp>

          <PricingSection
            user={user}
            minecraftVersion={settings.minecraftVersion}
            loaderName={settings.loaderName}
            mandarinNote={settings.mandarinNote}
            supportTelegram={settings.supportTelegram}
          />
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="border-t border-white/[0.06] bg-[#07070B]">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
            <FadeUp>
              <div className="text-center">
                <span className="font-mono text-xs uppercase tracking-widest text-violet-400">
                  FAQ
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Частые вопросы
                </h2>
              </div>
            </FadeUp>

            <div className="mt-10 space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={item.q}
                    className="overflow-hidden rounded-2xl border border-[#1E1E2B] bg-[#0B0B11]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="font-display text-base font-semibold text-white">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-violet-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/[0.05] px-5 py-4 text-sm leading-relaxed text-[#9CA3AF]">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />

      <DownloadFreeModal
        open={freeModalOpen}
        onClose={() => setFreeModalOpen(false)}
        minecraftVersion={settings.minecraftVersion}
        loaderName={settings.loaderName}
        freeDownloadNote={settings.freeDownloadNote}
      />
    </div>
  );
}
