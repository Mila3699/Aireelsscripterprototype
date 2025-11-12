import { motion } from 'motion/react';
import { Sparkles, Upload, Heart, Copy, Trash2, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { LogoutButton } from './LogoutButton';

interface HelpPageProps {
  onLogout?: () => void;
}

export function HelpPage({ onLogout }: HelpPageProps = {}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-6 pb-28 safe-area-inset-bottom">
      {/* Кнопка выхода */}
      {onLogout && <LogoutButton onLogout={onLogout} />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="mb-2">Помощь</h1>
          <p className="text-gray-600">
            Всё, что нужно знать о работе с приложением
          </p>
        </div>

        {/* Демо-режим уведомление */}
        <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="text-blue-900 mb-1">
                <strong>Демо-режим:</strong> Сейчас приложение работает с примерными данными
              </p>
              <p className="text-blue-700 text-xs">
                Для реального анализа видео с помощью Google AI нужно запустить backend
              </p>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Accordion type="single" collapsible className="space-y-3">
          {/* Как работает */}
          <AccordionItem value="how-it-works" className="bg-white rounded-xl border-0 shadow-sm overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-left">Как работает AI Reels Scripter?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3 text-gray-600">
                <p>
                  AI Reels Scripter анализирует короткие видео и генерирует готовый сценарий на русском языке.
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Загрузите видео (MP4, MOV или WEBM до 100 МБ)</li>
                  <li>Нейросеть проанализирует визуальный ряд и аудио</li>
                  <li>Получите транскрибацию, ключи успеха и готовый сценарий</li>
                  <li>Сохраните понравившиеся сценарии в избранное</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Загрузка видео */}
          <AccordionItem value="upload" className="bg-white rounded-xl border-0 shadow-sm overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-left">Как загрузить видео?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3 text-gray-600">
                <p><strong>Способ 1: Перетаскивание</strong></p>
                <p className="ml-4">Перетащите видеофайл на область загрузки</p>
                
                <p className="mt-3"><strong>Способ 2: Выбор файла</strong></p>
                <p className="ml-4">Нажмите кнопку "Выбрать файл" и выберите видео</p>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm"><strong>Требования:</strong></p>
                  <ul className="text-sm list-disc list-inside ml-2 mt-1">
                    <li>Форматы: MP4, MOV, WEBM</li>
                    <li>Максимальный размер: 100 МБ</li>
                    <li>Рекомендуемая длина: до 3 минут</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Сохранение */}
          <AccordionItem value="save" className="bg-white rounded-xl border-0 shadow-sm overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-left">Как сохранить сценарий?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3 text-gray-600">
                <p>
                  После анализа видео вы увидите кнопку с иконкой сердечка (♥) рядом с кнопкой "Копировать".
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Нажмите на иконку сердечка</li>
                  <li>Сценарий будет сохранён в избранное</li>
                  <li>Сердечко станет заполненным (розовым)</li>
                  <li>Посмотреть все сохранённые можно в разделе "Сохранённые"</li>
                </ol>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-900">
                    <strong>Лимит:</strong> Можно сохранить до 30 сценариев. При достижении лимита удалите ненужные.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Копирование */}
          <AccordionItem value="copy" className="bg-white rounded-xl border-0 shadow-sm overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Copy className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-left">Как скопировать сценарий?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3 text-gray-600">
                <p>
                  Вы можете скопировать весь сценарий в буфер обмена:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Откройте раздел "Готовый сценарий"</li>
                  <li>Нажмите кнопку "Копировать"</li>
                  <li>Сценарий скопируется со всеми деталями</li>
                  <li>Вставьте его в любой текстовый редактор (Ctrl+V / Cmd+V)</li>
                </ol>
                
                <p className="mt-3">
                  Скопированный текст включает: временные метки, визуальный ряд, текст для озвучки и заметки.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Управление сохранёнными */}
          <AccordionItem value="manage" className="bg-white rounded-xl border-0 shadow-sm overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-left">Как удалить сохранённые сценарии?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3 text-gray-600">
                <p><strong>Удаление отдельного сценария:</strong></p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Откройте "Сохранённые"</li>
                  <li>Найдите нужный сценарий</li>
                  <li>Нажмите иконку корзины</li>
                  <li>Подтвердите удаление</li>
                </ol>
                
                <p className="mt-3"><strong>Удаление всех сценариев:</strong></p>
                <p className="ml-4">Нажмите кнопку "Удалить все" в правом верхнем углу страницы "Сохранённые"</p>
                
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-900">
                    <strong>Внимание:</strong> Удалённые сценарии нельзя восстановить!
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ошибки */}
          <AccordionItem value="errors" className="bg-white rounded-xl border-0 shadow-sm overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-left">Что делать если что-то не работает?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 text-gray-600">
                <div>
                  <p className="mb-2"><strong>Видео не загружается:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                    <li>Проверьте формат (MP4, MOV, WEBM)</li>
                    <li>Убедитесь что размер до 100 МБ</li>
                    <li>Попробуйте другой файл</li>
                  </ul>
                </div>
                
                <div>
                  <p className="mb-2"><strong>Долго обрабатывается:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                    <li>В демо-режиме: ~4 секунды</li>
                    <li>С реальным AI: 30-90 секунд</li>
                    <li>Не закрывайте страницу</li>
                  </ul>
                </div>
                
                <div>
                  <p className="mb-2"><strong>Не сохраняется сценарий:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                    <li>Проверьте лимит (30 сценариев)</li>
                    <li>Удалите старые сценарии</li>
                    <li>Проверьте настройки браузера (cookies)</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Контакты/поддержка */}
        <Card className="mt-6 p-6 text-center bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
          <h3 className="mb-2">Нужна помощь?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Если вы не нашли ответ на свой вопрос, обратитесь к документ��ции
          </p>
          <div className="text-xs text-gray-500">
            Версия приложения: 1.1 (Демо-режим)
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
