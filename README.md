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
| Backend | Python, FastAPI / Django, JWT |
| База данных | PostgreSQL |
| ML / матчинг | Python, NumPy, scikit-learn, Faiss |
| Интеграции | Spotify API, Last.fm API, SoundCloud API, Яндекс Музыка |
| Дизайн | Figma |
| DevOps | Docker, GitHub Actions |

---

## 📁 Структура репозитория

```
soundmate/
├── backend/      # FastAPI/Django приложение
├── frontend/     # React + TypeScript + Tailwind
├── ml/           # Модели матчинга и работа с API
├── docs/         # Документация, ТЗ, вайрфреймы
└── README.md
```

---

## 🚀 Быстрый старт

### Требования
- Docker и Docker Compose
- Node.js 18+
- Python 3.11+

### Запуск backend

```bash
cd backend
docker-compose up
```

### Запуск frontend

```bash
cd frontend
npm install
npm run dev
```

### Запуск ML-сервиса

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
| Backend | FastAPI, PostgreSQL, JWT |
| Frontend | React, TypeScript, Tailwind |
| UX/UI дизайнер | Figma, вайрфреймы, прототипы |
| ML-инженер | Эмбеддинги, Faiss, интеграции API |
| Бизнес-аналитик | ТЗ, персонажи, метрики |

---

## 📋 Доска задач

Текущий статус задач: **[GitHub Projects → Soundmate Sprint 1](../../projects)**

---

## 📄 Документация

- [`docs/backlog_sprint1.md`](docs/backlog_sprint1.md) — бэклог первого спринта
- [`docs/requirements.md`](docs/requirements.md) — функциональные требования MVP
- [`docs/stack.md`](docs/stack.md) — обоснование выбора стека

---

## 🤝 Как работать с репозиторием

1. Клонировать: `git clone https://github.com/ВАШ_ЛОГИН/soundmate.git`
2. Создать ветку под задачу: `git checkout -b feature/название-задачи`
3. Сделать PR в `main` после завершения
4. PR проходит ревью тимлида перед мержем
