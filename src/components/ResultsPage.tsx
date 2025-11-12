import { motion } from 'motion/react';
import { Copy, CheckCircle2, FileText, Lightbulb, Video, Megaphone, Bookmark, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import type { VideoAnalysisResult } from '../lib/api';
import { saveScript } from '../lib/api-supabase';
import { SuccessCelebration, triggerConfetti } from './SuccessCelebration';
import { copyToClipboard } from '../lib/clipboard';

interface ResultsPageProps {
  onReset: () => void;
  analysisResult: VideoAnalysisResult;
  skipCelebration?: boolean; // Пропустить анимацию при возврате из Сохранённых
}

export function ResultsPage({ onReset, analysisResult, skipCelebration = false }: ResultsPageProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Показать celebration анимацию при первом появлении (но не при возврате)
  useEffect(() => {
    if (skipCelebration) {
      return; // Не показываем анимацию при возврате из Сохранённых
    }

    const timer = setTimeout(() => {
      setShowCelebration(true);
    }, 300); // Небольшая задержка для плавности

    return () => clearTimeout(timer);
  }, [skipCelebration]);

  const handleCopy = async (text: string, section: string) => {
    const success = await copyToClipboard(text);
    
    if (success) {
      setCopiedSection(section);
      toast.success('Скопировано в буфер обмена!');
      setTimeout(() => setCopiedSection(null), 2000);
    } else {
      toast.error('Не удалось скопировать автоматически. Выделите текст вручную (Ctrl+C)');
    }
  };

  const handleSaveScript = async () => {
    const result = await saveScript(analysisResult);
    if (result.success) {
      setIsSaved(true);
      
      // 🎉 Мини-celebration при сохранении!
      triggerConfetti();
      
      toast.success(
        'Сценарий сохранён! Откройте вкладку "Сохранённые" внизу.'
      );
    } else {
      toast.error(result.error || 'Не удалось сохранить сценарий');
    }
  };

  const formatScript = () => {
    return analysisResult.script.map(scene => 
      `[${scene.time}] ${scene.visual}\n"${scene.text}"\n(${scene.note})\n`
    ).join('\n');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-28 safe-area-inset-bottom">
        {/* 🎉 Дофаминовая анимация успеха */}
        <SuccessCelebration 
          show={showCelebration} 
          onComplete={() => setShowCelebration(false)}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header с улучшенной анимацией */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
            className="flex items-center gap-3 mb-6 md:mb-8"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ 
                delay: 1.4,
                duration: 0.6,
                repeat: 2 
              }}
              className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <motion.h2 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-gray-800"
                >
                  Анализ готов!
                </motion.h2>
                {analysisResult.isDemoMode && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.7, type: 'spring', stiffness: 200 }}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg"
                  >
                    Демо
                  </motion.span>
                )}
              </div>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="text-sm text-gray-500"
              >
                {analysisResult.isDemoMode ? 'Примерные данные для демонстрации' : 'Результаты обработки видео'}
              </motion.p>
            </div>
          </motion.div>

          {/* Results Accordion с stagger анимацией */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <Accordion type="multiple" defaultValue={['original', 'keys', 'script', 'recommendations']} className="space-y-4">
              {/* 1. Оригинал */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.9, type: 'spring', stiffness: 100 }}
              >
                <AccordionItem value="original" className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
                  <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-800">Оригинал</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 md:px-6 pb-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-gray-700">Транскрипция (оригинал)</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(analysisResult.original.transcription, 'transcription')}
                            className="h-8"
                            aria-label="Копировать транскрипцию"
                          >
                            {copiedSection === 'transcription' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                          {analysisResult.original.transcription}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-gray-700">Перевод на русский</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(analysisResult.original.translation, 'translation')}
                            className="h-8"
                            aria-label="Копировать перевод"
                          >
                            {copiedSection === 'translation' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                          {analysisResult.original.translation}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 2. Ключи к успеху */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 2.0, type: 'spring', stiffness: 100 }}
              >
                <AccordionItem value="keys" className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
                  <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span className="text-gray-800">Ключи к успеху</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 md:px-6 pb-6">
                    <div className="space-y-3">
                      {analysisResult.keys.map((key, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2.2 + index * 0.05 }}
                          className="flex gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl"
                        >
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">{index + 1}</span>
                          </div>
                          <div>
                            <h5 className="text-gray-800 mb-1">{key.title}</h5>
                            <p className="text-sm text-gray-600">{key.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 3. Готовый сценарий */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 2.1, type: 'spring', stiffness: 100 }}
              >
                <AccordionItem value="script" className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
                  <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-gray-800">Готовый сценарий на русском</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 md:px-6 pb-6">
                    {/* Название сценария */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-5 h-5 text-purple-600" />
                        <h4 className="text-gray-700">Название сценария</h4>
                      </div>
                      <h3 className="text-2xl text-gray-900">{analysisResult.title}</h3>
                    </div>

                    <div className="mb-4 flex gap-2">
                      <Button
                        onClick={() => handleCopy(formatScript(), 'script')}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 min-h-[48px] active:scale-95 transition-transform"
                        aria-label="Копировать весь сценарий"
                      >
                        {copiedSection === 'script' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Скопировано!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Копировать
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={handleSaveScript}
                        disabled={isSaved}
                        variant={isSaved ? "default" : "outline"}
                        className={`
                          min-w-[48px] min-h-[48px] w-14 h-14 p-0 rounded-xl transition-all active:scale-95
                          ${isSaved 
                            ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white' 
                            : 'hover:bg-pink-50 hover:border-pink-300'
                          }
                        `}
                        aria-label={isSaved ? "Сценарий сохранён" : "Сохранить сценарий"}
                      >
                        {isSaved ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            ❤️
                          </motion.div>
                        ) : (
                          <span className="text-2xl">🤍</span>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {analysisResult.script.map((scene, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.4 + index * 0.05 }}
                          className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-blue-50"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-lg">
                              {scene.time}
                            </span>
                            <span className="text-sm text-gray-600 italic">{scene.visual}</span>
                          </div>
                          <p className="text-gray-800 mb-2 pl-3 border-l-2 border-purple-400">
                            "{scene.text}"
                          </p>
                          <p className="text-xs text-gray-500 italic">💡 {scene.note}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Кнопка "Сохранить сценарий" внизу */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.6 }}
                      className={`
                        mt-6 p-4 md:p-6 rounded-xl border transition-all duration-300
                        ${isSaved 
                          ? 'bg-gradient-to-r from-pink-50 to-red-50 border-pink-200' 
                          : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                        }
                      `}
                    >
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 text-center md:text-left">
                          <h4 className="text-gray-800 mb-1">
                            Понравился сценарий?
                          </h4>
                          <p className="text-sm text-gray-600">
                            Сохраните его и используйте в своих проектах
                          </p>
                        </div>
                        <motion.div
                          animate={!isSaved ? {
                            scale: [1, 1.02, 1],
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Button
                            onClick={handleSaveScript}
                            disabled={isSaved}
                            size="lg"
                            className={`
                              min-w-[200px] min-h-[48px] transition-all duration-300 active:scale-95
                              ${isSaved 
                                ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600' 
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                              }
                            `}
                            aria-label={isSaved ? "Сценарий уже сохранён" : "Сохранить сценарий"}
                          >
                            {isSaved ? (
                              <>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 200 }}
                                  className="mr-2"
                                >
                                  <Heart className="w-5 h-5 fill-white" />
                                </motion.div>
                                Сохранено
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-5 h-5 mr-2" />
                                Сохранить сценарий
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                      {isSaved && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 text-sm text-center text-gray-600"
                        >
                          ✨ Сценарий сохранён! Найдёте его во вкладке "Сохранённые" внизу экрана
                        </motion.p>
                      )}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 4. Рекомендации */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 2.2, type: 'spring', stiffness: 100 }}
              >
                <AccordionItem value="recommendations" className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
                  <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-gray-800">Рекомендации по созданию</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 md:px-6 pb-6">
                    <div className="space-y-3">
                      {analysisResult.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2.4 + index * 0.05 }}
                          className="bg-green-50 p-4 rounded-xl"
                        >
                          <h5 className="text-gray-800 mb-1 flex items-center gap-2">
                            <span className="text-green-600">●</span>
                            {rec.category}
                          </h5>
                          <p className="text-sm text-gray-600 pl-4">{rec.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            </Accordion>
          </motion.div>

          {/* Bottom Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6 }}
            className="mt-8 p-4 md:p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl text-center"
          >
            <p className="text-gray-700 mb-4">
              Готовы создать свой вирусный контент? 🚀
            </p>
            <Button
              onClick={onReset}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 min-h-[48px] active:scale-95 transition-transform"
              aria-label="Проанализировать новое видео"
            >
              Проанализировать ещё одно видео
            </Button>
          </motion.div>
        </motion.div>
      </div>
  );
}
