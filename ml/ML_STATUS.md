# Soundmate ML — итоговый статус

Дата: 30.06.2026

## Сводка по неделям

| Неделя | Автор | Статус | Содержание |
|--------|-------|--------|------------|
| Week 1 | Team Lead (Hamenkouay) | ✅ | Эмбеддинг 25-dim, Last.fm клиент, genre map, Spotify stub |
| Week 2 | Backend + ML demo | ✅ | Faiss, demo_profiles.json, API feed, скоринг |
| Week 3 | ML завершение | ✅ | Пайплайн в прод, mood_profile, тесты, rebuild command |

---

## Что готово

### Ядро ML (`ml/`)

| Компонент | Файл | Статус |
|-----------|------|--------|
| Эмбеддинг 25-dim | `build_embedding.py` | ✅ |
| 20 жанровых категорий | `genre_categories.py` | ✅ |
| Last.fm клиент | `lastfm_client.py` | ✅ протестирован |
| Spotify клиент | `spotify_client.py` | ✅ готов (Premium + OAuth) |
| SoundCloud клиент | `soundcloud_client.py` | ✅ публичные профили |
| Faiss поиск | `faiss_search.py` | ✅ |
| Скоринг совместимости | `vector_utils.py` | ✅ |
| Демо-датасет (13 персон) | `generate_dataset.py` + `data/demo_profiles.json` | ✅ |
| Mood profile | `mood_profile.py` | ✅ |
| Пайплайн Last.fm → профиль | `pipeline.py` | ✅ |
| Терминальный демо | `demo.py` | ✅ |
| Unit-тесты | `tests/test_embedding.py` | ✅ |

### Интеграция с backend

| Компонент | Где | Статус |
|-----------|-----|--------|
| Парсинг/скоринг в API | `backend/apps/matching/embedding_utils.py` | ✅ |
| Faiss в ленте | `backend/apps/matching/faiss_feed.py` | ✅ |
| Пересборка профиля из Last.fm | `backend/apps/music/embedding_service.py` | ✅ |
| Management command | `python manage.py rebuild_music_profiles` | ✅ |
| Авто-rebuild при подключении Last.fm | `MusicConnectionSerializer.create` | ✅ |
| Ручной rebuild | `POST /api/v1/music/passport/rebuild/` | ✅ |
| Демо-seed | `python manage.py seed_demo_profiles` | ✅ |
| Feed API | `GET /api/v1/feed/` | ✅ |

---

## Как работает пайплайн

```
Last.fm username (MusicConnection.external_user_id)
    → fetch_top_artists + artist tags
    → build_user_embedding()  [25-dim vector]
    → Profile.music_embedding (JSON)
    → Profile.mood_profile (energy/valence/label)
    → MusicTaste rows (артисты с весами)
    → GET /feed/ (Faiss + compatibility_percent)
```

**Режим без Spotify:** аудио-часть вектора = `null`, матчинг по 20 жанровым признакам (cosine → 0–100%).

**Когда появится Spotify Premium:** `pipeline.build_profile_from_artists(..., audio_features=...)` даст полный вектор и mood по energy/valence.

---

## Команды

### ML (терминал)

```bash
cd ml
pip install -r requirements.txt
python -m unittest discover -s tests -v   # тесты
python generate_dataset.py                 # пересобрать demo JSON
python demo.py                             # Faiss демо в терминале
python main.py                             # Last.fm → embedding (нужен .env)
```

### Backend

```bash
cd backend
python manage.py seed_demo_profiles
python manage.py rebuild_music_profiles --email user@example.com
python manage.py rebuild_music_profiles --all
python manage.py rebuild_music_profiles --mood-only
```

### API

- `GET /api/v1/feed/` — лента с `compatibility_percent`
- `GET /api/v1/music/passport/` — жанры, артисты
- `POST /api/v1/music/passport/rebuild/` — пересборка из Last.fm

Демо: `demo.rock@soundmate.local` / `demopass123`

---

## Известные ограничения

1. **Spotify** — тимлид подключил приложение; нужны ключи в `.env` + OAuth токен пользователя (или локальный `python main.py --spotify`)
2. **SoundCloud** — тимлид подключил Artist Pro; нужны `SOUNDCLOUD_CLIENT_ID/SECRET` в `.env`
3. **Жанры** — на уровне артиста (Last.fm tags), не трека
4. **OAuth** — подключение music connections пока stub; для реальных данных Last.fm нужен реальный `external_user_id` = username
5. **Кэш тегов** — в продакшене стоит добавить кэш artist.getTopTags

---

## Для защиты / куратора

1. Профиль пользователя → музыкальный вектор (жанры + audio при наличии Spotify)
2. Faiss ищет ближайших в 20-мерном жанровом пространстве
3. Cosine similarity → `compatibility_percent` в ленте и матчах
4. Демо: 13 персон с разными жанрами, рок ближе к металу чем к джазу (тест + demo.py)

---

## Что остаётся на будущее (не блокирует MVP)

- OAuth Spotify / Яндекс / SoundCloud
- Track-level жанры
- Кэш Last.fm tags
- Wave mode ML (модель `WaveSession` есть, логики нет)
- Общий Python-пакет вместо дублирования `vector_utils` / `embedding_utils`
