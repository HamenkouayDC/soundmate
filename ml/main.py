"""
main.py

Полный прогон задачи 1 + задачи 3 целиком, в текущем режиме недели 1:
только Last.fm (Spotify Web API временно недоступен — требует Premium-
аккаунт у владельца приложения, см. README и комментарий в build_embedding.py).

Получаем топ-артистов из Last.fm -> докручиваем теги -> строим эмбеддинг
(аудио-часть будет "нет данных", жанровая часть — полноценная).

Запуск:
    source venv/bin/activate   (или venv\\Scripts\\activate на Windows)
    python main.py
"""

from lastfm_client import fetch_top_artists, artists_with_genres
from build_embedding import build_user_embedding, describe_embedding
import os
from dotenv import load_dotenv

load_dotenv()


def main() -> None:
    username = os.environ["LASTFM_TEST_USERNAME"]
    print(f"Запрашиваем топ-артистов Last.fm для пользователя {username}...\n")

    artists = fetch_top_artists(username)
    print(f"Получено артистов: {len(artists)}")

    print("Докручиваем теги по каждому артисту (это медленно — по 1 запросу на артиста)...")
    artists_full = artists_with_genres(artists)

    embedding = build_user_embedding(artists_full)  # audio_features не передаём

    print("\n=== Музыкальный эмбеддинг пользователя (режим: только Last.fm) ===")
    describe_embedding(embedding)
    print(
        "\nПримечание: первые 5 полей помечены как 'нет данных' — это аудио-"
        "характеристики, которые в полной версии берутся из Spotify audio "
        "features. Они появятся, когда у владельца Spotify-приложения будет "
        "Premium-аккаунт (см. README)."
    )


# --- Полный режим (Spotify + Last.fm), для справки, когда появится Premium ---
#
# from spotify_client import (
#     get_spotify_client, fetch_top_artists as spotify_top_artists,
#     fetch_top_tracks, fetch_audio_features,
# )
#
# def main_full():
#     sp = get_spotify_client()
#     artists = spotify_top_artists(sp)
#     tracks = fetch_top_tracks(sp)
#     features = fetch_audio_features(sp, [t["id"] for t in tracks])
#     embedding = build_user_embedding(artists, features)
#     describe_embedding(embedding)


if __name__ == "__main__":
    main()
