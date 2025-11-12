# Backend на Python + FastAPI

## Установка зависимостей

```bash
pip install fastapi
pip install uvicorn[standard]
pip install python-multipart
pip install google-generativeai
pip install google-cloud-storage
pip install celery[redis]
pip install python-dotenv
```

## Структура проекта

```
backend/
├── main.py                 # FastAPI приложение
├── worker.py               # Celery worker
├── config.py               # Конфигурация
├── requirements.txt        # Зависимости
├── .env                    # Переменные окружения
└── service-account.json    # GCP credentials
```

## Файл: `config.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Google AI
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")

# Google Cloud Storage
GCP_PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
GCP_BUCKET_NAME = os.getenv("GOOGLE_CLOUD_BUCKET_NAME")
GCP_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Server
PORT = int(os.getenv("PORT", 8000))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Limits
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 100))
MAX_VIDEO_DURATION = int(os.getenv("MAX_VIDEO_DURATION_SEC", 180))
ALLOWED_MIMETYPES = ["video/mp4", "video/quicktime", "video/webm"]
```

## Файл: `main.py`

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google.cloud import storage
import google.generativeai as genai
from celery import Celery
import config
import base64
import time
import json

# FastAPI app
app = FastAPI(title="AI Reels Scripter API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google Cloud Storage
storage_client = storage.Client(project=config.GCP_PROJECT_ID)
bucket = storage_client.bucket(config.GCP_BUCKET_NAME)

# Celery
celery_app = Celery(
    "tasks",
    broker=config.REDIS_URL,
    backend=config.REDIS_URL
)

# Google AI
genai.configure(api_key=config.GOOGLE_AI_API_KEY)

# Промпт для анализа
ANALYSIS_PROMPT = """
Ты — профессиональный SMM-аналитик и сценарист для коротких видео (Reels, TikTok).

Проанализируй загруженное видео и выполни следующие задачи:

1. ТРАНСКРИБАЦИЯ И ПЕРЕВОД:
   - Сделай полную транскрибацию аудиодорожки на языке оригинала
   - Переведи транскрибацию на русский язык

2. КЛЮЧИ К УСПЕХУ:
   Выяви 5 ключевых причин, почему это видео может быть успешным

3. ГОТОВЫЙ СЦЕНАРИЙ:
   Создай пошаговый сценарий для создания аналогичного видео на русском языке

4. РЕКОМЕНДАЦИИ ПО СОЗДАНИЮ:
   Дай практические советы по созданию контента

Ответ предоставь СТРОГО в формате JSON:
{
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
"""

# ============ CELERY TASK ============

@celery_app.task(bind=True)
def analyze_video_task(self, file_name: str, mime_type: str):
    """
    Celery задача для анализа видео
    """
    try:
        # Обновление прогресса
        self.update_state(state='PROGRESS', meta={'progress': 10})
        
        # Скачивание файла
        blob = bucket.blob(file_name)
        video_bytes = blob.download_as_bytes()
        
        self.update_state(state='PROGRESS', meta={'progress': 30})
        
        # Конвертация в base64
        video_base64 = base64.b64encode(video_bytes).decode('utf-8')
        
        self.update_state(state='PROGRESS', meta={'progress': 40})
        
        # Инициализация модели
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Отправка запроса
        response = model.generate_content([
            {
                'mime_type': mime_type,
                'data': video_base64
            },
            ANALYSIS_PROMPT
        ])
        
        self.update_state(state='PROGRESS', meta={'progress': 80})
        
        # Парсинг ответа
        result_text = response.text
        # Очистка от markdown
        result_text = result_text.replace('```json', '').replace('```', '').strip()
        result_data = json.loads(result_text)
        
        self.update_state(state='PROGRESS', meta={'progress': 90})
        
        # Удаление временного файла
        blob.delete()
        
        self.update_state(state='PROGRESS', meta={'progress': 100})
        
        return result_data
        
    except Exception as e:
        # Удаляем файл в случае ошибки
        try:
            bucket.blob(file_name).delete()
        except:
            pass
        raise e

# ============ API ENDPOINTS ============

@app.post("/api/upload")
async def upload_video(video: UploadFile = File(...)):
    """
    Загрузка видео и запуск анализа
    """
    try:
        # Валидация типа файла
        if video.content_type not in config.ALLOWED_MIMETYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Неподдерживаемый формат. Используйте: {', '.join(config.ALLOWED_MIMETYPES)}"
            )
        
        # Валидация размера
        content = await video.read()
        if len(content) > config.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"Файл слишком большой. Максимум {config.MAX_FILE_SIZE_MB} МБ"
            )
        
        # Создание уникального имени файла
        timestamp = int(time.time() * 1000)
        file_name = f"temp/{timestamp}_{video.filename}"
        
        # Загрузка в Cloud Storage
        blob = bucket.blob(file_name)
        blob.upload_from_string(
            content,
            content_type=video.content_type
        )
        
        # Запуск задачи в Celery
        task = analyze_video_task.delay(file_name, video.content_type)
        
        return JSONResponse({
            "success": True,
            "task_id": task.id,
            "message": "Видео загружено и отправлено на анализ"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status/{task_id}")
async def get_task_status(task_id: str):
    """
    Проверка статуса задачи
    """
    try:
        task = celery_app.AsyncResult(task_id)
        
        if task.state == 'PENDING':
            response = {
                'state': task.state,
                'progress': 0,
                'status': 'Задача в очереди...'
            }
        elif task.state == 'PROGRESS':
            response = {
                'state': task.state,
                'progress': task.info.get('progress', 0),
                'status': 'Обработка видео...'
            }
        elif task.state == 'SUCCESS':
            response = {
                'state': task.state,
                'progress': 100,
                'result': task.result
            }
        else:
            response = {
                'state': task.state,
                'progress': 0,
                'status': str(task.info)
            }
        
        return JSONResponse(response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """
    Проверка работоспособности API
    """
    return {"message": "AI Reels Scripter API is running"}

# ============ ЗАПУСК ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=config.PORT,
        reload=True
    )
```

## Файл: `worker.py`

```python
from main import celery_app

if __name__ == '__main__':
    celery_app.start()
```

## Файл: `requirements.txt`

```
fastapi==0.115.5
uvicorn[standard]==0.32.1
python-multipart==0.0.20
google-generativeai==0.8.3
google-cloud-storage==2.18.2
celery[redis]==5.4.0
python-dotenv==1.0.1
redis==5.2.0
```

## Запуск

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Запуск Redis

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 3. Запуск Celery Worker

```bash
celery -A worker worker --loglevel=info
```

### 4. Запуск FastAPI

```bash
python main.py
# или
uvicorn main:app --reload --port 8000
```

## Тестирование

```bash
# Загрузка видео
curl -X POST "http://localhost:8000/api/upload" \
  -F "video=@test.mp4"

# Проверка статуса (замените TASK_ID)
curl "http://localhost:8000/api/status/TASK_ID"
```

## Docker Compose

Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env
    depends_on:
      - redis
    volumes:
      - ./service-account.json:/app/service-account.json

  worker:
    build: .
    command: celery -A worker worker --loglevel=info
    environment:
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env
    depends_on:
      - redis
    volumes:
      - ./service-account.json:/app/service-account.json

volumes:
  redis_data:
```

Запуск:

```bash
docker-compose up -d
```

## Мониторинг Celery

Установка Flower (веб-интерфейс для Celery):

```bash
pip install flower
celery -A worker flower --port=5555
```

Открыть в браузере: http://localhost:5555
