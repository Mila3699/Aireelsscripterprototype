import { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { signIn } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { AuthLayout } from './auth/AuthLayout';
import { FormInput } from './auth/FormInput';
import { validateEmail, validatePassword } from '../lib/validation';
import { motion } from 'motion/react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginPage({ onLoginSuccess, onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Заполните все поля');
      return;
    }

    // Валидация email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      toast.error(emailValidation.error);
      return;
    }

    setIsLoading(true);
    setLoginAttempted(true);

    try {
      const result = await signIn(email, password);

      if (result.success) {
        toast.success('Вход выполнен успешно! 💾 Сессия сохранена', {
          duration: 3000,
        });
        setLastError(null);
        onLoginSuccess();
      } else {
        // Сохраняем ошибку для отображения подсказок
        setLastError(result.error || 'Ошибка входа');
        
        // Более понятное сообщение об ошибке
        if (result.error?.includes('Неверный email или пароль')) {
          toast.error('Неверный email или пароль. Проверьте данные или зарегистрируйтесь.', {
            duration: 5000
          });
        } else {
          toast.error(result.error || 'Ошибка входа');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLastError('Произошла ошибка при входе');
      toast.error('Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="AI Reels Scripter"
      subtitle="Войдите, чтобы продолжить работу"
      variant="login"
      footer={
        <>
          <p className="text-xs text-gray-500 mb-2">
            Анализ видео с помощью Google Gemini AI
          </p>
          <p className="text-xs text-gray-400 mb-4">
            💾 Ваша сессия будет автоматически сохранена
          </p>
          
          {/* Подсказка для новых пользователей */}
          {!loginAttempted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg text-left"
            >
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-purple-800 mb-1">
                    <strong>Первый раз здесь?</strong>
                  </p>
                  <p className="text-xs text-purple-700">
                    Нажмите «Зарегистрироваться» ниже, чтобы создать аккаунт.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Показываем детальную помощь только после неудачной попытки */}
          {loginAttempted && lastError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg text-left"
            >
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 mb-1">
                    <strong>Не можете войти?</strong>
                  </p>
                  <p className="text-xs text-red-700">
                    {lastError}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-xs text-red-700">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">1</span>
                  <span>Убедитесь, что вы <strong>зарегистрированы</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">2</span>
                  <span>Проверьте <strong>правильность email и пароля</strong></span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">3</span>
                  <span>
                    Отключите Email Confirmation в{' '}
                    <a
                      href="https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/settings/auth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-red-900 font-medium"
                    >
                      Supabase → Auth Settings
                    </a>
                  </span>
                </p>
              </div>
              
              <div className="mt-3 pt-3 border-t border-red-200">
                <button
                  onClick={onSwitchToRegister}
                  className="text-xs text-red-800 hover:text-red-900 font-medium underline"
                >
                  → Или создайте новый аккаунт прямо сейчас
                </button>
              </div>
            </motion.div>
          )}
        </>
      }
    >
      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <FormInput
            id="email"
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            disabled={isLoading}
            autoComplete="email"
          />

          {/* Password */}
          <FormInput
            id="password"
            label="Пароль"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            disabled={isLoading}
            autoComplete="current-password"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Вход...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Войти
              </>
            )}
          </Button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Нет аккаунта?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-purple-600 hover:text-purple-700 font-medium"
              disabled={isLoading}
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
