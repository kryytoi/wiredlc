import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Включаем встроенный node:sqlite и bcryptjs как внешние пакеты для серверной сборки
  serverExternalPackages: ['node:sqlite', 'bcryptjs'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
