import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoPath, videoBase64, mimeType, userId } = await req.json()
    
    let finalVideoBase64: string
    let finalMimeType: string
    
    if (videoBase64) {
      // НОВЫЙ ПОДХОД: Видео уже в base64 формате
      console.log('Using pre-encoded base64 video')
      finalVideoBase64 = videoBase64
      finalMimeType = mimeType || 'video/mp4'
    } else if (videoPath) {
      // СТАРЫЙ ПОДХОД: Загружаем видео из Storage (для обратной совместимости)
      console.log('Loading video from Storage:', videoPath)
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('video-uploads')
        .createSignedUrl(videoPath, 3600)

      if (signedUrlError) {
        throw new Error(`Failed to create signed URL: ${signedUrlError.message}`)
      }

      const videoUrl = signedUrlData.signedUrl
      const videoResponse = await fetch(videoUrl)
      
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`)
      }

      const videoBlob = await videoResponse.blob()
      const videoBuffer = await videoBlob.arrayBuffer()
      
      const videoBytes = new Uint8Array(videoBuffer)
      finalVideoBase64 = base64Encode(videoBytes)
      finalMimeType = videoBlob.type || 'video/mp4'
    } else {
      throw new Error('Either videoPath or videoBase64 is required')
    }

    // Промпт для Gemini AI
    const ANALYSIS_PROMPT = `
Ты — профессиональный SMM-аналитик и сценарист для коротких видео (Reels, TikTok).

Проанализируй загруженное видео и выполни следующие задачи:

0. НАЗВАНИЕ СЦЕНАРИЯ:
   - Придумай краткое название сценария (2-3 слова), которое отражает основной смысл ролика

1. ТРАНСКРИБАЦИЯ И ПЕРЕВОД:
   - Сделай полную транскрибацию аудиодорожки на языке оригинала
   - Переведи транскрибацию на русский язык

2. КЛЮЧИ К УСПЕХУ:
   Выяви 5 ключевых причин, почему это видео может быть успешным:
   - Хук (как привлечено внимание в первые 3 секунды)
   - Структура (как построен контент)
   - Подача (интонация, темп, энергетика)
   - Визуал (камера, монтаж, эффекты)
   - Аудио (музыка, звуковые акценты)

3. ГОТОВЫЙ СЦЕНАРИЙ:
   Создай пошаговый сценарий для создания аналогичного видео на русском языке.
   Для каждой сцены укажи:
   - Временной интервал (например, "0-3 сек")
   - Визуальный ряд (крупный план, средний план, демонстрация и т.д.)
   - Текст для озвучки (адаптированный под русский язык)
   - Заметка/совет (почему важен этот момент)

4. РЕКОМЕНДАЦИИ ПО СОЗДАНИЮ:
   Дай практические советы по:
   - Интонации и голосу
   - Фоновой музыке
   - Работе с ИИ-аватаром (если применимо)
   - Монтажу и эффектам

Ответ предоставь СТРОГО в формате JSON со следующей структурой:
{
  "title": "Название сценария",
  "original": {
    "transcription": "...",
    "translation": "..."
  },
  "keys": [
    {"title": "...", "description": "..."}
  ],
  "script": [
    {"time": "...", "visual": "...", "text": "...", "note": "..."}
  ],
  "recommendations": [
    {"category": "...", "text": "..."}
  ]
}
`

    // Вызов Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    console.log('Calling Gemini API...')
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: ANALYSIS_PROMPT
              },
              {
                inline_data: {
                  mime_type: finalMimeType,
                  data: finalVideoBase64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received')

    // Проверяем наличие candidates (может быть заблокировано safety фильтрами)
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error('No candidates in Gemini response:', JSON.stringify(geminiData))
      throw new Error('Gemini API returned no candidates. The video may have been blocked by safety filters.')
    }

    // Извлекаем текст из ответа
    const generatedText = geminiData.candidates[0].content.parts[0].text
    
    // Парсим JSON из ответа (убираем markdown блоки если есть)
    let analysisResult
    try {
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedText.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0]
        analysisResult = JSON.parse(jsonText)
      } else {
        analysisResult = JSON.parse(generatedText)
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', generatedText)
      throw new Error('Failed to parse Gemini response as JSON')
    }

    // Возвращаем результат
    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in analyze-video function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
