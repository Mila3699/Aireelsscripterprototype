import { useState } from 'react';
import { Copy, Check, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { checkStorageAccess } from '../lib/supabase';
import { copyToClipboard, selectText } from '../lib/clipboard';

const SQL_CODE = `-- Storage RLS Policies для AI Reels Scripter
-- Скопируйте и выполните в SQL Editor

-- 1. Загрузка
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'make-f3dc28c4-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Просмотр
CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Удаление
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Обновление
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'make-f3dc28c4-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);`;

export function SetupInstructions() {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);
  const [showSQLInCompact, setShowSQLInCompact] = useState(false);

  const handleCopySQL = async () => {
    const success = await copyToClipboard(SQL_CODE);
    
    if (success) {
      setCopied(true);
      toast.success('SQL скопирован в буфер обмена!');
      setTimeout(() => setCopied(false), 3000);
    } else {
      // Если всё не работает - показываем SQL код и просим скопировать вручную
      toast.error('Автокопирование не работает', {
        description: 'Откройте SQL код ниже и скопируйте вручную (Ctrl+C)',
        duration: 5000,
      });
      // Автоматически открываем секцию с кодом
      setIsExpanded(true);
    }
  };

  const handleRecheck = async () => {
    setIsRechecking(true);
    
    try {
      const result = await checkStorageAccess();
      
      if (result.needsSetup) {
        toast.error('Storage всё ещё требует настройки', {
          description: 'Убедитесь, что вы выполнили SQL код в редакторе',
        });
      } else {
        toast.success('Storage настроен правильно!', {
          description: 'Обновите страницу, чтобы скрыть это уведомление',
        });
        
        // Автоматически обновляем страницу через 1 секунду
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.error('Не удалось проверить статус Storage');
    } finally {
      setIsRechecking(false);
    }
  };

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-red-900">
              🔒 Требуется настройка Storage
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-red-700 hover:text-red-900"
            >
              {isExpanded ? 'Свернуть' : 'Показать инструкцию'}
            </Button>
          </div>

          <p className="text-red-800 mb-3">
            Для загрузки видео нужно создать Storage Policies (1 минута)
          </p>

          {isExpanded && (
            <div className="space-y-4">
              {/* Шаги */}
              <div className="bg-white rounded-lg p-4 space-y-3">
                <h4 className="text-red-900">Шаг 1: Откройте SQL Editor</h4>
                <a
                  href="https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Открыть SQL Editor в новой вкладке
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-white rounded-lg p-4 space-y-3">
                <h4 className="text-red-900">Шаг 2: Скопируйте SQL</h4>
                <Button
                  onClick={handleCopySQL}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Скопировать SQL код
                    </>
                  )}
                </Button>
                
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">
                    SQL код (выделите и скопируйте Ctrl+C / Cmd+C):
                  </p>
                  <pre 
                    className="p-3 bg-gray-100 rounded text-xs overflow-x-auto border border-gray-200 cursor-text select-all"
                    onClick={(e) => selectText(e.currentTarget)}
                  >
                    {SQL_CODE}
                  </pre>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Совет: нажмите на код, чтобы выделить весь текст
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 space-y-3">
                <h4 className="text-red-900">Шаг 3: Выполните SQL</h4>
                <ol className="list-decimal ml-4 space-y-1 text-gray-700 text-sm">
                  <li>Вставьте скопированный SQL в редактор</li>
                  <li>Нажмите кнопку <strong>"Run"</strong></li>
                  <li>Дождитесь сообщения: <code className="bg-gray-100 px-1 rounded">Success. No rows returned</code></li>
                </ol>
              </div>

              <div className="bg-white rounded-lg p-4 space-y-3">
                <h4 className="text-red-900">Шаг 4: Проверьте настройку</h4>
                <p className="text-gray-700 text-sm">
                  После выполнения SQL нажмите кнопку ниже для проверки.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRecheck}
                    disabled={isRechecking}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isRechecking ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Проверяем...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Проверить настройку
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Альтернатива */}
              <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
                <p className="text-amber-900 text-xs">
                  <strong>Быстрая альтернатива (менее безопасно):</strong><br />
                  Вместо создания политик можете отключить RLS:
                </p>
                <pre className="mt-2 p-2 bg-amber-50 rounded text-xs overflow-x-auto">
                  ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
                </pre>
                <p className="text-amber-800 text-xs mt-2">
                  ⚠️ Используйте только для прототипа!
                </p>
              </div>
            </div>
          )}

          {!isExpanded && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleCopySQL}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Скопировать SQL
                    </>
                  )}
                </Button>
                <a
                  href="https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="border-red-300">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    SQL Editor
                  </Button>
                </a>
                <Button
                  onClick={() => setShowSQLInCompact(!showSQLInCompact)}
                  size="sm"
                  variant="ghost"
                  className="text-gray-600"
                >
                  {showSQLInCompact ? 'Скрыть код' : 'Показать код'}
                </Button>
              </div>
              
              {showSQLInCompact && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">
                    SQL код (нажмите, чтобы выделить):
                  </p>
                  <pre 
                    className="p-2 bg-gray-50 rounded text-xs overflow-x-auto border border-gray-200 cursor-text select-all"
                    onClick={(e) => {
                      const selection = window.getSelection();
                      const range = document.createRange();
                      range.selectNodeContents(e.currentTarget);
                      selection?.removeAllRanges();
                      selection?.addRange(range);
                      toast.success('Текст выделен! Нажмите Ctrl+C или Cmd+C');
                    }}
                  >
                    {SQL_CODE}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
