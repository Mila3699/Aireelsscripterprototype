# ⚙️ Конфигурация приложения

## 🔧 Настройка Backend URL

### Текущая версия (Demo)

По умолчанию приложение работает с **mock данными** и не требует настоящего backend.

### Для продакшена с реальным AI

Когда вы настроите backend сервер, нужно изменить URL в файле `/lib/api.ts`:

#### Шаг 1: Откройте файл `/lib/api.ts`

Найдите строку (примерно строка 310):

```typescript
export const API_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB
  MAX_VIDEO_DURATION: 180, // 3 минуты
  ACCEPTED_FORMATS: ['video/mp4', 'video/quicktime', 'video/webm'],
  // Для продакшена замените на URL вашего backend
  BACKEND_URL: 'http://localhost:3001/api',
};
```

#### Шаг 2: Измените BACKEND_URL

**Для локальной разработки:**
```typescript
BACKEND_URL: 'http://localhost:3001/api',
```

**Для продакшена:**
```typescript
BACKEND_URL: 'https://your-backend-domain.com/api',
```

**Примеры:**
- Google Cloud Run: `'https://ai-reels-backend-xxxx-uc.a.run.app/api'`
- Railway: `'https://ai-reels-backend-production.up.railway.app/api'`
- Render: `'https://ai-reels-backend.onrender.com/api'`
- Свой сервер: `'https://api.yourcompany.com/v1'`

#### Шаг 3: Сохраните файл

После изменения сохраните файл, и приложение начнет использовать ваш backend.

---

## 🔐 Безопасность

### ⚠️ Важно:

1. **НИКОГДА не храните API ключи Google AI на frontend!**
   - ✅ Храните в backend `.env` файле
   - ❌ НЕ добавляйте в код frontend

2. **Используйте HTTPS для продакшена**
   - ✅ `https://your-backend.com`
   - ❌ `http://your-backend.com` (небезопасно!)

3. **Настройте CORS правильно**
   - Backend должен принимать запросы только с вашего домена
   - См. `/docs/BACKEND_SETUP.md` для примеров

---

## 🌍 Переменные окружения (Environment Variables)

### Frontend

В этом приложении **НЕ используются** переменные окружения на frontend для безопасности.

Все конфигурации находятся в `/lib/api.ts`:
- `MAX_FILE_SIZE` - максимальный размер файла
- `MAX_VIDEO_DURATION` - максимальная длительность видео
- `ACCEPTED_FORMATS` - поддерживаемые форматы
- `BACKEND_URL` - адрес backend API

### Backend

Backend использует переменные окружения. Создайте файл `.env` в папке backend:

**Node.js (.env):**
```env
# Google AI API
GOOGLE_AI_API_KEY=your_api_key_here

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=ai-reels-temp
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Server
PORT=3001
NODE_ENV=production

# Redis
REDIS_URL=redis://localhost:6379

# Frontend (для CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

**Python (.env):**
```env
# Google AI API
GOOGLE_AI_API_KEY=your_api_key_here

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=ai-reels-temp
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Server
PORT=8000

# Redis
REDIS_URL=redis://localhost:6379

# Frontend (для CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 📝 Настройка для разных окружений

### Локальная разработка

```typescript
// /lib/api.ts
BACKEND_URL: 'http://localhost:3001/api',
```

```env
# backend/.env
FRONTEND_URL=http://localhost:3000
```

### Staging/Testing

```typescript
// /lib/api.ts
BACKEND_URL: 'https://staging-backend.yourcompany.com/api',
```

```env
# backend/.env
FRONTEND_URL=https://staging.yourcompany.com
NODE_ENV=staging
```

### Production

```typescript
// /lib/api.ts
BACKEND_URL: 'https://api.yourcompany.com/v1',
```

```env
# backend/.env
FRONTEND_URL=https://yourcompany.com
NODE_ENV=production
```

---

## 🔄 Переключение между Mock и Real API

### Использовать Mock данные (текущее состояние)

