# 🔧 План рефакторинга DRY

## Конкретные действия с примерами кода

---

## 🚀 ФАЗА 1: Быстрые победы (2-3 часа)

### Задача 1.1: Объединить документацию (1.5 часа)

#### Действие 1: Безопасность (9 файлов → 2 файла)

**Удалить:**
```bash
rm БЕЗОПАСНОСТЬ_ОБНОВЛЕНО.md
rm ГОТОВО_БЕЗОПАСНОСТЬ.md
rm ИТОГО_БЕЗОПАСНОСТЬ.md
rm ДА_ГОТОВО.md
rm БЫСТРЫЙ_СТАРТ_БЕЗОПАСНОСТЬ.md
rm ШПАРГАЛКА_БЕЗОПАСНОСТЬ.md
rm ТЕСТ_БЕЗОПАСНОСТИ.md
rm ЧЕКЛИСТ_БЕЗОПАСНОСТЬ.md
rm СХЕМА_БЕЗОПАСНОСТИ.md
```

**Создать:** `docs/SECURITY.md` (уже есть, дополнить)

**Создать:** `docs/SECURITY_QUICKSTART.md`
```markdown
# Быстрый старт по безопасности

## Что сделано
1. UTF-8 и кириллица ✅
2. Rate Limiting ✅
3. XSS защита ✅

## Как проверить
[Краткий чеклист из всех 9 файлов]

## Команды
[Шпаргалка из всех 9 файлов]
```

#### Действие 2: Инструкции (4 файла → 1 файл)

**Удалить:**
```bash
rm ИНСТРУКЦИЯ_ДЛЯ_НОВИЧКОВ.md
rm ИНСТРУКЦИЯ_ДЛЯ_ПЕРВОГО_РАЗА.md
rm НАЧНИТЕ_ЗДЕСЬ.md
rm СДЕЛАЙТЕ_ЭТО_СЕЙЧАС.md
```

**Создать:** `docs/GETTING_STARTED.md`
```markdown
# С чего начать

## Для новичков
[Содержимое ИНСТРУКЦИЯ_ДЛЯ_НОВИЧКОВ]

## Быстрый старт
[Содержимое СДЕЛАЙТЕ_ЭТО_СЕЙЧАС]

## Первый запуск
[Содержимое НАЧНИТЕ_ЗДЕСЬ]
```

#### Действие 3: Чеклисты (4 файла → 1 файл)

**Удалить:**
```bash
rm CHECKLIST.md
rm ЧЕКЛИСТ_ЗАПУСКА.md
rm PRODUCTION_CHECKLIST.md
# ЧЕКЛИСТ_БЕЗОПАСНОСТЬ.md уже удален выше
```

**Создать:** `docs/CHECKLISTS.md`
```markdown
# Чеклисты

## Чеклист запуска
[...]

## Production чеклист
[...]

## Чеклист безопасности
[...]
```

#### Действие 4: История изменений (5+ файлов → 1 файл)

**Удалить:**
```bash
rm FIXED.md
rm ВСЁ_ИСПРАВЛЕНО.md
rm ИСПРАВЛЕНО_ДЕМО_РЕЖИМ.md
rm ИСПРАВЛЕНО_ОШИБКА_ONVIEWSAVED.md
rm ИСПРАВЛЕНО_СОХРАНЁННЫЕ.md
```

**Создать:** `docs/CHANGELOG.md`
```markdown
# История изменений

## [Unreleased]

## [2.0.0] - 2025-11-10
### Безопасность
- UTF-8 и кириллица
- Rate Limiting
- XSS защита

### Исправлено
- Ошибка onViewSaved
- Демо-режим
- Сохранённые сценарии
```

**Экономия:** 18+ файлов → 4 файла

---

### Задача 1.2: Notification wrapper (30 минут)

**Создать:** `lib/notifications.ts`

