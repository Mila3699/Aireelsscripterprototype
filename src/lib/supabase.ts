/**
 * Supabase клиент для работы с аутентификацией и хранилищем
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info.ts';

// Создаем Supabase клиент с настройкой сохранения сессии
const supabaseUrl = `https://${projectId}.supabase.co`;

console.log('🔧 Инициализация Supabase клиента...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key:', publicAnonKey ? 'Присутствует' : '❌ Отсутствует');

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    // Автоматически сохранять сессию в localStorage
    persistSession: true,
    // Автоматически обновлять токены
    autoRefreshToken: true,
    // Определить сессию при загрузке
    detectSessionInUrl: false,
    // Хранилище для сессии (по умолчанию localStorage)
    storage: window.localStorage,
  },
});

/**
 * Типы для аутентификации
 */
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

/**
 * Регистрация нового пользователя (напрямую через Supabase)
 * 
 * ВАЖНО: Для работы регистрации нужно отключить Email Confirmation в Supabase:
 * https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/settings/auth
 * → Disable "Enable email confirmations"
 */
export async function signUp(email: string, password: string) {
  try {
    console.log('🔐 Регистрация пользователя:', email);
    
    // Используем напрямую Supabase Auth API для регистрации
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign up error:', error);
      
      // Проверяем специфичные ошибки
      if (error.message.includes('User already registered')) {
        console.log('%c💡 Этот email уже зарегистрирован!', 'color: #F59E0B; font-weight: bold');
        console.log('   → Попробуйте войти вместо регистрации');
        console.log('   → Или используйте другой email');
        return {
          success: false,
          error: 'Пользователь с таким email уже зарегистрирован',
        };
      }
      
      if (error.message.includes('Email') || error.message.includes('confirmation')) {
        console.log('%c💡 Проблема с email confirmation', 'color: #F59E0B; font-weight: bold');
        console.log('   → Отключите Email Confirmation в Supabase Dashboard');
        console.log('   → https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/settings/auth');
      }
      
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      console.error('❌ User not created');
      return {
        success: false,
        error: 'Не удалось создать пользователя',
      };
    }

    console.log('✅ Пользователь создан:', data.user.id);
    console.log('📧 Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('🎫 Session created:', data.session ? 'Yes' : 'No');

    // Если сессия создана - отлично, пользователь вошел автоматически
    if (data.session) {
      console.log('✅ Автоматический вход выполнен');
      console.log('💾 Сессия сохранена в браузере - повторный вход не потребуется');
      return {
        success: true,
        data: {
          user: data.user,
          session: data.session,
        },
      };
    }

    // Если сессии нет, пробуем подтвердить email через backend и войти
    console.log('⚠️ Сессия не создана, пробуем подтвердить email...');
    
    try {
      const confirmResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f3dc28c4/auth/confirm-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId: data.user.id }),
        }
      );

      if (confirmResponse.ok) {
        console.log('✅ Email подтверждён через backend');
      } else {
        console.warn('⚠️ Не удалось подтвердить email через backend');
      }
    } catch (confirmError) {
      console.warn('⚠️ Ошибка подтверждения email:', confirmError);
    }

    // Пробуем войти
    console.log('🔑 Выполняем вход после регистрации...');
    const signInResult = await signIn(email, password);
    
    if (!signInResult.success) {
      console.error('❌ Вход не выполнен после регистрации');
      return {
        success: false,
        error: 'Регистрация успешна, но автоматический вход не выполнен. Отключите Email Confirmation в Supabase Dashboard и попробуйте войти вручную.',
      };
    }
    
    return signInResult;
  } catch (error) {
    console.error('❌ Sign up error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка регистрации',
    };
  }
}

/**
 * Вход пользователя
 */
