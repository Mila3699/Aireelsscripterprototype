/**
 * Preset анимации для Motion компонентов
 */

import type { Variant } from 'motion/react';

// Базовые анимации
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const scaleIn = {
  initial: { scale: 0 },
  animate: { scale: 1 },
};

export const slideInLeft = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
};

// С кастомными transitions
export const scaleInSpring = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { type: 'spring', stiffness: 200 },
};

export const fadeInUpDelayed = (delay: number = 0.4) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay },
});

// Анимация для списков (stagger)
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

// Анимация "wiggle" для привлечения внимания
export const wiggle = {
  animate: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
  },
  transition: {
    duration: 0.6,
    repeat: 2,
  },
};

// Пульсация для кнопки
export const pulse = {
  animate: {
    scale: [1, 1.02, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};
