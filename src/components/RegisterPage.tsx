import { useState } from 'react';
import { UserPlus, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { signUp } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { AuthLayout } from './auth/AuthLayout';
import { FormInput } from './auth/FormInput';
import { validateEmail, validatePassword, validatePasswordMatch } from '../lib/validation';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onRegisterSuccess, onSwitchToLogin }: RegisterPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация всех полей
    if (!email || !password || !confirmPassword) {
      toast.error('Заполните все поля');
      return;
    }

    // Валидация email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      toast.error(emailValidation.error);
      return;
    }

    // Валидация пароля
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.error);
      return;
    }

    // Валидация совпадения паролей
    const matchValidation = validatePasswordMatch(password, confirmPassword);
    if (!matchValidation.valid) {
      toast.error(matchValidation.error);
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Начинаем регистрацию для:', email);
      const result = await signUp(email, password);

      if (result.success) {
        toast.success('🎉 Регистрация успешна! 💾 Сессия сохранена', { duration: 4000 });
        // После успешной регистрации Supabase автоматически создаёт сессию
        // Сразу вызываем onRegisterSuccess
        setTimeout(() => {
          onRegisterSuccess();
        }, 500);
      } else {
        // Более понятные сообщения об ошибках
        if (result.error?.includes('already registered')) {
          toast.error('Этот email уже зарегистрирован. Попробуйте войти.');
        } else {
          toast.error(result.error || 'Ошибка регистрации');
        }
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Начните анализировать видео с AI"
      variant="register"
      footer={
        <>
          <p className="text-xs text-gray-500 mb-2">
            Безопасное хранение данных на Supabase
          </p>
          <p className="text-xs text-gray-400 mb-4">
            💾 После регистрации вход выполняется автоматически
          </p>
          
          {/* Важное уведомление */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
            <p className="text-xs text-amber-800 mb-1">
              ⚠️ <strong>Для работы регистрации:</strong>
            </p>
            <p className="text-xs text-amber-700">
              Отключите Email Confirmation в{' '}
              <a
                href="https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/settings/auth"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-900"
              >
                Supabase Dashboard
              </a>
            </p>
          </div>
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
            placeholder="Минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            disabled={isLoading}
            autoComplete="new-password"
          />

          {/* Confirm Password */}
          <FormInput
            id="confirmPassword"
            label="Подтвердите пароль"
            type="password"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={Lock}
            disabled={isLoading}
            autoComplete="new-password"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Регистрация...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Зарегистрироваться
              </>
            )}
          </Button>
        </form>

        {/* Features */}
        <div className="mt-6 space-y-2">
          <p className="text-xs text-gray-500 mb-3">После регистрации вы получите:</p>
          <div className="space-y-2">
            {[
              'Неограниченное хранение сценариев',
              'Анализ видео с Google Gemini AI',
              'Доступ с любого устройства',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Switch to Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              Войти
            </button>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
