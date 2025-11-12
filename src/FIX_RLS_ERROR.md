# ✅ Исправление: "new row violates row-level security policy"

## ❌ Ошибка

```
StorageApiError: new row violates row-level security policy
```

## 🔍 Причина

Storage bucket создан, но **нет политик безопасности (RLS)** для загрузки файлов.

Supabase Storage требует явного разрешения на INSERT/SELECT/DELETE операции.

---

## ✅ Решение А: Создать политики (рекомендуется) - 1 минута

### Шаг 1: Откройте SQL Editor

https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new

### Шаг 2: Скопируйте и выполните SQL

**Откройте файл:** `/STORAGE_POLICIES.sql`

**Скопируйте весь SQL код** (или используйте код ниже)

**Вставьте в SQL Editor → Нажмите "Run"**

```sql
-- Политика для загрузки
CREATE POLICY "Users can upload their own videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'make-f3dc28c4-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Политика для просмотра
CREATE POLICY "Users can view their own videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Политика для удаления
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Политика для обновления
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
```

### Шаг 3: Проверка

Должно быть сообщение: `Success. No rows returned`

✅ **Готово! Теперь загрузка работает.**

---

## ✅ Решение Б: Отключить RLS (быстро, но менее безопасно) - 30 секунд

**Только для прототипа! Не для production.**

### Через Dashboard:

1. **Откройте Storage:**
   https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/storage/buckets

2. **Нажмите на bucket `make-f3dc28c4-videos`**

3. **Settings → Scroll down → "RLS Policies"**

4. **Нажмите "Disable RLS" (если есть такая опция)**

### Или через SQL:

```sql
-- ⚠️ ВНИМАНИЕ: Это отключает безопасность!
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Не рекомендуется!** Лучше использовать Решение А.

---

## 🧪 Тест

После создания политик:

1. Откройте приложение
2. Зарегистрируйтесь / Войдите
3. Загрузите видео
4. → Должно успешно загрузиться

**Консоль (F12):**
```
✅ Видео загружено: user-id/1699999999.mp4
✅ Анализ завершен!
```

---

## 📋 Что делают политики?

### INSERT Policy
```
Разрешает пользователям загружать файлы ТОЛЬКО в папку:
/{их_user_id}/filename.mp4
```

### SELECT Policy
```
Разрешает пользователям просматривать ТОЛЬКО свои файлы:
/{их_user_id}/*
```

### DELETE Policy
```
Разрешает пользователям удалять ТОЛЬКО свои файлы:
/{их_user_id}/*
```

### UPDATE Policy
```
Разрешает пользователям обновлять метаданные ТОЛЬКО своих файлов
```

**Безопасность:** Каждый пользователь видит и управляет только своими видео.

---

## 🔍 Проверка политик

### SQL запрос:

```sql
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

Должно вернуть 4 политики.

---

## 🆘 Если не работает

### 1. Политики уже существуют?

```sql
-- Удалите старые
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;

-- Создайте заново (из Решения А)
```

### 2. Bucket не существует?

Проверьте:
https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/storage/buckets

Должен быть: `make-f3dc28c4-videos`

### 3. Пользователь не аутентифицирован?

Проверьте в консоли (F12):
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('User ID:', session?.user?.id);
```

Если `null` - выполните вход заново.

---

## 📚 Дополнительно

**Документация Supabase RLS:**
https://supabase.com/docs/guides/storage/security/access-control

**Примеры политик:**
https://supabase.com/docs/guides/storage/security/access-control#policy-examples

---

## ✅ Чеклист

- [ ] SQL политики созданы (`STORAGE_POLICIES.sql`)
- [ ] Email Confirmation отключен
- [ ] Bucket `make-f3dc28c4-videos` существует
- [ ] Пользователь зарегистрирован и вошёл
- [ ] Загрузка видео работает

**Если все галочки ✅ - приложение работает полностью!**

---

## 🎉 Итого

**Решение А (рекомендуется):**
- 4 SQL политики
- Безопасность на уровне строк
- Каждый пользователь видит только свои видео
- 1 минута настройки

**Решение Б (быстро):**
- Отключить RLS
- Все пользователи имеют полный доступ
- Только для прототипа!
- 30 секунд настройки

**Выберите Решение А для безопасности!** 🔒
