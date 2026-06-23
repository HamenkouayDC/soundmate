"""
build_embedding.py

Финальная структура музыкального эмбеддинга пользователя.

Состав вектора (длина 25):
  5 аудио-признаков (из Spotify audio features), нормализованных в [0, 1]:
    - energy
    - valence
    - tempo_norm      (tempo / 200, ограничено сверху единицей)
    - danceability
    - acousticness

  20 жанровых признаков (доля каждой из фиксированных категорий
  genre_categories.GENRE_CATEGORIES в общем жанровом профиле пользователя,
  считается по top-артистам, сумма по всем 20 равна 1.0):
    - genre_pop, genre_rock, genre_hip_hop, ... genre_other

Итог: вектор длины 5 + 20 = 25, все компоненты в диапазоне [0, 1].
Эта фиксированная длина и есть то, что пойдёт в Faiss index (Week 2) —
каждый пользователь превращается в точку в 25-мерном пространстве,
и Faiss ищет ближайшие точки.

Почему нормализация именно так:
  - Faiss из коробки лучше всего работает с L2-метрикой на признаках одного
    масштаба. Если tempo (значения ~60-200) не нормализовать, оно задавит
    своим масштабом признаки 0-1 (energy, valence и т.д.) при подсчёте
    расстояния. Поэтому ВСЕ 25 компонент приводятся к диапазону [0, 1] —
    это инвариант, который должен соблюдаться для любого будущего признака,
    добавленного в вектор.

ВРЕМЕННОЕ ОГРАНИЧЕНИЕ (с 23.06.2026):
  Spotify с февраля 2026 требует Premium-аккаунт у владельца приложения для
  доступа к Web API (audio features и top items). У команды Premium ни у кого
  нет, поэтому на неделе 1 аудио-часть вектора (5 полей) недоступна.
  Жанровая часть (20 полей) строится из Last.fm tags вместо Spotify genres —
  формат входных данных идентичен ([{"name": ..., "genres": [...]}]), поэтому
  _genre_distribution не меняется, меняется только источник на входе
  (см. lastfm_to_artist_format в lastfm_client.py).
  Аудио-часть в этом режиме помечается как отсутствующая явно (None),
  а не заглушкой 0.5 — чтобы было видно на уровне данных, что эти 5 чисел
  пока не измерены, а не "усреднены в ноль". Когда появится Spotify-доступ,
  build_user_embedding можно вызывать как раньше, без изменений интерфейса.
"""

import numpy as np
from genre_categories import GENRE_CATEGORIES, map_genre_to_category

# Порядок полей итогового вектора — фиксирован, чтобы Faiss и любой код,
# читающий эмбеддинг, всегда понимали, какая позиция за что отвечает.
AUDIO_FIELDS = ["energy", "valence", "tempo_norm", "danceability", "acousticness"]
EMBEDDING_FIELDS = AUDIO_FIELDS + [f"genre_{c}" for c in GENRE_CATEGORIES]
EMBEDDING_LENGTH = len(EMBEDDING_FIELDS)  # 5 + 20 = 25


def _average_audio_features(audio_features: list[dict] | None) -> dict:
    """
    Усредняет audio features по всем трекам пользователя.
    tempo нормализуется делением на 200 (верхняя граница типичного BPM
    для популярной музыки) и обрезается до 1.0, если попался совсем
    быстрый трек (drum'n'bass, hardcore и т.п. могут превышать 200 BPM).

    audio_features=None означает "источник недоступен" (например, нет
    Spotify Premium и используется только Last.fm) — это отличается от
    audio_features=[] ("Spotify подключён, но треков нет"). В обоих случаях
    возвращаем None по всем полям: лучше явно показать отсутствие данных
    дальше по пайплайну, чем подставлять нейтральное значение 0.5, которое
    выглядело бы как реально измеренный средний пользователь.
    """
    if not audio_features:
        return {field: None for field in AUDIO_FIELDS}

    energy = np.mean([f["energy"] for f in audio_features])
    valence = np.mean([f["valence"] for f in audio_features])
    tempo_raw = np.mean([f["tempo"] for f in audio_features])
    danceability = np.mean([f["danceability"] for f in audio_features])
    acousticness = np.mean([f["acousticness"] for f in audio_features])

    return {
        "energy": float(energy),
        "valence": float(valence),
        "tempo_norm": float(min(tempo_raw / 200.0, 1.0)),
        "danceability": float(danceability),
        "acousticness": float(acousticness),
    }


