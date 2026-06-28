# ML — демо матчинга (Week 2, срочно)

## Что сделано за 2 недели

| Задача | Статус |
|--------|--------|
| Spotify + Last.fm тест | ⚠️ Last.fm ✅, Spotify ждёт Premium |
| SoundCloud заявка | ❌ заблокировано подпиской |
| Структура эмбеддинга | ✅ вектор 25 (5 audio + 20 жанров) |
| **Датасет треков/жанров** | ✅ `ml/data/demo_profiles.json` (13 персон) |
| **Faiss поиск** | ✅ `ml/faiss_search.py` |
| **Скоринг совместимости** | ✅ `ml/vector_utils.py` + API |
| **API ленты** | ✅ `GET /api/v1/matching/feed/` |

## Быстрый демо-скрипт (терминал)

```bash
cd ml
pip install -r requirements.txt
python demo.py
```

## Демо через API (для куратора)

```bash
cd backend
python manage.py seed_demo_profiles
python manage.py runserver
```

Логин: `demo.rock@soundmate.local` / `demopass123`  
Запрос: `GET /api/v1/matching/feed/` с Bearer token

**Прод:** https://team17.st.ifbest.org/api/v1/matching/feed/

## Как объяснить на защите

1. Профиль → музыкальный вектор (жанры + audio features)
2. Faiss ищет ближайших в 20-мерном жанровом пространстве
3. Cosine score → процент совместимости в ленте
4. Spotify audio пока NaN — матчим по жанрам (Last.fm)
