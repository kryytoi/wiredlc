'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  Wind,
  Eye,
  Sliders,
  Search,
  Sparkles,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

interface GuiModule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  keybind: string;
  sliderLabel: string;
  sliderValue: number;
  sliderMin: number;
  sliderMax: number;
  sliderUnit: string;
}

type CategoryKey = 'combat' | 'movement' | 'visuals' | 'misc';

const CATEGORIES: Array<{ key: CategoryKey; label: string; icon: typeof Crosshair }> = [
  { key: 'combat', label: 'Combat', icon: Crosshair },
  { key: 'movement', label: 'Movement', icon: Wind },
  { key: 'visuals', label: 'Visuals', icon: Eye },
  { key: 'misc', label: 'Misc', icon: Sliders },
];

const INITIAL_MODULES: Record<CategoryKey, GuiModule[]> = {
  combat: [
    {
      id: 'rotation-assist',
      name: 'SmoothAim',
      description: 'Плавная адаптивная ротация с человеческим ускорением курсора.',
      enabled: true,
      keybind: 'R',
      sliderLabel: 'Скорость наведения',
      sliderValue: 74,
      sliderMin: 10,
      sliderMax: 100,
      sliderUnit: '%',
    },
    {
      id: 'trigger',
      name: 'SmartTrigger',
      description: 'Автоматический тайминг удара при попадании цели в хитбокс.',
      enabled: true,
      keybind: 'G',
      sliderLabel: 'Задержка отклика',
      sliderValue: 18,
      sliderMin: 0,
      sliderMax: 60,
      sliderUnit: ' мс',
    },
    {
      id: 'velocity-control',
      name: 'KnockbackTune',
      description: 'Тонкая калибровка отдачи с учётом актуальных проверок серверов.',
      enabled: false,
      keybind: 'V',
      sliderLabel: 'Компенсация',
      sliderValue: 85,
      sliderMin: 0,
      sliderMax: 100,
      sliderUnit: '%',
    },
    {
      id: 'auto-totem',
      name: 'TotemGuard',
      description: 'Своевременный перенос тотема в левую руку при критическом HP.',
      enabled: true,
      keybind: 'T',
      sliderLabel: 'Порог HP',
      sliderValue: 7,
      sliderMin: 2,
      sliderMax: 18,
      sliderUnit: ' HP',
    },
  ],
  movement: [
    {
      id: 'sprint',
      name: 'OmniSprint',
      description: 'Стабильный спринт без лишнего сброса анимации.',
      enabled: true,
      keybind: 'NONE',
      sliderLabel: 'Ускорение',
      sliderValue: 100,
      sliderMin: 50,
      sliderMax: 120,
      sliderUnit: '%',
    },
    {
      id: 'elytra-control',
      name: 'ElytraTune',
      description: 'Плавная стабилизация полёта на элитрах и экономия фейерверков.',
      enabled: false,
      keybind: 'F',
      sliderLabel: 'Угол пикирования',
      sliderValue: 32,
      sliderMin: 10,
      sliderMax: 60,
      sliderUnit: '°',
    },
    {
      id: 'no-slow',
      name: 'SmoothMove',
      description: 'Оптимизация движения при использовании предметов.',
      enabled: true,
      keybind: 'B',
      sliderLabel: 'Сохранение темпа',
      sliderValue: 88,
      sliderMin: 20,
      sliderMax: 100,
      sliderUnit: '%',
    },
  ],
  visuals: [
    {
      id: 'esp-minimal',
      name: 'ObsidianESP',
      description: 'Тонкая контурная подсветка игроков и сущностей без потери FPS.',
      enabled: true,
      keybind: 'X',
      sliderLabel: 'Прозрачность контура',
      sliderValue: 80,
      sliderMin: 10,
      sliderMax: 100,
      sliderUnit: '%',
    },
    {
      id: 'hud-clean',
      name: 'MinimalHUD',
      description: 'Компактный Watermark, FPS, бинды и эффекты зелий в стиле Wire DLC.',
      enabled: true,
      keybind: 'H',
      sliderLabel: 'Размытие фона',
      sliderValue: 65,
      sliderMin: 0,
      sliderMax: 100,
      sliderUnit: '%',
    },
    {
      id: 'jump-circle',
      name: 'PulseRing',
      description: 'Мягкое неоновое кольцо под ногами при прыжке.',
      enabled: false,
      keybind: 'J',
      sliderLabel: 'Радиус волны',
      sliderValue: 14,
      sliderMin: 5,
      sliderMax: 30,
      sliderUnit: 'x',
    },
  ],
  misc: [
    {
      id: 'fps-boost',
      name: 'FabricRenderOpt',
      description: 'Оптимизация отрисовки частиц и сущностей на 1.21.11 Fabric.',
      enabled: true,
      keybind: 'NONE',
      sliderLabel: 'Лимит частиц',
      sliderValue: 40,
      sliderMin: 0,
      sliderMax: 100,
      sliderUnit: '%',
    },
    {
      id: 'cloud-cfg',
      name: 'CloudSync',
      description: 'Быстрое сохранение и загрузка пресетов конфигурации.',
      enabled: true,
      keybind: 'C',
      sliderLabel: 'Автосейв (мин)',
      sliderValue: 5,
      sliderMin: 1,
      sliderMax: 30,
      sliderUnit: ' м',
    },
  ],
};

