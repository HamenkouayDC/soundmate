# Soundmate — деплой на VDS (team17)

**Домен:** https://team17.st.ifbest.org  
**API:** https://team17.st.ifbest.org/api/v1/  
**Swagger:** https://team17.st.ifbest.org/api/docs/

---

## SSH

```powershell
ssh -i C:\Users\<USER>\.ssh\team17_id_rsa -p 2217 team17@194.190.136.78
```

Ключ: `team17_id_rsa` (без `.txt`), права только для текущего пользователя.

---

## Как устроено

- Каждая команда — отдельный контейнер Ubuntu 24.04
- Внешний Nginx куратора проксирует `team17.st.ifbest.org` → **порт 80** внутри контейнера
- Docker внутри контейнера **нет** — приложение через **venv + gunicorn**
- БД на VDS: **SQLite** (`backend/data/db.sqlite3`) — PostgreSQL в контейнере недоступен
- Локально у разработчиков по-прежнему **PostgreSQL**

---

## Первый деплой / обновление

На сервере:

```bash
bash ~/deploy_vds.sh
```

Или вручную из репо:

```bash
cd ~/soundmate/repo
git pull
bash scripts/deploy_vds.sh
```

---

## Проверка

```bash
curl -s http://127.0.0.1/api/v1/health/
```

Снаружи: https://team17.st.ifbest.org/api/v1/health/

---

## Логи и перезапуск

```bash
tail -f ~/soundmate/gunicorn.log
kill $(cat ~/soundmate/gunicorn.pid)
bash ~/deploy_vds.sh
```

---

## Frontend

**Локальная разработка** — как раньше:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

**Прод / демо куратору:**
```env
VITE_API_URL=https://team17.st.ifbest.org/api/v1
```

CORS настроен для обоих вариантов.
