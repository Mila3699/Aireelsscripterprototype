import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function StorageTestPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const runTest = async () => {
    setTesting(true);
    setResult('🔍 Проверяем аутентификацию...\n');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setResult(prev => prev + `❌ Ошибка сессии: ${sessionError?.message || 'нет сессии'}\n`);
        setTesting(false);
        return;
      }

      const userId = session.user.id;
      setResult(prev => prev + `✅ User ID: ${userId}\n\n`);

      setResult(prev => prev + '📤 Пытаемся загрузить тестовый файл...\n');

      const testContent = 'Test file created at ' + new Date().toISOString();
      const testFile = new Blob([testContent], { type: 'text/plain' });
      const testFileName = `${userId}/test_${Date.now()}.txt`;

      setResult(prev => prev + `📁 Путь: ${testFileName}\n`);

      const uploadPromise = supabase.storage
        .from('video-uploads')
        .upload(testFileName, testFile, {
          cacheControl: '3600',
          upsert: false
        });

      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout 10s')), 10000)
      );

      const { data, error } = await Promise.race([uploadPromise, timeout]) as any;

      if (error) {
        setResult(prev => prev + `\n❌ ОШИБКА ЗАГРУЗКИ:\n${JSON.stringify(error, null, 2)}\n\n`);
        setResult(prev => prev + '🔧 РЕШЕНИЕ:\n');
        setResult(prev => prev + '1. Откройте SQL Editor:\n');
        setResult(prev => prev + '   https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new\n\n');
        setResult(prev => prev + '2. Выполните файл: ИСПРАВЛЕНИЕ_STORAGE_POLICIES.sql\n');
      } else {
        setResult(prev => prev + `\n✅ УСПЕХ! Файл загружен:\n${JSON.stringify(data, null, 2)}\n`);
        
        await supabase.storage.from('video-uploads').remove([testFileName]);
        setResult(prev => prev + '\n🗑️ Тестовый файл удалён\n');
      }
    } catch (err: any) {
      setResult(prev => prev + `\n❌ КРИТИЧЕСКАЯ ОШИБКА:\n${err.message}\n`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Диагностика Storage</CardTitle>
            <CardDescription>
              Проверка загрузки файлов в Supabase Storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTest} 
              disabled={testing}
              className="w-full"
            >
              {testing ? '⏳ Тестируем...' : '▶️ Запустить тест'}
            </Button>

            {result && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96">
                {result}
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p><strong>Этот тест проверяет:</strong></p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Аутентификацию пользователя</li>
                <li>Загрузку файла в Storage bucket</li>
                <li>Правильность Storage Policies</li>
              </ul>
              
              <p className="mt-4"><strong>Если тест не проходит:</strong></p>
              <p>Выполните SQL из файла <code>ИСПРАВЛЕНИЕ_STORAGE_POLICIES.sql</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