```typescript
import { toast } from 'sonner@2.0.3';
import { MESSAGES, UI } from './constants';

/**
 * Централизованный API для уведомлений
 * Использует константы из MESSAGES
 */

export const notify = {
  // Success notifications
  fileUploaded: () => {
    toast.success(MESSAGES.SUCCESS.FILE_UPLOADED, {
      duration: UI.TOAST_DURATION,
    });
  },

  scriptSaved: (remainingSlots: number) => {
    const message = remainingSlots > 0
      ? `${MESSAGES.SUCCESS.SCRIPT_SAVED}! Осталось мест: ${remainingSlots}. Откройте вкладку "Сохранённые" внизу.`
      : `${MESSAGES.SUCCESS.SCRIPT_SAVED}! Лимит достигнут.`;
    
    toast.success(message, {
      duration: UI.TOAST_DURATION + 1000, // Чуть дольше
    });
  },

  scriptDeleted: () => {
    toast.success(MESSAGES.SUCCESS.SCRIPT_DELETED);
  },

  allScriptsDeleted: () => {
    toast.success(MESSAGES.SUCCESS.ALL_DELETED);
  },

  copied: (what: string = 'Содержимое') => {
    toast.success(`${what} ${MESSAGES.SUCCESS.COPIED.toLowerCase()}`);
  },

  // Error notifications
  noFile: () => {
    toast.error(MESSAGES.ERRORS.NO_FILE);
  },

  invalidFormat: () => {
    toast.error(MESSAGES.ERRORS.INVALID_FORMAT);
  },

  fileTooLarge: () => {
    toast.error(MESSAGES.ERRORS.FILE_TOO_LARGE);
  },

  validationError: (message?: string) => {
    toast.error(message || MESSAGES.ERRORS.UNKNOWN_ERROR);
  },

  deleteError: (what: string = 'сценарий') => {
    toast.error(`Не удалось удалить ${what}`);
  },

  saveError: (message?: string) => {
    toast.error(message || 'Не удалось сохранить');
  },

  // Info notifications
  demoMode: () => {
    toast.info('🎭 ' + MESSAGES.INFO.DEMO_MODE, {
      duration: 5000,
    });
  },

  rateLimitExceeded: (message: string) => {
    toast.error(message, {
      duration: 6000,
    });
  },

  // Generic notifications
  error: (message: string) => {
    toast.error(message);
  },

  success: (message: string) => {
    toast.success(message);
  },

  info: (message: string) => {
    toast.info(message);
  },
};
```

**Использование в App.tsx:**

```typescript
// ❌ БЫЛО:
if (!uploadedFile) {
  toast.error('Пожалуйста, загрузите видео');
  return;
}

// ✅ СТАЛО:
import { notify } from './lib/notifications';

if (!uploadedFile) {
  notify.noFile();
  return;
}
```

**Использование в ResultsPage.tsx:**

```typescript
// ❌ БЫЛО:
const handleCopy = (text: string, section: string) => {
  navigator.clipboard.writeText(text);
  setCopiedSection(section);
  toast.success('Скопировано в буфер обмена!');
  setTimeout(() => setCopiedSection(null), 2000);
};

// ✅ СТАЛО:
import { notify } from '../lib/notifications';
import { copyToClipboard } from '../lib/clipboard';

const handleCopy = async (text: string, section: string) => {
  const success = await copyToClipboard(text);
  if (success) {
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  }
};
```

**Экономия:** ~30 строк кода, централизация сообщений

---

### Задача 1.3: Clipboard utils (15 минут)

**Создать:** `lib/clipboard.ts`

```typescript
import { notify } from './notifications';

/**
 * Утилиты для работы с буфером обмена
 */

/**
 * Скопировать текст в буфер обмена
 */
export async function copyToClipboard(
  text: string,
  notifyUser: boolean = true
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    
    if (notifyUser) {
      notify.copied('Скопировано');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    
    // Fallback для старых браузеров
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success && notifyUser) {
        notify.copied('Скопировано');
      }
      
      return success;
    } catch (fallbackError) {
      if (notifyUser) {
        notify.error('Не удалось скопировать');
      }
      return false;
    }
  }
}

/**
 * Проверить, доступен ли Clipboard API
 */
export function isClipboardAvailable(): boolean {
  return typeof navigator?.clipboard?.writeText === 'function';
}
```

