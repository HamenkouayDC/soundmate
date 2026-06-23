# ML-задачи недели 1 — Soundmate

Готовый код для трёх задач спринта:
1. Тест Spotify API + Last.fm API
2. Структура музыкального эмбеддинга
3. (Заявка на SoundCloud — см. отдельный файл soundcloud_application.txt, это не код)

## ВАЖНО: текущий статус Spotify (на 23.06.2026)

С февраля 2026 Spotify требует Premium-аккаунт у владельца приложения для
доступа к Web API (Development Mode). У команды Premium ни у кого нет,
поэтому **на неделе 1 рабочий режим — только Last.fm**. Код для Spotify
полностью готов (`spotify_client.py`) и заработает без изменений, как
только у кого-то в команде появится Premium — это внешнее ограничение
платформы, а не недоработка в разработке.

## Установка

```bash
cd soundmate_ml_week1
python3 -m venv venv

# Linux/macOS
source venv/bin/activate
# Windows
venv\Scripts\activate

pip install spotipy requests python-dotenv numpy
```

## Настройка ключей

1. Скопируй `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```
2. Заполни `.env` своими ключами (см. инструкцию по регистрации в Spotify
   Developer Dashboard и Last.fm выше в чате). Для текущего режима реально
   нужен только блок Last.fm — Spotify-ключи можно оставить пустыми
   до появления Premium.
3. Убедись, что `.env` добавлен в `.gitignore` — секреты не должны попасть в Git.

## Запуск (режим недели 1 — только Last.fm)

### Полный пайплайн: Last.fm -> эмбеддинг (аудио-часть = "нет данных")
```bash
python main.py
```

### Только Last.fm-клиент отдельно (топ-артисты, топ-треки, теги)
```bash
python lastfm_client.py
```

### Проверка маппинга жанров на тестовых строках
```bash
python genre_categories.py
```

### Построение эмбеддинга на синтетических данных, оба режима сразу
```bash
python build_embedding.py
```

## Запуск (когда появится Spotify Premium)

```bash
python spotify_client.py
```
При первом запуске откроется браузер — войди в Spotify и разреши доступ.
Дальше токен закэшируется в файле `.cache`.

В `main.py` внизу файла есть закомментированная функция `main_full()` —
она использует Spotify + Last.fm вместе и даёт полный вектор без "нет данных".
Когда Premium появится, достаточно раскомментировать и вызвать её вместо `main()`.

## Структура файлов

| Файл | Что делает |
|---|---|
| `spotify_client.py` | OAuth + запросы к Spotify Web API (нужен Premium, см. выше) |
| `lastfm_client.py` | Запросы к Last.fm API + адаптер `artists_with_genres` |
| `genre_categories.py` | 20 фиксированных категорий жанров + маппинг |
| `build_embedding.py` | Сборка итогового вектора длины 25, оба режима данных |
| `main.py` | Текущий рабочий пайплайн: Last.fm -> эмбеддинг |

## Решённые вопросы по сравнению с черновым обсуждением

- **indie**: решено как модификатор, не отдельная категория. `indie rock` -> rock,
  `indie pop` -> pop, голый `indie` -> `indie_alternative`. Подробное обоснование
  в docstring `genre_categories.py`.
- **Финальный список категорий (20)**: pop, rock, hip_hop, electronic, rnb,
  indie_alternative, metal, jazz, classical, folk, country, latin, reggae,
  punk, blues, soul_funk, ambient, k_pop, russian_pop_rock, other.
- **Длина вектора**: 25 (5 аудио-признаков + 20 жанровых долей).
- **Нормализация**: все компоненты в [0, 1] — необходимо для корректной
  работы L2-метрики в Faiss на неделе 2.
- **Отсутствие Spotify Premium**: аудио-часть вектора помечается как `NaN`
  ("нет данных"), а не заглушкой 0.5 — явный сигнал для Faiss-этапа, что
  эти 5 колонок нужно либо игнорировать, либо осознанно импутировать,
  когда дойдём до недели 2.

