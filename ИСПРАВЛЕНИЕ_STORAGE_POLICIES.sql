-- ✅ ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ Storage Policies
-- Выполните этот SQL в Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new

-- Шаг 1: Удаляем ВСЕ старые политики
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read their videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their videos" ON storage.objects;

-- Шаг 2: Создаем ПРАВИЛЬНЫЕ политики с split_part()
CREATE POLICY "Allow authenticated users to upload videos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'video-uploads' AND
    split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Allow authenticated users to read their videos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'video-uploads' AND
    split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Allow authenticated users to delete their videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'video-uploads' AND
    split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Allow authenticated users to update their videos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'video-uploads' AND
    split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'video-uploads' AND
    split_part(name, '/', 1) = auth.uid()::text
  );

-- Проверка: смотрим созданные политики
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN substring(qual from 1 for 100)
    WHEN with_check IS NOT NULL THEN substring(with_check from 1 for 100)
    ELSE 'N/A'
  END as policy_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%authenticated%video%';