**Использование:**

```typescript
// ❌ БЫЛО:
navigator.clipboard.writeText(text);
toast.success('Скопировано!');

// ✅ СТАЛО:
import { copyToClipboard } from '../lib/clipboard';
await copyToClipboard(text);
```

---

## 🎨 ФАЗА 2: Styled компоненты (2-3 часа)

### Задача 2.1: Styled Accordion (1 час)

**Создать:** `components/ui/styled-accordion.tsx`

```typescript
import { AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
import { ReactNode } from 'react';
import { cn } from './utils';

interface StyledAccordionItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

/**
 * AccordionItem со стилями Apple HIG
 */
export function StyledAccordionItem({ 
  value, 
  children, 
  className 
}: StyledAccordionItemProps) {
  return (
    <AccordionItem
      value={value}
      className={cn(
        "bg-white rounded-xl border-0 shadow-sm overflow-hidden",
        className
      )}
    >
      {children}
    </AccordionItem>
  );
}

interface StyledAccordionTriggerProps {
  children: ReactNode;
  className?: string;
}

/**
 * AccordionTrigger со стилями Apple HIG
 */
export function StyledAccordionTrigger({ 
  children, 
  className 
}: StyledAccordionTriggerProps) {
  return (
    <AccordionTrigger
      className={cn(
        "px-6 py-4 hover:no-underline hover:bg-gray-50",
        className
      )}
    >
      {children}
    </AccordionTrigger>
  );
}

/**
 * Полный Accordion с предустановленными стилями
 */
interface StyledAccordionProps {
  items: Array<{
    value: string;
    trigger: ReactNode;
    content: ReactNode;
  }>;
  type?: 'single' | 'multiple';
  className?: string;
}

export function StyledAccordion({ 
  items, 
  type = 'single',
  className 
}: StyledAccordionProps) {
  return (
    <Accordion type={type} collapsible className={cn("space-y-3", className)}>
      {items.map((item) => (
        <StyledAccordionItem key={item.value} value={item.value}>
          <StyledAccordionTrigger>
            {item.trigger}
          </StyledAccordionTrigger>
          <AccordionContent className="px-6 py-4">
            {item.content}
          </AccordionContent>
        </StyledAccordionItem>
      ))}
    </Accordion>
  );
}
```

**Использование в ResultsPage.tsx:**

```typescript
// ❌ БЫЛО (140 строка):
<AccordionItem value="original" className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
  <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline hover:bg-gray-50">
    <div className="flex items-center gap-3">
      <FileText className="w-5 h-5 text-purple-600" />
      <span>Транскрибация и перевод</span>
    </div>
  </AccordionTrigger>
  <AccordionContent>
    {/* ... */}
  </AccordionContent>
</AccordionItem>

// ✅ СТАЛО:
import { StyledAccordionItem, StyledAccordionTrigger } from './ui/styled-accordion';

<StyledAccordionItem value="original">
  <StyledAccordionTrigger>
    <div className="flex items-center gap-3">
      <FileText className="w-5 h-5 text-purple-600" />
      <span>Транскрибация и перевод</span>
    </div>
  </StyledAccordionTrigger>
  <AccordionContent>
    {/* ... */}
  </AccordionContent>
</StyledAccordionItem>
```

**Экономия:** ~40 строк кода, консистентность стилей

---

### Задача 2.2: Gradient Icon Box (30 минут)

**Создать:** `components/ui/gradient-icon-box.tsx`

