'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

export const EASE_OBSIDIAN = [0.22, 1, 0.36, 1] as const;

export function FadeUp({
  children,
  delay = 0,
  className = '',
  ...props
}: HTMLMotionProps<'div'> & { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay, ease: EASE_OBSIDIAN }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function HoverCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
