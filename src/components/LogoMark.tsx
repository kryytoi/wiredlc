'use client';

import { useState } from 'react';

interface LogoMarkProps {
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  hero: 'h-48 w-48 sm:h-60 sm:w-60',
};

/**
 * Компонент логотипа Wire DLC.
 * По умолчанию отображает предоставленный заказчиком 3D-логотип (/brand/wire-logo.png)
 * с mix-blend-screen, чтобы чистый чёрный фон логотипа бесшовно растворялся в обсидиановом фоне #050507.
 * Если путь изменён или файл недоступен, отображается векторный плейсхолдер.
 */
export function LogoMark({ logoUrl = '/brand/wire-logo.png', size = 'sm', className = '' }: LogoMarkProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !logoUrl) {
    return (
      <div
        className={`${SIZE_MAP[size]} ${className} relative flex items-center justify-center rounded-xl border border-violet-500/35 bg-violet-950/30 text-violet-300 shadow-[0_0_24px_rgba(139,92,246,0.25)]`}
        aria-label="Wire DLC Logo Placeholder"
      >
        <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none">
          <path
            d="M4 7L10.5 25L16 12L21.5 25L28 7"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${SIZE_MAP[size]} ${className} relative flex items-center justify-center select-none`}>
      <img
        src={logoUrl}
        alt="Wire DLC Logo"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain logo-blend pointer-events-none"
      />
    </div>
  );
}
