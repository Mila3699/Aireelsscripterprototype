/**
 * API Integration с Google AI (Gemini)
 * 
 * ВАЖНО: Это демо-версия с mock данными для прототипа.
 * Для продакшена нужен backend-сервер (Node.js, Python и т.д.)
 * 
 * НАСТРОЙКА BACKEND URL:
 * Измените BACKEND_URL в API_CONFIG (строка ~308) на адрес вашего backend:
 * - Локально: 'http://localhost:3001/api'
 * - Продакшен: 'https://your-backend-domain.com/api'
 * 
 * АРХИТЕКТУРА РЕАЛЬНОЙ ИНТЕГРАЦИИ:
 * 
 * 1. Frontend загружает видео на ваш backend
 * 2. Backend:
 *    - Сохраняет файл временно в облачное хранилище (AWS S3, Google Cloud Storage)
 *    - Отправляет файл в Google AI API
 *    - Получает результат анализа
 *    - Парсит и возвращает на frontend
 *    - Удаляет временный файл
 * 
 * 3. Frontend показывает результаты
 * 
 * БЕЗОПАСНОСТЬ:
 * - Rate Limiting: ограничение запросов для защиты от спама
 * - XSS Protection: санитизация всех данных от API
 * - MIME Type Validation: проверка типов файлов
 */

import { sanitizeAnalysisResult } from './sanitizer';
import { videoAnalysisLimiter } from './rateLimiter';
import { MOCK_ANALYSIS_RESULT } from './mockData';
import { STORAGE, VIDEO } from './constants';

// ============ ТИПЫ ДАННЫХ ============

export interface VideoAnalysisResult {
  title: string; // Название сценария (2-3 слова)
  original: {
    transcription: string;
    translation: string;
  };
  keys: Array<{
    title: string;
    description: string;
  }>;
  script: Array<{
    time: string;
    visual: string;
    text: string;
    note: string;
  }>;
  recommendations: Array<{
    category: string;
    text: string;
  }>;
  isDemoMode?: boolean; // Флаг демо-режима (если backend недоступен)
}

// Интерфейс для сохранённого сценария
export interface SavedScript extends VideoAnalysisResult {
  id: string;
  savedAt: string; // ISO timestamp
}

// ============ ПРОМПТ ДЛЯ GOOGLE AI ============

export const ANALYSIS_PROMPT = `
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
`;

// ============ API ФУНКЦИИ ============

/**
 * Загрузка видео на сервер (MOCK)
 * 
 * РЕАЛЬНАЯ РЕАЛИЗАЦИЯ (Backend):
 * ```javascript
 * // Node.js + Express пример:
 * const multer = require('multer');
 * const { Storage } = require('@google-cloud/storage');
 * 
 * const storage = new Storage();
 * const bucket = storage.bucket('your-bucket-name');
 * 
 * app.post('/api/upload', multer().single('video'), async (req, res) => {
 *   const file = req.file;
 *   const blob = bucket.file(`temp/${Date.now()}_${file.originalname}`);
 *   
 *   await blob.save(file.buffer);
 *   const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
 *   
 *   res.json({ fileUrl: publicUrl, fileId: blob.name });
 * });
 * ```
 */
export async function uploadVideo(file: File): Promise<string> {
  // MOCK: Имитация загрузки
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockFileId = `video_${Date.now()}`;
      console.log('📤 Видео загружено (MOCK):', file.name);
      resolve(mockFileId);
    }, 1000);
  });
}

