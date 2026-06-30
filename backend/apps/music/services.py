"""Музыкальный паспорт пользователя."""

from __future__ import annotations

from apps.matching.embedding_utils import parse_embedding, top_genre_labels
from apps.music.models import MusicTaste
from apps.profiles.models import Profile


def build_music_passport(profile: Profile) -> dict:
    vector = parse_embedding(profile.music_embedding)
    genres = top_genre_labels(vector) if vector is not None else []

    tastes = MusicTaste.objects.filter(profile=profile).order_by("-weight")
    artists = [
        {
            "name": taste.artist_name,
            "weight": taste.weight,
            "source": taste.source,
        }
        for taste in tastes
    ]

    top_tracks: list[dict] = []
    if profile.preview_track_url:
        top_tracks.append(
            {
                "title": "Preview",
                "artist": artists[0]["name"] if artists else "",
                "url": profile.preview_track_url,
            }
        )
    elif artists:
        for index, artist in enumerate(artists[:3], start=1):
            top_tracks.append(
                {
                    "title": f"Top track #{index}",
                    "artist": artist["name"],
                    "url": "",
                }
            )

    return {
        "genres": genres,
        "artists": artists,
        "top_tracks": top_tracks,
    }
