"""Утилиты для матчинга: нормализация вектора и скоринг совместимости."""

from __future__ import annotations

import math
from typing import Iterable

import numpy as np

from build_embedding import AUDIO_FIELDS, EMBEDDING_FIELDS, EMBEDDING_LENGTH

GENRE_START = len(AUDIO_FIELDS)
GENRE_DIM = EMBEDDING_LENGTH - GENRE_START


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
    return np.array(values, dtype=np.float32)


def embedding_to_storage(vector: np.ndarray) -> dict:
    return {
        "version": 1,
        "fields": EMBEDDING_FIELDS,
        "vector": [None if np.isnan(v) else float(v) for v in vector],
    }


def search_vector(vector: np.ndarray) -> np.ndarray:
    """Для Faiss всегда 20 жанровых признаков — единая размерность для всех профилей."""
    return vector[GENRE_START:].copy()


def compatibility_score(vector_a: np.ndarray, vector_b: np.ndarray) -> float:
    """
    Скоринг 0–100. Чем ближе векторы в пространстве жанров/признаков, тем выше.
    """
    a = search_vector(vector_a)
    b = search_vector(vector_b)
    if len(a) != len(b):
        raise ValueError("Разная размерность векторов для сравнения")

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0

    cosine = float(np.dot(a, b) / (norm_a * norm_b))
    cosine = max(0.0, min(1.0, cosine))
    return round(cosine * 100, 1)


def top_genre_labels(vector: np.ndarray, limit: int = 3) -> list[str]:
    genres = vector[GENRE_START:]
    indexed = [(EMBEDDING_FIELDS[GENRE_START + i].replace("genre_", ""), float(genres[i])) for i in range(len(genres))]
    indexed.sort(key=lambda item: item[1], reverse=True)
    return [name for name, weight in indexed[:limit] if weight > 0.05]


def shared_top_genres(vector_a: np.ndarray, vector_b: np.ndarray, limit: int = 3) -> list[str]:
    labels_a = set(top_genre_labels(vector_a, limit=5))
    labels_b = set(top_genre_labels(vector_b, limit=5))
    shared = sorted(labels_a & labels_b)
    return shared[:limit]