/**
 * Анализ видео через Google AI API (MOCK)
 * 
 * РЕАЛЬНАЯ РЕАЛИЗАЦИЯ (Backend):
 * ```javascript
 * // Node.js пример с Google AI SDK:
 * const { GoogleGenerativeAI } = require('@google/generative-ai');
 * 
 * const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
 * 
 * app.post('/api/analyze', async (req, res) => {
 *   const { fileUrl } = req.body;
 *   
 *   // Инициализация модели с видео-возможностями
 *   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
 *   
 *   // Загрузка видео
 *   const videoFile = await fetch(fileUrl).then(r => r.arrayBuffer());
 *   
 *   // Отправка запроса
 *   const result = await model.generateContent([
 *     {
 *       inlineData: {
 *         mimeType: 'video/mp4',
 *         data: Buffer.from(videoFile).toString('base64')
 *       }
 *     },
 *     { text: ANALYSIS_PROMPT }
 *   ]);
 *   
 *   // Парсинг ответа
 *   const response = await result.response;
 *   const analysisData = JSON.parse(response.text());
 *   
 *   res.json(analysisData);
 * });
 * ```
 * 
 * ДОКУМЕНТАЦИЯ:
 * https://ai.google.dev/tutorials/node_quickstart
 * https://ai.google.dev/gemini-api/docs/vision
 */
export async function analyzeVideo(fileId: string): Promise<VideoAnalysisResult> {
  // MOCK: Имитация анализа
  return new Promise((resolve) => {
    // Имитируем время обработки (3-4 секунды)
    setTimeout(() => {
      console.log('🤖 Видео проанализировано (MOCK)');
      resolve(MOCK_ANALYSIS_RESULT);
    }, 3500);
  });
}

/**
 * Полный процесс: загрузка + анализ
 * 
 * Автоматически использует backend если он доступен, иначе переключается на демо-режим
 * Включает Rate Limiting и санитизацию данных для безопасности
 */
export async function processVideo(file: File): Promise<VideoAnalysisResult> {
  // ============ RATE LIMITING ============
  // Проверяем лимит запросов для защиты от спама
  const limitCheck = videoAnalysisLimiter.checkLimit();
  
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || 'Превышен лимит запросов. Попробуйте позже.');
  }
  
  // Регистрируем запрос
  videoAnalysisLimiter.recordRequest();
  
  // Логируем оставшиеся запросы
  console.info(`📊 Осталось запросов: ${limitCheck.remainingRequests}/${videoAnalysisLimiter.getStatus().maxRequests}`);
  
  // Создаем FormData для отправки видео
  const formData = new FormData();
  formData.append('video', file);

  try {
    console.info('📤 Подключение к backend...');
    
    // Проверяем доступность backend с таймаутом
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
    
    // Отправляем запрос к backend
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    console.info('✅ Backend подключен! Используем реальный анализ');
    const result = await response.json();
    
    // ============ XSS PROTECTION ============
    // Санитизируем все данные от API перед использованием
    const sanitizedResult = sanitizeAnalysisResult(result);
    
    return {
      ...sanitizedResult,
      isDemoMode: false,
    };
  } catch (error) {
    // Если backend недоступен - переключаемся на демо-режим
    console.info('🎭 Демо-режим активирован!');
    console.info('✨ Используем примерные данные для демонстрации возможностей');
    console.info('💡 Для подключения реального анализа запустите backend (см. backend-example/README.md)');
    
    // Возвращаем демо-результат
    // 1. Имитируем загрузку
    await uploadVideo(file);
    
    // 2. Имитируем анализ
    const result = await analyzeVideo('demo');
    
    // ============ XSS PROTECTION ============
    // Санитизируем демо-данные
    const sanitizedResult = sanitizeAnalysisResult(result);
    
    // Добавляем метаданные о демо-режиме
    return {
      ...sanitizedResult,
      isDemoMode: true,
    };
  }
}

// ============ КОНФИГУРАЦИЯ ДЛЯ ПРОДАКШЕНА ============

/**
 * Переменные окружения для продакшена:
 * 
 * .env файл:
 * ```
 * GOOGLE_AI_API_KEY=your_api_key_here
 * GOOGLE_CLOUD_PROJECT_ID=your_project_id
 * GOOGLE_CLOUD_BUCKET=your_bucket_name
 * MAX_FILE_SIZE=104857600  # 100 MB
 * MAX_VIDEO_DURATION=180   # 3 минуты
 * ```
 * 
 * Получить API ключ:
 * 1. Перейти на https://makersuite.google.com/app/apikey
 * 2. Создать новый проект
 * 3. Включить Gemini API
 * 4. Создать API ключ
 * 
 * ВАЖНО: 
 * - Никогда не храните API ключи на frontend!
 * - Используйте backend для всех запросов к Google AI
 * - Настройте rate limiting и очереди задач
 * - Удаляйте временные файлы после обработки
 */

