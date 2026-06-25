# Soundmate — локальный backend для Frontend (Windows)

Пошаговая инструкция: поднять Django API у себя на ПК для работы с React.

**Нужно:** Python **3.12**, PostgreSQL **18**, Git.

---

## Часть 0. Клонировать репозиторий

```powershell
git clone https://github.com/HamenkouayDC/soundmate.git
cd soundmate
```

---

## Часть 1. PostgreSQL 18

### 1.1 Установка

1. Скачать: https://www.postgresql.org/download/windows/
2. Установить PostgreSQL **18**
3. Запомнить пароль суперпользователя **`postgres`**
4. Порт: **`5432`** (по умолчанию)
5. **Stack Builder** в конце — можно отменить

### 1.2 Создать БД в pgAdmin

1. Открыть **pgAdmin 4**
2. Подключиться к серверу (пароль `postgres` при установке)
   - Host: `127.0.0.1` (если `localhost` ругается)
3. **Tools → Query Tool** (или правый клик по серверу → Query Tool)
4. Выполнить **по одному запросу** (F5):

```sql
CREATE USER soundmate WITH PASSWORD 'soundmate';
```

```sql
CREATE DATABASE soundmate OWNER soundmate;
```

```sql
GRANT ALL PRIVILEGES ON DATABASE soundmate TO soundmate;
```

5. **Refresh** — должны появиться БД `soundmate` и пользователь `soundmate`

> Пароль `soundmate` — для dev. Свой пароль можно, но тогда пропиши его в `.env`.

---

## Часть 2. Python 3.12

### 2.1 Установка

Скачать: https://www.python.org/downloads/release/python-31210/

- Галочка **Add python.exe to PATH**
- Python **3.14 не использовать** для backend — только **3.12**

### 2.2 Проверка

```powershell
py -0p
```

Должен быть `3.12`. Проверка:

```powershell
py -3.12 --version
```

Ожидается: `Python 3.12.x`

---

## Часть 3. Backend (Django)

Все команды из папки `soundmate\backend`:

```powershell
cd backend
```

### 3.1 Виртуальное окружение (только Python 3.12!)

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe --version
```

Должно быть **3.12.x**, не 3.14.

### 3.2 Зависимости

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 3.3 Файл `.env`

```powershell
copy .env.example .env
```

Открыть `.env` в блокноте. Минимум:

```env
POSTGRES_DB=soundmate
POSTGRES_USER=soundmate
POSTGRES_PASSWORD=soundmate
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Если при создании БД другой пароль — укажи его в `POSTGRES_PASSWORD`.

### 3.4 Миграции и админ

```powershell
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py createsuperuser
```

`createsuperuser`:
- **Email** — твой email (это логин)
- **Password** — два раза (символы не видны — нормально)

### 3.5 Запуск API

```powershell
.\.venv\Scripts\python.exe manage.py runserver
```

Окно **не закрывать** — пока сервер работает, API доступен.

---

## Часть 4. Проверка

В браузере:

| URL | Ожидание |
|-----|----------|
| http://localhost:8000/api/v1/health/ | `{"status":"ok",...}` |
| http://localhost:8000/api/docs/ | Swagger UI |
| http://localhost:8000/admin/ | Вход по email из createsuperuser |

---

## Часть 5. Подключение React (Frontend)

В проекте frontend создай/открой `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Базовый URL для запросов:

```
http://localhost:8000/api/v1/
```

### Auth flow

1. **Регистрация** — `POST /auth/register/`
   ```json
   { "email": "...", "password": "мин 8 символов", "display_name": "..." }
   ```
   Ответ: user + profile, **без токенов**.

2. **Логин** — `POST /auth/login/`
   ```json
   { "email": "...", "password": "..." }
   ```
   Ответ: `access`, `refresh`.

3. **Текущий user** — `GET /users/me/`
   ```
   Authorization: Bearer <access>
   ```

4. **Обновить токен** — `POST /auth/refresh/`
   ```json
   { "refresh": "..." }
   ```

CORS уже разрешён для `http://localhost:5173` (Vite).

---

## Ежедневная работа

```powershell
cd путь\к\soundmate\backend
.\.venv\Scripts\python.exe manage.py runserver
```

В другом терминале — frontend:

```powershell
cd frontend
npm install
npm run dev
```

После `git pull`:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
```

---

## Частые проблемы

### PowerShell: `Activate.ps1` заблокирован

Не используй активацию venv. Всегда:

```powershell
.\.venv\Scripts\python.exe manage.py <команда>
```

### `CREATE DATABASE` — ошибка про транзакцию

В pgAdmin выполняй SQL **по одному** запросу, не все сразу.

### Пароль в SQL без кавычек

Нужно: `PASSWORD 'soundmate'` — с **одинарными кавычками**.

### `python` запускает 3.14

Используй только `py -3.12` и `.\.venv\Scripts\python.exe`.

### Порт 8000 занят

```powershell
.\.venv\Scripts\python.exe manage.py runserver 8001
```

Тогда в frontend: `VITE_API_URL=http://localhost:8001/api/v1`

---

## Чего в API пока нет

- PATCH профиля
- Лента, лайки, скипы, матчи

Есть в Swagger: health, register, login, refresh, me.

---

## Ссылки

- Репо: https://github.com/HamenkouayDC/soundmate
- Общий handoff: `docs/BACKEND_HANDOFF.md`
