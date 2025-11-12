import { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логирование ошибки в сервис (Sentry, LogRocket, etc.)
    console.error('❌ Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // В продакшене отправить на сервер
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Если передан кастомный fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Стандартный экран ошибки (Apple style)
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              {/* Иконка */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>

              {/* Заголовок */}
              <h1 className="text-2xl mb-3 text-gray-900">
                Что-то пошло не так
              </h1>

              {/* Описание */}
              <p className="text-gray-600 mb-6">
                Приложение столкнулось с непредвиденной ошибкой. 
                Попробуйте перезагрузить страницу или вернуться на главную.
              </p>

              {/* Детали ошибки (только в dev режиме) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 mb-2">
                    Технические детали
                  </summary>
                  <div className="bg-gray-50 rounded-lg p-4 text-xs font-mono text-gray-700 overflow-auto max-h-40">
                    <p className="text-red-600 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Кнопки действий */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  aria-label="Перезагрузить приложение"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Перезагрузить
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1"
                  aria-label="Вернуться на главную страницу"
                >
                  <Home className="w-4 h-4 mr-2" />
                  На главную
                </Button>
              </div>

              {/* Помощь */}
              <p className="text-xs text-gray-500 mt-6">
                Если проблема повторяется, свяжитесь с поддержкой
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
