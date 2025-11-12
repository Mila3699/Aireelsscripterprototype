# 🔧 План DRY-рефакторинга: Пошаговая инструкция

## 🎯 ЦЕЛЬ
Устранить ~470 строк дублирующегося кода за 1.5 часа работы

---

## ⚡ ФАЗА 1: КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ (30 минут)

### Шаг 1.1: Создать `/lib/mockData.ts` (5 минут)

```typescript
/**
 * Mock-данные для демонстрационного режима
 * Используется когда backend недоступен
 */

import type { VideoAnalysisResult } from './api';

export const MOCK_ANALYSIS_RESULT: VideoAnalysisResult = {
  title: "Секреты вирусности",
  original: {
    transcription: "Hey everyone! Today I'm going to show you the secret to making viral content. First, you need a strong hook in the first 3 seconds. Then keep the energy high, speak fast but clear, and don't forget to end with a call to action!",
    translation: "Привет всем! Сегодня я покажу вам секрет создания вирусного контента. Во-первых, вам нужен сильный хук в первые 3 секунды. Затем поддерживайте высокую энергию, говорите быстро, но чётко, и не забудьте закончить призывом к действию!",
  },
  keys: [
    {
      title: "Мощный хук",
      description: "Видео начинается с интригующего вопроса, который заставляет зрителя остановиться и досмотреть до конца.",
    },
    {
      title: "Динамичная подача",
      description: "Быстрая речь, энергичная интонация и уверенная подача создают ощущение срочности и важности информации.",
    },
    {
      title: "Четкая структура",
      description: "Контент разбит на понятные этапы: хук → проблема → решение → призыв к действию.",
    },
    {
      title: "Визуальные акценты",
      description: "Частая смена ракурсов, текстовые вставки и эмодзи удерживают внимание зрителя.",
    },
    {
      title: "Пауза для осознания",
      description: "Микро-паузы после ключевых фраз позволяют зрителю усвоить информацию.",
    },
  ],
  script: [
    {
      time: "0-3 сек",
      visual: "Крупный план лица",
      text: "Хотите узнать, как я набрал 1 миллион просмотров за неделю?",
      note: "Интригующий вопрос с конкретной цифрой",
    },
    {
      time: "3-8 сек",
      visual: "Средний план, жестикуляция",
      text: "Я использовал один простой трюк, который меняет всё. И сейчас я покажу его вам!",
      note: "Обещание ценности",
    },
    {
      time: "8-15 сек",
      visual: "Демонстрация (примеры)",
      text: "Первое — ваш хук должен быть неожиданным. Начните с вопроса или смелого заявления.",
      note: "Практический совет №1",
    },
    {
      time: "15-22 сек",
      visual: "Текст на экране",
      text: "Второе — держите темп. Никаких 'воды', только концентрированная польза.",
      note: "Практический совет №2",
    },
    {
      time: "22-30 сек",
      visual: "Возврат к крупному плану",
      text: "И третье — закончите призывом. Попросите подписаться, сохранить или прокомментировать.",
      note: "Призыв к действию",
    },
  ],
  recommendations: [
    {
      category: "Интонация",
      text: "Используйте энергичный тон с акцентами на ключевых словах. Говорите чуть быстрее обычного, но чётко.",
    },
    {
      category: "Музыка",
      text: "Выберите динамичный трек из библиотеки TikTok/Reels. Громкость музыки должна быть на 30% тише голоса.",
    },
    {
      category: "Работа с ИИ-аватаром",
      text: "Для ИИ-аватара: настройте жесты для ключевых моментов, добавьте легкую анимацию переходов.",
    },
    {
      category: "Монтаж",
      text: "Используйте jump cuts (быстрые склейки) каждые 3-5 секунд. Добавьте текстовые вставки на 8 и 15 секундах.",
    },
  ],
  isDemoMode: true,
};
```

**Что изменить:**
- В `/lib/api.ts` удалить MOCK_ANALYSIS_RESULT и импортировать из mockData
- В `/lib/api-supabase.ts` удалить mockResult и импортировать из mockData

---

### Шаг 1.2: Создать `/lib/constants.ts` (10 минут)

