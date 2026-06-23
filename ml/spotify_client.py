"""
spotify_client.py

Задача: получить топ-артистов и топ-треки тестового пользователя из Spotify,
а также audio features (energy, valence, tempo, danceability, acousticness)
для его треков. Эти пять чисел — основа музыкального эмбеддинга.

Почему не Client Credentials Flow:
Client Credentials даёт доступ только к публичным данным (информация о треке,
альбоме), но НЕ даёт доступ к персональным данным пользователя вроде
/me/top/artists. Для них нужен Authorization Code Flow — пользователь логинится
через браузер и разрешает приложению доступ к своим данным. spotipy берёт всю
эту возню на себя через SpotifyOAuth: он сам поднимает локальный сервер,
открывает браузер, ловит redirect и обменивает code на access_token.
"""

import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

# Какие права запрашиваем у пользователя.
# user-top-read — единственный scope, нужный для /me/top/artists и /me/top/tracks.
SCOPE = "user-top-read"


def get_spotify_client() -> spotipy.Spotify:
    """
    Создаёт авторизованный клиент Spotify.
    При первом запуске откроется браузер — нужно залогиниться и разрешить доступ.
    После этого spotipy сохранит токен в файле .cache и при следующих запусках
    будет использовать его без повторного логина (пока токен не истечёт).
    """
    auth_manager = SpotifyOAuth(
        client_id=os.environ["SPOTIFY_CLIENT_ID"],
        client_secret=os.environ["SPOTIFY_CLIENT_SECRET"],
        redirect_uri=os.environ["SPOTIFY_REDIRECT_URI"],
        scope=SCOPE,
        open_browser=True,
    )
    return spotipy.Spotify(auth_manager=auth_manager)


def fetch_top_artists(sp: spotipy.Spotify, limit: int = 20) -> list[dict]:
    """
    GET /me/top/artists
    Возвращает список артистов с полями: name, genres (список строк),
    popularity (0-100). Именно genres отсюда пойдёт в распределение жанров
    для эмбеддинга.
    """
    result = sp.current_user_top_artists(limit=limit, time_range="medium_term")
    return result["items"]


def fetch_top_tracks(sp: spotipy.Spotify, limit: int = 20) -> list[dict]:
    """
    GET /me/top/tracks
    Возвращает список треков. Нам из них нужен только id —
    дальше по id получаем audio features.
    """
    result = sp.current_user_top_tracks(limit=limit, time_range="medium_term")
    return result["items"]


def fetch_audio_features(sp: spotipy.Spotify, track_ids: list[str]) -> list[dict]:
    """
    GET /audio-features (батчем, до 100 id за раз)
    Возвращает для каждого трека: energy, valence, tempo, danceability,
    acousticness и ещё несколько полей, которые мы не используем в первой версии.
    Это и есть сырьё для пяти "аудио" компонент эмбеддинга.
    """
    features = sp.audio_features(track_ids)
    # Если конкретный трек недоступен (бывает с некоторыми региональными треками),
    # API возвращает None на этой позиции — отфильтровываем.
    return [f for f in features if f is not None]


def run_test() -> None:
    """Прогоняет весь сценарий и печатает результат — то, что нужно для отчёта по задаче."""
    sp = get_spotify_client()

    print("=== Топ артистов ===")
    artists = fetch_top_artists(sp)
    for a in artists[:5]:
        print(f"  {a['name']:30} genres={a['genres']}")
    print(f"  ... всего получено: {len(artists)} артистов\n")

    print("=== Топ треков ===")
    tracks = fetch_top_tracks(sp)
    for t in tracks[:5]:
        print(f"  {t['name']:30} artist={t['artists'][0]['name']}")
    print(f"  ... всего получено: {len(tracks)} треков\n")

    print("=== Audio features ===")
    track_ids = [t["id"] for t in tracks]
    features = fetch_audio_features(sp, track_ids)
    for f in features[:5]:
        print(
            f"  energy={f['energy']:.2f} valence={f['valence']:.2f} "
            f"tempo={f['tempo']:.0f} danceability={f['danceability']:.2f} "
            f"acousticness={f['acousticness']:.2f}"
        )
    print(f"  ... всего получено: {len(features)} наборов признаков")

    return artists, tracks, features


if __name__ == "__main__":
    run_test()
