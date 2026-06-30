"""Faiss-ранжирование кандидатов для ленты."""

from __future__ import annotations

import faiss
import numpy as np

from apps.matching.embedding_utils import (
    compatibility_score,
    parse_embedding,
    search_vector,
    shared_top_genres,
    top_genre_labels,
)
from apps.profiles.models import Profile


def rank_feed_candidates(
    viewer_profile: Profile,
    candidates: list[Profile],
    query_vector: np.ndarray,
    top_k: int | None = None,
) -> list[tuple[Profile, float, list[str], list[str]]]:
    indexed: list[tuple[Profile, np.ndarray]] = []
    for profile in candidates:
        vector = parse_embedding(profile.music_embedding)
        if vector is not None:
            indexed.append((profile, vector))

    if not indexed:
        return []

    if len(indexed) == 1:
        profile, vector = indexed[0]
        return [
            (
                profile,
                compatibility_score(query_vector, vector),
                shared_top_genres(query_vector, vector),
                top_genre_labels(vector),
            )
        ]

    dimension = search_vector(indexed[0][1]).shape[0]
    matrix = np.vstack([search_vector(vector) for _, vector in indexed]).astype(np.float32)
    faiss.normalize_L2(matrix)

    index = faiss.IndexFlatL2(dimension)
    index.add(matrix)

    query = search_vector(query_vector).astype(np.float32).reshape(1, -1)
    faiss.normalize_L2(query)

    k = top_k or len(indexed)
    k = min(k, len(indexed))
    _, indices = index.search(query, k)

    ranked: list[tuple[Profile, float, list[str], list[str]]] = []
    for idx in indices[0]:
        if idx < 0:
            continue
        profile, vector = indexed[int(idx)]
        ranked.append(
            (
                profile,
                compatibility_score(query_vector, vector),
                shared_top_genres(query_vector, vector),
                top_genre_labels(vector),
            )
        )

    ranked.sort(key=lambda item: item[1], reverse=True)
    return ranked
