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
-- ГОТОВО! ✅
-- 
-- Теперь:
-- - Каждый пользователь видит только свои сценарии
-- - Никто не может читать/удалять чужие данные
-- - Данные защищены на уровне базы данных
-- =============================================================================