```typescript
/**
 * Глобальные константы приложения
 */

// ============ STORAGE ============
export const STORAGE_KEYS = {
  SAVED_SCRIPTS: 'ai_reels_saved_scripts',
} as const;

// ============ ЛИМИТЫ ============
export const LIMITS = {
  MAX_SAVED_SCRIPTS: 30,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB
  MAX_VIDEO_DURATION: 180, // 3 минуты
} as const;

// ============ API ============
export const API_CONFIG = {
  ACCEPTED_FORMATS: ['video/mp4', 'video/quicktime', 'video/webm'] as const,
  BACKEND_URL: 'http://localhost:3001/api',
} as const;

// ============ UI ГРАДИЕНТЫ ============
export const GRADIENTS = {
  // Кнопки
  PRIMARY_BUTTON: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
  SUCCESS_BUTTON: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
  
  // Фоны
  PAGE_BG: 'bg-gradient-to-br from-purple-50 via-white to-blue-50',
  CARD_BG: 'bg-gradient-to-r from-purple-50 to-blue-50',
  
  // Иконки
  ICON_BG: 'bg-gradient-to-br from-purple-500 to-blue-500',
} as const;

// ============ СУPABASE ============
export const SUPABASE_CONFIG = {
  BUCKET_NAME: 'make-f3dc28c4-videos',
  AUTH_STORAGE_KEY: (projectId: string) => `sb-${projectId}-auth-token`,
} as const;

// ============ АНИМАЦИИ ============
export const ANIMATION_DELAYS = {
  LOGO: 0.2,
  TITLE: 0.3,
  FORM: 0.4,
  INFO: 0.5,
} as const;
```

**Что изменить:**
- Заменить все хардкод значения на импорты из constants
- Обновить: api.ts, api-supabase.ts, UploadPage.tsx, ResultsPage.tsx, LoginPage.tsx, RegisterPage.tsx

---

### Шаг 1.3: Удалить дублирование localStorage функций (15 минут)

**Действие:**
1. В `/lib/api.ts` УДАЛИТЬ функции:
   - `getSavedScripts()`
   - `saveScript()`
   - `deleteScript()`
   - `deleteAllScripts()`
   - `getSavedScriptsCount()`
   - `canSaveMoreScripts()`
   - `getRemainingSlots()`

2. Переименовать в `/lib/api-supabase.ts`:
   - `getSavedScriptsFromSupabase()` → `getSavedScripts()`
   - `saveScriptToSupabase()` → `saveScript()`
   - `deleteScriptFromSupabase()` → `deleteScript()`
   - `deleteAllScriptsFromSupabase()` → `deleteAllScripts()`

3. Экспортировать из `/lib/api-supabase.ts`:
```typescript
export {
  getSavedScripts,
  saveScript,
  deleteScript,
  deleteAllScripts,
};
```

4. Обновить импорты где используются (вероятно в App.tsx и SavedScriptsPage.tsx)

---

## 🚀 ФАЗА 2: ВАЖНЫЕ УЛУЧШЕНИЯ (1 час)

### Шаг 2.1: Создать `/lib/validation.ts` (5 минут)

```typescript
/**
 * Утилиты для валидации данных
 */

/**
 * Валидация email адреса
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email обязателен' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Введите корректный email адрес' };
  }

  return { valid: true };
}

/**
 * Валидация пароля
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Пароль обязателен' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Пароль должен быть не менее 6 символов' };
  }

  return { valid: true };
}

/**
 * Валидация совпадения паролей
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Пароли не совпадают' };
  }

  return { valid: true };
}
```

**Что изменить:**
- В LoginPage.tsx и RegisterPage.tsx заменить инлайн валидацию на функции из validation.ts

---

### Шаг 2.2: Создать `/lib/animations.ts` (10 минут)

```typescript
/**
 * Preset анимации для Motion компонентов
 */

import type { Variants } from 'motion/react';

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
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
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
```

**Что изменить:**
- В UploadPage, ResultsPage, LoginPage, RegisterPage заменить inline анимации на импорты

Пример:
```tsx
// Было:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
>

// Стало:
<motion.div {...fadeInUpDelayed(0.4)}>
```

---

### Шаг 2.3: Рефакторинг LoginPage и RegisterPage (45 минут)

#### Шаг 2.3.1: Создать `/components/auth/AuthLayout.tsx`

