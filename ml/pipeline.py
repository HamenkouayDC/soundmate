"""
Пайплайн построения музыкального профиля пользователя.

Last.fm (рабочий режим) -> embedding + mood + список артистов для БД.
Spotify (когда появится Premium) -> полный вектор с audio features.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from build_embedding import build_user_embedding
from lastfm_client import artists_with_genres, fetch_top_artists, fetch_top_tracks
from mood_profile import build_mood_profile
from spotify_client import fetch_audio_features, fetch_top_artists as spotify_top_artists
from spotify_client import fetch_top_tracks as spotify_top_tracks
from vector_utils import embedding_to_storage, top_genre_labels


@dataclass
class MusicProfileResult:
    embedding: dict
    mood_profile: dict
    artists: list[dict]
    top_tracks: list[dict]
    top_genres: list[str]
    mode: str


def _artist_rows_from_lastfm(raw_artists: list[dict]) -> list[dict]:
    max_playcount = max((int(artist.get("playcount", 1)) for artist in raw_artists), default=1)
    rows = []
    for index, artist in enumerate(raw_artists, start=1):
        playcount = int(artist.get("playcount", 1))
        weight = round(max(1.0, (playcount / max_playcount) * 4.0 - index * 0.1), 2)
        rows.append(
            {
                "name": artist["name"],
                "external_artist_id": f"lastfm-{artist['name'].lower().replace(' ', '-')}",
                "weight": weight,
                "source": "lastfm",
            }
        )
    return rows


def _track_rows_from_lastfm(raw_tracks: list[dict], limit: int = 5) -> list[dict]:
    rows = []
    for track in raw_tracks[:limit]:
        artist_name = track.get("artist", {}).get("name", "")
        rows.append(
            {
                "title": track.get("name", ""),
                "artist": artist_name,
                "url": "",
            }
        )
    return rows


def _artist_rows_from_spotify(raw_artists: list[dict]) -> list[dict]:
    rows = []
    for index, artist in enumerate(raw_artists, start=1):
        popularity = int(artist.get("popularity", 50))
        weight = round(max(1.0, popularity / 25.0 - index * 0.05), 2)
        rows.append(
            {
                "name": artist["name"],
                "external_artist_id": f"spotify-{artist['id']}",
                "weight": weight,
                "source": "spotify",
            }
        )
    return rows


def _track_rows_from_spotify(raw_tracks: list[dict], limit: int = 5) -> list[dict]:
    rows = []
    for track in raw_tracks[:limit]:
        rows.append(
            {
                "title": track.get("name", ""),
                "artist": track["artists"][0]["name"] if track.get("artists") else "",
                "url": track.get("external_urls", {}).get("spotify", ""),
            }
        )
    return rows


def build_profile_from_spotify(sp, artist_limit: int = 20) -> MusicProfileResult:
    raw_artists = spotify_top_artists(sp, limit=artist_limit)
    artists = [{"name": artist["name"], "genres": artist.get("genres", [])} for artist in raw_artists]
    raw_tracks = spotify_top_tracks(sp, limit=20)
    track_ids = [track["id"] for track in raw_tracks if track.get("id")]
    audio_features = fetch_audio_features(sp, track_ids) if track_ids else None

    vector = build_user_embedding(artists, audio_features)
    return MusicProfileResult(
        embedding=embedding_to_storage(vector),
        mood_profile=build_mood_profile(vector, source="spotify"),
        artists=_artist_rows_from_spotify(raw_artists),
        top_tracks=_track_rows_from_spotify(raw_tracks),
        top_genres=top_genre_labels(vector),
        mode="full",
    )


def build_profile_from_soundcloud(username: str, track_limit: int = 20) -> MusicProfileResult:
    from soundcloud_client import (
        fetch_top_tracks_formatted,
        fetch_user_tracks,
        get_app_access_token,
        resolve_username,
        tracks_to_artists,
    )

    token = get_app_access_token()
    user = resolve_username(username, token)
    tracks = fetch_user_tracks(int(user["id"]), token, limit=track_limit)
    artists = tracks_to_artists(tracks)

    vector = build_user_embedding(artists)
    return MusicProfileResult(
        embedding=embedding_to_storage(vector),
        mood_profile=build_mood_profile(vector, source="soundcloud"),
        artists=[
            {
                "name": artist["name"],
                "external_artist_id": f"soundcloud-{artist['name'].lower().replace(' ', '-')}",
                "weight": max(1.0, 4.0 - index * 0.4),
                "source": "soundcloud",
            }
            for index, artist in enumerate(artists, start=1)
        ],
        top_tracks=fetch_top_tracks_formatted(tracks),
        top_genres=top_genre_labels(vector),
        mode="soundcloud_only",
    )


def build_profile_from_lastfm(username: str, artist_limit: int = 20) -> MusicProfileResult:
    raw_artists = fetch_top_artists(username, limit=artist_limit)
    artists_with_tags = artists_with_genres(raw_artists)
    raw_tracks = fetch_top_tracks(username, limit=10)

    vector = build_user_embedding(artists_with_tags)
    return MusicProfileResult(
        embedding=embedding_to_storage(vector),
        mood_profile=build_mood_profile(vector, source="lastfm"),
        artists=_artist_rows_from_lastfm(raw_artists),
        top_tracks=_track_rows_from_lastfm(raw_tracks),
        top_genres=top_genre_labels(vector),
        mode="lastfm_only",
    )


def build_profile_from_artists(
    artists: list[dict],
    audio_features: list[dict] | None = None,
    source: str = "demo",
) -> MusicProfileResult:
    vector = build_user_embedding(artists, audio_features)
    mode = "full" if audio_features else "lastfm_only"
    return MusicProfileResult(
        embedding=embedding_to_storage(vector),
        mood_profile=build_mood_profile(vector, source=source),
        artists=[
            {
                "name": artist["name"],
                "external_artist_id": f"demo-{artist['name'].lower().replace(' ', '-')}",
                "weight": max(1.0, 4.0 - index * 0.5),
                "source": source,
            }
            for index, artist in enumerate(artists, start=1)
        ],
        top_tracks=[],
        top_genres=top_genre_labels(vector),
        mode=mode,
    )
