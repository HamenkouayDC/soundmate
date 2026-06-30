# Soundmate Backend — передача команде

Документ для Team Lead и Frontend.

---

## Статус

| Неделя | Статус | Содержание |
|--------|--------|------------|
| Week 1 | ✅ | Каркас, модели, auth API |
| Week 2 | ✅ | CRUD профиля, music connections, матчинг Faiss |
| Week 3 | ✅ | Профиль city/avatar, лента, лайки, матчи, чат, music passport |

**Репозиторий:** https://github.com/HamenkouayDC/soundmate

**Стек:** Python 3.12, Django 5, DRF, simplejwt, PostgreSQL 18.

**Разработка:** локально Python + PostgreSQL (без Docker на ПК).  
**Деплой на VDS:** `bash ~/soundmate/repo/scripts/deploy_vds.sh`

---

## Для Team Lead

- Monorepo: код backend в папке `backend/`
- Настройка локально: [`docs/BACKEND_SETUP.md`](BACKEND_SETUP.md), [`docs/FRONTEND_LOCAL_SETUP.md`](FRONTEND_LOCAL_SETUP.md)
- После `git pull`:
  ```bash
  pip install -r requirements.txt
  python manage.py migrate
  python manage.py seed_demo_profiles   # опционально, демо-данные
  ```
- Куратор: VDS team17 — `https://team17.st.ifbest.org/api/v1/`

---

## Для Frontend

### Базовый URL

```
http://localhost:8000/api/v1/
```

Swagger: http://localhost:8000/api/docs/

Продакшен: `https://team17.st.ifbest.org/api/v1/`

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

---

### Профиль

**Читать** — `GET /api/v1/profiles/me/`

**Обновить** — `PATCH /api/v1/profiles/me/`
```json
{
  "display_name": "Имя",
  "city": "Москва",
  "bio": "О себе",
  "birth_date": "2000-01-15",
  "avatar_url": "https://...",
  "preview_track_url": "https://..."
}
```

**Загрузить аватар (файл)** — `POST /api/v1/profiles/me/avatar/`  
`Content-Type: multipart/form-data`, поле `avatar` (image).  
В ответе — полный профиль; `avatar_url` будет абсолютным URL загруженного файла.

`mood_profile` и `music_embedding` — только чтение (заполняет ML).

---

### Music Passport

**Подключения (stub, без OAuth)** — `GET/POST /api/v1/music/connections/`  
**Отключить** — `DELETE /api/v1/music/connections/<uuid>/`

**Музыкальный паспорт** — `GET /api/v1/music/passport/`
```json
{
  "genres": ["rock", "metal"],
  "artists": [
    { "name": "Nirvana", "weight": 3.5, "source": "lastfm" }
  ],
  "top_tracks": [
    { "title": "Preview", "artist": "Nirvana", "url": "https://..." }
  ]
}
```
Жанры берутся из `music_embedding`, артисты — из `MusicTaste`. OAuth Spotify/Яндекс — позже.

---

### Лента (feed)

**Список рекомендаций** — `GET /api/v1/feed/`  
(алиас: `GET /api/v1/matching/feed/`)

```json
{
  "results": [
    {
      "id": "uuid пользователя",
      "profile_id": "uuid профиля",
      "name": "Аня — рок",
      "display_name": "Аня — рок",
      "age": 28,
      "birth_date": "1998-03-14",
      "city": "Москва",
      "bio": "...",
      "avatar_url": "http://localhost:8000/media/avatars/...",
      "compatibility_percent": 87.5,
      "shared_genres": ["rock"],
      "shared_artists": ["Arctic Monkeys"],
      "top_genres": ["rock", "punk"],
      "mood": ""
    }
  ]
}
```

Уже пролайканные/пропущенные пользователи не возвращаются.

---

### Лайки и пропуски

**Действие** — `POST /api/v1/feed/actions/`
```json
{
  "target_user_id": "uuid пользователя",
  "action": "like"
}
```
`action`: `"like"` | `"skip"`

Ответ:
```json
{
  "action": "like",
  "is_match": true,
  "match_id": "uuid матча или null"
}
```
`is_match: true` — взаимный лайк, матч создан.

---

### Матчи

**Список** — `GET /api/v1/matches/`
```json
{
  "results": [
    {
      "match_id": "uuid",
      "compatibility_percent": 72.3,
      "shared_genres": ["rock"],
      "shared_artists": ["Metallica"],
      "last_message": {
        "id": "uuid",
        "text": "Привет!",
        "created_at": "2026-06-30T15:00:00+03:00",
        "sender_id": "uuid"
      },
      "user": {
        "id": "uuid",
        "profile_id": "uuid",
        "name": "Макс — метал",
        "display_name": "Макс — метал",
        "age": 30,
        "birth_date": "1996-05-20",
        "city": "Санкт-Петербург",
        "bio": "...",
        "avatar_url": ""
      }
    }
  ]
}
```

---

### Чат

**Сообщения матча** — `GET /api/v1/matches/<match_id>/messages/`
```json
{
  "results": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "text": "Привет!",
      "created_at": "2026-06-30T15:00:00+03:00"
    }
  ]
}
```

**Отправить** — `POST /api/v1/matches/<match_id>/messages/`
```json
{ "text": "Текст сообщения" }
```

Сообщения сохраняются в БД и остаются после перезагрузки.

---

### Демо-данные

```bash
cd ml && python generate_dataset.py   # пересобрать demo_profiles.json
cd backend
python manage.py seed_demo_profiles
```

Демо-логин: `demo.rock@soundmate.local` / `demopass123`

### CORS

`http://localhost:5173`, `http://127.0.0.1:5173` — из `backend/.env`.

### Healthcheck

`GET /api/v1/health/` → `{"status":"ok",...}`

---

## Модели (кратко)

| App | Модели |
|-----|--------|
| `users` | User (email, UUID) |
| `profiles` | Profile (+ city, avatar) |
| `music` | MusicConnection, MusicTaste |
| `matching` | WaveSession, Match, FeedAction, Message |

Admin: http://localhost:8000/admin/

---

## Схема (локально)

```
React (localhost:5173) → Django API (localhost:8000) → PostgreSQL
```
