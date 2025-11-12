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
 * 
 * @param file - Файл видео для анализа
 * @param userId - ID пользователя из кэшированной сессии
 * @param userEmail - Email пользователя для логирования (опционально)
 */
export async function processVideoWithSupabase(
  file: File,
  userId: string,
  userEmail?: string
): Promise<VideoAnalysisResult> {
  console.log('✅ Пользователь:', userEmail || userId);
  
  // Проверка Rate Limiting
  const limitCheck = videoAnalysisLimiter.checkLimit();
  
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || 'Превышен лимит запросов. Попробуйте позже.');
  }
  
  videoAnalysisLimiter.recordRequest();
  
  console.info(`📊 Осталось запросов: ${limitCheck.remainingRequests}/${videoAnalysisLimiter.getStatus().maxRequests}`);
  
  try {
    console.log('📤 Подготовка видео для анализа...');
    console.log('📁 Файл:', file.name, 'Размер:', (file.size / 1024 / 1024).toFixed(2), 'МБ');
    console.log('📁 MIME type:', file.type);
    
    const startTime = Date.now();
    
    // НОВЫЙ ПОДХОД: Конвертируем видео в base64 и отправляем напрямую в Edge Function
    console.log('🔄 Конвертируем видео в base64...');
    const base64Video = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Убираем "data:video/quicktime;base64," префикс
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
    
    const conversionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Конвертация завершена за ${conversionTime}s`);
    console.log('🤖 Отправляем видео в Gemini AI через Edge Function...');
    
    // Вызываем Edge Function для анализа с base64 видео
    const edgeFunctionPromise = supabase.functions.invoke('analyze-video', {
      body: {
        videoBase64: base64Video,
        mimeType: file.type,
        userId: userId,
      },
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Edge Function timeout (90s)')), 90000)
    );
    
    const { data: analysisData, error: analysisError } = await Promise.race([
      edgeFunctionPromise,
      timeoutPromise
    ]) as any;
    
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
    console.log('ℹ️ Ошибка:', error instanceof Error ? error.message : String(error));
    
    // Имитируем время обработки (4 секунды как в ProcessingPage)
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const sanitizedResult = sanitizeAnalysisResult(MOCK_ANALYSIS_RESULT);
    
    return {
      ...sanitizedResult,
      isDemoMode: true,
    };
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