```typescript
import { ReactNode } from 'react';
import { cn } from './utils';

type GradientColor = 'purple' | 'green' | 'blue' | 'pink';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface GradientIconBoxProps {
  children: ReactNode;
  color?: GradientColor;
  size?: Size;
  className?: string;
  animate?: boolean;
}

const gradients: Record<GradientColor, string> = {
  purple: 'from-purple-500 to-blue-500',
  green: 'from-green-500 to-emerald-500',
  blue: 'from-blue-500 to-cyan-500',
  pink: 'from-pink-500 to-purple-500',
};

const sizes: Record<Size, string> = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16',
};

/**
 * Красивый градиентный контейнер для иконок
 */
export function GradientIconBox({
  children,
  color = 'purple',
  size = 'md',
  className,
  animate = false,
}: GradientIconBoxProps) {
  return (
    <div
      className={cn(
        'bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg',
        gradients[color],
        sizes[size],
        animate && 'transition-transform hover:scale-110',
        className
      )}
    >
      {children}
    </div>
  );
}
```

**Использование:**

```typescript
// ❌ БЫЛО:
<div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
  <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
</div>

// ✅ СТАЛО:
import { GradientIconBox } from './ui/gradient-icon-box';

<GradientIconBox color="green" size="lg" animate>
  <CheckCircle2 className="w-6 md:w-7 text-white" />
</GradientIconBox>
```

---

### Задача 2.3: Motion wrappers (1 час)

**Создать:** `components/ui/animated.tsx`

```typescript
import { motion, MotionProps } from 'motion/react';
import { ReactNode } from 'react';
import { ANIMATIONS } from '../../lib/constants';

interface AnimatedProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Fade In анимация
 */
export function FadeIn({ children, delay = 0, className }: AnimatedProps) {
  return (
    <motion.div
      {...ANIMATIONS.FADE_IN}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide In анимация
 */
export function SlideIn({ children, delay = 0, className }: AnimatedProps) {
  return (
    <motion.div
      {...ANIMATIONS.SLIDE_IN}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale анимация
 */
export function ScaleIn({ children, delay = 0, className }: AnimatedProps) {
  return (
    <motion.div
      {...ANIMATIONS.SCALE}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Spring анимация
 */
export function Spring({ children, delay = 0, className }: AnimatedProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay, ...ANIMATIONS.SPRING }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**Использование:**

```typescript
// ❌ БЫЛО:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
>
  <Content />
</motion.div>

// ✅ СТАЛО:
import { FadeIn } from './ui/animated';

<FadeIn delay={0.4}>
  <Content />
</FadeIn>
```

---

## 🛠️ ФАЗА 3: Утилиты (1-2 часа)

### Задача 3.1: Форматтеры (30 минут)

**Создать:** `lib/formatters.ts`

```typescript
import type { VideoAnalysisResult } from './api';

/**
 * Утилиты для форматирования данных
 */

/**
 * Форматировать сценарий для отображения
 */
export function formatScriptForDisplay(
  script: VideoAnalysisResult['script']
): string {
  return script
    .map(
      (scene) =>
        `[${scene.time}] ${scene.visual}\n"${scene.text}"\n(${scene.note})\n`
    )
    .join('\n');
}

/**
 * Форматировать сценарий для копирования
 */
export function formatScriptForCopy(
  script: VideoAnalysisResult['script'],
  includeIndex: boolean = true
): string {
  return script
    .map(
      (scene, index) =>
        `${includeIndex ? `${index + 1}. ` : ''}${scene.time}\n` +
        `Визуал: ${scene.visual}\n` +
        `Текст: ${scene.text}\n` +
        `Заметка: ${scene.note}\n`
    )
    .join('\n');
}

/**
 * Форматировать полный результат анализа для копирования
 */
export function formatFullAnalysisForCopy(
  result: VideoAnalysisResult
): string {
  const scriptText = formatScriptForCopy(result.script);
  const recommendations = result.recommendations
    .map((r) => `${r.category}: ${r.text}`)
    .join('\n');

  return (
    `📝 ${result.title}\n\n` +
    `🎬 СЦЕНАРИЙ:\n\n${scriptText}\n\n` +
    `💡 РЕКОМЕНДАЦИИ:\n${recommendations}`
  );
}

