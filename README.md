# 🎵 Soundmate

> «Твоя музыка найдёт тебя»

Сервис знакомств, где совместимость определяется музыкальным вкусом. Подключаешь стриминг — система анализирует что ты слушаешь и подбирает людей со схожим настроением и вкусом.

---

## ✨ Ключевые фичи

- **Music Passport** — подключи любой стриминг: Spotify, Last.fm, SoundCloud, Яндекс Музыка
- **Режим «Волна»** — сначала слышишь 30 секунд музыки человека, потом видишь фото
- **Матчинг по настроению** — алгоритм учитывает energy, valence, tempo треков, а не только жанры

---

## 🛠 Стек технологий

| Область | Технологии |
|---|---|
| Frontend | TypeScript, React, Tailwind CSS |
| Backend | Python 3.12, Django, DRF, JWT |
| База данных | PostgreSQL 18 |
| ML / матчинг | Python, NumPy, scikit-learn, Faiss |
| Интеграции | Spotify API, Last.fm API, SoundCloud API, Яндекс Музыка |
| Дизайн | Figma |
| DevOps | Docker (отчётность), GitHub Actions |

---

## 📁 Структура репозитория

```
soundmate/
├── backend/      # Django API
├── frontend/     # React + TypeScript + Tailwind
├── ml/           # Модели матчинга и работа с API
├── docs/         # Документация, ТЗ, вайрфреймы
└── README.md
```

---

## 🚀 Быстрый старт

### Backend (локально, без Docker)

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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### ML-сервис

```bash
cd ml
pip install -r requirements.txt
python main.py
```

---

## 👥 Команда

| Роль | Задачи |
|---|---|
| Тимлид | Координация, GitHub, daily-синки |
| Backend | Django, PostgreSQL, JWT |
| Frontend | React, TypeScript, Tailwind |
| UX/UI дизайнер | Figma, вайрфреймы, прототипы |
| ML-инженер | Эмбеддинги, Faiss, интеграции API |
| Бизнес-аналитик | ТЗ, персонажи, метрики |

---

## 📋 Доска задач

Текущий статус задач: **[GitHub Projects → Soundmate Sprint 1](../../projects)**

---

## 📄 Документация

- [`docs/BACKEND_SETUP.md`](docs/BACKEND_SETUP.md) — настройка backend (Python + PostgreSQL)
- [`docs/github_setup_guide.md`](docs/github_setup_guide.md) — работа с GitHub

---

## 🤝 Как работать с репозиторием

1. Клонировать: `git clone https://github.com/HamenkouayDC/soundmate.git`
2. Создать ветку под задачу: `git checkout -b feature/название-задачи`
3. Сделать PR в `main` после завершения
4. PR проходит ревью тимлида перед мержем
