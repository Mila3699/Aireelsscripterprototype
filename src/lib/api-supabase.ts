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
 * Загрузить видео и проанализировать через Gemini AI (PRODUCTION)
 * 
 * Новая архитектура:
 * 1. Загружаем видео в Supabase Storage
 * 2. Вызываем Edge Function для анализа через Gemini API
 * 3. Возвращаем результат
 */
export async function processVideoWithSupabase(file: File): Promise<VideoAnalysisResult> {
  // Проверка Rate Limiting
  const limitCheck = videoAnalysisLimiter.checkLimit();
  
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || 'Превышен лимит запросов. Попробуйте позже.');
  }
  
  videoAnalysisLimiter.recordRequest();
  
  console.info(`📊 Осталось запросов: ${limitCheck.remainingRequests}/${videoAnalysisLimiter.getStatus().maxRequests}`);
  
  let uploadedFilePath: string | null = null;
  
  try {
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Необходимо войти в систему для анализа видео');
    }
    
    console.log('📤 Загружаем видео в Supabase Storage...');
    console.log('📁 Файл:', file.name, 'Размер:', (file.size / 1024 / 1024).toFixed(2), 'МБ');
    
    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const fileName = `${user.id}/${timestamp}_${randomString}.${fileExtension}`;
    
    // Загружаем видео в Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('video-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('❌ Ошибка загрузки видео:', uploadError);
      throw new Error(`Не удалось загрузить видео: ${uploadError.message}`);
    }
    
    // Сохраняем путь для cleanup в finally
    uploadedFilePath = uploadData.path;
    
    console.log('✅ Видео загружено:', uploadData.path);
    console.log('🤖 Вызываем Gemini AI для анализа...');
    
    // Вызываем Edge Function для анализа
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-video', {
      body: {
        videoPath: uploadData.path,
      },
    });
    
    if (analysisError) {
      console.error('❌ Ошибка анализа:', analysisError);
      throw new Error(`Ошибка анализа видео: ${analysisError.message}`);
    }
    
    console.log('✅ Анализ завершён успешно!');
    
    // Санитизируем результат
    const sanitizedResult = sanitizeAnalysisResult(analysisData);
    
    return {
      ...sanitizedResult,
      isDemoMode: false,
    };
    
  } catch (error) {
    console.error('❌ Ошибка обработки видео:', error);
    
    // Fallback на mock данные если что-то пошло не так
    console.log('🎭 Переключаемся на демо-режим из-за ошибки');
    console.log('💡 Проверьте что Edge Function задеплоена и GEMINI_API_KEY настроен');
    
    // Имитируем время обработки
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sanitizedResult = sanitizeAnalysisResult(MOCK_ANALYSIS_RESULT);
    
    return {
      ...sanitizedResult,
      isDemoMode: true,
    };
  } finally {
    // ВСЕГДА удаляем загруженное видео (даже при ошибках)
    if (uploadedFilePath) {
      try {
        await supabase.storage.from('video-uploads').remove([uploadedFilePath]);
        console.log('🗑️ Временное видео удалено:', uploadedFilePath);
      } catch (cleanupError) {
        console.error('⚠️ Не удалось удалить временное видео:', cleanupError);
      }
    }
  }
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
