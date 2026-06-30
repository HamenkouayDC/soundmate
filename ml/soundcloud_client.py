"""
SoundCloud API client (OAuth 2.1 client credentials + resolve public profile).

Для пользовательских лайков/приватного контента нужен Authorization Code + PKCE
(отдельный OAuth flow в backend). Здесь — публичные треки профиля по username.
"""

from __future__ import annotations

import base64
import os

import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN_URL = "https://secure.soundcloud.com/oauth/token"
API_BASE = "https://api.soundcloud.com"


def get_app_access_token() -> str:
    client_id = os.environ["SOUNDCLOUD_CLIENT_ID"]
    client_secret = os.environ["SOUNDCLOUD_CLIENT_SECRET"]
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    response = requests.post(
        TOKEN_URL,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
            "accept": "application/json; charset=utf-8",
        },
        data={"grant_type": "client_credentials"},
        timeout=15,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def _auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"OAuth {access_token}"}


def resolve_username(username: str, access_token: str) -> dict:
    response = requests.get(
        f"{API_BASE}/resolve",
        params={"url": f"https://soundcloud.com/{username}"},
        headers=_auth_headers(access_token),
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def fetch_user_tracks(user_id: int, access_token: str, limit: int = 20) -> list[dict]:
    response = requests.get(
        f"{API_BASE}/users/{user_id}/tracks",
        params={"limit": limit},
        headers=_auth_headers(access_token),
        timeout=15,
    )
    response.raise_for_status()
    payload = response.json()
    if isinstance(payload, list):
        return payload
    return payload.get("collection", payload.get("items", []))


def tracks_to_artists(tracks: list[dict]) -> list[dict]:
    """Группируем треки по автору; жанры — из genre и tag_list трека."""
    grouped: dict[str, set[str]] = {}
    for track in tracks:
        user = track.get("user") or {}
        artist_name = user.get("username") or user.get("full_name") or track.get("title", "unknown")
        genres: set[str] = set()
        if track.get("genre"):
            genres.add(str(track["genre"]))
        tag_list = track.get("tag_list") or ""
        for tag in str(tag_list).split():
            if tag.strip():
                genres.add(tag.strip())
        if not genres:
            genres.add("other")
        grouped.setdefault(artist_name, set()).update(genres)

    return [{"name": name, "genres": sorted(genres)} for name, genres in grouped.items()]


def fetch_top_tracks_formatted(tracks: list[dict], limit: int = 5) -> list[dict]:
    rows = []
    for track in tracks[:limit]:
        user = track.get("user") or {}
        rows.append(
            {
                "title": track.get("title", ""),
                "artist": user.get("username", ""),
                "url": track.get("permalink_url", ""),
            }
        )
    return rows
