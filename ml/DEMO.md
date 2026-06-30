# ML — демо матчинга

Полный статус: [`ML_STATUS.md`](ML_STATUS.md)

## Что сделано

| Задача | Статус |
|--------|--------|
| Spotify + Last.fm тест | ⚠️ Last.fm ✅, Spotify ждёт Premium |
| SoundCloud заявка | ❌ заблокировано подпиской |
| Структура эмбеддинга | ✅ вектор 25 (5 audio + 20 жанров) |
| Датасет | ✅ `ml/data/demo_profiles.json` (13 персон) |
| Faiss поиск | ✅ `ml/faiss_search.py` + backend `faiss_feed.py` |
| Скоринг совместимости | ✅ `vector_utils.py` + API |
| Mood profile | ✅ `mood_profile.py` |
| Пайплайн Last.fm → БД | ✅ `pipeline.py` + `rebuild_music_profiles` |
| API ленты | ✅ `GET /api/v1/feed/` |
| Тесты | ✅ `python -m unittest discover -s tests -v` |

## Быстрый демо-скрипт (терминал)

```bash
cd ml
pip install -r requirements.txt
python -m unittest discover -s tests -v
python demo.py
```

## Демо через API

```bash
cd backend
python manage.py seed_demo_profiles
python manage.py runserver
```

Логин: `demo.rock@soundmate.local` / `demopass123`  
Запрос: `GET /api/v1/feed/` с Bearer token

**Прод:** https://team17.st.ifbest.org/api/v1/feed/

## Реальный Last.fm пользователь

1. Добавить в `backend/.env`: `LASTFM_API_KEY=...`
2. `POST /api/v1/music/connections/` с `{"provider": "lastfm", "external_user_id": "ваш_lastfm_username"}`
3. Или: `POST /api/v1/music/passport/rebuild/`

## Как объяснить на защите

1. Профиль → музыкальный вектор (жанры + audio features при Spotify)
2. Faiss ищет ближайших в 20-мерном жанровом пространстве
3. Cosine score → `compatibility_percent` в ленте
4. Spotify audio пока null — матчим по жанрам (Last.fm); код для полного вектора готов
