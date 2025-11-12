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
import { supabase } from './supabase';

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
 * Сохранить сценарий в Supabase Database
 */
export async function saveScript(
  result: VideoAnalysisResult
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    console.log('💾 Сохраняем в Supabase Database...');
    
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Необходимо войти в систему для сохранения сценария',
      };
    }
    
    // Санитизируем данные
    const sanitizedResult = sanitizeAnalysisResult(result);
    
    // Проверяем лимит (необязательно для малой группы, но оставим)
    const { count } = await supabase
      .from('scripts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (count && count >= STORAGE.MAX_SAVED_SCRIPTS) {
      return {
        success: false,
        error: `Лимит сохранённых сценариев исчерпан (${STORAGE.MAX_SAVED_SCRIPTS}). Удалите ненужные сценарии.`,
      };
    }
    
    // Вставляем в базу данных
    const { data, error } = await supabase
      .from('scripts')
      .insert({
        user_id: user.id,
        title: sanitizedResult.title,
        original: sanitizedResult.original,
        keys: sanitizedResult.keys,
        script: sanitizedResult.script,
        recommendations: sanitizedResult.recommendations,
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Ошибка Supabase:', error);
      return {
        success: false,
        error: error.message,
      };
    }
    
    console.log('✅ Сценарий сохранён в базу:', data.id);
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('scriptsUpdated'));

    return {
      success: true,
      id: data.id,
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
 * Получить все сохранённые сценарии из Supabase Database
 */
export async function getSavedScripts(): Promise<SavedScript[]> {
  try {
    console.log('📂 Загружаем из Supabase Database...');
    
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️ Пользователь не авторизован');
      return [];
    }
    
    // Загружаем сценарии пользователя
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });
    
    if (error) {
      console.error('❌ Ошибка Supabase:', error);
      return [];
    }
    
    // Преобразуем данные из базы в формат SavedScript
    const scripts: SavedScript[] = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      original: row.original,
      keys: row.keys,
      script: row.script,
      recommendations: row.recommendations,
      savedAt: row.saved_at,
    }));
    
    console.log(`📊 Загружено ${scripts.length} сценариев`);
    return scripts;
  } catch (error) {
    console.error('Ошибка загрузки сценариев:', error);
    return [];
  }
}

/**
 * Удалить сценарий из Supabase Database
 */
export async function deleteScript(id: string): Promise<boolean> {
  try {
    console.log('🗑️ Удаляем из Supabase Database...');
    
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️ Пользователь не авторизован');
      return false;
    }
    
    // Удаляем сценарий (RLS автоматически проверит что это сценарий пользователя)
    const { error } = await supabase
      .from('scripts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('❌ Ошибка Supabase:', error);
      return false;
    }
    
    console.log('✅ Сценарий удалён:', id);
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('scriptsUpdated'));
    
    return true;
  } catch (error) {
    console.error('Ошибка удаления:', error);
    return false;
  }
}

/**
 * Удалить все сценарии пользователя из Supabase Database
 */
export async function deleteAllScripts(): Promise<boolean> {
  try {
    console.log('🗑️ Удаляем все сценарии из Supabase Database...');
    
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️ Пользователь не авторизован');
      return false;
    }
    
    // Удаляем все сценарии пользователя
    const { error } = await supabase
      .from('scripts')
      .delete()
      .eq('user_id', user.id);
    
    if (error) {
      console.error('❌ Ошибка Supabase:', error);
      return false;
    }
    
    console.log('✅ Все сценарии удалены');
    
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
