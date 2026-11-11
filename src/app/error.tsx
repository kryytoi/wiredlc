'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Wire DLC ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050507] px-4 text-center text-[#F4F4F8]">
      <div className="w-full max-w-md rounded-2xl border border-[#1E1E2B] bg-[#0B0B11] p-7">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-white">
          Временная ошибка сервера
        </h2>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Не удалось загрузить страницу. Попробуйте обновить экран или вернуться на главную.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-[#64687A]">Digest: {error.digest}</p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7C3AED]"
          >
            <RefreshCw className="h-4 w-4" />
            Повторить
          </button>
          <Link
            href="/"
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#272738] bg-[#12121B] px-4 py-2.5 text-sm font-medium text-white"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
