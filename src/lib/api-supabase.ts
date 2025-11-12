/**
 * API с интеграцией Supabase
 * Новая архитектура:
 * 1. Frontend загружает видео напрямую в Supabase Storage
 * 2. Frontend отправляет путь к файлу на backend (Render)
 * 3. Backend создает signed URL и отправляет в Gemini
 * 4. Backend возвращает результат анализа
 */

import type { VideoAnalysisResult, SavedScript } from './api';
import { sanitizeAnalysisResult } from './sanitizer';
import { videoAnalysisLimiter } from './rateLimiter';
import { MOCK_ANALYSIS_RESULT } from './mockData';
import { STORAGE } from './constants';

/**
 * Загрузить видео и проанализировать (ПРОТОТИП - БЕЗ РЕАЛЬНОГО BACKEND)
 * 
 * Для прототипа используем простую mock-функцию без реальных запросов к серверу.
 * Это позволяет приложению работать даже если backend не настроен.
 */
export async function processVideoWithSupabase(file: File): Promise<VideoAnalysisResult> {
  // Проверка Rate Limiting
  const limitCheck = videoAnalysisLimiter.checkLimit();
  
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || 'Превышен лимит запросов. Попробуйте позже.');
  }
  
  videoAnalysisLimiter.recordRequest();
  
  console.info(`📊 Осталось запросов: ${limitCheck.remainingRequests}/${videoAnalysisLimiter.getStatus().maxRequests}`);
  
  console.log('🎭 ПРОТОТИП: Используем mock-данные (backend не требуется)');
  console.log('📁 Файл:', file.name, 'Размер:', (file.size / 1024 / 1024).toFixed(2), 'МБ');
  
  // Имитируем время обработки (3 секунды)
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('✅ Mock-анализ завершен!');
  
  // Санитизируем результат
  const sanitizedResult = sanitizeAnalysisResult(MOCK_ANALYSIS_RESULT);
  
  return sanitizedResult;
}

/**
 * Сохранить сценарий (ПРОТОТИП - используем localStorage)
 */
export async function saveScript(
  result: VideoAnalysisResult
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    console.log('💾 ПРОТОТИП: Сохраняем в localStorage');
    
    // Санитизируем данные
    const sanitizedResult = sanitizeAnalysisResult(result);
    
    const scriptId = crypto.randomUUID();
    const savedScript: SavedScript = {
      ...sanitizedResult,
      id: scriptId,
      savedAt: new Date().toISOString(),
    };
    
    // Получаем текущие сценарии
    const stored = localStorage.getItem(STORAGE.SCRIPTS_KEY);
    const scripts: SavedScript[] = stored ? JSON.parse(stored) : [];
    
    // Проверка лимита
    if (scripts.length >= STORAGE.MAX_SAVED_SCRIPTS) {
      return {
        success: false,
        error: `Лимит сохранённых сценариев исчерпан (${STORAGE.MAX_SAVED_SCRIPTS}). Удалите ненужные сценарии.`,
      };
    }
    
    // Добавляем новый сценарий
    scripts.unshift(savedScript);
    localStorage.setItem(STORAGE.SCRIPTS_KEY, JSON.stringify(scripts));
    
    console.log('✅ Сценарий сохранён:', scriptId);
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('scriptsUpdated'));

    return {
      success: true,
      id: scriptId,
    };
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка сохранения сценария',
    };
  }
}

/**
 * Получить все сохранённые сценарии (ПРОТОТИП - из localStorage)
 */
export async function getSavedScripts(): Promise<SavedScript[]> {
  try {
    console.log('📂 ПРОТОТИП: Загружаем из localStorage');
    
    const stored = localStorage.getItem(STORAGE.SCRIPTS_KEY);
    if (!stored) {
      return [];
    }
    
    const scripts: SavedScript[] = JSON.parse(stored);
    
    // Сортируем по дате (новые сверху)
    return scripts.sort((a, b) => {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
  } catch (error) {
    console.error('Ошибка загрузки сценариев:', error);
    return [];
  }
}

/**
 * Удалить сценарий (ПРОТОТИП - из localStorage)
 */
export async function deleteScript(id: string): Promise<boolean> {
  try {
    console.log('🗑️ ПРОТОТИП: Удаляем из localStorage');
    
    const stored = localStorage.getItem(STORAGE.SCRIPTS_KEY);
    if (!stored) {
      return false;
    }
    
    const scripts: SavedScript[] = JSON.parse(stored);
    const filtered = scripts.filter(s => s.id !== id);
    
    localStorage.setItem(STORAGE.SCRIPTS_KEY, JSON.stringify(filtered));
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('scriptsUpdated'));
    
    return true;
  } catch (error) {
    console.error('Ошибка удаления:', error);
    return false;
  }
}

/**
 * Удалить все сценарии (ПРОТОТИП - из localStorage)
 */
export async function deleteAllScripts(): Promise<boolean> {
  try {
    console.log('🗑️ ПРОТОТИП: Удаляем все из localStorage');
    
    localStorage.removeItem(STORAGE.SCRIPTS_KEY);
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('scriptsUpdated'));
    
    return true;
  } catch (error) {
    console.error('Ошибка удаления всех сценариев:', error);
    return false;
  }
}

/**
 * Поиск сценариев по ключевым словам
 */
export function searchScripts(scripts: SavedScript[], query: string): SavedScript[] {
  if (!query.trim()) {
    return scripts;
  }

  const lowerQuery = query.toLowerCase().trim();

  return scripts.filter((script) => {
    // Поиск в названии
    if (script.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Поиск в сценарии
    const scriptText = script.script
      .map((scene) => `${scene.visual} ${scene.text} ${scene.note}`)
      .join(' ')
      .toLowerCase();

    if (scriptText.includes(lowerQuery)) {
      return true;
    }

    // Поиск в рекомендациях
    const recommendations = script.recommendations
      .map((r) => `${r.category} ${r.text}`)
      .join(' ')
      .toLowerCase();

    if (recommendations.includes(lowerQuery)) {
      return true;
    }

    // Поиск в ключах успеха
    const keys = script.keys
      .map((k) => `${k.title} ${k.description}`)
      .join(' ')
      .toLowerCase();

    if (keys.includes(lowerQuery)) {
      return true;
    }

    return false;
  });
}