export const API_CONFIG = {
  MAX_FILE_SIZE: VIDEO.MAX_FILE_SIZE,
  MAX_VIDEO_DURATION: VIDEO.MAX_DURATION,
  ACCEPTED_FORMATS: VIDEO.ACCEPTED_FORMATS,
  // Для продакшена замените на URL вашего backend
  BACKEND_URL: 'http://localhost:3001/api',
};

// Флаг для отслеживания первого показа уведомления о демо-режиме
let demoModeNotificationShown = false;

/**
 * Валидация файла
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Проверка формата
  if (!API_CONFIG.ACCEPTED_FORMATS.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Неподдерживаемый формат. Используйте MP4, MOV или WEBM'
    };
  }

  // Проверка размера
  if (file.size > API_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Файл слишком большой. Максимум 100 МБ'
    };
  }

  return { valid: true };
}

/**
 * Проверка длительности видео
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      reject(new Error('Не удалось загрузить видео'));
    };

    video.src = URL.createObjectURL(file);
  });
}

// ============ РАБОТА С СОХРАНЁННЫМИ СЦЕНАРИЯМИ ============
// ВНИМАНИЕ: Эти функции дублируются в api-supabase.ts
// TODO: После рефакторинга использовать только версии из api-supabase.ts

/**
 * Получить все сохранённые сценарии
 */
export function getSavedScripts(): SavedScript[] {
  try {
    const stored = localStorage.getItem(STORAGE.SCRIPTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Ошибка при загрузке сохранённых сценариев:', error);
    return [];
  }
}

/**
 * Сохранить сценарий
 */
export function saveScript(result: VideoAnalysisResult): { success: boolean; error?: string } {
  try {
    const scripts = getSavedScripts();
    
    // Проверка лимита
    if (scripts.length >= STORAGE.MAX_SAVED_SCRIPTS) {
      return {
        success: false,
        error: `Лимит по сохранению сценариев исчерпан (${STORAGE.MAX_SAVED_SCRIPTS}). Удалите ненужные сценарии, чтобы освободить место.`
      };
    }
    
    // ============ XSS PROTECTION ============
    // Санитизируем данные перед сохранением
    const sanitizedResult = sanitizeAnalysisResult(result);
    
    const savedScript: SavedScript = {
      ...sanitizedResult,
      id: `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date().toISOString()
    };
    
    scripts.unshift(savedScript); // Добавляем в начало (новые сверху)
    localStorage.setItem(STORAGE.SCRIPTS_KEY, JSON.stringify(scripts));
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('scriptsUpdated'));
    
    return { success: true };
  } catch (error) {
    console.error('Ошибка при сохранении сценария:', error);
    return {
      success: false,
      error: 'Не удалось сохранить сценарий'
    };
  }
}

/**
 * Удалить сценарий по ID
 */
export function deleteScript(id: string): boolean {
  try {
    const scripts = getSavedScripts();
    const filtered = scripts.filter(s => s.id !== id);
    localStorage.setItem(STORAGE.SCRIPTS_KEY, JSON.stringify(filtered));
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('scriptsUpdated'));
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении сценария:', error);
    return false;
  }
}

/**
 * Удалить все сценарии
 */
export function deleteAllScripts(): boolean {
  try {
    localStorage.removeItem(STORAGE.SCRIPTS_KEY);
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('scriptsUpdated'));
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении всех сценариев:', error);
    return false;
  }
}

/**
 * Получить количество сохранённых сценариев
 */
export function getSavedScriptsCount(): number {
  return getSavedScripts().length;
}

/**
 * Проверить, можно ли сохранить ещё сценарии
 */
export function canSaveMoreScripts(): boolean {
  return getSavedScriptsCount() < STORAGE.MAX_SAVED_SCRIPTS;
}

/**
 * Получить оставшееся количество слотов
 */
export function getRemainingSlots(): number {
  return STORAGE.MAX_SAVED_SCRIPTS - getSavedScriptsCount();
}
