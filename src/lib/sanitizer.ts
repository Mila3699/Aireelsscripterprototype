/**
 * Утилиты для санитизации данных и защиты от XSS
 * 
 * Обеспечивает безопасность при работе с пользовательским контентом
 * и данными от внешних API.
 */

/**
 * Экранирование HTML-специальных символов
 * Преобразует потенциально опасные символы в HTML entities
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Удаление потенциально опасных HTML-тегов
 */
export function stripHtmlTags(text: string): string {
  // Удаляем все HTML теги
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Санитизация текста для безопасного отображения
 * Удаляет HTML теги и экранирует специальные символы
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Сначала удаляем теги, затем экранируем оставшиеся символы
  return escapeHtml(stripHtmlTags(text));
}

/**
 * Санитизация URL для защиты от javascript: и data: URI
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const trimmedUrl = url.trim().toLowerCase();
  
  // Запрещаем опасные протоколы
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
  ];
  
  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      console.warn('Заблокирован потенциально опасный URL:', url);
      return '';
    }
  }
  
  return url;
}

/**
 * Валидация и санитизация объекта результата анализа
 * Проверяет структуру и очищает все текстовые поля
 */
export function sanitizeAnalysisResult(result: any): any {
  if (!result || typeof result !== 'object') {
    throw new Error('Некорректный формат данных');
  }

  return {
    title: sanitizeText(result.title || ''),
    original: {
      transcription: sanitizeText(result.original?.transcription || ''),
      translation: sanitizeText(result.original?.translation || ''),
    },
    keys: Array.isArray(result.keys)
      ? result.keys.map((key: any) => ({
          title: sanitizeText(key.title || ''),
          description: sanitizeText(key.description || ''),
        }))
      : [],
    script: Array.isArray(result.script)
      ? result.script.map((item: any) => ({
          time: sanitizeText(item.time || ''),
          visual: sanitizeText(item.visual || ''),
          text: sanitizeText(item.text || ''),
          note: sanitizeText(item.note || ''),
        }))
      : [],
    recommendations: Array.isArray(result.recommendations)
      ? result.recommendations.map((rec: any) => ({
          category: sanitizeText(rec.category || ''),
          text: sanitizeText(rec.text || ''),
        }))
      : [],
    isDemoMode: Boolean(result.isDemoMode),
  };
}

/**
 * Валидация имени файла
 * Проверяет, что имя файла не содержит опасных символов
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  
  // Удаляем потенциально опасные символы
  return filename
    .replace(/[^a-zA-Zа-яА-ЯёЁ0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.') // Запрещаем ".."
    .substring(0, 255); // Ограничиваем длину
}

/**
 * Проверка типа MIME для загружаемых файлов
 */
export function isValidVideoMimeType(mimeType: string): boolean {
  const allowedTypes = [
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ];
  
  return allowedTypes.includes(mimeType);
}

/**
 * Санитизация всех текстовых полей в объекте рекурсивно
 */
export function deepSanitize(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = deepSanitize(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Безопасное парсирование JSON
 * Парсит JSON и санитизирует результат
 */
export function safeJsonParse(jsonString: string): any {
  try {
    const parsed = JSON.parse(jsonString);
    return deepSanitize(parsed);
  } catch (error) {
    console.error('Ошибка при парсинге JSON:', error);
    throw new Error('Некорректный формат данных');
  }
}

/**
 * Создание безопасного текстового узла для вставки в DOM
 */
export function createSafeTextNode(text: string): string {
  return sanitizeText(text);
}

/**
 * Проверка на SQL-инъекции в строковых параметрах
 * (для будущего использования с базой данных)
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\*\/|\/\*)/gi,
    /(\bOR\b.*=.*|1=1|'=')/gi,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Утилита для безопасного логирования
 * Удаляет чувствительные данные перед логированием
 */
export function safeLog(data: any): void {
  // Список ключей с чувствительными данными
  const sensitiveKeys = [
    'apiKey',
    'api_key',
    'password',
    'token',
    'secret',
    'authorization',
  ];
  
  const cleanData = JSON.parse(JSON.stringify(data));
  
  function removeSensitiveData(obj: any): void {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key in obj) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        removeSensitiveData(obj[key]);
      }
    }
  }
  
  removeSensitiveData(cleanData);
  console.log(cleanData);
}

/**
 * Content Security Policy (CSP) директивы
 * Эти директивы должны быть добавлены в HTTP headers или meta тег
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  mediaSrc: ["'self'", "blob:"],
  connectSrc: ["'self'", "http://localhost:*", "https:"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
};

/**
 * Генерация строки CSP для meta тега
 */
export function generateCspString(): string {
  const directives = Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      const directiveName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${directiveName} ${values.join(' ')}`;
    })
    .join('; ');
  
  return directives + ';';
}
