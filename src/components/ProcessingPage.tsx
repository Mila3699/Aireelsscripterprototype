import { motion } from 'motion/react';
import { Sparkles, Eye, Target, FileText } from 'lucide-react';
import { Progress } from './ui/progress';
import { useState, useEffect } from 'react';

const processingSteps = [
  { icon: Eye, text: 'Нейросеть смотрит ваше видео...', duration: 1000 },
  { icon: Target, text: 'Выделяем хуки и ключевые моменты...', duration: 1500 },
  { icon: FileText, text: 'Пишем сценарий на русском...', duration: 1500 },
];

export function ProcessingPage() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Прогресс: 0-100% за 4 секунды (40ms на 1%)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    // Шаги: переключаем каждые ~1.3 секунды
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1300);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <p className="text-center text-gray-600">
            {progress}%
          </p>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4">
          {processingSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isActive || isCompleted ? 1 : 0.3,
                  x: 0,
                  scale: isActive ? 1.02 : 1
                }}
                transition={{ delay: index * 0.2 }}
                className={`
                  flex items-center gap-4 p-4 rounded-2xl transition-all
                  ${isActive ? 'bg-purple-100 shadow-md' : 'bg-white'}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${isActive ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-gray-100'}
                `}>
                  <StepIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <p className={`flex-1 ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.text}
                </p>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Fun Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 mt-8 text-sm"
        >
          ✨ Наш ИИ изучает каждый кадр вашего видео
        </motion.p>
      </motion.div>
    </div>
  );
}
