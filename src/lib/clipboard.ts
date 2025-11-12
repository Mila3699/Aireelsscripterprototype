/**
 * Универсальная утилита для копирования текста в буфер обмена
 * с трёхуровневой системой fallback
 */

/**
 * Копирует текст в буфер обмена с тремя уровнями поддержки:
 * 1. Modern Clipboard API (если доступен)
 * 2. Legacy execCommand (для старых браузеров)
 * 3. Возвращает false если оба метода не работают
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Уровень 1: Пробуем современный Clipboard API
  // Проверяем разрешение ТОЛЬКО если API доступен
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ Скопировано через Clipboard API');
      return true;
    } catch (error) {
      // Тихо переходим к fallback
      console.log('⚠️ Clipboard API не доступен, используем execCommand');
    }
  }

  // Уровень 2: Fallback на execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Делаем элемент невидимым, но не вне экрана (для совместимости)
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    // Для iOS Safari
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      textarea.setSelectionRange(0, 999999);
    } else {
      textarea.select();
    }
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      console.log('✅ Скопировано через execCommand');
      return true;
    }
  } catch (error) {
    console.log('⚠️ execCommand не сработал');
  }

  // Уровень 3: Оба метода не сработали
  console.error('❌ Не удалось скопировать автоматически');
  return false;
}

/**
 * Копирует текст и возвращает результат для обработки в UI
 */
export async function copyWithFeedback(
  text: string
): Promise<{ success: boolean; method?: 'clipboard' | 'execCommand' }> {
  // Пробуем Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    } catch (error) {
      // Тихо переходим к fallback
    }
  }

  // Пробуем execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    // Для iOS Safari
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      textarea.setSelectionRange(0, 999999);
    } else {
      textarea.select();
    }
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      return { success: true, method: 'execCommand' };
    }
  } catch (error) {
    // Игнорируем ошибку
  }

  return { success: false };
}

/**
 * Автоматически выделяет весь текст внутри элемента
 * Полезно для ручного копирования когда API не работает
 */
export function selectText(element: HTMLElement) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);
}
