# ✅ Исправление ошибки: process is not defined

## Проблема

```
ReferenceError: process is not defined
    at lib/api.ts:309:15
```

## Причина

В файле `/lib/api.ts` использовалась конструкция `process.env.NEXT_PUBLIC_BACKEND_URL`, которая не работает в браузерной среде Figma Make.

Объект `process` доступен только в Node.js окружении, но не в браузере.

## Решение

### Что было изменено

**Было (строка 309):**
```typescript
export const API_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  MAX_VIDEO_DURATION: 180,
  ACCEPTED_FORMATS: ['video/mp4', 'video/quicktime', 'video/webm'],
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api',
};
```

**Стало:**
```typescript
export const API_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB
  MAX_VIDEO_DURATION: 180, // 3 минуты
  ACCEPTED_FORMATS: ['video/mp4', 'video/quicktime', 'video/webm'],
  // Для продакшена замените на URL вашего backend
  BACKEND_URL: 'http://localhost:3001/api',
};
```

### Дополнительные изменения

1. **Добавлен комментарий** в начале `/lib/api.ts` о том, как настроить BACKEND_URL

2. **Создан новый файл документации** `/docs/CONFIGURATION.md` с подробными инструкциями по конфигурации

3. **Обновлены файлы:**
   - `README.md` - добавлена ссылка на Configuration Guide
   - `INTEGRATION_SUMMARY.md` - обновлены инструкции
   - `CHECKLIST.md` - исправлены шаги настройки

## Как настроить URL backend

### Локальная разработка

Оставьте как есть:
```typescript
BACKEND_URL: 'http://localhost:3001/api',
```

### Продакшен

Измените на адрес вашего backend:
```typescript
BACKEND_URL: 'https://your-backend-domain.com/api',
```

**Примеры:**
- Google Cloud Run: `'https://ai-reels-backend-xxxx.run.app/api'`
- Railway: `'https://ai-reels-backend.up.railway.app/api'`
- Render: `'https://ai-reels-backend.onrender.com/api'`

## Проверка исправления

Приложение теперь должно работать без ошибок:

1. ✅ Нет ошибки `process is not defined`
2. ✅ Приложение загружается
3. ✅ Можно загружать видео
4. ✅ Mock данные показываются

## Следующие шаги

Для работы с реальным Google AI API:

1. Настройте backend сервер (см. `/docs/BACKEND_SETUP.md`)
2. Измените `BACKEND_URL` в `/lib/api.ts`
3. Раскомментируйте реальную реализацию `processVideo()`

**Подробная инструкция:** `/docs/CONFIGURATION.md`

---

**Статус:** ✅ Исправлено  
**Дата:** 9 ноября 2024  
**Версия:** 1.0.1
