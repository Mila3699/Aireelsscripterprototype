# 🔒 Безопасность приложения

## Обзор

AI Reels Scripter реализует комплексные меры безопасности для защиты пользователей и системы от различных угроз.

---

## 🛡️ Реализованные меры безопасности

### 1. UTF-8 и шрифты с кириллицей

#### ✅ Что сделано:

- **Кодировка UTF-8**: Добавлена в `index.html` через `<meta charset="UTF-8">`
- **Google Fonts Inter**: Подключен с полной поддержкой кириллицы
- **Запасные шрифты**: Настроена цепочка системных шрифтов

#### Файлы:
- `/index.html` - мета-тег charset
- `/styles/globals.css` - импорт Google Fonts и fallback шрифты

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
  'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
  'Helvetica Neue', Arial, sans-serif, 
  'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
```

---

### 2. Поддержка устройств за последние ~5 лет

#### ✅ Что сделано:

Создан файл `/.browserslistrc` с настройками для современных браузеров:

```
> 0.2%
last 5 years
not dead

Chrome >= 80
Firefox >= 75
Safari >= 13
Edge >= 80
iOS >= 13
Android >= 80
```

#### Поддерживаемые браузеры:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ iOS Safari 13+
- ✅ Android 80+
- ❌ IE 11 (не поддерживается)

---

### 3. Rate Limiting - защита от спама

#### ✅ Что сделано:

Создана система ограничения запросов `/lib/rateLimiter.ts`:

#### Лимиты:

**Анализ видео:**
- 5 запросов в 15 минут
- Автоматический сброс счетчика
- Информативные сообщения об ошибках

**Сохранение сценариев:**
- 10 сохранений в 5 минут

#### Использование:

```typescript
import { videoAnalysisLimiter } from './lib/rateLimiter';

// Проверка лимита
const limitCheck = videoAnalysisLimiter.checkLimit();
if (!limitCheck.allowed) {
  throw new Error(limitCheck.message);
}

// Регистрация запроса
videoAnalysisLimiter.recordRequest();
```

#### Функции:
- `checkLimit()` - проверить, можно ли выполнить запрос
- `recordRequest()` - зарегистрировать новый запрос
- `getStatus()` - получить текущий статус лимита
- `reset()` - сбросить счетчик (для тестирования)

---

### 4. Защита от XSS-уязвимостей

#### ✅ Что сделано:

Создана система санитизации данных `/lib/sanitizer.ts`:

#### Функции защиты:

**1. Санитизация текста:**
```typescript
import { sanitizeText } from './lib/sanitizer';

const safeText = sanitizeText(userInput);
```

**2. Санитизация HTML:**
```typescript
import { escapeHtml, stripHtmlTags } from './lib/sanitizer';

const escaped = escapeHtml('<script>alert("XSS")</script>');
// Результат: <script>alert(&quot;XSS&quot;)</script>
```

**3. Санитизация URL:**
```typescript
import { sanitizeUrl } from './lib/sanitizer';

const safeUrl = sanitizeUrl(inputUrl);
// Блокирует: javascript:, data:, vbscript:, file:
```

**4. Санитизация имен файлов:**
```typescript
import { sanitizeFilename } from './lib/sanitizer';

const safeName = sanitizeFilename('../../etc/passwd');
// Результат: .._.._.._etc_passwd
```

**5. Валидация MIME типов:**
```typescript
import { isValidVideoMimeType } from './lib/sanitizer';

if (!isValidVideoMimeType(file.type)) {
  throw new Error('Недопустимый тип файла');
}
```

**6. Глубокая санитизация объектов:**
```typescript
import { deepSanitize } from './lib/sanitizer';

const safeData = deepSanitize(apiResponse);
```

#### Content Security Policy (CSP):

Добавлена в `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  media-src 'self' blob:;
  connect-src 'self' http://localhost:* https:;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
" />
```

#### Защита в компонентах:

**UploadPage.tsx:**
- Валидация MIME типов перед загрузкой
- Санитизация имен файлов

**api.ts:**
- Санитизация всех данных от API
- Санитизация перед сохранением в localStorage

---

## 📋 Где применяется защита

### Frontend (React)
- ✅ Все пользовательские данные санитизируются перед отображением
- ✅ React автоматически экранирует JSX (защита от XSS)
- ✅ Никогда не используется `dangerouslySetInnerHTML` без санитизации

### API Integration
- ✅ Все данные от внешних API санитизируются
- ✅ Валидация структуры JSON
- ✅ Rate limiting для всех запросов

### LocalStorage
- ✅ Данные санитизируются перед сохранением
- ✅ Валидация при чтении из localStorage

---

## 🚨 Что НЕ защищено (требует backend)

### Требуется для production:

1. **Backend Rate Limiting**
   - Текущий rate limiting работает на frontend (может быть обойден)
   - Нужен серверный rate limiting на backend

2. **API Keys**
   - Google AI API ключи должны храниться только на backend
   - Никогда не передавайте API ключи на frontend

3. **Аутентификация**
   - Текущая версия не требует авторизации
   - Для production добавьте JWT/OAuth

4. **HTTPS**
   - Используйте только HTTPS в production
   - Настройте SSL сертификаты

5. **File Upload Security**
   - Backend должен проверять:
     - Реальный MIME тип (не только расширение)
     - Содержимое файла (сканирование на вирусы)
     - Размер и количество файлов

---

## 🔧 Настройка для Production

### 1. Backend Security Headers

Добавьте в ваш backend (Node.js пример):

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 2. Rate Limiting на Backend

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 запросов
  message: 'Превышен лимит запросов. Попробуйте позже.'
});

app.use('/api/analyze', apiLimiter);
```

### 3. CORS

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://your-domain.com',
  credentials: true
}));
```

### 4. Sanitization на Backend

```javascript
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

function sanitizeInput(input) {
  return DOMPurify.sanitize(validator.escape(input));
}
```

---

## 📖 Дополнительные рекомендации

### Для разработчиков:

1. **Никогда не доверяйте данным от пользователя**
   - Всегда санитизируйте input
   - Валидируйте на backend

2. **Используйте HTTPS везде**
   - Локально: `mkcert` для dev сертификатов
   - Production: Let's Encrypt или CloudFlare

3. **Регулярно обновляйте зависимости**
   ```bash
   npm audit
   npm audit fix
   ```

4. **Тестируйте безопасность**
   - OWASP ZAP
   - Burp Suite
   - npm audit

5. **Логирование и мониторинг**
   - Логируйте все подозрительные действия
   - Используйте Sentry или аналоги для отслеживания ошибок

---

## 📚 Полезные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#jsx-and-security)
- [Google AI API Security](https://ai.google.dev/gemini-api/docs/security)

---

## ✅ Чеклист безопасности

### Frontend (выполнено):
- ✅ UTF-8 кодировка
- ✅ Шрифты с кириллицей
- ✅ Rate Limiting (client-side)
- ✅ XSS защита (sanitization)
- ✅ CSP meta tag
- ✅ MIME type validation
- ✅ Filename sanitization
- ✅ Browserslist конфигурация

### Backend (требуется реализация):
- ⏳ Rate Limiting (server-side)
- ⏳ CORS настройка
- ⏳ Helmet security headers
- ⏳ API key защита
- ⏳ File upload security
- ⏳ JWT/OAuth аутентификация
- ⏳ HTTPS/SSL
- ⏳ Virus scanning
- ⏳ Input validation
- ⏳ Logging и monitoring

---

**Дата создания документации:** 10 ноября 2025  
**Версия:** 1.0
