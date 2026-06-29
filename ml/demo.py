"""
Демо матчинга для куратора — запуск из папки ml/:

    pip install -r requirements.txt
    python generate_dataset.py
    python demo.py
"""

from __future__ import annotations

import json
from pathlib import Path

from faiss_search import IndexedProfile, ProfileFaissIndex
from vector_utils import parse_embedding, shared_top_genres, top_genre_labels

DATA_PATH = Path(__file__).parent / "data" / "demo_profiles.json"


def main() -> None:
    if not DATA_PATH.exists():
        print("Сначала запустите: python generate_dataset.py")
        return

    profiles_raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    indexed: list[IndexedProfile] = []
    vectors = []

    for item in profiles_raw:
        vector = parse_embedding(item["music_embedding"])
        if vector is None:
            continue
        indexed.append(
            IndexedProfile(
                profile_id=item["email"],
                display_name=item["display_name"],
                vector=vector,
            )
        )
        vectors.append((item, vector))

    print("=" * 60)
    print("Soundmate ML Demo — Faiss + скоринг совместимости")
    print(f"Профилей в датасете: {len(indexed)}")
    print("=" * 60)

    faiss_index = ProfileFaissIndex(indexed)

    # Демо 1: рок-фан ищет похожих
    query_item, query_vector = vectors[0]
    print(f"\nЗапрос: {query_item['display_name']}")
    print(f"Топ-жанры: {', '.join(top_genre_labels(query_vector))}")

    matches = faiss_index.search(query_vector, top_k=5)
    print("\nТоп-5 похожих (Faiss L2 + cosine score):")
    for rank, match in enumerate(matches, start=1):
        target_vector = next(v for item, v in vectors if item["email"] == match.profile_id)
        shared = shared_top_genres(query_vector, target_vector)
        shared_text = f", общие жанры: {', '.join(shared)}" if shared else ""
        print(
            f"  {rank}. {match.display_name} — "
            f"совместимость {match.compatibility_score}%{shared_text}"
        )

    # Демо 2: метал ближе к року, чем к джазу
    rock = vectors[0][1]
    metal = vectors[1][1]
    jazz = vectors[5][1]
    from vector_utils import compatibility_score

    print("\nПроверка здравого смысла:")
    print(f"  рок - метал: {compatibility_score(rock, metal)}%")
    print(f"  рок - джаз:  {compatibility_score(rock, jazz)}%")

    print("\nГотово. Для API: python manage.py seed_demo_profiles && GET /matching/feed/")


if __name__ == "__main__":
    main()
