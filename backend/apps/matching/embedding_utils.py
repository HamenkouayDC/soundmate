"""Утилиты эмбеддинга для API матчинга (зеркало ml/vector_utils.py)."""

from __future__ import annotations

import numpy as np

EMBEDDING_LENGTH = 25
GENRE_START = 5


def parse_embedding(raw) -> np.ndarray | None:
    if raw is None:
        return None
    if isinstance(raw, dict):
        values = raw.get("vector")
    elif isinstance(raw, list):
        values = raw
    else:
        return None
    if not values or len(values) != EMBEDDING_LENGTH:
        return None
    array = np.empty(EMBEDDING_LENGTH, dtype=np.float32)
    for index, value in enumerate(values):
        if value is None:
            array[index] = np.nan
        else:
            array[index] = float(value)
    return array


def search_vector(vector: np.ndarray) -> np.ndarray:
    return vector[GENRE_START:].copy()


def compatibility_score(vector_a: np.ndarray, vector_b: np.ndarray) -> float:
    a = search_vector(vector_a)
    b = search_vector(vector_b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    cosine = float(np.dot(a, b) / (norm_a * norm_b))
    cosine = max(0.0, min(1.0, cosine))
    return round(cosine * 100, 1)


def top_genre_labels(vector: np.ndarray, limit: int = 3) -> list[str]:
    genre_fields = [
        "pop", "rock", "hip_hop", "electronic", "rnb", "indie_alternative",
        "metal", "jazz", "classical", "folk", "country", "latin", "reggae",
        "punk", "blues", "soul_funk", "ambient", "k_pop", "russian_pop_rock", "other",
    ]
    genres = vector[GENRE_START:]
    indexed = [(genre_fields[i], float(genres[i])) for i in range(len(genre_fields))]
    indexed.sort(key=lambda item: item[1], reverse=True)
    return [name for name, weight in indexed[:limit] if weight > 0.05]


def shared_top_genres(vector_a: np.ndarray, vector_b: np.ndarray, limit: int = 3) -> list[str]:
    return list(set(top_genre_labels(vector_a, 5)) & set(top_genre_labels(vector_b, 5)))[:limit]
