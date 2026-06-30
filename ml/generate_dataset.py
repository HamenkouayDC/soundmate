"""
Генерация демо-датасета профилей для Faiss и демо куратору.
Запуск: python generate_dataset.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from build_embedding import build_user_embedding
from mood_profile import build_mood_profile
from vector_utils import embedding_to_storage, top_genre_labels

DATA_PATH = Path(__file__).parent / "data" / "demo_profiles.json"

DEMO_PERSONAS = [
    {
        "email": "demo.rock@soundmate.local",
        "display_name": "Аня — рок",
        "city": "Москва",
        "birth_date": "1998-03-14",
        "bio": "Классический и альтернативный рок.",
        "artists": [
            {"name": "Nirvana", "genres": ["grunge", "rock"]},
            {"name": "Arctic Monkeys", "genres": ["indie rock", "rock"]},
            {"name": "Кино", "genres": ["русский рок", "post-punk"]},
        ],
        "audio": [
            {"energy": 0.85, "valence": 0.45, "tempo": 140, "danceability": 0.5, "acousticness": 0.1},
            {"energy": 0.8, "valence": 0.55, "tempo": 128, "danceability": 0.65, "acousticness": 0.08},
        ],
    },
    {
        "email": "demo.metal@soundmate.local",
        "display_name": "Макс — метал",
        "bio": "Heavy и alternative metal.",
        "artists": [
            {"name": "Metallica", "genres": ["metal", "thrash metal"]},
            {"name": "Slipknot", "genres": ["nu metal", "metal"]},
            {"name": "Rammstein", "genres": ["industrial metal", "metal"]},
        ],
        "audio": [
            {"energy": 0.95, "valence": 0.35, "tempo": 150, "danceability": 0.45, "acousticness": 0.02},
            {"energy": 0.9, "valence": 0.3, "tempo": 132, "danceability": 0.4, "acousticness": 0.01},
        ],
    },
    {
        "email": "demo.pop@soundmate.local",
        "display_name": "Катя — поп",
        "bio": "Поп и инди-поп.",
        "artists": [
            {"name": "Dua Lipa", "genres": ["pop", "dance pop"]},
            {"name": "Lorde", "genres": ["art pop", "indie pop"]},
            {"name": "Zemfira", "genres": ["русский поп", "rock"]},
        ],
        "audio": [
            {"energy": 0.7, "valence": 0.75, "tempo": 118, "danceability": 0.8, "acousticness": 0.12},
            {"energy": 0.65, "valence": 0.6, "tempo": 105, "danceability": 0.7, "acousticness": 0.2},
        ],
    },
    {
        "email": "demo.hiphop@soundmate.local",
        "display_name": "Денис — хип-хоп",
        "bio": "Русский и западный rap.",
        "artists": [
            {"name": "Eminem", "genres": ["hip hop", "rap"]},
            {"name": "Oxxxymiron", "genres": ["russian hip hop", "rap"]},
            {"name": "Travis Scott", "genres": ["trap", "hip hop"]},
        ],
        "audio": [
            {"energy": 0.75, "valence": 0.4, "tempo": 95, "danceability": 0.85, "acousticness": 0.05},
            {"energy": 0.8, "valence": 0.35, "tempo": 88, "danceability": 0.82, "acousticness": 0.04},
        ],
    },
    {
        "email": "demo.electronic@soundmate.local",
        "display_name": "Ира — электроника",
        "bio": "House, techno, ambient.",
        "artists": [
            {"name": "Daft Punk", "genres": ["electronic", "house"]},
            {"name": "Aphex Twin", "genres": ["idm", "electronic"]},
            {"name": "Bonobo", "genres": ["downtempo", "electronic"]},
        ],
        "audio": [
            {"energy": 0.6, "valence": 0.5, "tempo": 124, "danceability": 0.75, "acousticness": 0.15},
            {"energy": 0.55, "valence": 0.45, "tempo": 110, "danceability": 0.7, "acousticness": 0.25},
        ],
    },
    {
        "email": "demo.jazz@soundmate.local",
        "display_name": "Олег — джаз",
        "bio": "Smooth jazz и soul.",
        "artists": [
            {"name": "Miles Davis", "genres": ["jazz", "cool jazz"]},
            {"name": "Norah Jones", "genres": ["jazz", "vocal jazz"]},
            {"name": "Jamiroquai", "genres": ["funk", "jazz funk"]},
        ],
        "audio": [
            {"energy": 0.35, "valence": 0.55, "tempo": 90, "danceability": 0.45, "acousticness": 0.55},
            {"energy": 0.4, "valence": 0.6, "tempo": 100, "danceability": 0.5, "acousticness": 0.5},
        ],
    },
    {
        "email": "demo.indie@soundmate.local",
        "display_name": "Лиза — инди",
        "bio": "Indie rock и dream pop.",
        "artists": [
            {"name": "Tame Impala", "genres": ["psychedelic rock", "indie"]},
            {"name": "The xx", "genres": ["indie pop", "dream pop"]},
            {"name": "Молчат дома", "genres": ["post-punk", "cold wave"]},
        ],
        "audio": [
            {"energy": 0.55, "valence": 0.5, "tempo": 115, "danceability": 0.55, "acousticness": 0.3},
            {"energy": 0.5, "valence": 0.45, "tempo": 108, "danceability": 0.5, "acousticness": 0.35},
        ],
    },
    {
        "email": "demo.kpop@soundmate.local",
        "display_name": "Соня — K-pop",
        "bio": "K-pop и dance pop.",
        "artists": [
            {"name": "BTS", "genres": ["k-pop", "pop"]},
            {"name": "BLACKPINK", "genres": ["k-pop", "dance pop"]},
            {"name": "TWICE", "genres": ["k-pop", "bubblegum pop"]},
        ],
        "audio": [
            {"energy": 0.85, "valence": 0.8, "tempo": 125, "danceability": 0.9, "acousticness": 0.05},
            {"energy": 0.8, "valence": 0.75, "tempo": 130, "danceability": 0.88, "acousticness": 0.04},
        ],
    },
    {
        "email": "demo.folk@soundmate.local",
        "display_name": "Пётр — фолк",
        "bio": "Акустика и авторская песня.",
        "artists": [
            {"name": "Simon & Garfunkel", "genres": ["folk", "folk rock"]},
            {"name": "Мельница", "genres": ["folk rock", "celtic"]},
            {"name": "Nick Drake", "genres": ["folk", "singer-songwriter"]},
        ],
        "audio": [
            {"energy": 0.3, "valence": 0.4, "tempo": 85, "danceability": 0.35, "acousticness": 0.85},
            {"energy": 0.35, "valence": 0.45, "tempo": 92, "danceability": 0.4, "acousticness": 0.8},
        ],
    },
    {
        "email": "demo.rnb@soundmate.local",
        "display_name": "Мила — R&B",
        "bio": "Современный R&B и neo soul.",
        "artists": [
            {"name": "SZA", "genres": ["rnb", "neo soul"]},
            {"name": "Frank Ocean", "genres": ["rnb", "alternative rnb"]},
            {"name": "The Weeknd", "genres": ["rnb", "pop"]},
        ],
        "audio": [
            {"energy": 0.5, "valence": 0.35, "tempo": 98, "danceability": 0.65, "acousticness": 0.2},
            {"energy": 0.55, "valence": 0.4, "tempo": 105, "danceability": 0.7, "acousticness": 0.15},
        ],
    },
    {
        "email": "demo.latin@soundmate.local",
        "display_name": "Карлос — латино",
        "bio": "Reggaeton и latin pop.",
        "artists": [
            {"name": "Bad Bunny", "genres": ["reggaeton", "latin"]},
            {"name": "Shakira", "genres": ["latin pop", "pop"]},
            {"name": "Rosalía", "genres": ["latin", "flamenco"]},
        ],
        "audio": [
            {"energy": 0.8, "valence": 0.7, "tempo": 96, "danceability": 0.9, "acousticness": 0.1},
            {"energy": 0.75, "valence": 0.65, "tempo": 100, "danceability": 0.85, "acousticness": 0.12},
        ],
    },
    {
        "email": "demo.ambient@soundmate.local",
        "display_name": "Ника — ambient",
        "bio": "Ambient и lo-fi.",
        "artists": [
            {"name": "Brian Eno", "genres": ["ambient", "electronic"]},
            {"name": "Tycho", "genres": ["ambient", "chillwave"]},
            {"name": "Nujabes", "genres": ["jazz hop", "lo-fi"]},
        ],
        "audio": [
            {"energy": 0.25, "valence": 0.5, "tempo": 80, "danceability": 0.4, "acousticness": 0.6},
            {"energy": 0.3, "valence": 0.55, "tempo": 88, "danceability": 0.45, "acousticness": 0.55},
        ],
    },
]


def build_persona(persona: dict, index: int = 0, lastfm_only: bool = False) -> dict:
    artists = persona["artists"]
    audio = None if lastfm_only else persona.get("audio")
    vector = build_user_embedding(artists, audio)
    storage = embedding_to_storage(vector)

    cities = [
        "Москва",
        "Санкт-Петербург",
        "Казань",
        "Новосибирск",
        "Екатеринбург",
        "Краснодар",
        "Самара",
        "Воронеж",
        "Ростов-на-Дону",
        "Нижний Новгород",
        "Тюмень",
        "Уфа",
    ]
    birth_year = 1994 + (index % 10)
    birth_month = (index % 12) + 1
    birth_day = (index % 27) + 1

    return {
        **{k: v for k, v in persona.items() if k != "audio"},
        "city": persona.get("city", cities[index % len(cities)]),
        "birth_date": persona.get(
            "birth_date",
            f"{birth_year}-{birth_month:02d}-{birth_day:02d}",
        ),
        "artists": artists,
        "music_embedding": storage,
        "mood_profile": build_mood_profile(vector, source="demo" if not lastfm_only else "lastfm"),
        "top_genres": top_genre_labels(vector),
        "mode": "lastfm_only" if lastfm_only else "full",
    }


def main() -> None:
    profiles = [build_persona(p, index=index) for index, p in enumerate(DEMO_PERSONAS)]
    profiles.append(build_persona(DEMO_PERSONAS[0], index=len(DEMO_PERSONAS), lastfm_only=True))
    profiles[-1]["email"] = "demo.lastfm@soundmate.local"
    profiles[-1]["display_name"] = "Вика — Last.fm only"
    profiles[-1]["bio"] = "Демо без Spotify: только жанры из Last.fm."

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(json.dumps(profiles, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Сохранено {len(profiles)} профилей -> {DATA_PATH}")


if __name__ == "__main__":
    main()