```typescript
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { AuthStatusChecker } from '../AuthStatusChecker';
import { scaleInSpring, fadeIn, fadeInUpDelayed } from '../../lib/animations';
import { GRADIENTS } from '../../lib/constants';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'login' | 'register';
}

export function AuthLayout({ 
  title, 
  subtitle, 
  children, 
  footer,
  variant = 'login' 
}: AuthLayoutProps) {
  const gradientClass = variant === 'login' 
    ? 'from-purple-500 to-blue-500'
    : 'from-blue-500 to-purple-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <AuthStatusChecker />
      
      <motion.div
        {...fadeInUp}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          {...scaleInSpring}
          className="flex justify-center mb-8"
        >
          <div className={`w-16 h-16 bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </motion.div>

        {/* Form */}
        <motion.div {...fadeInUpDelayed(0.4)}>
          {children}
        </motion.div>

        {/* Footer */}
        {footer && (
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            {footer}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
```

#### Шаг 2.3.2: Создать `/components/auth/FormInput.tsx`

```typescript
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { LucideIcon } from 'lucide-react';

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  disabled?: boolean;
  autoComplete?: string;
}

export function FormInput({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  disabled = false,
  autoComplete,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-10"
          disabled={disabled}
          autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}
```

#### Шаг 2.3.3: Обновить LoginPage.tsx

```tsx
// Использовать AuthLayout и FormInput
// Уменьшит компонент с ~287 строк до ~120 строк
```

#### Шаг 2.3.4: Обновить RegisterPage.tsx

```tsx
// Использовать AuthLayout и FormInput
// Уменьшит компонент с ~270 строк до ~130 строк
```

---

## 📊 РЕЗУЛЬТАТЫ РЕФАКТОРИНГА

### До рефакторинга:
- Дублирующийся код: ~470 строк
- Mock-данные: в 2 файлах
- localStorage функции: 8 дублей
- Auth формы: ~200 строк дублирования
- Магические строки: 50+ повторений

### После рефакторинга:
- ✅ Mock-данные: 1 источник истины
- ✅ localStorage: единая реализация
- ✅ Auth формы: переиспользуемые компоненты
- ✅ Константы: централизованы
- ✅ Анимации: preset библиотека
- ✅ Валидация: утилиты

### Экономия:
- ~470 строк кода устранено
- 7 новых утилит/компонентов
- Легче поддержка и изменения
- Меньше потенциальных багов

---

## ✅ ЧЕКЛИСТ ВЫПОЛНЕНИЯ

### Фаза 1 (обязательно):
- [ ] Создать `/lib/mockData.ts`
- [ ] Обновить импорты в api.ts и api-supabase.ts
- [ ] Создать `/lib/constants.ts`
- [ ] Заменить магические строки на константы
- [ ] Удалить дубли localStorage функций
- [ ] Обновить импорты в компонентах

### Фаза 2 (рекомендуется):
- [ ] Создать `/lib/validation.ts`
- [ ] Обновить валидацию в LoginPage/RegisterPage
- [ ] Создать `/lib/animations.ts`
- [ ] Заменить inline анимации на preset
- [ ] Создать `/components/auth/AuthLayout.tsx`
- [ ] Создать `/components/auth/FormInput.tsx`
- [ ] Рефакторить LoginPage с использованием новых компонентов
- [ ] Рефакторить RegisterPage с использованием новых компонентов

### Тестирование:
- [ ] Проверить работу логина
- [ ] Проверить работу регистрации
- [ ] Проверить работу mock-данных
- [ ] Проверить сохранение сценариев
- [ ] Проверить все анимации

---

## 🎓 BEST PRACTICES

1. **Тестируйте после каждого шага** - не переходите к следующему пока не убедитесь что всё работает
2. **Делайте коммиты** после каждой фазы
3. **Не меняйте функциональность** - только структуру кода
4. **Используйте TypeScript** - он поможет найти ошибки в импортах
5. **Сохраняйте бекапы** - на случай если что-то пойдёт не так

---

## 🚀 ГОТОВЫ НАЧАТЬ?

Начните с Фазы 1, Шаг 1.1 - это займёт всего 5 минут и даст немедленный результат!
