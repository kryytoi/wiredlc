'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, X, Check } from 'lucide-react';

export function ClickGuiShowcase({
  minecraftVersion = '1.21.11',
  loaderName = 'Fabric',
}: {
  minecraftVersion?: string;
  loaderName?: string;
}) {
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Скриншот реального ClickGUI Wire DLC */}
      <div className="group relative overflow-hidden rounded-2xl border border-[#1E1E2B] bg-[#09090F] shadow-[0_24px_80px_rgba(0,0,0,0.75)] transition-colors hover:border-violet-500/40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-b from-violet-500/10 via-transparent to-transparent opacity-60"
        />

        <div className="relative overflow-hidden">
          <img
            src="/screenshots/clickgui.png"
            alt={`Wire DLC ClickGUI для Minecraft ${minecraftVersion} ${loaderName}`}
            className="block h-auto w-full select-none object-cover"
          />

          {/* Кнопка увеличения скриншота */}
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label="Увеличить скриншот ClickGUI"
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#050507]/85 px-3 py-2 text-xs font-medium text-[#F4F4F8] backdrop-blur-md transition hover:border-violet-400/60 hover:text-white"
          >
            <Maximize2 className="h-3.5 w-3.5 text-violet-400" />
            Открыть крупнее
          </button>
        </div>
      </div>

      {/* Компактные акценты по реальному интерфейсу */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Модульная 3-колоночная сетка',
            caption: 'Мгновенный доступ к категориям Combat, Movement, Visuals и профилям конфигов.',
          },
          {
            title: 'Точные слайдеры и режимы',
            caption: 'Тонкая настройка Range, FOV, Delay и приоритетов целей в реальном времени.',
          },
          {
            title: `Оптимизация под ${minecraftVersion} ${loaderName}`,
            caption: 'Плавный рендер меню без просадок FPS поверх современного Fabric Loader.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-[#1E1E2B] bg-[#0B0B11] p-4 transition-colors hover:border-[#2D2B42]"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-[#F4F4F8]">
              <Check className="h-3.5 w-3.5 shrink-0 text-violet-400" />
              {item.title}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#9CA3AF]">{item.caption}</p>
          </div>
        ))}
      </div>

      {/* Лайтбокс для просмотра скриншота во весь экран */}
      <AnimatePresence>
        {zoomOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-6xl overflow-hidden rounded-2xl border border-[#2D2B42] bg-[#09090F] shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                aria-label="Закрыть просмотр"
                className="absolute right-3 top-3 z-20 rounded-xl border border-white/15 bg-[#050507]/85 p-2 text-[#D1D5DB] backdrop-blur-md transition hover:border-violet-400/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src="/screenshots/clickgui.png"
                alt={`Wire DLC ClickGUI для Minecraft ${minecraftVersion} ${loaderName}`}
                className="block max-h-[85vh] w-full object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
