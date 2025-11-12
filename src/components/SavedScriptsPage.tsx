import { useState, useEffect } from 'react';
import type { SavedScript } from '../lib/api';
import {
  getSavedScripts,
  deleteScript,
  deleteAllScripts,
  searchScripts,
} from '../lib/api-supabase';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Copy, Trash2, ArrowLeft, Calendar, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '../lib/clipboard';

interface SavedScriptsPageProps {
  onBack: () => void;
}

export function SavedScriptsPage({ onBack }: SavedScriptsPageProps) {
  const [scripts, setScripts] = useState<SavedScript[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<SavedScript[]>([]);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScripts();
  }, []);

  // Фильтруем сценарии при изменении поискового запроса
  useEffect(() => {
    const filtered = searchScripts(scripts, searchQuery);
    setFilteredScripts(filtered);
  }, [scripts, searchQuery]);

  const loadScripts = async () => {
    setIsLoading(true);
    const loadedScripts = await getSavedScripts();
    setScripts(loadedScripts);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteScript(id);
    if (success) {
      toast.success('Сценарий удалён');
      loadScripts();
    } else {
      toast.error('Не удалось удалить сценарий');
    }
  };

  const handleDeleteAll = async () => {
    const success = await deleteAllScripts();
    if (success) {
      toast.success('Все сценарии удалены');
      loadScripts();
    } else {
      toast.error('Не удалось удалить сценарии');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleCopyScript = async (script: SavedScript) => {
    const scriptText = script.script.map((scene, index) => 
      `${index + 1}. ${scene.time}\n` +
      `Визуал: ${scene.visual}\n` +
      `Текст: ${scene.text}\n` +
      `Заметка: ${scene.note}\n`
    ).join('\n');

    const fullText = `📝 ${script.title}\n\n` +
      `🎬 СЦЕНАРИЙ:\n\n${scriptText}\n\n` +
      `💡 РЕКОМЕНДАЦИИ:\n${script.recommendations.map(r => `${r.category}: ${r.text}`).join('\n')}`;

    const success = await copyToClipboard(fullText);
    
    if (success) {
      toast.success('Сценарий скопирован в буфер обмена');
    } else {
      toast.error('Не удалось скопировать автоматически. Выделите текст вручную (Ctrl+C)');
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6 pb-28 safe-area-inset-bottom">
      <div className="max-w-5xl mx-auto">
        {/* Шапка */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl mb-2">Сохранённые сценарии</h1>
              <p className="text-gray-600 text-sm md:text-base">
                {scripts.length === 0 
                  ? 'У вас пока нет сохранённых сценариев'
                  : `Всего сценариев: ${scripts.length}` + (searchQuery ? ` • Найдено: ${filteredScripts.length}` : '')
                }
              </p>
            </div>

            {scripts.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="min-h-[44px] w-full md:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить все
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить все сценарии?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Все {scripts.length} сценариев будут удалены безвозвратно.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700">
                      Удалить всё
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Поиск */}
        {scripts.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по названию или содержимому..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Очистить поиск"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Список сценариев */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Загрузка сценариев...</p>
          </Card>
        ) : scripts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl mb-2">Пока пусто</h3>
            <p className="text-gray-600 mb-6">
              Проанализируйте видео и сохраните сценарий, чтобы он появился здесь
            </p>
            <Button onClick={onBack}>
              Вернуться к анализу
            </Button>
          </Card>
        ) : filteredScripts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl mb-2">Ничего не найдено</h3>
            <p className="text-gray-600 mb-6">
              По запросу "{searchQuery}" не найдено сценариев
            </p>
            <Button onClick={clearSearch}>
              Очистить поиск
            </Button>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-350px)] md:h-[calc(100vh-380px)]">
            <div className="space-y-4 pr-2 md:pr-4">
              {filteredScripts.map((script) => (
                <Card key={script.id} className="overflow-hidden">
                  {/* Заголовок карточки */}
                  <div className="p-4 md:p-6 bg-white border-b">
                    <div className="space-y-4">
                      {/* Заголовок и метаданные */}
                      <div>
                        <h2 className="text-xl md:text-2xl mb-2">{script.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(script.savedAt)}
                          </div>
                          <div>
                            Сцен: {script.script.length}
                          </div>
                        </div>
                      </div>

                      {/* Кнопки */}
                      <div className="flex flex-col gap-2">
                        {/* Первый ряд: Копировать и Удалить */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyScript(script)}
                            className="flex-1 min-h-[44px]"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Копировать
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="min-w-[44px] min-h-[44px] px-3 md:px-4"
                                aria-label="Удалить сценарий"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">Удалить</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить сценарий?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Сценарий "{script.title}" будет удалён безвозвратно.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(script.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {/* Второй ряд: Развернуть */}
                        <Button
                          variant={expandedScript === script.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExpandedScript(
                            expandedScript === script.id ? null : script.id
                          )}
                          className="w-full min-h-[44px]"
                        >
                          {expandedScript === script.id ? '▲ Свернуть' : '▼ Развернуть'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Развёрнутое содержимое */}
                  {expandedScript === script.id && (
                    <div className="bg-gray-50 border-t">
                      <div className="p-4 md:p-6 space-y-6">
                          {/* Транскрибация */}
                          <div>
                            <h3 className="mb-3">📝 Транскрибация</h3>
                            <div className="bg-white p-4 rounded-lg space-y-2">
                              <p className="text-sm text-gray-600">{script.original.transcription}</p>
                              <p className="text-sm">{script.original.translation}</p>
                            </div>
                          </div>

                          {/* Ключи к успеху */}
                          <div>
                            <h3 className="mb-3">🔑 Ключи к успеху</h3>
                            <div className="grid gap-3">
                              {script.keys.map((key, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg">
                                  <div className="mb-1">{key.title}</div>
                                  <p className="text-sm text-gray-600">{key.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Сценарий */}
                          <div>
                            <h3 className="mb-3">🎬 Сценарий</h3>
                            <div className="space-y-3">
                              {script.script.map((scene, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg">
                                  <div className="flex items-start gap-3 md:gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="mb-2 text-sm text-indigo-600">{scene.time}</div>
                                      <div className="mb-2">
                                        <span className="text-sm text-gray-500">Визуал: </span>
                                        <span className="text-sm">{scene.visual}</span>
                                      </div>
                                      <div className="mb-2 p-3 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-500">Текст: </span>
                                        <span className="text-sm">{scene.text}</span>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        💡 {scene.note}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Рекомендации */}
                          <div>
                            <h3 className="mb-3">💡 Рекомендации</h3>
                            <div className="grid gap-3">
                              {script.recommendations.map((rec, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg">
                                  <div className="mb-1">{rec.category}</div>
                                  <p className="text-sm text-gray-600">{rec.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
