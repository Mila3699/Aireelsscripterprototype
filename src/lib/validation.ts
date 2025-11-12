/**
 * Утилиты для валидации данных
 */

/**
 * Валидация email адреса
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email обязателен' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Введите корректный email адрес' };
  }

  return { valid: true };
}

/**
 * Валидация пароля
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Пароль обязателен' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Пароль должен быть не менее 6 символов' };
  }

  return { valid: true };
}

/**
 * Валидация совпадения паролей
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Пароли не совпадают' };
  }

  return { valid: true };
}
