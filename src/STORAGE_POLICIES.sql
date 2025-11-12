-- =====================================================
-- Storage RLS Policies для AI Reels Scripter
-- =====================================================
-- 
-- Выполните этот SQL в Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new
-- 
-- Скопируйте весь код → Вставьте → Run
-- 
-- =====================================================

-- 1. Политика для ЗАГРУЗКИ видео (INSERT)
-- Пользователи могут загружать файлы только в свою папку
CREATE POLICY "Users can upload their own videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-f3dc28c4-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Политика для ПРОСМОТРА видео (SELECT)
-- Пользователи могут просматривать только свои файлы
CREATE POLICY "Users can view their own videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Политика для УДАЛЕНИЯ видео (DELETE)
-- Пользователи могут удалять только свои файлы
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Политика для ОБНОВЛЕНИЯ метаданных (UPDATE)
-- Пользователи могут обновлять метаданные своих файлов
CREATE POLICY "Users can update their own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- ✅ Готово! Теперь загрузка видео работает.
-- =====================================================

-- ПРОВЕРКА: Посмотрите созданные политики
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%videos%';

-- Если нужно удалить политики (для пересоздания):
-- DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
