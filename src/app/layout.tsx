import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wire DLC — Минималистичный клиент для Minecraft 1.21.11 Fabric',
  description:
    'Wire DLC — современный клиент для Minecraft 1.21.11 на базе Fabric. Адаптивные обходы античитов, оптимизированный рендер и гибкий ClickGUI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen bg-[#050507] text-[#F4F4F8] selection:bg-violet-500/30 selection:text-violet-100">
        {children}
      </body>
    </html>
  );
}
