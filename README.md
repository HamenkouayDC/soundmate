# Soundmate

**Слоган:** «Твоя музыка найдёт тебя»

Приложение для знакомств на основе музыкального вкуса. Совместимость определяется не только жанрами, но и настроением музыки. Механика «Волна» — сначала слушаешь, потом видишь.

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | React, TypeScript, Tailwind |
| Backend | Python 3.12, Django, DRF, JWT |
| Database | PostgreSQL 16 |
| ML | Python, NumPy, scikit-learn, Faiss |

## Структура репозитория

```
Soundmate/
├── backend/     # Django API
├── frontend/    # React (Week 1+)
├── ml/          # Матчинг (Week 1+)
└── docs/        # Документация
```

## Backend — быстрый старт

Команда backend разрабатывает **локально**: Python 3.12 + PostgreSQL (без Docker).

Подробно: [backend/README.md](backend/README.md)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

API: http://localhost:8000  
Healthcheck: http://localhost:8000/api/v1/health/  
Swagger: http://localhost:8000/api/docs/

## Docker

`docker-compose.yml` и `Dockerfile` — для отчётности по стеку проекта. В разработке не используем.

## Команда

6 человек: Team Lead, Backend ×2, Frontend, UX/UI, ML Engineer, Business Analyst.
