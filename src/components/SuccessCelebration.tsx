import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface SuccessCelebrationProps {
  /** Показать анимацию */
  show: boolean;
  /** Callback после завершения анимации */
  onComplete?: () => void;
}

/**
 * Дофаминовая анимация успеха с конфетти и частицами
 * Создаёт эффект celebration при получении результатов
 */
export function SuccessCelebration({ show, onComplete }: SuccessCelebrationProps) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (show) {
      // Haptic feedback на мобильных
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 100]); // Короткая ритмичная вибрация
      }

      // Задержка перед началом анимации
      const startDelay = setTimeout(() => {
        setShowParticles(true);
        
        // Первый залп конфетти (снизу вверх)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
          ticks: 200,
          gravity: 1.2,
          scalar: 1.2,
        });

        // Второй залп с задержкой (слева)
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ['#EC4899', '#8B5CF6', '#3B82F6'],
          });
        }, 200);

        // Третий залп (справа)
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ['#10B981', '#F59E0B', '#EF4444'],
          });
        }, 400);

        // Финальный залп (центр, сверху)
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.3 },
            colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'],
            shapes: ['circle', 'square'],
            ticks: 300,
          });
        }, 600);

        // Звёздный дождь
        setTimeout(() => {
          const duration = 2000;
          const animationEnd = Date.now() + duration;
          const defaults = { 
            startVelocity: 30, 
            spread: 360, 
            ticks: 60, 
            zIndex: 0,
            colors: ['#FFD700', '#FFA500', '#FF6347'],
          };

          const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              clearInterval(interval);
              if (onComplete) onComplete();
              return;
            }

            const particleCount = 3;

            confetti({
              ...defaults,
              particleCount,
              origin: { x: Math.random(), y: Math.random() * 0.5 }
            });
          }, 250);
        }, 800);
      }, 100);

      // Очистка
      return () => {
        clearTimeout(startDelay);
        setShowParticles(false);
      };
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {showParticles && (
        <>
          {/* Полноэкранный overlay с частицами */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          >
            {/* Анимированные эмодзи летят снизу вверх */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 50,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  y: -100,
                  scale: [0, 1.5, 1, 0],
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.8,
                  ease: 'easeOut',
                }}
                className="absolute text-4xl"
                style={{
                  left: Math.random() * 100 + '%',
                }}
              >
                {['🎉', '✨', '🌟', '💫', '⭐', '🎊', '🔥', '💥'][Math.floor(Math.random() * 8)]}
              </motion.div>
            ))}

            {/* Волны от центра */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`wave-${i}`}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  ease: 'easeOut',
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-purple-400"
              />
            ))}

            {/* Пульсирующие круги по углам */}
            {[
              { top: '10%', left: '10%', color: 'bg-blue-400' },
              { top: '10%', right: '10%', color: 'bg-purple-400' },
              { bottom: '30%', left: '15%', color: 'bg-pink-400' },
              { bottom: '30%', right: '15%', color: 'bg-green-400' },
            ].map((pos, i) => (
              <motion.div
                key={`circle-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: 2,
                  ease: 'easeInOut',
                }}
                className={`absolute w-24 h-24 rounded-full ${pos.color} blur-2xl`}
                style={pos}
              />
            ))}
          </motion.div>

          {/* Центральное сообщение */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.3,
            }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
              {/* Анимированная иконка */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: 3,
                  ease: 'easeInOut',
                }}
                className="text-8xl text-center mb-4"
              >
                🎉
              </motion.div>

              {/* Текст с эффектом печати */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-3xl mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                >
                  Готово!
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-gray-600 text-lg"
                >
                  Сценарий создан ✨
                </motion.p>
              </motion.div>

              {/* Анимированные звёздочки вокруг */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    x: Math.cos((i / 8) * Math.PI * 2) * 60,
                    y: Math.sin((i / 8) * Math.PI * 2) * 60,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.8 + i * 0.1,
                    ease: 'easeOut',
                  }}
                  className="absolute top-1/2 left-1/2 text-2xl"
                >
                  ✨
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Простая версия celebration (только конфетти)
 * Для использования inline без компонента
 */
export function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  });
}

/**
 * Haptic feedback helper
 */
export function triggerHaptic(pattern: 'success' | 'warning' | 'error' = 'success') {
  if (!navigator.vibrate) return;

  const patterns = {
    success: [50, 30, 50], // Короткая вибрация
    warning: [100], // Средняя
    error: [100, 50, 100, 50, 100], // Длинная тревожная
  };

  navigator.vibrate(patterns[pattern]);
}
