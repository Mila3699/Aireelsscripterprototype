/**
 * Глобальные константы приложения
 * Центральное место для всех магических чисел и конфигурации
 */

// ============ API & BACKEND ============

export const API = {
  /** URL backend сервера (по умолчанию localhost для разработки) */
  BACKEND_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 'http://localhost:3001/api',
  
  /** Таймаут для запросов к backend (мс) */
  REQUEST_TIMEOUT: 5000,
  
  /** Таймаут для анализа видео (мс) */
  ANALYSIS_TIMEOUT: 120000, // 2 минуты
  
  /** Максимальное количество повторных попыток */
  MAX_RETRIES: 3,
  
  /** Задержка между повторными попытками (мс) */
  RETRY_DELAY: 1000,
} as const;

// ============ ФАЙЛЫ И МЕДИА ============

export const VIDEO = {
  /** Максимальный размер файла в байтах (100 МБ) */
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  
  /** Максимальная длительность видео в секундах (3 минуты) */
  MAX_DURATION: 180,
  
  /** Поддерживаемые MIME типы */
  ACCEPTED_FORMATS: [
    'video/mp4',
    'video/quicktime', 
    'video/webm'
  ] as const,
  
  /** Расширения файлов для отображения */
  ACCEPTED_EXTENSIONS: ['MP4', 'MOV', 'WEBM'] as const,
} as const;

// ============ ХРАНИЛИЩЕ ============

export const STORAGE = {
  /** Ключ для сохранения сценариев в localStorage */
  SCRIPTS_KEY: 'ai_reels_saved_scripts',
  
  /** Максимальное количество сохранённых сценариев */
  MAX_SAVED_SCRIPTS: 30,
  
  /** Ключ для настроек пользователя */
  SETTINGS_KEY: 'ai_reels_settings',
  
  /** Ключ для истории действий */
  HISTORY_KEY: 'ai_reels_history',
} as const;

// ============ UI & UX ============

export const UI = {
  /** Время показа toast уведомлений (мс) */
  TOAST_DURATION: 3000,
  
  /** Длительность анимаций (мс) */
  ANIMATION_DURATION: 300,
  
  /** Длительность плавных переходов (мс) */
  TRANSITION_DURATION: 600,
  
  /** Debounce задержка для поиска (мс) */
  SEARCH_DEBOUNCE: 300,
  
  /** Минимальная высота кнопок для touch устройств (px) */
  MIN_TOUCH_TARGET: 44,
  
  /** Отступ снизу для мобильной навигации (px) */
  BOTTOM_NAV_HEIGHT: 80,
} as const;

// ============ АНИМАЦИИ ============

export const ANIMATIONS = {
  /** Параметры spring анимации */
  SPRING: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
  },
  
  /** Параметры fade-in анимации */
  FADE_IN: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  /** Параметры slide-in анимации */
  SLIDE_IN: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  
  /** Параметры scale анимации */
  SCALE: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
  
  /** Stagger delay для списков */
  STAGGER_DELAY: 0.1,
} as const;

// ============ ТЕКСТЫ ============

export const MESSAGES = {
  /** Сообщения об ошибках */
  ERRORS: {
    NO_FILE: 'Пожалуйста, загрузите видео',
    INVALID_FORMAT: 'Неподдерживаемый формат. Используйте MP4, MOV или WEBM',
    FILE_TOO_LARGE: `Файл слишком большой. Максимум ${VIDEO.MAX_FILE_SIZE / (1024 * 1024)} МБ`,
    VIDEO_TOO_LONG: `Видео слишком длинное. Максимум ${VIDEO.MAX_DURATION / 60} минут`,
    NETWORK_ERROR: 'Нет подключения к интернету. Проверьте соединение',
    BACKEND_ERROR: 'Ошибка сервера. Попробуйте позже',
    QUOTA_EXCEEDED: `Достигнут лимит сохранений (${STORAGE.MAX_SAVED_SCRIPTS}). Удалите старые сценарии`,
    UNKNOWN_ERROR: 'Произошла непредвиденная ошибка',
  },
  
  /** Сообщения об успехе */
  SUCCESS: {
    FILE_UPLOADED: 'Видео готово к анализу!',
    SCRIPT_SAVED: 'Сценарий сохранён',
    SCRIPT_DELETED: 'Сценарий удалён',
    ALL_DELETED: 'Все сценарии удалены',
    COPIED: 'Сценарий скопирован в буфер обмена',
  },
  
  /** Информационные сообщения */
  INFO: {
    DEMO_MODE: 'Работает демо-режим с примерными данными',
    PROCESSING: 'Анализируем видео...',
    BACKEND_CONNECTING: 'Подключение к серверу...',
  },
} as const;