export function ClickGuiShowcase({
  minecraftVersion = '1.21.11',
  loaderName = 'Fabric',
}: {
  minecraftVersion?: string;
  loaderName?: string;
}) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('combat');
  const [modules, setModules] = useState(INITIAL_MODULES);
  const [search, setSearch] = useState('');

  const currentList = modules[activeCategory].filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleModule(id: string) {
    setModules((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map((m) =>
        m.id === id ? { ...m, enabled: !m.enabled } : m,
      ),
    }));
  }

  function updateSlider(id: string, value: number) {
    setModules((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map((m) =>
        m.id === id ? { ...m, sliderValue: value } : m,
      ),
    }));
  }

  const enabledCount = Object.values(modules)
    .flat()
    .filter((m) => m.enabled).length;

  return (
    <div className="space-y-8">
      {/* Интерактивный ClickGUI-прототип */}
      <div className="overflow-hidden rounded-2xl border border-[#1E1E2B] bg-[#09090F] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        {/* Верхняя панель имитации внутриигрового окна */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0C0C14] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>
            <span className="font-mono text-xs text-[#9CA3AF]">
              Wire DLC ClickGUI · {minecraftVersion} {loaderName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64687A]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск модуля..."
                className="h-8 w-44 rounded-lg border border-[#1E1E2B] bg-[#050507] pl-8 pr-3 text-xs text-white placeholder:text-[#64687A] focus:border-violet-500/70 focus:outline-none sm:w-52"
              />
            </div>
            <span className="hidden rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] text-emerald-300 sm:inline-flex">
              Активно: {enabledCount}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-[210px_1fr]">
          {/* Боковое меню категорий */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-white/[0.06] bg-[#0A0A10] p-3 md:flex-col md:border-b-0 md:border-r">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`relative flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-[#9CA3AF] hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="clickgui-active-tab"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      className="absolute inset-0 rounded-xl border border-violet-500/40 bg-violet-500/15"
                    />
                  )}
                  <Icon className={`relative z-10 h-4 w-4 ${isActive ? 'text-violet-400' : ''}`} />
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}

            <div className="mt-auto hidden rounded-xl border border-white/[0.05] bg-[#06060A] p-3 text-xs text-[#64687A] md:block">
              <div className="flex items-center gap-1.5 font-medium text-[#9CA3AF]">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                Интерактив
              </div>
              <p className="mt-1 leading-relaxed">
                Переключайте модули и крутите слайдеры прямо здесь, чтобы оценить логику GUI.
              </p>
            </div>
          </div>

          {/* Сетка модулей */}
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid gap-3.5 sm:grid-cols-2"
              >
                {currentList.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-sm text-[#64687A]">
                    Модули по запросу «{search}» не найдены.
                  </div>
                ) : (
                  currentList.map((mod) => (
                    <div
                      key={mod.id}
                      className={`rounded-xl border p-4 transition-colors ${
                        mod.enabled
                          ? 'border-violet-500/40 bg-[#11111B]'
                          : 'border-[#1E1E2B] bg-[#0C0C12]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-semibold text-white">
                              {mod.name}
                            </span>
                            <span className="rounded border border-white/[0.08] bg-[#050507] px-1.5 py-0.5 font-mono text-[10px] text-[#9CA3AF]">
                              {mod.keybind}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
                            {mod.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleModule(mod.id)}
                          aria-pressed={mod.enabled}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                            mod.enabled ? 'bg-[#8B5CF6]' : 'bg-[#1E1E2B]'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              mod.enabled ? 'left-[22px]' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
                          <span>{mod.sliderLabel}</span>
                          <span className="font-mono text-violet-300">
                            {mod.sliderValue}
                            {mod.sliderUnit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={mod.sliderMin}
                          max={mod.sliderMax}
                          value={mod.sliderValue}
                          onChange={(e) => updateSlider(mod.id, Number(e.target.value))}
                          className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#1E1E2B] accent-[#8B5CF6]"
                        />
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Слоты под скриншоты из игры (плейсхолдеры для заказчика) */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Минималистичный HUD в бою',
            caption: 'Плейсхолдер скриншота #1 · замените на реальный PNG/WebP в public/screenshots/',
            tag: 'HUD + Keybinds',
          },
          {
            title: 'Плавные визуалы & ESP',
            caption: 'Плейсхолдер скриншота #2 · контурная подсветка без просадок FPS на 1.21.11',
            tag: 'Render Engine',
          },
          {
            title: 'Редактор облачных профилей',
            caption: 'Плейсхолдер скриншота #3 · быстрое переключение конфигов под разные режимы',
            tag: 'Cloud Configs',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-xl border border-dashed border-[#272738] bg-[#09090E] p-5 transition hover:border-violet-500/40"
          >
            <div className="mb-4 flex aspect-video items-center justify-center rounded-lg border border-white/[0.04] bg-gradient-to-br from-[#0F0F19] via-[#08080D] to-[#130D24]">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#64687A]">
                  {item.tag}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#F4F4F8]">
              <Check className="h-3.5 w-3.5 text-violet-400" />
              {item.title}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#64687A]">{item.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
