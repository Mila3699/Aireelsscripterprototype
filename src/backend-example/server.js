// ============================================
// AI REELS SCRIPTER - BACKEND СЕРВЕР
// ============================================
// 
// УСТАНОВКА:
// 1. npm init -y
// 2. npm install express cors dotenv multer @google/generative-ai
// 3. Создайте .env файл (см. ниже)
// 4. node server.js
//
// ФАЙЛ .env:
// GOOGLE_AI_API_KEY=ваш_ключ_от_google
// PORT=3001
// FRONTEND_URL=http://localhost:3000
//
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// ============ НАСТРОЙКА CORS ============
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// ============ НАСТРОЙКА ЗАГРУЗКИ ФАЙЛОВ ============
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый формат видео. Используйте MP4, MOV или WEBM'));
    }
  }
});

// ============ ИНИЦИАЛИЗАЦИЯ GOOGLE AI ============
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// ============ ПРОМПТ ДЛЯ АНАЛИЗА ============
const ANALYSIS_PROMPT = `
Ты — профессиональный SMM-аналитик и сценарист для коротких видео (Reels, TikTok).

Проанализируй загруженное видео и выполни следующие задачи:

0. НАЗВАНИЕ СЦЕНАРИЯ:
   - Придумай краткое название сценария (2-3 слова), которое отражает основной смысл ролика
   - Примеры: "Секреты вирусности", "Хук за 3 секунды", "Монтаж для блогера"

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
   - Временной интервал (например, "0-3 сек")
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
  "title": "Название сценария",
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

ВАЖНО: Верни ТОЛЬКО JSON, без дополнительного текста или markdown форматирования.
`;

// ============ ЭНДПОИНТ ДЛЯ АНАЛИЗА ============
app.post('/api/analyze', upload.single('video'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Проверка наличия файла
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Видео не загружено',
        message: 'Пожалуйста, загрузите видеофайл'
      });
    }

    const fileSize = (req.file.size / 1024 / 1024).toFixed(2);
    console.log(`📹 Получено видео: ${req.file.originalname} (${fileSize} MB)`);
    console.log(`📝 MIME тип: ${req.file.mimetype}`);

    // Проверка API ключа
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY не установлен в .env файле');
    }

    // Инициализация модели Gemini
    // gemini-1.5-flash - быстрее и дешевле
    // gemini-1.5-pro - медленнее, но точнее
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash'
    });

    // Конвертация видео в base64
    const videoBase64 = req.file.buffer.toString('base64');
    console.log(`🔄 Видео сконвертировано в base64 (${videoBase64.length} символов)`);

    console.log('🤖 Отправка запроса в Google AI...');

    // Отправка запроса к Google AI
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: videoBase64
        }
      },
      { text: ANALYSIS_PROMPT }
    ]);

    const response = await result.response;
    const text = response.text();

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Получен ответ от Google AI (${processingTime} сек)`);
    console.log(`📊 Длина ответа: ${text.length} символов`);

    // Парсинг JSON из ответа
    let analysisData;
    try {
      // Убираем возможные markdown обертки (```json ... ```)
      const jsonText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      analysisData = JSON.parse(jsonText);
      console.log('✅ JSON успешно распарсен');
    } catch (parseError) {
      console.error('❌ Ошибка парсинга JSON:', parseError.message);
      console.log('📄 Сырой ответ от AI:', text.substring(0, 500) + '...');
      
      return res.status(500).json({ 
        error: 'Не удалось распарсить ответ от AI',
        message: 'Google AI вернул некорректный JSON',
        raw: text.substring(0, 1000) // Отправляем первые 1000 символов для дебага
      });
    }

    // Валидация структуры ответа
    if (!analysisData.original || !analysisData.keys || !analysisData.script || !analysisData.recommendations) {
      console.error('❌ Неполная структура ответа');
      return res.status(500).json({
        error: 'Неполная структура ответа от AI',
        message: 'Отсутствуют обязательные поля'
      });
    }

    // Логирование статистики
    console.log(`📈 Статистика анализа:`);
    console.log(`   - Ключей к успеху: ${analysisData.keys.length}`);
    console.log(`   - Сцен в сценарии: ${analysisData.script.length}`);
    console.log(`   - Рекомендаций: ${analysisData.recommendations.length}`);
    console.log(`   - Время обработки: ${processingTime} сек`);

    // Отправка результата
    res.json({
      ...analysisData,
      _metadata: {
        processingTime: processingTime,
        fileSize: fileSize,
        fileName: req.file.originalname,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ошибка при обработке:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Определение типа ошибки
    let errorMessage = 'Ошибка при обработке видео';
    let statusCode = 500;

    if (error.message.includes('API key')) {
      errorMessage = 'Неверный или отсутствующий Google AI API ключ';
      statusCode = 401;
    } else if (error.message.includes('quota')) {
      errorMessage = 'Превышена квота Google AI API';
      statusCode = 429;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Превышено время ожидания ответа от AI';
      statusCode = 504;
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ ПРОВЕРКА ЗДОРОВЬЯ СЕРВЕРА ============
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'AI Reels Scripter Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    endpoints: {
      analyze: 'POST /api/analyze'
    }
  });
});

app.get('/api/health', (req, res) => {
  const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;
  
  res.json({
    status: 'ok',
    checks: {
      apiKey: hasApiKey ? 'configured' : 'missing',
      memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      uptime: `${(process.uptime() / 60).toFixed(2)} минут`
    },
    timestamp: new Date().toISOString()
  });
});

// ============ ОБРАБОТКА ОШИБОК ============
app.use((error, req, res, next) => {
  console.error('❌ Необработанная ошибка:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Файл слишком большой',
        message: 'Максимальный размер файла: 100 МБ'
      });
    }
  }
  
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: error.message
  });
});

// ============ ЗАПУСК СЕРВЕРА ============
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 AI REELS SCRIPTER - BACKEND');
  console.log('='.repeat(50));
  console.log(`📡 Сервер запущен: http://localhost:${PORT}`);
  console.log(`🌐 Разрешенный frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔑 API ключ: ${process.env.GOOGLE_AI_API_KEY ? '✅ Настроен' : '❌ Отсутствует'}`);
  console.log('='.repeat(50));
  console.log('\n💡 Эндпоинты:');
  console.log('   GET  /           - Проверка работы');
  console.log('   GET  /api/health - Детальная проверка');
  console.log('   POST /api/analyze - Анализ видео');
  console.log('\n✨ Готов к работе!\n');
});

// Обработка graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM получен, завершаю работу...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT получен, завершаю работу...');
  process.exit(0);
});