def _genre_distribution(genre_lists: list[list[str]]) -> dict:
    """
    Принимает список списков сырых жанровых строк — по одному списку
    на каждого артиста, например:
        [["indie pop", "art pop"], ["uk rock", "post-punk"], ...]
    Каждый артист даёт "голоса" своим жанрам, голоса маппятся в 20 категорий,
    затем считается доля каждой категории от общего числа голосов.

    Решение взвешивания: каждый артист даёт ОДИН голос за КАЖДУЮ свою
    уникальную категорию (не за каждый отдельный жанр-тег). Так артист
    с тегами ["indie pop", "art pop"] (оба маппятся в pop) даёт один голос
    в pop, а не два — иначе артисты с длинным списком жанровых тегов
    получали бы незаслуженно больший вес в распределении.
    """
    category_votes = {c: 0 for c in GENRE_CATEGORIES}
    total_votes = 0

    for raw_genres in genre_lists:
        categories_for_this_artist = {
            map_genre_to_category(g) for g in raw_genres
        }
        if not categories_for_this_artist:
            categories_for_this_artist = {"other"}
        for category in categories_for_this_artist:
            category_votes[category] += 1
            total_votes += 1

    if total_votes == 0:
        # Нет жанровых данных вообще — всё в other, а не равномерно по всем
        # 20 категориям (равномерное распределение ошибочно намекало бы,
        # что у пользователя широкий вкус, хотя у нас просто нет данных).
        category_votes["other"] = 1
        total_votes = 1

    return {
        f"genre_{c}": category_votes[c] / total_votes
        for c in GENRE_CATEGORIES
    }


def build_user_embedding(
    artists: list[dict],
    audio_features: list[dict] | None = None,
) -> np.ndarray:
    """
    Главная функция задачи. Принимает данные об артистах (формат:
    [{"name": ..., "genres": [...]}, ...] — подходит и для Spotify
    fetch_top_artists, и для lastfm_client.artists_with_genres) и
    опционально audio features из Spotify.

    Использование с полным набором данных (когда есть Spotify Premium):
        from spotify_client import get_spotify_client, fetch_top_artists, \\
            fetch_top_tracks, fetch_audio_features

        sp = get_spotify_client()
        artists = fetch_top_artists(sp)
        tracks = fetch_top_tracks(sp)
        features = fetch_audio_features(sp, [t["id"] for t in tracks])
        embedding = build_user_embedding(artists, features)

    Использование в режиме "только Last.fm" (текущий режим недели 1,
    Spotify Premium недоступен):
        from lastfm_client import fetch_top_artists, artists_with_genres

        raw_artists = fetch_top_artists(username)
        artists = artists_with_genres(raw_artists)
        embedding = build_user_embedding(artists)  # audio_features не передаём

    В режиме без audio_features первые 5 компонент вектора будут np.nan —
    это сознательный сигнал "не измерено", а не 0 или 0.5. Faiss и любой
    код, строящий индекс, должен будет либо игнорировать эти 5 колонок
    до появления Spotify-доступа, либо явно решить, чем их заполнить
    (например, импутация средним по всем пользователям) — это отдельное
    решение, которое нельзя принимать молча внутри этой функции.
    """
    audio_part = _average_audio_features(audio_features)
    genre_lists = [a.get("genres", []) for a in artists]
    genre_part = _genre_distribution(genre_lists)

    combined = {**audio_part, **genre_part}
    # None -> np.nan: numpy-массив должен быть float, а не object,
    # иначе любые дальнейшие векторные операции (Faiss, нормализация) сломаются.
    vector = np.array(
        [
            np.nan if combined[field] is None else combined[field]
            for field in EMBEDDING_FIELDS
        ],
        dtype=np.float32,
    )
    return vector


def describe_embedding(vector: np.ndarray) -> None:
    """Печатает вектор по полям — для отчёта и проверки глазами."""
    for field, value in zip(EMBEDDING_FIELDS, vector):
        if np.isnan(value):
            print(f"  {field:25} нет данных")
        else:
            print(f"  {field:25} {value:.3f}")


if __name__ == "__main__":
    # Демонстрация 1: полный набор данных (Spotify Premium есть) —
    # синтетические данные, чтобы показать, что функция работает
    # ещё ДО подключения реального API.
    fake_artists = [
        {"name": "Tame Impala", "genres": ["indie pop", "psychedelic rock"]},
        {"name": "Mac Miller", "genres": ["hip hop", "rap"]},
        {"name": "Король и Шут", "genres": ["русский рок", "punk"]},
        {"name": "Boards of Canada", "genres": ["ambient", "electronic"]},
    ]
    fake_audio_features = [
        {"energy": 0.7, "valence": 0.6, "tempo": 120, "danceability": 0.65, "acousticness": 0.1},
        {"energy": 0.8, "valence": 0.5, "tempo": 95, "danceability": 0.8, "acousticness": 0.05},
        {"energy": 0.9, "valence": 0.4, "tempo": 160, "danceability": 0.5, "acousticness": 0.02},
    ]

    print("=== Режим 1: Spotify + audio features (нужен Premium) ===")
    embedding_full = build_user_embedding(fake_artists, fake_audio_features)
    print(f"Длина вектора: {len(embedding_full)} (ожидается {EMBEDDING_LENGTH})\n")
    describe_embedding(embedding_full)

    print("\n=== Режим 2: только Last.fm (текущий режим недели 1) ===")
    # audio_features не передаём — аудио-часть будет "нет данных"
    embedding_lastfm_only = build_user_embedding(fake_artists)
    describe_embedding(embedding_lastfm_only)
