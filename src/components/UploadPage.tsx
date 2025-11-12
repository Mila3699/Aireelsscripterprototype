import { useState, useCallback } from 'react';
import { Upload, Film, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { LogoutButton } from './LogoutButton';
import { motion } from 'motion/react';
import { validateVideoFile } from '../lib/api';
import { toast } from 'sonner@2.0.3';
import { sanitizeFilename, isValidVideoMimeType } from '../lib/sanitizer';

interface UploadPageProps {
  onFileUpload: (file: File) => void;
  onAnalyze: () => void;
  uploadedFile: File | null;
  onLogout?: () => void;
}

export function UploadPage({ onFileUpload, onAnalyze, uploadedFile, onLogout }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndUpload = useCallback((file: File) => {
    setIsValidating(true);
    
    // Проверка MIME типа для защиты от загрузки вредоносных файлов
    if (!isValidVideoMimeType(file.type)) {
      toast.error('Недопустимый тип файла. Используйте MP4, MOV или WEBM');
      setIsValidating(false);
      return;
    }
    
    // Валидация файла
    const validation = validateVideoFile(file);
    
    if (!validation.valid) {
      toast.error(validation.error || 'Ошибка валидации файла');
      setIsValidating(false);
      return;
    }
    
    // Санитизация имени файла для безопасного отображения
    const safeName = sanitizeFilename(file.name);
    console.log('Безопасное имя файла:', safeName);
    
    // Файл валидный, загружаем
    onFileUpload(file);
    setIsValidating(false);
    toast.success('Видео готово к анализу!');
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndUpload(file);
    }
  }, [validateAndUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };



  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 pb-28 safe-area-inset-bottom">
        {/* Кнопка выхода */}
        {onLogout && <LogoutButton onLogout={onLogout} />}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 md:mb-6"
          >
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </motion.div>
          
          <h1 
            className="mb-3 md:mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            role="heading"
            aria-level={1}
          >
            AI Reels Scripter
          </h1>
          
          <p className="text-gray-600 max-w-xl mx-auto px-4">
            Проанализируй вирусный рилс и получи готовый сценарий на русском
          </p>

          {/* Уведомление о прототипе */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 max-w-2xl mx-auto px-4"
          >
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-base mt-0.5">
                  ✨
                </div>
                <div className="flex-1 text-left">
                  <p className="text-purple-900 mb-1">
                    <strong>Интерактивный прототип</strong>
                  </p>
                  <p className="text-purple-700 text-xs">
                    Загрузите любое видео и получите готовый анализ за 3 секунды! Все данные - демонстрационные, идеально для презентации возможностей.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="region"
            aria-label="Область загрузки видео"
            aria-describedby="upload-description"
            className={`
              relative border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all duration-300
              ${isDragging 
                ? 'border-purple-500 bg-purple-50' 
                : uploadedFile 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50/50'
              }
            `}
          >
            {!uploadedFile ? (
              <>
                <Upload className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 transition-colors ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
                <h3 className="mb-2 text-gray-800">
                  Перетащите видео сюда
                </h3>
                <p className="text-gray-500 mb-6 text-sm md:text-base">
                  или нажмите на кнопку ниже
                </p>
                
                <label htmlFor="file-upload">
                  <Button 
                    type="button"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    aria-label="Выбрать видео файл для анализа"
                  >
                    <Film className="w-4 h-4 mr-2" aria-hidden="true" />
                    Выбрать видео
                  </Button>
                </label>
                
                <input
                  id="file-upload"
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Загрузить видео файл"
                  style={{ fontSize: '16px' }}
                />
                
                <p id="upload-description" className="text-xs text-gray-400 mt-6">
                  Форматы: MP4, MOV, WEBM • Макс. 100 МБ • До 3 минут
                </p>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-green-500" />
                <h3 className="mb-2 text-gray-800">
                  Видео загружено!
                </h3>
                <p className="text-gray-600 mb-6 px-4 break-words">
                  {sanitizeFilename(uploadedFile.name)}
                </p>
                <Button 
                  onClick={onAnalyze}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 min-h-[48px] px-8 active:scale-95 transition-transform"
                  aria-label="Начать анализ видео с помощью Google AI"
                >
                  <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
                  Анализировать
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => onFileUpload(null as any)}
                  className="block mx-auto mt-4 min-h-[44px] hover:bg-gray-100"
                  aria-label="Выбрать другое видео"
                >
                  Выбрать другое видео
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 md:mt-12"
        >
          {[
            { icon: '🎯', iconLabel: 'Цель', text: 'Анализ хуков' },
            { icon: '📝', iconLabel: 'Документ', text: 'Готовый сценарий' },
            { icon: '🚀', iconLabel: 'Ракета', text: 'За 90 секунд' }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-2" role="img" aria-label={feature.iconLabel}>
                {feature.icon}
              </div>
              <p className="text-sm text-gray-600">{feature.text}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
