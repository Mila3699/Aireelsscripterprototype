# Руководство по настройке Backend для AI Reels Scripter

## Обзор архитектуры

```
[Frontend] → [Backend API] → [Google Cloud Storage] → [Google AI API]
                ↓
         [Queue System]
                ↓
        [Database (optional)]
```

## 1. Технологический стек (рекомендации)

### Вариант 1: Node.js + Express
- **Backend**: Node.js 18+ с Express.js
- **Хранилище**: Google Cloud Storage
- **Очередь**: Bull (Redis)
- **База данных**: PostgreSQL (для истории запросов)

### Вариант 2: Python + FastAPI
- **Backend**: Python 3.10+ с FastAPI
- **Хранилище**: Google Cloud Storage
- **Очередь**: Celery (Redis)
- **База данных**: PostgreSQL

## 2. Установка и настройка Google AI API

### Шаг 1: Создание проекта в Google Cloud

```bash
# 1. Перейдите на https://console.cloud.google.com/
# 2. Создайте новый проект
# 3. Включите следующие API:
#    - Generative Language API (Gemini)
#    - Cloud Storage API
```

### Шаг 2: Получение API ключа

```bash
# Перейдите на https://makersuite.google.com/app/apikey
# Или: https://aistudio.google.com/app/apikey
# Создайте новый API ключ
```

### Шаг 3: Установка SDK

**Node.js:**
```bash
npm install @google/generative-ai
npm install @google-cloud/storage
npm install dotenv express multer bull
```

**Python:**
```bash
pip install google-generativeai
pip install google-cloud-storage
pip install fastapi uvicorn python-multipart celery redis
```

## 3. Пример реализации Backend (Node.js)

### Файл: `.env`

```env
# Google AI
GOOGLE_AI_API_KEY=your_api_key_here

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=ai-reels-scripter-temp
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Server
PORT=3001
NODE_ENV=production

# Redis (для очередей)
REDIS_URL=redis://localhost:6379

# Ограничения
MAX_FILE_SIZE_MB=100
MAX_VIDEO_DURATION_SEC=180

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

### Файл: `server.js`

```javascript
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Storage } = require('@google-cloud/storage');
const Queue = require('bull');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// CORS настройка
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// Инициализация Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Инициализация Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// Инициализация очереди задач
const videoQueue = new Queue('video-analysis', process.env.REDIS_URL);

// Multer для загрузки файлов (в память)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый формат видео'));
    }
  }
});

// ============ ЭНДПОИНТЫ ============

/**
 * POST /api/upload
 * Загрузка видео и запуск анализа
 */
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const file = req.file;
    const timestamp = Date.now();
    const fileName = `temp/${timestamp}_${file.originalname}`;

    // Загрузка в Cloud Storage
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype
      }
    });

    await new Promise((resolve, reject) => {
      blobStream.on('error', reject);
      blobStream.on('finish', resolve);
      blobStream.end(file.buffer);
    });

    // Получение публичного URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Добавление задачи в очередь
    const job = await videoQueue.add({
      fileName,
      publicUrl,
      mimeType: file.mimetype,
      timestamp
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Видео загружено и отправлено на анализ'
    });

  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/status/:jobId
 * Проверка статуса анализа
 */
