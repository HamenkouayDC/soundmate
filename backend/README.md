# Backend — Soundmate API

Django + DRF + PostgreSQL.

## Версии (одинаковые у обоих backend)

| Инструмент | Версия |
|------------|--------|
| Python | **3.12.x** |
| PostgreSQL | **18.x** (одинаковая у обоих) |
| Django | 5.x (из `requirements.txt`) |

Проверка: `python --version` и `psql --version`.

Docker в разработке **не используем** — только Python + PostgreSQL на машине.

## Локальная разработка (без Docker)

### 1. PostgreSQL

Установите [PostgreSQL](https://www.postgresql.org/download/windows/).

Создайте пользователя и БД (pgAdmin или `psql`):

```sql
CREATE USER soundmate WITH PASSWORD 'soundmate';
CREATE DATABASE soundmate OWNER soundmate;
GRANT ALL PRIVILEGES ON DATABASE soundmate TO soundmate;
```

### 2. Окружение Python

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Переменные окружения

```powershell
copy .env.example .env
```

### 4. Запуск

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Эндпоинты

| URL | Описание |
|-----|----------|
| http://localhost:8000/api/v1/health/ | Healthcheck |
| http://localhost:8000/api/docs/ | Swagger UI |
| http://localhost:8000/admin/ | Django Admin |

## Структура apps

| App | Назначение |
|-----|------------|
| `core` | Healthcheck, общие утилиты |
| `users` | Пользователи, auth |
| `profiles` | Профили пользователей |
| `music` | Music Passport, музыкальные вкусы |
| `matching` | Волна, матчи |

## Docker

`Dockerfile` и корневой `docker-compose.yml` — для отчётности по стеку. В работе не нужны.
