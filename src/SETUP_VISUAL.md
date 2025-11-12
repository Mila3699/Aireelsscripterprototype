# 🎯 Визуальная инструкция по настройке

## 🔴 Проблема: Ошибка при загрузке видео

```
StorageApiError: new row violates row-level security policy
```

---

## ✅ Решение: 4 простых шага

---

### Шаг 1: Откройте SQL Editor

#### Вариант А: Прямая ссылка
```
https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new
```

#### Вариант Б: Через меню
```
Supabase Dashboard
  → Ваш проект (ssqcxrimivxqdydgmfcn)
    → SQL Editor (слева в меню)
      → New query (синяя кнопка)
```

**Вы увидите:**
```
┌─────────────────────────────────────────┐
│ SQL Editor                         Run  │
├─────────────────────────────────────────┤
│                                         │
│  [Пустой редактор]                      │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

### Шаг 2: Скопируйте SQL

#### В приложении (самый простой способ):
```
1. Посмотрите на красное уведомление на главном экране
2. Нажмите кнопку "Скопировать SQL код"
3. Готово! SQL в буфере обмена
```

#### Или вручную из `/COPY_PASTE_SQL.md`:
```sql
CREATE POLICY "Users can upload their own videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own videos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

### Шаг 3: Вставьте и выполните

**В SQL Editor:**
```
1. Кликните в поле редактора
2. Вставьте: Ctrl+V (Windows) или Cmd+V (Mac)
3. Нажмите синюю кнопку "Run" (справа вверху)
```

**Вы увидите:**
```
┌─────────────────────────────────────────┐
│ SQL Editor                         Run  │
├─────────────────────────────────────────┤
│ CREATE POLICY "Users can upload...     │
│ CREATE POLICY "Users can view...       │
│ CREATE POLICY "Users can delete...     │
│ CREATE POLICY "Users can update...     │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│ ✅ Success. No rows returned            │
└─────────────────────────────────────────┘
```

---

### Шаг 4: Обновите приложение

**Вернитесь в приложение и:**
```
1. Нажмите F5
   или
2. Ctrl+R (Windows) / Cmd+R (Mac)
   или
3. Кнопка обновить в браузере
```

---

## ✅ Готово!

Теперь попробуйте загрузить видео снова:
```
1. Drag & drop видео
2. Кнопка "Проанализировать"
3. Получите результат! 🎉
```

---

## 🎨 Что вы увидите в приложении

### До настройки:
```
┌──────────────────────────────────────┐
│ 🔴 Требуется настройка Storage       │
│                                      │
│ Для загрузки видео нужно создать    │
│ Storage Policies (1 минута)         │
│                                      │
│ [Показать инструкцию ▼]              │
│ [Скопировать SQL] [SQL Editor]       │
└──────────────────────────────────────┘
```

### После настройки:
```
┌──────────────────────────────────────┐
│ ℹ️ Демо-режим: Приложение использует │
│ примерные данные для демонстрации    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│          Перетащите видео сюда       │
│       или нажмите на кнопку ниже     │
│                                      │
│           [Выбрать видео]            │
└──────────────────────────────────────┘
```

---

## 🆘 Проблемы?

### Ошибка: "policy already exists"
```
✅ Это хорошо! Политики уже созданы.
→ Просто обновите страницу (F5)
```

### Не могу войти в Supabase
```
1. Откройте: supabase.com
2. Нажмите "Sign In"
3. Войдите через GitHub или Email
4. Выберите проект: ssqcxrimivxqdydgmfcn
```

### SQL Editor пустой
```
✅ Это нормально!
→ Просто вставьте SQL код
→ Нажмите Run
```

### Всё равно ошибка
```
Быстрая альтернатива (только для теста):

ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

⚠️ Менее безопасно, используйте только для прототипа!
```

---

## 💡 Подсказки

### 🎯 Самый быстрый способ:
```
1. Откройте приложение
2. Кликните "Скопировать SQL код" (в красном блоке)
3. Кликните "SQL Editor"
4. Вставьте → Run → F5
```

### 📱 На мобильном:
```
Используйте компьютер для настройки.
После настройки приложение работает на всех устройствах.
```

### 🔄 Сколько раз настраивать?
```
Только 1 раз!
После создания политик больше ничего не нужно.
```

---

## ✨ Что дальше?

После настройки всё работает:
- ✅ Загрузка видео
- ✅ Анализ с AI (демо)
- ✅ Сохранение сценариев
- ✅ Поиск по ключевым словам

**Наслаждайтесь приложением! 🎬**

---

## 📚 Другие инстр��кции

- **Супер-быстро:** `/ПРОСТО_СДЕЛАЙТЕ_ЭТО.md`
- **Только SQL:** `/COPY_PASTE_SQL.md`
- **Подробно:** `/ПОЛНАЯ_НАСТРОЙКА_ФИНАЛ.md`
- **Все ошибки:** `/QUICK_FIX.md`
