"""Интеграция ML-пайплайна с Django."""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

from django.conf import settings

from apps.music.models import MusicConnection, MusicProvider, MusicTaste
from apps.profiles.models import Profile

logger = logging.getLogger(__name__)

ML_ROOT = Path(settings.BASE_DIR).parent / "ml"


def _ensure_ml_path() -> None:
    ml_path = str(ML_ROOT)
    if ml_path not in sys.path:
        sys.path.insert(0, ml_path)


def _import_pipeline():
    _ensure_ml_path()
    from pipeline import (
        MusicProfileResult,
        build_profile_from_artists,
        build_profile_from_lastfm,
        build_profile_from_soundcloud,
        build_profile_from_spotify,
    )

    return (
        MusicProfileResult,
        build_profile_from_artists,
        build_profile_from_lastfm,
        build_profile_from_soundcloud,
        build_profile_from_spotify,
    )


def _import_mood_builder():
    _ensure_ml_path()
    from mood_profile import build_mood_profile
    from vector_utils import parse_embedding

    return build_mood_profile, parse_embedding


def sync_music_tastes(profile: Profile, artists: list[dict], default_source: str) -> None:
    MusicTaste.objects.filter(profile=profile).delete()
    for artist in artists:
        source = artist.get("source", default_source)
        provider = source if source in MusicProvider.values else default_source
        MusicTaste.objects.create(
            profile=profile,
            source=provider,
            external_artist_id=artist["external_artist_id"],
            artist_name=artist["name"],
            weight=float(artist.get("weight", 1.0)),
        )


def apply_music_profile_result(profile: Profile, result, default_source: str = MusicProvider.LASTFM) -> None:
    profile.music_embedding = result.embedding
    profile.mood_profile = result.mood_profile
    profile.save(update_fields=["music_embedding", "mood_profile", "updated_at"])
    sync_music_tastes(profile, result.artists, default_source=default_source)


def rebuild_profile_from_lastfm(profile: Profile, username: str):
    _, _, build_profile_from_lastfm, _, _ = _import_pipeline()
    result = build_profile_from_lastfm(username)
    apply_music_profile_result(profile, result, default_source=MusicProvider.LASTFM)
    return result


def rebuild_profile_from_spotify_token(profile: Profile, access_token: str):
    _ensure_ml_path()
    from spotify_client import get_spotify_client_from_token

    _, _, _, _, build_profile_from_spotify = _import_pipeline()
    sp = get_spotify_client_from_token(access_token)
    result = build_profile_from_spotify(sp)
    apply_music_profile_result(profile, result, default_source=MusicProvider.SPOTIFY)
    return result


def rebuild_profile_from_spotify_env(profile: Profile):
    """Локальная разработка: spotipy OAuth + .cache (ключи в .env)."""
    _ensure_ml_path()
    from spotify_client import get_spotify_client

    _, _, _, _, build_profile_from_spotify = _import_pipeline()
    sp = get_spotify_client()
    result = build_profile_from_spotify(sp)
    apply_music_profile_result(profile, result, default_source=MusicProvider.SPOTIFY)
    return result


def rebuild_profile_from_soundcloud(profile: Profile, username: str):
    _, _, _, build_profile_from_soundcloud, _ = _import_pipeline()
    result = build_profile_from_soundcloud(username)
    apply_music_profile_result(profile, result, default_source=MusicProvider.SOUNDCLOUD)
    return result


def rebuild_profile_from_demo_artists(
    profile: Profile,
    artists: list[dict],
    audio_features: list[dict] | None = None,
):
    _, build_profile_from_artists, _, _, _ = _import_pipeline()
    result = build_profile_from_artists(artists, audio_features=audio_features, source="demo")
    apply_music_profile_result(profile, result, default_source=MusicProvider.LASTFM)
    return result


def rebuild_profile_mood_from_embedding(profile: Profile) -> None:
    build_mood_profile, parse_embedding = _import_mood_builder()
    vector = parse_embedding(profile.music_embedding)
    if vector is None:
        return
    source = "demo"
    if profile.mood_profile and isinstance(profile.mood_profile, dict):
        source = profile.mood_profile.get("source", source)
    profile.mood_profile = build_mood_profile(vector, source=source)
    profile.save(update_fields=["mood_profile", "updated_at"])


def _try_spotify(profile: Profile, connection: MusicConnection) -> bool:
    tokens = connection.tokens_encrypted or {}
    access_token = tokens.get("access_token")
    if access_token:
        rebuild_profile_from_spotify_token(profile, access_token)
        return True

    if os.environ.get("SPOTIFY_CLIENT_ID") and os.environ.get("SPOTIFY_CLIENT_SECRET"):
        rebuild_profile_from_spotify_env(profile)
        return True

    return False


def rebuild_profile_from_connections(profile: Profile) -> bool:
    connections = MusicConnection.objects.filter(profile=profile, is_active=True).order_by("-connected_at")

    spotify = connections.filter(provider=MusicProvider.SPOTIFY).first()
    if spotify:
        try:
            if _try_spotify(profile, spotify):
                return True
        except Exception:
            logger.exception("Spotify rebuild failed for profile %s", profile.id)

    lastfm = connections.filter(provider=MusicProvider.LASTFM).first()
    if lastfm:
        try:
            rebuild_profile_from_lastfm(profile, lastfm.external_user_id)
            return True
        except Exception:
            logger.exception("Last.fm rebuild failed for profile %s", profile.id)

    soundcloud = connections.filter(provider=MusicProvider.SOUNDCLOUD).first()
    if soundcloud:
        try:
            rebuild_profile_from_soundcloud(profile, soundcloud.external_user_id)
            return True
        except Exception:
            logger.exception("SoundCloud rebuild failed for profile %s", profile.id)

    return False
