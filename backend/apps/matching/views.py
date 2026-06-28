import json
from pathlib import Path

import faiss
import numpy as np
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.matching.embedding_utils import (
    compatibility_score,
    parse_embedding,
    search_vector,
    shared_top_genres,
    top_genre_labels,
)
from apps.matching.serializers import FeedProfileSerializer
from apps.profiles.models import Profile


class MatchingFeedView(generics.GenericAPIView):
    """
    Лента кандидатов по музыкальной совместимости (Faiss L2 + cosine score).
    Для демо: сначала `python manage.py seed_demo_profiles`.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = FeedProfileSerializer

    def get(self, request):
        my_profile = request.user.profile
        query_vector = parse_embedding(my_profile.music_embedding)

        if query_vector is None:
            return Response(
                {
                    "detail": (
                        "У вашего профиля нет music_embedding. "
                        "Запустите seed_demo_profiles или подключите Last.fm."
                    ),
                    "results": [],
                },
                status=200,
            )

        candidates = (
            Profile.objects.exclude(user=request.user)
            .exclude(music_embedding__isnull=True)
            .select_related("user")
        )

        indexed = []
        for profile in candidates:
            vector = parse_embedding(profile.music_embedding)
            if vector is not None:
                indexed.append((profile, vector))

        if not indexed:
            return Response({"results": []})

        dimension = search_vector(indexed[0][1]).shape[0]
        matrix = np.vstack([search_vector(vector) for _, vector in indexed]).astype(np.float32)
        faiss.normalize_L2(matrix)

        index = faiss.IndexFlatL2(dimension)
        index.add(matrix)

        query = search_vector(query_vector).astype(np.float32).reshape(1, -1)
        faiss.normalize_L2(query)

        k = min(10, len(indexed))
        distances, indices = index.search(query, k)

        results = []
        for distance, idx in zip(distances[0], indices[0]):
            if idx < 0:
                continue
            profile, vector = indexed[int(idx)]
            results.append(
                {
                    "profile": profile,
                    "compatibility_score": compatibility_score(query_vector, vector),
                    "shared_genres": shared_top_genres(query_vector, vector),
                    "top_genres": top_genre_labels(vector),
                    "_distance": float(distance),
                }
            )

        results.sort(key=lambda item: item["compatibility_score"], reverse=True)
        serializer = self.get_serializer(
            [
                {
                    "profile": item["profile"],
                    "compatibility_score": item["compatibility_score"],
                    "shared_genres": item["shared_genres"],
                    "top_genres": item["top_genres"],
                }
                for item in results
            ],
            many=True,
        )
        return Response({"results": serializer.data})
