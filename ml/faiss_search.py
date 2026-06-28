"""Поиск похожих профилей через Faiss (L2 на жанровом/полном векторе)."""

from __future__ import annotations

from dataclasses import dataclass

import faiss
import numpy as np

from vector_utils import compatibility_score, parse_embedding, search_vector


@dataclass
class IndexedProfile:
    profile_id: str
    display_name: str
    vector: np.ndarray


@dataclass
class MatchResult:
    profile_id: str
    display_name: str
    compatibility_score: float
    distance: float


class ProfileFaissIndex:
    def __init__(self, profiles: list[IndexedProfile]):
        if not profiles:
            raise ValueError("Нужен хотя бы один профиль для индекса")

        self.profiles = profiles
        self.dimension = search_vector(profiles[0].vector).shape[0]
        matrix = np.vstack([search_vector(p.vector) for p in profiles]).astype(np.float32)
        faiss.normalize_L2(matrix)

        self._index = faiss.IndexFlatL2(self.dimension)
        self._index.add(matrix)

    def search(self, query_vector: np.ndarray, top_k: int = 5) -> list[MatchResult]:
        query = search_vector(query_vector).astype(np.float32).reshape(1, -1)
        faiss.normalize_L2(query)

        k = min(top_k, len(self.profiles))
        distances, indices = self._index.search(query, k)

        results: list[MatchResult] = []
        for distance, idx in zip(distances[0], indices[0]):
            if idx < 0:
                continue
            profile = self.profiles[int(idx)]
            score = compatibility_score(query_vector, profile.vector)
            results.append(
                MatchResult(
                    profile_id=profile.profile_id,
                    display_name=profile.display_name,
                    compatibility_score=score,
                    distance=float(distance),
                )
            )
        return results