export async function signIn(email: string, password: string) {
  try {
    console.log('🔑 Попытка входа:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign in error:', error.message);
      console.error('Error details:', error);
      throw error;
    }

    if (!data.session) {
      console.error('❌ Вход выполнен, но сессия не создана');
      throw new Error('Не удалось создать сессию');
    }

    console.log('✅ Вход успешен! User ID:', data.user.id);
    console.log('📧 Email:', data.user.email);
    console.log('💾 Сессия сохранена в браузере - повторный вход не потребуется');
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    
    let errorMessage = 'Ошибка входа';
    
    if (error instanceof Error) {
      // Переводим стандартные ошибки Supabase с подробными объяснениями
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Неверный email или пароль';
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #EF4444');
        console.log('%c❌ ОШИБКА ВХОДА: Invalid login credentials', 'color: #EF4444; font-weight: bold; font-size: 14px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #EF4444');
        console.log('');
        console.log('%c💡 РЕШЕНИЯ:', 'font-weight: bold; font-size: 13px');
        console.log('');
        console.log('%c1️⃣ Вы зарегистрированы?', 'font-weight: bold');
        console.log('   → Если НЕТ: нажмите "Зарегистрироваться" на странице входа');
        console.log('');
        console.log('%c2️⃣ Email Confirmation отключён?', 'font-weight: bold');
        console.log('   → Откройте: https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/settings/auth');
        console.log('   → Отключите: "Enable email confirmations"');
        console.log('   → Нажмите: Save');
        console.log('');
        console.log('%c3️⃣ Данные правильные?', 'font-weight: bold');
        console.log('   → Проверьте правильность email и пароля');
        console.log('');
        console.log('%c📚 Подробная инструкция:', 'font-weight: bold');
        console.log('   → См. файл: /ОШИБКА_ВХОДА_РЕШЕНИЕ.md');
        console.log('   → Или: /FIX_LOGIN_ERROR.md');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #EF4444');
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email не подтверждён. Отключите Email Confirmation в Supabase Dashboard.';
        console.log('%c💡 Решение:', 'font-weight: bold');
        console.log('   https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/settings/auth');
        console.log('   → Отключите "Enable email confirmations"');
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Выход пользователя
 */
export async function signOut() {
  try {
    console.log('👋 Выполняется выход из системы...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('✅ Сессия удалена из браузера');
    console.log('🔐 При следующем посещении потребуется повторный вход');
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка выхода',
    };
  }
}

/**
 * Быстрая проверка сессии из localStorage (без запроса к серверу)
 * Используется при загрузке приложения для мгновенного определения состояния auth
 */
export function checkLocalSession() {
  try {
    console.log('⚡ Быстрая проверка локальной сессии...');
    
    // Проверяем localStorage на наличие Supabase auth token
    const authStorage = localStorage.getItem(`sb-${projectId}-auth-token`);
    
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const hasValidToken = parsed && parsed.access_token && parsed.expires_at;
        
        if (hasValidToken) {
          // Проверяем не истёк ли токен
          const expiresAt = parsed.expires_at * 1000; // конвертируем в миллисекунды
          const isExpired = Date.now() > expiresAt;
          
          if (!isExpired) {
            console.log('✅ Найдена активная сессия в localStorage');
            return { hasSession: true };
          } else {
            console.log('⏰ Токен в localStorage истёк');
            return { hasSession: false };
          }
        }
      } catch (parseError) {
        console.log('⚠️ Ошибка парсинга токена из localStorage');
      }
    }
    
    console.log('ℹ️ Активной сессии в localStorage нет');
    return { hasSession: false };
  } catch (error) {
    console.error('❌ Ошибка проверки localStorage:', error);
    return { hasSession: false };
  }
}

/**
 * Получить текущего пользователя (для использования после успешной проверки localStorage)
 * Этот метод вызывается только когда нужны детали пользователя, не при загрузке приложения
 */
export async function getCurrentUser() {
  try {
    console.log('🔍 Запрос данных пользователя...');
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.log('⚠️ Ошибка получения пользователя:', error.message);
      throw error;
    }

    if (user) {
      console.log('✅ Пользователь найден:', user.email);
    } else {
      console.log('ℹ️ Активной сессии нет');
    }

    return { success: true, user };
  } catch (error) {
    console.error('❌ getCurrentUser error:', error);
    return { success: false, user: null };
  }
}

/**
 * Получить активную сессию
 */
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return { success: true, session };
  } catch (error) {
    return { success: false, session: null };
  }
}

/**
 * Проверить/создать bucket в Storage
 */
async function ensureStorageBucket(bucketName: string) {
  try {
    // Проверяем существование bucket
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      // Пробуем создать bucket через backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f3dc28c4/ensure-bucket`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ bucketName }),
        }
      );
      
      if (response.ok) {
        console.log('Bucket created via backend');
        return true;
      }
      
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      return true;
    }
    
    // Bucket не существует, создаем через backend
    console.log('Bucket not found, requesting creation...');
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-f3dc28c4/ensure-bucket`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ bucketName }),
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('ensureStorageBucket error:', error);
    return false;
  }
}

/**
 * Загрузить видео в Supabase Storage
 */
export async function uploadVideoToStorage(file: File, userId: string) {
  try {
    const bucketName = 'make-f3dc28c4-videos';
    
    // Проверяем что bucket существует
    const bucketReady = await ensureStorageBucket(bucketName);
    if (!bucketReady) {
      throw new Error('Storage bucket не готов. Попробуйте снова через несколько секунд.');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    return {
      success: true,
      path: data.path,
      fullPath: `${bucketName}/${data.path}`,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка загрузки видео',
    };
  }
}

/**
 * Получить публичный URL видео (для отладки)
 */
export function getPublicVideoUrl(path: string) {
  const bucketName = 'make-f3dc28c4-videos';
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Проверить доступность Storage (есть ли RLS policies)
 * Возвращает true если Storage настроен правильно, false если нужна настройка
 */
export async function checkStorageAccess(): Promise<{ accessible: boolean; needsSetup: boolean; error?: string }> {
  try {
    const { user } = await getCurrentUser();
    
    if (!user) {
      // Если пользователь не авторизован, считаем что всё ОК (проверка будет позже)
      return { accessible: true, needsSetup: false };
    }

    const bucketName = 'make-f3dc28c4-videos';
    
    // Пробуем получить список файлов пользователя
    // Это позволит проверить наличие RLS policies без создания файла
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(user.id, {
        limit: 1,
      });

    if (error) {
      // Проверяем, является ли это ошибкой RLS
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('row-level security') || 
          errorMessage.includes('policy') ||
          errorMessage.includes('permission denied')) {
        console.log('⚠️ Storage RLS не настроен');
        return { 
          accessible: false, 
          needsSetup: true,
          error: error.message 
        };
      }
      
      // Другие ошибки (например, bucket не существует) - не требуют настройки RLS
      console.log('ℹ️ Storage error (не RLS):', error.message);
      return { accessible: true, needsSetup: false };
    }

    // Успешно получили список - Storage настроен
    console.log('✅ Storage доступен и настроен правильно');
    return { accessible: true, needsSetup: false };
  } catch (error) {
    console.error('Ошибка проверки Storage:', error);
    // При неизвестной ошибке не показываем предупреждение
    return { accessible: true, needsSetup: false };
  }
}
