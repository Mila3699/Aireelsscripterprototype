# AI Reels Scripter

> **Анализируй вирусные ролики. Получай готовые сценарии.**

Превращайте успешные Reels и TikTok в адаптированные сценарии на русском языке с помощью Google Gemini AI.

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Возможности

<table>
<tr>
<td width="33%" align="center">
  <h3>🎯 Умный анализ</h3>
  <p>Выявление хуков, структуры и ключей успеха</p>
</td>
<td width="33%" align="center">
  <h3>📝 Готовый сценарий</h3>
  <p>Пошаговый план с таймингом и текстами</p>
</td>
<td width="33%" align="center">
  <h3>⚡ Быстро</h3>
  <p>Результат за 90 секунд</p>
</td>
</tr>
</table>

- ✅ **Drag & Drop загрузка** - Перетащите видео и получите результат
- ✅ **AI-powered** - Анализ с помощью Google Gemini 1.5 Pro
- ✅ **Полный разбор** - Транскрипция, ключи успеха, сценарий, рекомендации
- ✅ **Локальное хранение** - До 30 сценариев в браузере
- ✅ **Адаптивный дизайн** - Идеально на мобильных и десктопе
- ✅ **Демо-режим** - Работает без backend для тестирования

---

## 🚀 Быстрый старт

### За 30 секунд

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск приложения
npm run dev

# 3. Откройте в браузере
# http://localhost:5173
```

**Готово!** Приложение работает в демо-режиме с примерными данными.

### С реальным AI (Google Gemini)

```bash
# 1. Перейдите в папку backend
cd backend-example

# 2. Установите зависимости
npm install

# 3. Создайте .env файл
echo "GOOGLE_AI_API_KEY=your_api_key_here" > .env

# 4. Запустите backend
npm start

# 5. В другом терминале запустите frontend
cd ..
npm run dev
```

📚 [Подробная инструкция по интеграции](docs/INTEGRATION_GUIDE.md)

---

## 📸 Скриншоты

### Главный экран
<img src="docs/screenshots/upload.png" width="800" alt="Экран загрузки видео">

### Результаты анализа
<img src="docs/screenshots/results.png" width="800" alt="Результаты анализа">

### Сохранённые сценарии
<img src="docs/screenshots/saved.png" width="800" alt="Список сохранённых">

---

## 🏗️ Технологический стек

| Категория | Технологии |
|-----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Стили** | Tailwind CSS 4.0, shadcn/ui |
| **Анимации** | Motion (Framer Motion) |
| **Backend** | Node.js / Python (опционально) |
| **AI** | Google Gemini 1.5 Pro API |
| **Хранение** | localStorage (frontend) |

---

## 📁 Структура проекта

```
ai-reels-scripter/
├── components/              # React компоненты
│   ├── UploadPage.tsx      # Загрузка видео
│   ├── ProcessingPage.tsx  # Экран обработки
│   ├── ResultsPage.tsx     # Результаты анализа
│   ├── SavedScriptsPage.tsx # Сохранённые сценарии
│   ├── HelpPage.tsx        # Справка
│   ├── BottomNavigation.tsx # Нижняя панель
│   ├── ErrorBoundary.tsx   # Обработка ошибок
│   └── ui/                 # shadcn/ui компоненты
├── lib/
│   └── api.ts              # API логика и mock данные
├── styles/
│   └── globals.css         # Глобальные стили
├── backend-example/        # Пример backend сервера
│   ├── server.js           # Node.js сервер
│   └── server.py           # Python альтернатива
├── docs/                   # Документация
└── App.tsx                 # Главный компонент
```

---

## 🎯 Как это работает

### 1. Загрузка видео
```
Пользователь → Drag & Drop → Валидация → ✅
                                         ↓
                                    Готов к анализу
```

### 2. Анализ с AI
```
Видео → Backend → Google Gemini API → Анализ контента
                                      ↓
                        ┌─────────────┴─────────────┐
                        │                           │
                  Транскрипция              Ключи успеха
                        │                           │
                        └─────────────┬─────────────┘
                                      ↓
                              Готовый сценарий
                                      ↓
                               Рекомендации
