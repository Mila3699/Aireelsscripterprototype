# 📝 SQL Шпаргалка - Копируй и вставляй

## 🎯 Использование

1. **Откройте SQL Editor:**
   https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new

2. **Скопируйте весь код ниже**

3. **Вставьте в редактор**

4. **Нажмите "Run"**

5. **Должно быть: `Success. No rows returned`**

---

## 📋 Storage Policies (Скопируйте весь блок)

```sql
-- =====================================================
-- Storage RLS Policies для AI Reels Scripter
-- =====================================================

-- 1. Политика для ЗАГРУЗКИ
CREATE POLICY "Users can upload their own videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-f3dc28c4-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Политика для ПРОСМОТРА
CREATE POLICY "Users can view their own videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Политика для УДАЛЕНИЯ
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Политика для ОБНОВЛЕНИЯ
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
```

---

## 🔍 Проверка политик (опционально)

```sql
-- Посмотреть созданные политики
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%videos%';
```

**Должно вернуть 4 строки.**

---

## 🗑️ Удаление политик (если нужно пересоздать)

```sql
-- Удалить все политики
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
```

---

## ⚠️ Альтернатива: Отключить RLS (НЕ рекомендуется)

```sql
-- ВНИМАНИЕ: Это отключает безопасность!
-- Только для быстрого прототипа!
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Используйте только если:**
- Вы понимаете риски
- Это локальный прототип
- Вы не храните реальные данные

**Для production всегда используйте политики выше!**

---

## 📚 Что дальше?

После выполнения SQL:

1. ✅ Загрузка видео работает
2. ✅ Каждый пользователь видит только свои файлы
3. ✅ Безопасность на уровне строк включена

**Тестируйте приложение!** 🎉

---

## 🆘 Помощь

- **Ошибки при выполнении SQL** → Проверьте что bucket существует
- **Политики не работают** → Удалите и создайте заново
- **Подробно** → `/FIX_RLS_ERROR.md`
