"""Тесты ML-логики (запуск: cd ml && python -m unittest discover -s tests -v)."""

from __future__ import annotations

import unittest

import numpy as np

from build_embedding import build_user_embedding
from genre_categories import map_genre_to_category
from mood_profile import build_mood_profile
from vector_utils import compatibility_score, embedding_to_storage, parse_embedding, top_genre_labels


class GenreMappingTests(unittest.TestCase):
    def test_indie_rock_maps_to_rock(self):
        self.assertEqual(map_genre_to_category("indie rock"), "rock")

    def test_indie_pop_maps_to_pop(self):
        self.assertEqual(map_genre_to_category("indie pop"), "pop")

    def test_russian_rock_maps_to_russian_pop_rock(self):
        self.assertEqual(map_genre_to_category("русский рок"), "russian_pop_rock")


class EmbeddingTests(unittest.TestCase):
    def test_vector_length_is_25(self):
        artists = [{"name": "Nirvana", "genres": ["grunge", "rock"]}]
        vector = build_user_embedding(artists)
        self.assertEqual(len(vector), 25)

    def test_lastfm_mode_has_nan_audio(self):
        artists = [{"name": "Nirvana", "genres": ["grunge", "rock"]}]
        vector = build_user_embedding(artists)
        self.assertTrue(np.isnan(vector[0]))

    def test_storage_roundtrip(self):
        artists = [{"name": "Metallica", "genres": ["metal", "thrash metal"]}]
        vector = build_user_embedding(artists)
        storage = embedding_to_storage(vector)
        restored = parse_embedding(storage)
        self.assertIsNotNone(restored)
        self.assertEqual(len(restored), 25)


class CompatibilityTests(unittest.TestCase):
    def setUp(self):
        rock_artists = [
            {"name": "Nirvana", "genres": ["grunge", "rock"]},
            {"name": "Arctic Monkeys", "genres": ["indie rock", "rock"]},
        ]
        metal_artists = [
            {"name": "Metallica", "genres": ["metal", "thrash metal", "rock"]},
            {"name": "Slipknot", "genres": ["nu metal", "metal", "rock"]},
        ]
        jazz_artists = [
            {"name": "Miles Davis", "genres": ["jazz", "cool jazz"]},
            {"name": "Norah Jones", "genres": ["jazz", "vocal jazz"]},
        ]
        audio = [
            {"energy": 0.85, "valence": 0.45, "tempo": 140, "danceability": 0.5, "acousticness": 0.1},
            {"energy": 0.8, "valence": 0.55, "tempo": 128, "danceability": 0.65, "acousticness": 0.08},
        ]
        self.rock = build_user_embedding(rock_artists, audio)
        self.metal = build_user_embedding(metal_artists, audio)
        self.jazz = build_user_embedding(jazz_artists, audio)

    def test_rock_closer_to_metal_than_jazz(self):
        rock_metal = compatibility_score(self.rock, self.metal)
        rock_jazz = compatibility_score(self.rock, self.jazz)
        self.assertGreaterEqual(rock_metal, rock_jazz)
        self.assertGreater(rock_metal, 0.0)

    def test_compatibility_in_range(self):
        score = compatibility_score(self.rock, self.metal)
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 100.0)


class MoodProfileTests(unittest.TestCase):
    def test_full_audio_gets_label(self):
        artists = [{"name": "Artist", "genres": ["pop"]}]
        audio = [{"energy": 0.9, "valence": 0.8, "tempo": 120, "danceability": 0.7, "acousticness": 0.1}]
        vector = build_user_embedding(artists, audio)
        mood = build_mood_profile(vector, source="demo")
        self.assertEqual(mood["label"], "энергичное")
        self.assertEqual(mood["source"], "demo")

    def test_lastfm_only_uses_genre_label(self):
        artists = [{"name": "Artist", "genres": ["rock"]}]
        vector = build_user_embedding(artists)
        mood = build_mood_profile(vector, source="lastfm")
        self.assertEqual(mood["label"], "по жанрам")


class GenreLabelTests(unittest.TestCase):
    def test_top_genres_for_rock_profile(self):
        artists = [{"name": "Nirvana", "genres": ["grunge", "rock"]}]
        vector = build_user_embedding(artists)
        labels = top_genre_labels(vector)
        self.assertIn("rock", labels)


if __name__ == "__main__":
    unittest.main()
