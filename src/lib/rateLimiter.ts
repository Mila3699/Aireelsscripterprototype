/**
 * Rate Limiter - защита от спама и чрезмерного количества запросов
 * 
 * Использует localStorage для хранения истории запросов.
 * Ограничивает количество запросов в единицу времени.
 */

interface RateLimitConfig {
  maxRequests: number; // Максимальное количество запросов
  windowMs: number; // Временное окно в миллисекундах
  storageKey: string; // Ключ для хранения в localStorage
}

interface RequestRecord {
  timestamp: number;
}

/**
 * Класс для управления rate limiting
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Получить историю запросов из localStorage
   */
  private getRequestHistory(): RequestRecord[] {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Ошибка при чтении истории запросов:', error);
      return [];
    }
  }

  /**
   * Сохранить историю запросов в localStorage
   */
  private saveRequestHistory(history: RequestRecord[]): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Ошибка при сохранении истории запросов:', error);
    }
  }

  /**
   * Очистить устаревшие записи (старше временного окна)
   */
  private cleanOldRecords(history: RequestRecord[]): RequestRecord[] {
    const now = Date.now();
    const cutoff = now - this.config.windowMs;
    return history.filter(record => record.timestamp > cutoff);
  }

  /**
   * Проверить, можно ли выполнить запрос
   * @returns {allowed: boolean, remainingRequests: number, resetTime: number}
   */
  public checkLimit(): {
    allowed: boolean;
    remainingRequests: number;
    resetTime: number;
    message?: string;
  } {
    const history = this.getRequestHistory();
    const cleanedHistory = this.cleanOldRecords(history);
    
    const currentCount = cleanedHistory.length;
    const allowed = currentCount < this.config.maxRequests;
    const remainingRequests = Math.max(0, this.config.maxRequests - currentCount);
    
    // Время до сброса лимита
    const oldestRecord = cleanedHistory[0];
    const resetTime = oldestRecord 
      ? oldestRecord.timestamp + this.config.windowMs 
      : Date.now() + this.config.windowMs;

    let message: string | undefined;
    if (!allowed) {
      const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
      message = `Превышен лимит запросов (${this.config.maxRequests} в ${this.config.windowMs / 60000} мин). Попробуйте через ${minutesLeft} мин.`;
    }

    return {
      allowed,
      remainingRequests,
      resetTime,
      message,
    };
  }

  /**
   * Зарегистрировать новый запрос
   * @returns true если запрос разрешен, false если превышен лимит
   */
  public recordRequest(): boolean {
    const { allowed } = this.checkLimit();
    
    if (!allowed) {
      return false;
    }

    const history = this.getRequestHistory();
    const cleanedHistory = this.cleanOldRecords(history);
    
    cleanedHistory.push({
      timestamp: Date.now(),
    });
    
    this.saveRequestHistory(cleanedHistory);
    return true;
  }

  /**
   * Получить информацию о текущем статусе лимита
   */
  public getStatus(): {
    currentRequests: number;
    maxRequests: number;
    remainingRequests: number;
    windowMs: number;
    resetTime: number;
  } {
    const history = this.getRequestHistory();
    const cleanedHistory = this.cleanOldRecords(history);
    
    const currentRequests = cleanedHistory.length;
    const remainingRequests = Math.max(0, this.config.maxRequests - currentRequests);
    
    const oldestRecord = cleanedHistory[0];
    const resetTime = oldestRecord 
      ? oldestRecord.timestamp + this.config.windowMs 
      : Date.now() + this.config.windowMs;

    return {
      currentRequests,
      maxRequests: this.config.maxRequests,
      remainingRequests,
      windowMs: this.config.windowMs,
      resetTime,
    };
  }

  /**
   * Очистить всю историю запросов
   */
  public reset(): void {
    localStorage.removeItem(this.config.storageKey);
  }
}

// Предустановленные конфигурации

/**
 * Rate Limiter для анализа видео
 * Ограничение: 5 запросов в 15 минут
 */
export const videoAnalysisLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 минут
  storageKey: 'ai_reels_video_analysis_limit',
});

/**
 * Rate Limiter для сохранения сценариев
 * Ограничение: 10 сохранений в 5 минут
 */
export const saveScriptLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 5 * 60 * 1000, // 5 минут
  storageKey: 'ai_reels_save_script_limit',
});

/**
 * Утилита для форматирования времени до сброса
 */
export function formatResetTime(resetTime: number): string {
  const now = Date.now();
  const diff = resetTime - now;
  
  if (diff <= 0) return 'сейчас';
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes} мин ${seconds} сек`;
  }
  
  return `${seconds} сек`;
}

/**
 * Хук для использования rate limiter в React компонентах
 */
export function useRateLimiter(limiter: RateLimiter) {
  return {
    checkLimit: () => limiter.checkLimit(),
    recordRequest: () => limiter.recordRequest(),
    getStatus: () => limiter.getStatus(),
    reset: () => limiter.reset(),
  };
}
