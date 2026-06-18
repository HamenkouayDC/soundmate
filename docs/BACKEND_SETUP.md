# Soundmate — окружение backend

Команда backend (2 человека) работает **без Docker**.

## Стек на машине

| Компонент | Версия |
|-----------|--------|
| Python | 3.12.x |
| PostgreSQL | 18.x (одинаковая у обоих) |
| Django | 5.x |

## Настройка (один раз)

1. Установить Python 3.12 и PostgreSQL 18.
2. Создать БД и пользователя (см. `backend/README.md`).
3. В `backend/`:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   copy .env.example .env
   python manage.py migrate
   ```

## Ежедневный запуск

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

## Docker в репозитории

`docker-compose.yml` и `Dockerfile` указаны в проекте **для отчётности** (технический стек в документации). В разработке не применяются.

## Синхронизация между backend-разработчиками

- Одинаковые версии Python и PostgreSQL.
- Один `requirements.txt` — после изменений: `pip install -r requirements.txt`.
- Миграции в git — `python manage.py makemigrations` / `migrate` у обоих после pull.
- Секреты только в `.env` (в git не коммитим).
