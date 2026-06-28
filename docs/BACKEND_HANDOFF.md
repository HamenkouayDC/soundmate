# Soundmate Backend — передача команде

Документ для Team Lead и Frontend.

---

## Статус

| Неделя | Статус | Содержание |
|--------|--------|------------|
| Week 1 | ✅ | Каркас, модели, auth API |
| Week 2 | ✅ | CRUD профиля, music connections, **матчинг Faiss** |

**Репозиторий:** https://github.com/HamenkouayDC/soundmate

**Стек:** Python 3.12, Django 5, DRF, simplejwt, PostgreSQL 18.

**Разработка:** локально Python + PostgreSQL (без Docker на ПК).  
**Деплой на VDS:** Docker — после получения доступов от куратора.

**Backend-команда:** один разработчик.

---

## Для Team Lead

- Monorepo: код backend в папке `backend/`
- `docker-compose.yml` — для деплоя на VDS куратора
- Настройка локально: [`docs/BACKEND_SETUP.md`](BACKEND_SETUP.md), [`docs/FRONTEND_LOCAL_SETUP.md`](FRONTEND_LOCAL_SETUP.md)
- После `git pull`: `pip install -r requirements.txt` и `python manage.py migrate`
- Куратор: тимлиду написать `#VDS` в ЛС для доступов **команды 10** (не team17)

---

## Для Frontend

### Базовый URL

```
http://localhost:8000/api/v1/
```

Swagger: http://localhost:8000/api/docs/

### Auth

**Регистрация** — `POST /api/v1/auth/register/`
```json
{ "email": "...", "password": "мин 8 символов", "display_name": "Имя" }
```

**Логин** — `POST /api/v1/auth/login/`
```json
{ "email": "...", "password": "..." }
```
Ответ: `{ "access": "...", "refresh": "..." }`

**Refresh** — `POST /api/v1/auth/refresh/` с `{ "refresh": "..." }`

**Текущий пользователь** — `GET /api/v1/users/me/`  
Header: `Authorization: Bearer <access>`

### Профиль (Week 2)

**Читать свой профиль** — `GET /api/v1/profiles/me/`

**Обновить** — `PATCH /api/v1/profiles/me/`
```json
{
  "display_name": "Новое имя",
  "bio": "О себе",
  "birth_date": "2000-01-15",
  "avatar_url": "https://...",
  "preview_track_url": "https://..."
}
```
Все поля опциональны (partial update).  
`mood_profile` и `music_embedding` — только чтение (заполнит ML).

### Music Passport (Week 2, stub без OAuth)

**Список подключений** — `GET /api/v1/music/connections/`

**Подключить сервис** — `POST /api/v1/music/connections/`
```json
{
  "provider": "spotify",
  "external_user_id": "spotify_user_123"
}
```
Провайдеры: `spotify`, `lastfm`, `soundcloud`, `yandex`

**Отключить** — `DELETE /api/v1/music/connections/<uuid>/`

### Матчинг (Week 2 demo)

**Лента по совместимости** — `GET /api/v1/matching/feed/`  
Header: `Authorization: Bearer <access>`

Ответ:
```json
{
  "results": [
    {
      "profile": { "display_name": "...", "bio": "..." },
      "compatibility_score": 87.5,
      "shared_genres": ["rock", "metal"],
      "top_genres": ["rock", "punk"]
    }
  ]
}
```

Перед демо на сервере:
```bash
python manage.py seed_demo_profiles
```

Демо-логин: `demo.rock@soundmate.local` / `demopass123`

Полный OAuth Spotify/Яндекс — позже.

### CORS

`http://localhost:5173`, `http://127.0.0.1:5173` — из `backend/.env`.

### Healthcheck

`GET /api/v1/health/` → `{"status":"ok",...}`

### Продакшен (team17)

```
https://team17.st.ifbest.org/api/v1/
```

Swagger: https://team17.st.ifbest.org/api/docs/

---

## Модели (кратко)

| App | Модели |
|-----|--------|
| `users` | User (email, UUID) |
| `profiles` | Profile |
| `music` | MusicConnection, MusicTaste |
| `matching` | WaveSession, Match |

Admin: http://localhost:8000/admin/

---

## Схема (локально)

```
React (localhost:5173) → Django API (localhost:8000) → PostgreSQL
```
