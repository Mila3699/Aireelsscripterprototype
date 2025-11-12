-- ПРОВЕРКА: Убедимся что политики созданы правильно
-- Выполните в SQL Editor: https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new

-- 1. Проверка: RLS включен ли для storage.objects?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
-- Должно быть: rowsecurity = true

-- 2. Проверка: Какие политики существуют для storage.objects?
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN LEFT(qual, 150)
    ELSE NULL
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN LEFT(with_check, 150)
    ELSE NULL
  END as with_check_clause
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY cmd, policyname;

-- 3. Проверка: Тестовый запрос от имени пользователя
-- ЗАМЕНИТЕ 'ac3891ec-4995-4391-b0c3-406857a9038b' на ваш реальный auth.uid()
SELECT 
  split_part('ac3891ec-4995-4391-b0c3-406857a9038b/test.mov', '/', 1) as first_part,
  'ac3891ec-4995-4391-b0c3-406857a9038b'::text as user_id,
  split_part('ac3891ec-4995-4391-b0c3-406857a9038b/test.mov', '/', 1) = 'ac3891ec-4995-4391-b0c3-406857a9038b'::text as should_match;
-- Должно быть: should_match = true
