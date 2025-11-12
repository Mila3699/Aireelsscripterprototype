import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Supabase клиент с service role для админских операций
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-f3dc28c4/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ STORAGE ENDPOINTS ============

/**
 * Проверить/создать bucket
 * POST /make-server-f3dc28c4/ensure-bucket
 * Body: { bucketName: string }
 */
app.post("/make-server-f3dc28c4/ensure-bucket", async (c) => {
  try {
    const { bucketName } = await c.req.json();

    if (!bucketName) {
      return c.json({ error: 'bucketName обязателен' }, 400);
    }

    const success = await ensureBucketExists(bucketName);

    if (!success) {
      return c.json({ error: 'Не удалось создать bucket' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Ensure bucket error:', error);
    return c.json({ error: 'Ошибка создания bucket' }, 500);
  }
});

// ============ AUTH ENDPOINTS ============

/**
 * Подтверждение email пользователя (для автоподтверждения в прототипе)
 * POST /make-server-f3dc28c4/auth/confirm-email
 * Body: { userId: string }
 */
app.post("/make-server-f3dc28c4/auth/confirm-email", async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'userId обязателен' }, 400);
    }

    // Используем admin API для подтверждения email
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );

    if (error) {
      console.error('Email confirmation error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('Email confirmed for user:', userId);

    return c.json({
      success: true,
    });
  } catch (error) {
    console.error('Email confirmation error:', error);
    return c.json({ error: 'Ошибка подтверждения email' }, 500);
  }
});

// ============ VIDEO ANALYSIS ENDPOINTS ============

/**
 * Анализ видео через Google Gemini AI
 * POST /make-server-f3dc28c4/analyze
 * Body: { videoPath: string, userId: string }
 * 
 * Архитектура:
 * 1. Frontend загружает видео в Supabase Storage
 * 2. Frontend отправляет путь к файлу на этот endpoint
 * 3. Backend создает signed URL из Storage
 * 4. Backend отправляет URL в Google AI Gemini
 * 5. Backend возвращает результат анализа
 */
app.post("/make-server-f3dc28c4/analyze", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    // Проверяем аутентификацию
    if (!accessToken) {
      return c.json({ error: 'Требуется авторизация' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Неверный токен авторизации' }, 401);
    }

    const { videoPath } = await c.req.json();

    if (!videoPath) {
      return c.json({ error: 'videoPath обязателен' }, 400);
    }

    console.log('Analyzing video for user:', user.id, 'path:', videoPath);

    // Проверяем что bucket существует
    const bucketReady = await ensureBucketExists('make-f3dc28c4-videos');
    if (!bucketReady) {
      return c.json({ error: 'Storage не готов. Попробуйте снова через несколько секунд.' }, 500);
    }

    // Создаем signed URL для доступа к видео (действителен 1 час)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('make-f3dc28c4-videos')
      .createSignedUrl(videoPath, 3600);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return c.json({ error: 'Не удалось создать доступ к видео' }, 500);
    }

    const videoUrl = signedUrlData.signedUrl;
    console.log('Created signed URL for Gemini');

    // TODO: Здесь должна быть интеграция с Google Gemini AI
    // Пока возвращаем mock данные для тестирования
    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    
    console.log('API Key status:', apiKey ? 'Установлен (используем демо-режим до интеграции с Gemini)' : 'Не установлен (демо-режим)');
    
    // Имитируем время обработки (2 секунды)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Возвращаем демо-данные (пока нет реальной интеграции с Gemini)
    return c.json({
      success: true,
      isDemoMode: true,
      result: {
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
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ error: 'Ошибка анализа видео' }, 500);
  }
});

// ============ SCRIPTS ENDPOINTS ============

/**
 * Сохранить сценарий
 * POST /make-server-f3dc28c4/scripts
 */
app.post("/make-server-f3dc28c4/scripts", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Требуется авторизация' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Неверный токен авторизации' }, 401);
    }

    const script = await c.req.json();
    const scriptId = crypto.randomUUID();
    const key = `script:${user.id}:${scriptId}`;

    await kv.set(key, {
      ...script,
      id: scriptId,
      userId: user.id,
      savedAt: new Date().toISOString(),
    });

    console.log('Script saved:', scriptId, 'for user:', user.id);

    return c.json({
      success: true,
      id: scriptId,
    });
  } catch (error) {
    console.error('Save script error:', error);
    return c.json({ error: 'Ошибка сохранения сценария' }, 500);
  }
});

/**
 * Получить все сценарии пользователя
 * GET /make-server-f3dc28c4/scripts
 */
app.get("/make-server-f3dc28c4/scripts", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Требуется авторизация' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Неверный токен авторизации' }, 401);
    }

    const prefix = `script:${user.id}:`;
    const scripts = await kv.getByPrefix(prefix);

    console.log('Fetched scripts for user:', user.id, 'count:', scripts.length);

    return c.json({
      success: true,
      scripts,
    });
  } catch (error) {
    console.error('Fetch scripts error:', error);
    return c.json({ error: 'Ошибка получения сценариев' }, 500);
  }
});

/**
 * Уд��лить сценарий
 * DELETE /make-server-f3dc28c4/scripts/:id
 */
app.delete("/make-server-f3dc28c4/scripts/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Требуется авторизация' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Неверный токен авторизации' }, 401);
    }

    const scriptId = c.req.param('id');
    const key = `script:${user.id}:${scriptId}`;

    await kv.del(key);

    console.log('Script deleted:', scriptId, 'for user:', user.id);

    return c.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete script error:', error);
    return c.json({ error: 'Ошибка удаления сценария' }, 500);
  }
});

/**
 * Удалить все сценарии пользователя
 * DELETE /make-server-f3dc28c4/scripts
 */
app.delete("/make-server-f3dc28c4/scripts", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Требуется авторизация' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Неверный токен авторизации' }, 401);
    }

    const prefix = `script:${user.id}:`;
    const scripts = await kv.getByPrefix(prefix);
    const keys = scripts.map(s => `script:${user.id}:${s.id}`);

    if (keys.length > 0) {
      await kv.mdel(keys);
    }

    console.log('All scripts deleted for user:', user.id, 'count:', keys.length);

    return c.json({
      success: true,
      deleted: keys.length,
    });
  } catch (error) {
    console.error('Delete all scripts error:', error);
    return c.json({ error: 'Ошибка удаления сценариев' }, 500);
  }
});

/**
 * Утилита для проверки/создания bucket
 */
async function ensureBucketExists(bucketName: string) {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket ${bucketName} already exists`);
      return true;
    }
    
    console.log(`Creating bucket ${bucketName}...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: false,
      // fileSizeLimit не поддерживается в API, лимиты настраиваются в Dashboard
    });
    
    if (createError) {
      console.error('Error creating bucket:', createError);
      
      // Если bucket уже существует, это не ошибка
      if (createError.message?.includes('already exists')) {
        console.log(`Bucket ${bucketName} already exists (via error)`);
        return true;
      }
      
      return false;
    }
    
    console.log(`Bucket ${bucketName} created successfully`);
    return true;
  } catch (error) {
    console.error('ensureBucketExists error:', error);
    return false;
  }
}

// Создаем bucket при старте
console.log('Starting server...');
const bucketName = 'make-f3dc28c4-videos';
ensureBucketExists(bucketName).then((success) => {
  if (success) {
    console.log('Server ready with storage bucket');
  } else {
    console.warn('Server started but bucket creation failed - will retry on upload');
  }
});

Deno.serve(app.fetch);