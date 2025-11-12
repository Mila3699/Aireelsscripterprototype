# Руководство по интеграции с Backend

## Текущее состояние

✅ **Frontend готов** - работает с mock данными  
🔄 **Backend требуется** - для реальной работы с Google AI API

## Что уже реализовано

### 1. API клиент (`/lib/api.ts`)

Файл содержит:
- ✅ Типы данных для анализа (`VideoAnalysisResult`)
- ✅ Промпт для Google AI API (`ANALYSIS_PROMPT`)
- ✅ Mock функции для демонстрации
- ✅ Валидация файлов
- ✅ Конфигурация API

### 2. Интеграция в компоненты

- ✅ `App.tsx` - обработка результатов анализа
- ✅ `UploadPage.tsx` - валидация файлов перед загрузкой
- ✅ `ResultsPage.tsx` - отображение динамических данных
- ✅ Toast уведомления

## Как подключить реальный Backend

### Шаг 1: Настроить Backend

Выберите один из вариантов:

**Вариант A: Node.js + Express**
```bash
cd backend
npm install
# Настройте .env файл (см. /docs/BACKEND_SETUP.md)
npm start
```

**Вариант B: Python + FastAPI**
```bash
cd backend
pip install -r requirements.txt
# Настройте .env файл (см. /docs/BACKEND_SETUP_PYTHON.md)
python main.py
```

### Шаг 2: Обновить API клиент

Откройте `/lib/api.ts` и замените mock функции на реальные:

```typescript
// Вместо mock версии:
export async function uploadVideo(file: File): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`video_${Date.now()}`);
    }, 1000);
  });
}

// Используйте реальную версию:
export async function uploadVideo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch(`${API_CONFIG.BACKEND_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Ошибка загрузки видео');
  }

  const data = await response.json();
  return data.task_id || data.jobId; // В зависимости от backend
}

export async function analyzeVideo(taskId: string): Promise<VideoAnalysisResult> {
  // Polling механизм
  return new Promise((resolve, reject) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/status/${taskId}`);
        const data = await response.json();

        if (data.state === 'completed' || data.state === 'SUCCESS') {
          clearInterval(pollInterval);
          resolve(data.result);
        } else if (data.state === 'failed' || data.state === 'FAILURE') {
          clearInterval(pollInterval);
          reject(new Error('Анализ не удался'));
        }
      } catch (error) {
        clearInterval(pollInterval);
        reject(error);
      }
    }, 2000); // Проверяем каждые 2 секунды
  });
}
```

### Шаг 3: Настроить переменные окружения

Создайте `.env.local` в корне проекта:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api
# или для продакшена:
# NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com/api
```

### Шаг 4: Обновить ProcessingPage (опционально)

Добавьте реальный прогресс обработки в `/components/ProcessingPage.tsx`:

```typescript
export function ProcessingPage({ taskId }: { taskId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const pollProgress = setInterval(async () => {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/status/${taskId}`);
      const data = await response.json();
      setProgress(data.progress || 0);
    }, 1000);

    return () => clearInterval(pollProgress);
  }, [taskId]);

  // ... остальной код с использованием `progress`
}
```

## Готовый пример интеграции

### Полностью рабочий `/lib/api.ts` (для продакшена)

```typescript
import { API_CONFIG } from './api';

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
      const error = await uploadResponse.json();
      throw new Error(error.detail || 'Ошибка загрузки');
    }

    const { task_id } = await uploadResponse.json();

    // 2. Polling статуса
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Timeout: обработка заняла слишком много времени'));
      }, 300000); // 5 минут максимум

      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `${API_CONFIG.BACKEND_URL}/status/${task_id}`
          );
          const statusData = await statusResponse.json();

          console.log('Статус:', statusData.state, 'Прогресс:', statusData.progress);

          if (statusData.state === 'completed' || statusData.state === 'SUCCESS') {
            clearInterval(pollInterval);
            clearTimeout(timeout);
            resolve(statusData.result);
          } else if (statusData.state === 'failed' || statusData.state === 'FAILURE') {
            clearInterval(pollInterval);
            clearTimeout(timeout);
            reject(new Error(statusData.status || 'Ошибка обработки'));
          }
        } catch (error) {
          console.error('Ошибка проверки статуса:', error);
        }
      }, 2000);
    });
  } catch (error) {
    console.error('Ошибка processVideo:', error);
    throw error;
  }
}
```

## Тестирование интеграции

### 1. Локальное тестирование

```bash
# Терминал 1: Запуск backend
cd backend
npm start  # или python main.py

# Терминал 2: Запуск frontend
npm run dev

# Откройте http://localhost:3000
```

### 2. Проверьте консоль браузера

Вы должны увидеть логи:
```
📤 Загрузка видео...
✅ Видео загружено, task_id: abc123
🔄 Проверка статуса...
✅ Анализ завершен!
```

### 3. Проверьте Network tab

- `POST /api/upload` - должен вернуть 200 и task_id
- `GET /api/status/{task_id}` - должен показывать прогресс
- Финальный запрос должен вернуть полный результат

## Возможные проблемы и решения

### ❌ CORS ошибка

**Проблема:** `Access-Control-Allow-Origin` blocked

**Решение:** Настройте CORS в backend:
```javascript
// Node.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

### ❌ 413 Payload Too Large

**Проблема:** Файл слишком большой

**Решение:** Увеличьте лимит в backend:
```javascript
// Node.js
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
```

### ❌ Timeout

**Проблема:** Обработка занимает > 5 минут

**Решение:** Используйте более мощную модель или разбейте на части

### ❌ Google AI API quota exceeded

**Проблема:** Превышен лимит запросов

**Решение:** 
- Добавьте очередь задач (Bull/Celery)
- Настройте rate limiting
- Используйте кеширование для похожих видео

## Переход на продакшен

### Чеклист перед деплоем:

- [ ] Backend развернут и доступен
- [ ] API ключи Google AI настроены
- [ ] Google Cloud Storage bucket создан
- [ ] CORS настроен правильно
- [ ] HTTPS включен
- [ ] Rate limiting добавлен
- [ ] Мониторинг настроен
- [ ] Логирование работает
- [ ] Обработка ошибок добавлена
- [ ] Тестирование пройдено

### Рекомендуемые платформы:

**Backend:**
- Google Cloud Run (рекомендуется)
- Railway.app
- Render.com
- Fly.io

**Frontend:**
- Vercel (рекомендуется для Next.js)
- Netlify
- Cloudflare Pages

## Поддержка и документация

- [Google AI Documentation](https://ai.google.dev/)
- [Backend Setup Guide](./BACKEND_SETUP.md)
- [Python Backend Guide](./BACKEND_SETUP_PYTHON.md)

---

**Статус:** Mock версия работает ✅ | Реальный backend требуется для продакшена 🔄
