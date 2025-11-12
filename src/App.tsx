import { useState, useEffect } from 'react';
import { UploadPage } from './components/UploadPage';
import { ProcessingPage } from './components/ProcessingPage';
import { ResultsPage } from './components/ResultsPage';
import { SavedScriptsPage } from './components/SavedScriptsPage';
import { HelpPage } from './components/HelpPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { BottomNavigation } from './components/BottomNavigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from './components/ui/button';
import { processVideoWithSupabase, getSavedScripts } from './lib/api-supabase';
import type { VideoAnalysisResult } from './lib/api';
import { getCurrentUser, signOut, supabase, checkLocalSession } from './lib/supabase';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

export type AppState = 'login' | 'register' | 'upload' | 'processing' | 'results' | 'saved' | 'help';

function AppContent() {
  const [appState, setAppState] = useState<AppState>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [isReturningFromSaved, setIsReturningFromSaved] = useState(false); // Флаг возврата из Сохранённых

  // Проверка аутентификации при загрузке
  useEffect(() => {
    // Выводим полезную информацию в консоль
    console.log('%c🎬 AI Reels Scripter', 'font-size: 20px; font-weight: bold; color: #8B5CF6;');
    console.log('%c✨ Анализ видео с помощью Google Gemini AI', 'font-size: 14px; color: #6366F1;');
    console.log('');
    console.log('%c💡 Ошибка "Invalid login credentials"?', 'font-weight: bold;');
    console.log('1. Убедитесь что вы зарегистрированы');
    console.log('2. Отключите Email Confirmation: https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/settings/auth');
    console.log('3. См. файл: /ОШИБКА_ВХОДА_РЕШЕНИЕ.md');
    console.log('');

    const checkAuth = async () => {
      try {
        console.log('🔍 Проверка аутентификации...');
        
        // Шаг 1: Быстрая проверка localStorage (мгновенно, без запросов к серверу)
        const { hasSession } = checkLocalSession();
        
        if (hasSession) {
          // Есть локальная сессия - сразу показываем приложение
          console.log('✅ Найдена активная локальная сессия');
          console.log('🚀 Быстрый вход - переход к приложению');
          setIsAuthenticated(true);
          setAppState('upload');
          
          // Загружаем количество сохранённых сценариев в фоне (не блокирует UI)
          getSavedScripts()
            .then(scripts => {
              setSavedCount(scripts.length);
              console.log(`📊 Загружено ${scripts.length} сохранённых сценариев`);
            })
            .catch(error => {
              console.error('⚠️ Ошибка загрузки сценариев:', error);
              // Если не удалось загрузить скрипты, возможно токен истёк
              // Пользователь увидит ошибку при попытке загрузить видео или открыть сохранённые
            });
        } else {
          // Нет локальной сессии - показываем страницу входа
          console.log('ℹ️ Локальной сессии нет - показываем страницу входа');
          setIsAuthenticated(false);
          setAppState('login');
        }
      } catch (error) {
        console.error('❌ Ошибка проверки аутентификации:', error);
        // При любой ошибке показываем страницу входа
        setIsAuthenticated(false);
        setAppState('login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    // Запускаем проверку (теперь мгновенная, без таймаутов)
    checkAuth();

    // Слушаем изменения состояния аутентификации
    // Это автоматически обновит состояние при входе/выходе
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ Пользователь вошёл:', session.user.email);
          setIsAuthenticated(true);
          setAppState('upload');
          
          // Загружаем сценарии
          const scripts = await getSavedScripts();
          setSavedCount(scripts.length);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Пользователь вышел');
          setIsAuthenticated(false);
          setAppState('login');
          setUploadedFile(null);
          setAnalysisResult(null);
          setSavedCount(0);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Токен обновлён автоматически');
        }
      }
    );

    // Очистка подписки при размонтировании
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Обновляем счётчик при изменении appState
  useEffect(() => {
    if (isAuthenticated && appState === 'saved') {
      getSavedScripts().then(scripts => {
        setSavedCount(scripts.length);
      });
    }
  }, [appState, isAuthenticated]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleAnalyze = async () => {
    console.log('🎬 handleAnalyze вызван');
    
    if (!uploadedFile) {
      toast.error('Пожалуйс��а, загрузите видео');
      return;
    }

    console.log('📹 Файл есть, переключаемся на processing');
    setAppState('processing');

    try {
      console.log('🚀 Запускаем processVideoWithSupabase...');
      // Используем прототип с mock-данными
      const result = await processVideoWithSupabase(uploadedFile);
      console.log('✅ processVideoWithSupabase завершён');
      
      // Показываем информационное уведомление о прототипе
      if (result.isDemoMode) {
        toast.success('✨ Анализ завершен! Показываем примерные данные для демонстрации', {
          duration: 4000,
        });
      }
      
      setAnalysisResult(result);
      setIsReturningFromSaved(false); // Новый анализ - показываем анимацию
      setAppState('results');
    } catch (error) {
      console.error('Ошибка при анализе видео:', error);
      
      // Проверяем тип ошибки
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при анализе видео';
      
      // Ошибка RLS - показываем специальное сообщение
      if (errorMessage.includes('row-level security') || errorMessage.includes('🔒')) {
        toast.error('Требуется настройка Storage Policies', {
          description: 'Смотрите красное уведомление на экране загрузки',
          duration: 8000,
        });
      } else if (errorMessage.includes('лимит')) {
        toast.error(errorMessage, {
          duration: 6000,
        });
      } else {
        toast.error(errorMessage);
      }
      
      setAppState('upload');
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAppState('upload');
    getSavedScripts().then(scripts => {
      setSavedCount(scripts.length);
    });
  };

  const handleLogout = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚪 НАЧАЛО ПРОЦЕССА ВЫХОДА');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 Компонент: App.tsx -> handleLogout()');
    console.log('⏰ Время:', new Date().toLocaleTimeString());
    console.log('📊 Текущее состояние:');
    console.log('   - isAuthenticated:', isAuthenticated);
    console.log('   - appState:', appState);
    console.log('   - uploadedFile:', uploadedFile?.name || 'нет');
    
    try {
      console.log('🔄 Вызываем signOut()...');
      const result = await signOut();
      console.log('📊 Результат signOut:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ УСПЕХ! Обновляем состояние приложения...');
        console.log('   1. setIsAuthenticated(false)');
        setIsAuthenticated(false);
        console.log('   2. setAppState("login")');
        setAppState('login');
        console.log('   3. setUploadedFile(null)');
        setUploadedFile(null);
        console.log('   4. setAnalysisResult(null)');
        setAnalysisResult(null);
        console.log('   5. setSavedCount(0)');
        setSavedCount(0);
        console.log('   6. Показываем toast');
        toast.success('Вы вышли из системы. Для входа потребуется авторизация.');
        console.log('✅ ВСЁ СОСТОЯНИЕ ОБНОВЛЕНО!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } else {
        console.error('❌ ОШИБКА ПРИ ВЫХОДЕ');
        console.error('   Детали:', result.error);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        toast.error('Ошибка выхода: ' + (result.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ИСКЛЮЧЕНИЕ ПРИ ВЫХОДЕ');
      console.error('   Тип ошибки:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('   Сообщение:', error instanceof Error ? error.message : String(error));
      console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      toast.error('Критическая ошибка при выходе');
    }
  };

  const handleReset = () => {
    setAppState('upload');
    setUploadedFile(null);
    setAnalysisResult(null);
    setIsReturningFromSaved(false); // Сбрасываем флаг
  };

  const handleViewSaved = () => {
    setAppState('saved');
  };

  const handleBackFromSaved = () => {
    // Если есть результат анализа, возвращаемся к нему, иначе на главную
    if (analysisResult) {
      setIsReturningFromSaved(true); // Отмечаем, что возвращаемся из Сохранённых
      setAppState('results');
    } else {
      setAppState('upload');
    }
  };

  const handleNavigate = (tab: 'home' | 'saved' | 'help') => {
    if (tab === 'home') {
      setIsReturningFromSaved(false); // Сбрасываем флаг при переходе на главную
      handleReset();
    } else if (tab === 'saved') {
      setAppState('saved');
    } else if (tab === 'help') {
      setAppState('help');
    }
  };

  // Определяем активную вкладку для нижней панели
  const getActiveTab = (): 'home' | 'saved' | 'help' => {
    if (appState === 'saved') return 'saved';
    if (appState === 'help') return 'help';
    return 'home';
  };

  // Показывать ли нижнюю панель
  const showBottomNav = isAuthenticated && appState !== 'processing';

  // Показываем загрузку при проверке аутентификации (мгновенная проверка localStorage)
  if (isCheckingAuth) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Экраны аутентификации */}
        {appState === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAppState('register')}
          />
        )}
        {appState === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setAppState('login')}
          />
        )}

        {/* Основные экраны приложения */}
        {isAuthenticated && (
          <>
            {appState === 'upload' && (
              <UploadPage 
                onFileUpload={handleFileUpload}
                onAnalyze={handleAnalyze}
                uploadedFile={uploadedFile}
                onLogout={handleLogout}
              />
            )}
            {appState === 'processing' && <ProcessingPage />}
            {appState === 'results' && analysisResult && (
              <ResultsPage 
                onReset={handleReset}
                analysisResult={analysisResult}
                skipCelebration={isReturningFromSaved}
              />
            )}
            {appState === 'saved' && (
              <SavedScriptsPage onBack={handleBackFromSaved} />
            )}
            {appState === 'help' && (
              <HelpPage onLogout={handleLogout} />
            )}

            {/* Нижняя панель навигации */}
            {showBottomNav && (
              <BottomNavigation
                activeTab={getActiveTab()}
                onNavigate={handleNavigate}
                savedCount={savedCount}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
