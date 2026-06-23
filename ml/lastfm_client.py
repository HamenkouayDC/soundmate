"""
lastfm_client.py

Задача: получить топ-артистов и топ-треки тестового пользователя из Last.fm
и сравнить структуру данных со Spotify.

В отличие от Spotify, Last.fm не требует OAuth для чтения публичной статистики
пользователя — достаточно API-ключа и публичного username. Это сильно проще,
но и данных меньше: НЕТ audio features (energy, valence и т.д.), зато есть
tags — пользовательские теги, которыми сообщество размечает артистов и треки.
Tags могут частично заменить genres из Spotify, но это текстовые метки без
числовой структуры, и их нужно будет нормализовать отдельно.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://ws.audioscrobbler.com/2.0/"


def _call(method: str, **params) -> dict:
    """Базовый вызов Last.fm API: всегда GET, всегда json, всегда с api_key."""
    query = {
        "method": method,
        "api_key": os.environ["LASTFM_API_KEY"],
        "format": "json",
        **params,
    }
    response = requests.get(BASE_URL, params=query, timeout=10)
    response.raise_for_status()
    return response.json()


def fetch_top_artists(username: str, limit: int = 20) -> list[dict]:
    """
    user.getTopArtists
    Возвращает артистов с полями: name, playcount (сколько раз пользователь
    их слушал). В отличие от Spotify, здесь НЕТ поля genres у артиста напрямую —
    жанровую информацию нужно получать отдельным вызовом artist.getTopTags.
    """
    data = _call(
        "user.gettopartists",
        user=username,
        limit=limit,
        period="6month",  # аналог time_range="medium_term" у Spotify
    )
    return data["topartists"]["artist"]


def fetch_top_tracks(username: str, limit: int = 20) -> list[dict]:
    """
    user.getTopTracks
    Возвращает треки с playcount. Полей с аудио-характеристиками тут нет —
    Last.fm их never предоставлял, это принципиальное отличие от Spotify.
    """
    data = _call(
        "user.gettoptracks",
        user=username,
        limit=limit,
        period="6month",
    )
    return data["toptracks"]["track"]


def fetch_artist_tags(artist_name: str) -> list[str]:
    """
    artist.getTopTags
    Возвращает список тегов сообщества для артиста, отсортированный по весу
    (count). Например для группы может вернуться ['rock', 'alternative',
    '90s', 'british']. Это смесь жанров и не-жанровых тегов (десятилетия,
    настроение, страна) — при маппинге в категории жанра нужно отсеивать мусор.
    """
    data = _call("artist.gettoptags", artist=artist_name)
    tags = data.get("toptags", {}).get("tag", [])
    # Last.fm отдаёт count как вес тега (не нормализованный процент) —
    # берём только топ-5 самых весомых тегов на артиста, остальное шум.
    return [t["name"] for t in tags[:5]]


def artists_with_genres(artists: list[dict]) -> list[dict]:
    """
    Адаптер для build_embedding.build_user_embedding.

    Last.fm не даёт genres прямо в ответе user.getTopArtists — теги нужно
    дозапрашивать по каждому артисту отдельным вызовом (fetch_artist_tags).
    Эта функция делает это и приводит результат к универсальному формату
    [{"name": ..., "genres": [...]}], идентичному формату Spotify
    fetch_top_artists — благодаря этому build_embedding._genre_distribution
    работает одинаково независимо от того, откуда пришли артисты.

    Внимание: делает по одному HTTP-запросу на артиста (artist.getTopTags
    не поддерживает батч-запрос по нескольку артистов за раз), поэтому
    на топ-20 артистов это 20 дополнительных запросов — это нормально
    для разового теста, но при регулярном пересчёте профилей в продакшене
    стоит кэшировать теги по артисту, а не запрашивать каждый раз заново.
    """
    result = []
    for artist in artists:
        tags = fetch_artist_tags(artist["name"])
        result.append({"name": artist["name"], "genres": tags})
    return result


def run_test() -> None:
    """Прогоняет весь сценарий и печатает результат для отчёта по задаче."""
    username = os.environ["LASTFM_TEST_USERNAME"]

    print("=== Топ артистов ===")
    artists = fetch_top_artists(username)
    for a in artists[:5]:
        print(f"  {a['name']:30} playcount={a['playcount']}")
    print(f"  ... всего получено: {len(artists)} артистов\n")

    print("=== Топ треков ===")
    tracks = fetch_top_tracks(username)
    for t in tracks[:5]:
        print(f"  {t['name']:30} artist={t['artist']['name']}")
    print(f"  ... всего получено: {len(tracks)} треков\n")

    print("=== Теги артистов (аналог genres) ===")
    for a in artists[:5]:
        tags = fetch_artist_tags(a["name"])
        print(f"  {a['name']:30} tags={tags}")

    return artists, tracks


if __name__ == "__main__":
    run_test()
