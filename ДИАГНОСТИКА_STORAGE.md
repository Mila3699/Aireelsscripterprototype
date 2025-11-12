# 🔍 Детальная диагностика проблемы Storage Upload Timeout

## Проблема
`supabase.storage.upload()` зависает на 30 секунд при попытке загрузить видео 6.53 МБ.

## Что уже проверено
✅ Bucket `video-uploads` **PRIVATE** (не public)
✅ Storage Policies пересозданы с `split_part(name, '/', 1) = auth.uid()::text`

## Что нужно проверить СЕЙЧАС

### 1. Проверьте что политики АКТИВНЫ
https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/storage/policies

**Должны быть 3-4 активные политики для bucket `video-uploads`:**
- ✅ "Users can upload their own videos" (INSERT)
- ✅ "Users can view their own videos" (SELECT)  
- ✅ "Users can delete their own videos" (DELETE)

**Убедитесь что:**
- Галочки стоят (политики включены)
- Target roles: `authenticated`
- Policy definition содержит `split_part(name, '/', 1) = auth.uid()::text`

### 2. Проверьте настройки bucket
https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/storage/buckets/video-uploads

**Настройки должны быть:**
- Public bucket: **OFF** ❌
- File size limit: **≥ 30 MB** (30000000 bytes минимум)
- Allowed MIME types: `video/mp4`, `video/quicktime`, `video/webm`, `video/x-matroska`

### 3. Проверьте MIME type вашего файла
Откройте консоль (F12) и выполните:
```javascript
// После выбора файла, проверьте его MIME type:
const fileInput = document.querySelector('input[type="file"]');
console.log('MIME type:', fileInput.files[0].type);
```

Если MIME type не разрешен, добавьте его в bucket settings!

### 4. Тест загрузки вручную
https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/storage/buckets/video-uploads

1. Нажмите "Upload file"
2. Создайте папку с именем вашего user ID: `ac3891ec-4995-4391-b0c3-406857a9038b`
3. Попробуйте загрузить видео вручную
4. Если загрузка вручную не работает - проблема в bucket настройках!

### 5. Проверьте SQL политики напрямую

Откройте SQL Editor и выполните:
```sql
-- Посмотреть все политики для storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
```

**Ожидаемый результат:**
Должны быть политики с:
- `cmd = 'INSERT'` - with_check содержит `split_part`
- `cmd = 'SELECT'` - qual содержит `split_part`
- `cmd = 'DELETE'` - qual содержит `split_part`

## Возможные альтернативы

### Вариант А: Попробовать другой bucket
Создайте новый bucket `test-uploads` с настройками:
- Private: YES
- File size limit: 50 MB
- MIME types: video/*
- RLS enabled: YES

Потом создайте политики для него и попробуйте загрузить туда.

### Вариант Б: Использовать signed upload URL
Вместо прямой загрузки использовать signed URL (более надежно, но сложнее).

### Вариант В: Временно отключить RLS
**ТОЛЬКО ДЛЯ ТЕСТА!** Откройте SQL Editor:
```sql
-- ВРЕМЕННО отключить RLS (НЕ используйте в production!)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

Попробуйте загрузить видео. Если заработает - проблема точно в политиках!

**ВАЖНО:** Сразу же верните RLS обратно:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## Что делать дальше?

1. Выполните проверки 1-5
2. Пришлите скриншоты:
   - Storage Policies (список политик)
   - Bucket Configuration (настройки bucket)
   - Результат SQL запроса политик
3. Попробуйте загрузить файл вручную через Dashboard
4. Сообщите результаты - продолжим отладку!