В `/lib/api.ts` используйте mock функцию:

```typescript
export async function processVideo(file: File): Promise<VideoAnalysisResult> {
  // Симуляция загрузки и обработки
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Возвращаем mock данные
  return getMockAnalysisResult();
}
```

### Использовать реальный API

Замените на реальную реализацию:

```typescript
export async function processVideo(file: File): Promise<VideoAnalysisResult> {
  try {
    // 1. Загрузка файла
    const formData = new FormData();
    formData.append('video', file);

    const uploadResponse = await fetch(`${API_CONFIG.BACKEND_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Ошибка загрузки видео');
    }

    const { task_id } = await uploadResponse.json();

    // 2. Polling статуса
    return await pollTaskStatus(task_id);
  } catch (error) {
    console.error('Ошибка обработки видео:', error);
    throw error;
  }
}
```

См. полный пример в `/docs/INTEGRATION_GUIDE.md`

---

## 📊 Мониторинг и отладка

### Включить подробные логи

В `/lib/api.ts` добавьте:

```typescript
const DEBUG = true; // Установите в false для продакшена

export async function processVideo(file: File): Promise<VideoAnalysisResult> {
  if (DEBUG) console.log('📤 Загрузка видео:', file.name, file.size);
  
  // ... остальной код
  
  if (DEBUG) console.log('✅ Анализ завершен');
  return result;
}
```

### Проверка соединения с backend

Создайте простую функцию для проверки:

```typescript
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend недоступен:', error);
    return false;
  }
}
```

---

## 🚀 Рекомендации по деплою

### Vercel (Frontend)

1. Деплой автоматически использует код из `/lib/api.ts`
2. Убедитесь, что `BACKEND_URL` указывает на продакшн backend
3. Проверьте CORS настройки на backend

### Google Cloud Run (Backend)

```bash
# Deploy команда
gcloud run deploy ai-reels-backend \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars FRONTEND_URL=https://your-frontend.vercel.app
```

### Railway (Backend)

1. Подключите репозиторий
2. Добавьте environment variables через UI
3. Railway автоматически предоставит URL
4. Обновите `BACKEND_URL` в frontend

---

## 🧪 Тестирование конфигурации

### Проверка локально

```bash
# Терминал 1: Backend
cd backend
npm start
# Должно показать: "Server running on http://localhost:3001"

# Терминал 2: Frontend  
npm run dev
# Откройте http://localhost:3000
```

### Проверка на продакшене

1. Откройте DevTools (F12)
2. Перейдите на вкладку Network
3. Загрузите видео
4. Проверьте запросы:
   - POST к `/upload` - должен быть 200 OK
   - GET к `/status/{id}` - должен показывать прогресс

---

## ❓ FAQ по конфигурации

### Почему нельзя использовать `process.env` на frontend?

В браузере нет объекта `process`, он доступен только в Node.js. Вместо этого мы используем константы в коде.

### Как защитить API ключи?

- ✅ Храните на backend в `.env`
- ✅ Добавьте `.env` в `.gitignore`
- ✅ Используйте secrets manager в продакшене (Google Secret Manager, AWS Secrets Manager)
- ❌ Никогда не коммитьте `.env` в git

### Можно ли использовать разные backend для разных окружений?

Да! Создайте несколько конфигураций:

```typescript
const ENVIRONMENTS = {
  development: 'http://localhost:3001/api',
  staging: 'https://staging-api.example.com/api',
  production: 'https://api.example.com/api',
};

export const API_CONFIG = {
  // ...
  BACKEND_URL: ENVIRONMENTS.production, // Меняйте вручную
};
```

---

## 📚 Дополнительные ресурсы

- [Backend Setup (Node.js)](./BACKEND_SETUP.md)
- [Backend Setup (Python)](./BACKEND_SETUP_PYTHON.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Quick Start](./QUICK_START.md)

---

**Обновлено:** 9 ноября 2024  
**Версия:** 1.0.0