```

### 3. Результат
- **Транскрипция** - Оригинал + перевод на русский
- **Ключи успеха** - 5 причин вирусности
- **Сценарий** - Пошаговый план (время, визуал, текст, заметки)
- **Рекомендации** - Советы по созданию

---

## 🔌 API Интеграция

### Демо-режим (по умолчанию)

Приложение работает с mock данными без backend:

```typescript
// lib/api.ts
const MOCK_ANALYSIS_RESULT = {
  title: "Секреты вирусности",
  original: { transcription: "...", translation: "..." },
  keys: [...],
  script: [...],
  recommendations: [...]
};
```

### Production режим

1. **Получите API ключ Google AI**
   - Перейдите на [makersuite.google.com](https://makersuite.google.com/app/apikey)
   - Создайте проект и включите Gemini API
   - Скопируйте API ключ

2. **Настройте backend**
   ```bash
   cd backend-example
   npm install
   echo "GOOGLE_AI_API_KEY=your_key" > .env
   npm start
   ```

3. **Подключите frontend к backend**
   ```typescript
   // lib/api.ts
   export const API_CONFIG = {
     BACKEND_URL: 'http://localhost:3001/api',
     // Для production: 'https://your-domain.com/api'
   };
   ```

📚 [Полная инструкция по интеграции](docs/INTEGRATION_GUIDE.md)

---

## ⚙️ Конфигурация

### Environment Variables

```bash
# .env (backend)
GOOGLE_AI_API_KEY=your_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id
MAX_FILE_SIZE=104857600  # 100 MB
MAX_VIDEO_DURATION=180   # 3 минуты
PORT=3001
```

### API Config

```typescript
// lib/api.ts
export const API_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,      // 100 MB
  MAX_VIDEO_DURATION: 180,                // 3 минуты
  ACCEPTED_FORMATS: [
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ],
  BACKEND_URL: 'http://localhost:3001/api'
};
```

---

## 📦 Деплой

### Vercel (Рекомендуется)

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Деплой
vercel

# 3. Настройте environment variables в dashboard
# GOOGLE_AI_API_KEY=...
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-reels-scripter)

### Netlify

```bash
# 1. Установите Netlify CLI
npm i -g netlify-cli

# 2. Деплой
netlify deploy --prod
```

### Docker

```bash
# Build
docker build -t ai-reels-scripter .

# Run
docker run -p 5173:5173 ai-reels-scripter
```

📚 [Подробная инструкция по деплою](docs/DEPLOYMENT.md)

---

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🛠️ Разработка

### Запуск в dev режиме

```bash
npm run dev
```

### Build для production

```bash
npm run build
npm run preview
```

### Линтинг

```bash
npm run lint
npm run lint:fix
```

---

## 📊 Производительность

- ⚡ **Lighthouse Score:** 95+
- 🎨 **First Contentful Paint:** < 1.5s
- 📱 **Mobile Performance:** 90+
- ♿ **Accessibility:** WCAG 2.1 Level AA

---

## 🔒 Безопасность

- ✅ API ключи хранятся только на backend
- ✅ Валидация всех входных данных
- ✅ CSP headers настроены
- ✅ Rate limiting на backend
- ✅ Нет сбора персональных данных

---

## ♿ Доступность

Приложение соответствует стандартам WCAG 2.1 Level AA:

- ✅ ARIA labels на всех интерактивных элементах
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ Контрастность 4.5:1+

---

## 📱 PWA Support

Приложение поддерживает установку как PWA:

- ✅ Работает офлайн (сохранённые сценарии)
- ✅ Manifest.json
- ✅ Service Worker
- ✅ Иконки для всех платформ

---

## 🐛 Известные ограничения

- Максимальный размер видео: 100 МБ
- Максимальная длительность: 3 минуты
- Сохранённых сценариев: до 30 (localStorage)
- Форматы: MP4, MOV, WEBM

---

## 🗺️ Roadmap

### v1.1 (Следующий релиз)
- [ ] Экспорт сценариев в PDF
- [ ] Теги и категории для сценариев
- [ ] Поиск по сохранённым
- [ ] Тёмная тема

### v1.2
- [ ] Batch processing (несколько видео)
- [ ] Cloud sync (Supabase)
- [ ] Поделиться сценарием (ссылка)
- [ ] AI переписчик (улучшение текста)

### v2.0
- [ ] Мультиязычность
- [ ] Интеграция с TikTok/Instagram API
- [ ] Автоматическая нарезка видео
- [ ] Генерация субтитров

📚 [Полный roadmap](docs/ROADMAP.md)

---

## 🤝 Вклад в проект

Мы приветствуем вклад в проект!

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

[Code of Conduct](CODE_OF_CONDUCT.md) · [Contributing Guide](CONTRIBUTING.md)

---

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл

---

## 💬 Поддержка

- 📧 Email: support@example.com
- 💬 Telegram: [@your_username](https://t.me/your_username)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ai-reels-scripter/issues)
- 📚 Docs: [Документация](docs/)

---

## 👏 Благодарности

- [Google Gemini AI](https://ai.google.dev/) - AI модель для анализа
- [shadcn/ui](https://ui.shadcn.com/) - UI компоненты
- [Tailwind CSS](https://tailwindcss.com/) - Стилизация
- [Motion](https://motion.dev/) - Анимации
- [Lucide Icons](https://lucide.dev/) - Иконки

---

## ⭐ Поддержите проект

Если проект вам полезен, поставьте звезду на GitHub!

[![Star on GitHub](https://img.shields.io/github/stars/yourusername/ai-reels-scripter?style=social)](https://github.com/yourusername/ai-reels-scripter)

---

<p align="center">
  Сделано с ❤️ для контент-мейкеров
</p>

<p align="center">
  <a href="#ai-reels-scripter">↑ Наверх</a>
</p>
