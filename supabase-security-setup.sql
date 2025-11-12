-- =============================================================================
-- НАСТРОЙКА БЕЗОПАСНОСТИ SUPABASE для AI Reels Scripter
-- =============================================================================
-- Инструкция:
-- 1. Откройте Supabase Dashboard → SQL Editor
-- 2. Скопируйте весь этот код
-- 3. Нажмите "Run"
-- 4. Включите RLS для таблицы scripts (если отключён)
-- =============================================================================

-- Шаг 1: Убедимся что RLS включён для таблицы scripts
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Шаг 2: Удалим старые политики (если есть)
DROP POLICY IF EXISTS "Users see only their scripts" ON scripts;
DROP POLICY IF EXISTS "Users can view their own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can insert their own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can delete their own scripts" ON scripts;

-- Шаг 3: Создаём правильные политики безопасности

-- Политика SELECT: пользователи видят только свои сценарии
CREATE POLICY "Users can select own scripts" 
  ON scripts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Политика INSERT: пользователи могут создавать только свои сценарии
CREATE POLICY "Users can insert own scripts" 
  ON scripts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Политика DELETE: пользователи могут удалять только свои сценарии
CREATE POLICY "Users can delete own scripts" 
  ON scripts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =============================================================================
-- Шаг 4: Storage Policies для бакета video-uploads
-- =============================================================================

-- Политика INSERT: пользователи могут загружать видео
CREATE POLICY "Users can upload their own videos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'video-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Политика SELECT: пользователи могут читать свои видео
CREATE POLICY "Users can view their own videos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'video-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Политика DELETE: пользователи могут удалять свои видео
CREATE POLICY "Users can delete their own videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'video-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- ГОТОВО! ✅
-- 
-- Теперь:
-- - Каждый пользователь видит только свои сценарии
-- - Каждый пользователь может загружать/удалять только свои видео
-- - Никто не может читать/удалять чужие данные
-- - Данные защищены на уровне базы данных
-- =============================================================================