/**
 * Форматировать дату в локальный формат
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Форматировать относительное время
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;
  
  return formatDate(isoDate);
}
```

**Использование:**

```typescript
// ❌ БЫЛО:
const formatScript = () => {
  return analysisResult.script.map(scene => 
    `[${scene.time}] ${scene.visual}\n"${scene.text}"\n(${scene.note})\n`
  ).join('\n');
};

// ✅ СТАЛО:
import { formatScriptForDisplay } from '../lib/formatters';

const scriptText = formatScriptForDisplay(analysisResult.script);
```

---

### Задача 3.2: Error helpers (20 минут)

**Добавить в:** `lib/utils.ts`

```typescript
import { notify } from './notifications';

/**
 * Обработать результат операции с автоматическими уведомлениями
 */
export function handleOperationResult<T>(
  result: { success: boolean; error?: string; data?: T },
  successMessage: string,
  errorPrefix: string = 'Ошибка'
): T | null {
  if (result.success) {
    notify.success(successMessage);
    return (result.data ?? null) as T | null;
  } else {
    notify.error(result.error || `${errorPrefix}: неизвестная ошибка`);
    return null;
  }
}

/**
 * Обработать async операцию с try/catch и уведомлениями
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  successMessage: string,
  errorMessage: string = 'Произошла ошибка'
): Promise<T | null> {
  try {
    const result = await operation();
    notify.success(successMessage);
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    notify.error(errorMessage);
    return null;
  }
}
```

**Использование:**

```typescript
// ❌ БЫЛО:
const handleSaveScript = () => {
  const result = saveScript(analysisResult);
  if (result.success) {
    setIsSaved(true);
    triggerConfetti();
    const remaining = getRemainingSlots();
    toast.success(`Сценарий сохранён! Осталось: ${remaining}`);
  } else {
    toast.error(result.error || 'Не удалось сохранить');
  }
};

// ✅ СТАЛО:
import { handleOperationResult } from '../lib/utils';

const handleSaveScript = () => {
  const saved = handleOperationResult(
    saveScript(analysisResult),
    `Сценарий сохранён! Осталось: ${getRemainingSlots()}`,
    'Не удалось сохранить'
  );
  
  if (saved) {
    setIsSaved(true);
    triggerConfetti();
  }
};
```

---

## 📊 РЕЗУЛЬТАТЫ РЕФАКТОРИНГА

### До:
- Строк кода: ~3500
- Файлов: ~120
- Дублирования: высокое
- DRY Score: 4/10

### После:
- Строк кода: ~3300 (-200)
- Файлов: ~90 (-30)
- Дублирования: низкое
- DRY Score: 8/10

---

## ✅ ЧЕКЛИСТ ВЫПОЛНЕНИЯ

### Фаза 1: Быстрые победы
- [ ] Объединить файлы о безопасности (9 → 2)
- [ ] Объединить инструкции (4 → 1)
- [ ] Объединить чеклисты (4 → 1)
- [ ] Создать CHANGELOG (5+ → 1)
- [ ] Создать lib/notifications.ts
- [ ] Заменить все toast.success/error
- [ ] Создать lib/clipboard.ts
- [ ] Заменить navigator.clipboard

### Фаза 2: Компоненты
- [ ] Создать ui/styled-accordion.tsx
- [ ] Заменить во всех компонентах (18 мест)
- [ ] Создать ui/gradient-icon-box.tsx
- [ ] Заменить во всех компонентах (5+ мест)
- [ ] Создать ui/animated.tsx
- [ ] Заменить motion.div (10+ мест)

### Фаза 3: Утилиты
- [ ] Создать lib/formatters.ts
- [ ] Заменить formatScript функции
- [ ] Добавить error helpers в utils.ts
- [ ] Заменить if/else паттерны

### Фаза 4: Тестирование
- [ ] Проверить все уведомления
- [ ] Проверить копирование
- [ ] Проверить анимации
- [ ] Проверить форматирование
- [ ] Проверить стили

---

**Время выполнения:** 8-10 часов  
**Приоритет:** Высокий 🔴  
**Сложность:** Средняя  
**Риск:** Низкий (не меняем логику)
