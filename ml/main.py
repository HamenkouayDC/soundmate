"""
main.py

Прогон ML-пайплайна:
  python main.py              # Last.fm (нужен LASTFM_* в .env)
  python main.py --spotify    # Spotify + audio features (нужен SPOTIFY_* в .env)
  python main.py --soundcloud USERNAME
"""

from __future__ import annotations

import argparse
import os
import sys

from dotenv import load_dotenv

load_dotenv()


def main_lastfm() -> None:
    from lastfm_client import artists_with_genres, fetch_top_artists
    from build_embedding import describe_embedding
    from pipeline import build_profile_from_lastfm

    username = os.environ["LASTFM_TEST_USERNAME"]
    print(f"Last.fm → embedding для {username}\n")
    result = build_profile_from_lastfm(username)
    describe_embedding(__import__("vector_utils").parse_embedding(result.embedding))
    print(f"\nMood: {result.mood_profile['label']}")
    print(f"Топ-жанры: {', '.join(result.top_genres)}")


def main_spotify() -> None:
    from spotify_client import get_spotify_client
    from build_embedding import describe_embedding
    from pipeline import build_profile_from_spotify

    print("Spotify → полный embedding (жанры + audio features)\n")
    sp = get_spotify_client()
    result = build_profile_from_spotify(sp)
    describe_embedding(__import__("vector_utils").parse_embedding(result.embedding))
    print(f"\nMood: {result.mood_profile['label']}")
    print(f"Топ-жанры: {', '.join(result.top_genres)}")


def main_soundcloud(username: str) -> None:
    from build_embedding import describe_embedding
    from pipeline import build_profile_from_soundcloud

    print(f"SoundCloud → embedding для {username}\n")
    result = build_profile_from_soundcloud(username)
    describe_embedding(__import__("vector_utils").parse_embedding(result.embedding))
    print(f"\nMood: {result.mood_profile['label']}")
    print(f"Топ-жанры: {', '.join(result.top_genres)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Soundmate ML pipeline")
    parser.add_argument("--spotify", action="store_true", help="Полный пайплайн через Spotify")
    parser.add_argument("--soundcloud", metavar="USERNAME", help="Профиль SoundCloud по username")
    args = parser.parse_args()

    if args.spotify:
        main_spotify()
    elif args.soundcloud:
        main_soundcloud(args.soundcloud)
    else:
        main_lastfm()


if __name__ == "__main__":
    main()
