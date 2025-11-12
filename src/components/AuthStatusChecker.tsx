/**
 * Компонент для проверки статуса Email Confirmation в Supabase
 * Показывает предупреждение, если Email Confirmation включён
 */

import { useState, useEffect } from 'react';
import { AlertCircle, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AuthStatusChecker() {
  const [showWarning, setShowWarning] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Проверяем, был ли баннер уже закрыт
    const dismissed = localStorage.getItem('authWarningDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Показываем предупреждение через 2 секунды
    const timer = setTimeout(() => {
      setShowWarning(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowWarning(false);
    setIsDismissed(true);
    localStorage.setItem('authWarningDismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              
              <div className="flex-1">
                <p className="text-sm text-amber-900 mb-1">
                  <strong>⚠️ Важно для входа!</strong>
                </p>
                <p className="text-xs text-amber-800 mb-2">
                  Для работы регистрации отключите Email Confirmation в Supabase
                </p>
                
                <a
                  href="https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/settings/auth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-900 hover:text-amber-950 font-medium underline"
                >
                  Открыть настройки
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                onClick={handleDismiss}
                className="text-amber-600 hover:text-amber-900 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
