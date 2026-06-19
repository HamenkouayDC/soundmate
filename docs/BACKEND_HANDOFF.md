# Soundmate Backend — передача команде (Week 1)

Документ для Team Lead, Frontend и второго backend-разработчика.

---

## Статус Week 1

| Этап | Статус | Содержание |
|------|--------|------------|
| 1 | ✅ | Каркас Django, apps, healthcheck, Docker (для отчёта) |
| 2 | ✅ | Модели User, Profile, Music Passport, Wave, Match, Admin |
| 3 | ✅ | Auth API: register, login, refresh, `/users/me` |

**Репозиторий:** https://github.com/HamenkouayDC/soundmate

**Стек:** Python 3.12, Django 5, DRF, simplejwt, PostgreSQL 18 (локально, без Docker в разработке).

---

## Для Team Lead

- Monorepo: код backend в папке `backend/`
- `docker-compose.yml` — для отчётности по стеку, в разработке не используем
- Подробная настройка: [`docs/BACKEND_SETUP.md`](BACKEND_SETUP.md)
- После `git pull`: `pip install -r requirements.txt` и `python manage.py migrate`
- История git была переписана (удалён Co-authored-by) — нужен обычный `git pull`

---

## Для Frontend

### Базовый URL

```
http://localhost:8000/api/v1/
```

Backend должен быть запущен на машине backend-разработчика (`python manage.py runserver`).

### Swagger (главный источник правды)

```
http://localhost:8000/api/docs/
```

### Auth — контракт

**Регистрация**
```http
POST /api/v1/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "минимум 8 символов",
  "display_name": "Имя"
}
```
Ответ `201`: объект user + profile (без пароля).

**Логин**
```http
POST /api/v1/auth/login/

{
  "email": "user@example.com",
  "password": "пароль"
}
```
Ответ `200`:
```json
{
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

**Обновить access** (срок жизни ~30 мин)
```http
POST /api/v1/auth/refresh/

{
  "refresh": "eyJ..."
}
```

**Текущий пользователь**
```http
GET /api/v1/users/me/
Authorization: Bearer <access>
```

### CORS

Разрешены origins из `backend/.env`:
- `http://localhost:5173` (Vite)
- `http://127.0.0.1:5173`

Другой порт — согласовать с backend, добавим в `CORS_ALLOWED_ORIGINS`.

### Healthcheck

```http
GET /api/v1/health/
```
Ответ: `{"status":"ok","service":"soundmate-api","version":"0.1.0"}`

### Что на стороне Frontend

- Хранение `access` / `refresh` (localStorage, memory — на выбор)
- Заголовок `Authorization: Bearer <access>` для защищённых запросов
- UI профиля, лента, «Волна» — API появится на следующих неделях

---

## Для второго backend

1. Клонировать репо
2. Python 3.12 + PostgreSQL 18 (те же версии)
3. См. [`backend/README.md`](../backend/README.md) и [`BACKEND_SETUP.md`](BACKEND_SETUP.md)
4. Скопировать `backend/.env.example` → `backend/.env`, настроить пароль БД
5. `python -m venv .venv` → `pip install -r requirements.txt` → `migrate` → `runserver`

---

## Модели (кратко)

| App | Модели |
|-----|--------|
| `users` | User (email, UUID) |
| `profiles` | Profile |
| `music` | MusicConnection, MusicTaste |
| `matching` | WaveSession, Match |

Просмотр данных: http://localhost:8000/admin/

---

## Схема подключения

```
React (localhost:5173)
        │  HTTP + JSON
        ▼
Django API (localhost:8000)
        ▼
PostgreSQL (localhost:5432, БД soundmate)
```