// ============ ROUTES & NAVIGATION ============

export const ROUTES = {
  HOME: '/',
  UPLOAD: '/upload',
  PROCESSING: '/processing',
  RESULTS: '/results',
  SAVED: '/saved',
  HELP: '/help',
} as const;

export const NAV_TABS = {
  HOME: 'home',
  SAVED: 'saved',
  HELP: 'help',
} as const;

// ============ BREAKPOINTS ============

export const BREAKPOINTS = {
  /** Мобильные устройства */
  MOBILE: 640,
  
  /** Планшеты */
  TABLET: 768,
  
  /** Десктопы */
  DESKTOP: 1024,
  
  /** Большие экраны */
  WIDE: 1280,
} as const;

// ============ COLORS (для JS логики) ============

export const COLORS = {
  PRIMARY: '#8B5CF6',     // purple-600
  SECONDARY: '#3B82F6',   // blue-600
  SUCCESS: '#10B981',     // green-600
  ERROR: '#EF4444',       // red-600
  WARNING: '#F59E0B',     // amber-600
  INFO: '#0EA5E9',        // sky-600
} as const;

// ============ REGEX PATTERNS ============

export const PATTERNS = {
  /** Email validation */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  /** URL validation */
  URL: /^https?:\/\/.+/,
  
  /** Только цифры */
  DIGITS_ONLY: /^\d+$/,
  
  /** Безопасное имя файла */
  SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/,
} as const;

// ============ FEATURE FLAGS ============

export const FEATURES = {
  /** Включить PWA функциональность */
  ENABLE_PWA: true,
  
  /** Включить аналитику */
  ENABLE_ANALYTICS: false,
  
  /** Включить error tracking (Sentry) */
  ENABLE_ERROR_TRACKING: false,
  
  /** Включить haptic feedback на мобильных */
  ENABLE_HAPTICS: true,
  
  /** Включить pull-to-refresh */
  ENABLE_PULL_TO_REFRESH: false,
  
  /** Показывать dev tools в production */
  SHOW_DEV_TOOLS: typeof import.meta !== 'undefined' && import.meta.env?.DEV,
} as const;

// ============ ЛОКАЛИЗАЦИЯ ============

export const LOCALE = {
  /** Язык по умолчанию */
  DEFAULT: 'ru-RU',
  
  /** Временная зона */
  TIMEZONE: 'Europe/Moscow',
  
  /** Формат даты */
  DATE_FORMAT: 'dd.MM.yyyy',
  
  /** Формат времени */
  TIME_FORMAT: 'HH:mm',
} as const;

// ============ ANALYTICS EVENTS ============

export const ANALYTICS_EVENTS = {
  VIDEO_UPLOADED: 'video_uploaded',
  VIDEO_ANALYZED: 'video_analyzed',
  SCRIPT_SAVED: 'script_saved',
  SCRIPT_DELETED: 'script_deleted',
  SCRIPT_COPIED: 'script_copied',
  ERROR_OCCURRED: 'error_occurred',
  PAGE_VIEW: 'page_view',
} as const;

// ============ ТИПЫ (для TypeScript) ============

export type AppState = 'upload' | 'processing' | 'results' | 'saved' | 'help';
export type NavTab = typeof NAV_TABS[keyof typeof NAV_TABS];
export type VideoFormat = typeof VIDEO.ACCEPTED_FORMATS[number];
export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// ============ УТИЛИТЫ ============

/**
 * Проверить, работает ли приложение в production
 */
export const isProduction = (): boolean => {
  return typeof import.meta !== 'undefined' && import.meta.env?.PROD === true;
};

/**
 * Проверить, работает ли приложение в development
 */
export const isDevelopment = (): boolean => {
  return typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;
};

/**
 * Получить полный URL backend
 */
export const getBackendUrl = (path: string = ''): string => {
  return `${API.BACKEND_URL}${path}`;
};

/**
 * Форматировать размер файла
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/**
 * Форматировать длительность (секунды → мм:сс)
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Задержка (для async/await)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Проверить, мобильное ли устройство
 */
export const isMobile = (): boolean => {
  return window.innerWidth < BREAKPOINTS.TABLET;
};

/**
 * Проверить, touch устройство
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Безопасное получение значения из localStorage
 */
export const getLocalStorage = <T = any,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Безопасное сохранение в localStorage
 */
export const setLocalStorage = <T = any,>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
