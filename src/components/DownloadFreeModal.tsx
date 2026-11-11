'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, X, Terminal, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DownloadFreeModalProps {
  open: boolean;
  onClose: () => void;
  minecraftVersion: string;
  loaderName: string;
  freeDownloadNote: string;
}

export function DownloadFreeModal({
  open,
  onClose,
  minecraftVersion,
  loaderName,
  freeDownloadNote,
}: DownloadFreeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-[#272738] bg-[#0B0B11] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-[11px] text-violet-300">
                  {minecraftVersion} · {loaderName}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white">
                  Скачать Wire DLC (Free)
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/[0.08] p-1.5 text-[#9CA3AF] transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">{freeDownloadNote}</p>

            <div className="mt-4 space-y-2.5 rounded-xl border border-[#1E1E2B] bg-[#06060A] p-4 text-xs text-[#9CA3AF]">
              <div className="flex items-center gap-2 font-medium text-white">
                <Terminal className="h-4 w-4 text-violet-400" />
                Быстрая установка на {loaderName} {minecraftVersion}
              </div>
              <ol className="list-inside list-decimal space-y-1.5 text-[#9CA3AF]">
                <li>Установите актуальный Fabric Loader для Minecraft {minecraftVersion}.</li>
                <li>Поместите скачанный файл в папку <code className="text-violet-300">.minecraft/mods</code>.</li>
                <li>Запустите игру и откройте меню клиента клавишей <code className="text-violet-300">Right Shift</code>.</li>
              </ol>
            </div>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <a
                href="/api/download/free"
                download
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] transition hover:bg-[#7C3AED]"
              >
                <Download className="h-4 w-4" />
                Скачать .jar (MVP-сборка)
              </a>
              <Link
                href="/pricing"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#272738] bg-[#11111A] px-4 py-3 text-sm font-medium text-[#F4F4F8] transition hover:border-violet-500/40"
              >
                Полная версия
                <ArrowRight className="h-4 w-4 text-violet-400" />
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-[#64687A]">
              <Shield className="h-3.5 w-3.5 text-emerald-400/80" />
              <span>Для полного набора модулей и закрытого чата выберите платный тариф.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
