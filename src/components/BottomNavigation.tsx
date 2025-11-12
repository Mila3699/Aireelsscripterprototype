import { Home, BookmarkCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavigationProps {
  activeTab: 'home' | 'saved' | 'help';
  onNavigate: (tab: 'home' | 'saved' | 'help') => void;
  savedCount?: number;
}

export function BottomNavigation({ activeTab, onNavigate, savedCount = 0 }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'home' as const,
      icon: Home,
      label: 'Главная',
      badge: null,
    },
    {
      id: 'saved' as const,
      icon: BookmarkCheck,
      label: 'Сохранённые',
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      id: 'help' as const,
      icon: HelpCircle,
      label: 'Помощь',
      badge: null,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50 pb-safe">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`
                  relative flex flex-col items-center justify-center gap-1 px-4 md:px-6 py-2 rounded-xl transition-all active:scale-95 min-h-[44px]
                  ${isActive 
                    ? 'text-purple-600' 
                    : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                  }
                `}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Badge для количества сохранённых */}
                  {tab.badge !== null && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1"
                    >
                      {tab.badge}
                    </motion.div>
                  )}
                </div>
                
                <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>

                {/* Индикатор активной вкладки */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-purple-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
