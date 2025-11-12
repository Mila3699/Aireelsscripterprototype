#!/bin/bash

# 🎉 Установка дофаминовой анимации для AI Reels Scripter
# Быстрая установка canvas-confetti

echo "🎉 Установка celebration анимации..."
echo ""

# Проверка node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules не найдена. Запускаем npm install..."
    npm install
fi

# Установка canvas-confetti
echo "📦 Установка canvas-confetti..."
npm install canvas-confetti

# Установка типов для TypeScript
echo "📦 Установка @types/canvas-confetti..."
npm install --save-dev @types/canvas-confetti

echo ""
echo "✅ Установка завершена!"
echo ""
echo "🚀 Запустите приложение:"
echo "   npm run dev"
echo ""
echo "🎉 Загрузите видео, нажмите 'Анализировать' и наслаждайтесь celebration!"
echo ""
echo "📚 Подробная документация: CELEBRATION_SETUP.md"
echo ""