app.get('/api/status/:jobId', async (req, res) => {
  try {
    const job = await videoQueue.getJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;

    res.json({
      state,
      progress,
      result: state === 'completed' ? result : null
    });

  } catch (error) {
    console.error('Ошибка получения статуса:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ОБРАБОТЧИК ОЧЕРЕДИ ============

videoQueue.process(async (job) => {
  const { fileName, publicUrl, mimeType } = job.data;

  try {
    // 1. Обновление прогресса
    job.progress(10);

    // 2. Скачивание файла из Cloud Storage
    const [fileBuffer] = await bucket.file(fileName).download();
    job.progress(30);

    // 3. Конвертация в base64
    const base64Data = fileBuffer.toString('base64');
    job.progress(40);

    // 4. Отправка в Google AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = \`
Ты — профессиональный SMM-аналитик и сценарист для коротких видео (Reels, TikTok).

Проанализируй загруженное видео и выполни следующие задачи:

1. ТРАНСКРИБАЦИЯ И ПЕРЕВОД:
   - Сделай полную транскрибацию аудиодорожки на языке оригинала
   - Переведи транскрибацию на русский язык

2. КЛЮЧИ К УСПЕХУ:
   Выяви 5 ключевых причин, почему это видео может быть успешным:
   - Хук (как привлечено внимание в первые 3 секунды)
   - Структура (как построен контент)
   - Подача (интонация, темп, энергетика)
   - Визуал (камера, монтаж, эффекты)
   - Аудио (музыка, звуковые акценты)

3. ГОТОВЫЙ СЦЕНАРИЙ:
   Создай пошаговый сценарий для создания аналогичного видео на русском языке.
   Для каждой сцены укажи:
   - Временной интервал (например, "0-3 се��")
   - Визуальный ряд (крупный план, средний план, демонстрация и т.д.)
   - Текст для озвучки (адаптированный под русский язык)
   - Заметка/совет (почему важен этот момент)

4. РЕКОМЕНДАЦИИ ПО СОЗДАНИЮ:
   Дай практические советы по:
   - Интонации и голосу
   - Фоновой музыке
   - Работе с ИИ-аватаром (если применимо)
   - Монтажу и эффектам

Ответ предоставь СТРОГО в формате JSON со следующей структурой:
{
  "original": {
    "transcription": "...",
    "translation": "..."
  },
  "keys": [
    {"title": "...", "description": "..."}
  ],
  "script": [
    {"time": "...", "visual": "...", "text": "...", "note": "..."}
  ],
  "recommendations": [
    {"category": "...", "text": "..."}
  ]
}
\`;

    job.progress(50);

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data
        }
      },
      { text: prompt }
    ]);

    job.progress(80);

    // 5. Парсинг ответа
    const response = await result.response;
    let analysisText = response.text();
    
    // Очистка от markdown форматирования если есть
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const analysisData = JSON.parse(analysisText);
    job.progress(90);

    // 6. Удаление временного файла
    await bucket.file(fileName).delete();
    job.progress(100);

    return analysisData;

  } catch (error) {
    console.error('Ошибка обработки видео:', error);
    
    // Удаляем файл в случае ошибки
    try {
      await bucket.file(fileName).delete();
    } catch (deleteError) {
      console.error('Ошибка удаления файла:', deleteError);
    }
    
    throw error;
  }
});

// ============ ЗАПУСК СЕРВЕРА ============

app.listen(port, () => {
  console.log(\`🚀 Сервер запущен на порту \${port}\`);
  console.log(\`📊 Dashboard очереди: http://localhost:\${port}/admin/queues\`);
});
```

### Файл: `package.json`

```json
{
  "name": "ai-reels-scripter-backend",
  "version": "1.0.0",
  "description": "Backend для AI Reels Scripter",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@google-cloud/storage": "^7.13.0",
    "bull": "^4.16.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "multer": "^1.4.5-lts.1",
    "redis": "^4.7.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

## 4. Настройка Google Cloud Storage

### Создание bucket

```bash
# Установите gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Авторизация
gcloud auth login

# Создание bucket
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l europe-west1 gs://ai-reels-scripter-temp/

# Настройка жизненного цикла (автоудаление старых файлов)
echo '{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 1}
      }
    ]
  }
}' > lifecycle.json

gsutil lifecycle set lifecycle.json gs://ai-reels-scripter-temp/
```

## 5. Запуск Redis (для очередей)

### Docker

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### Linux

```bash
sudo apt install redis-server
sudo systemctl start redis
```

### macOS

```bash
brew install redis
brew services start redis
```

## 6. Тестирование API

### cURL примеры

```bash
# Загрузка видео
curl -X POST http://localhost:3001/api/upload \
  -F "video=@./test-video.mp4"

# Проверка статуса
curl http://localhost:3001/api/status/JOB_ID
```

## 7. Деплой на продакшен

### Рекомендуемые платформы:

1. **Google Cloud Run** (рекомендуется)
   - Автоскейлинг
   - Оплата по использованию
   - Интеграция с GCP

2. **Railway.app**
   - Простой деплой
   - Встроенный Redis

3. **Render.com**
   - Бесплатный tier
   - Автоматический CI/CD

### Пример Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

## 8. Мониторинг и лимиты

### Google AI API лимиты (бесплатный tier):

- **Gemini 1.5 Flash**: 15 запросов/минуту, 1500 запросов/день
- **Gemini 1.5 Pro**: 2 запроса/минуту, 50 запросов/день

### Рекомендации:

1. Добавьте rate limiting на уровне API
2. Настройте мониторинг очередей
3. Логируйте все ошибки
4. Добавьте retry механизм для failed jobs

## 9. Безопасность

### Важно:

1. ✅ Никогда не храните API ключи в коде
2. ✅ Используйте переменные окружения
3. ✅ Настройте CORS правильно
4. ✅ Добавьте rate limiting
5. ✅ Валидируйте все входные данные
6. ✅ Удаляйте временные файлы
7. ✅ Используйте HTTPS на продакшене

## 10. Альтернативный вариант (Python + FastAPI)

См. файл `BACKEND_SETUP_PYTHON.md` для Python реализации.

---

## Полезные ссылки

- [Google AI SDK Documentation](https://ai.google.dev/tutorials/node_quickstart)
- [Gemini API Reference](https://ai.google.dev/gemini-api/docs)
- [Google Cloud Storage Docs](https://cloud.google.com/storage/docs)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
