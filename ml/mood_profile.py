"""Построение mood_profile из аудио-части эмбеддинга."""

from __future__ import annotations

import math

import numpy as np

from build_embedding import AUDIO_FIELDS


def _mood_label(energy: float, valence: float) -> str:
    if energy >= 0.65 and valence >= 0.55:
        return "энергичное"
    if energy >= 0.65 and valence < 0.45:
        return "агрессивное"
    if energy < 0.45 and valence >= 0.55:
        return "спокойное"
    if energy < 0.45 and valence < 0.45:
        return "меланхоличное"
    if valence >= 0.55:
        return "позитивное"
    if valence < 0.45:
        return "задумчивое"
    return "нейтральное"


def build_mood_profile(vector: np.ndarray, source: str = "unknown") -> dict:
    values = {
        field: None if math.isnan(float(vector[index])) else round(float(vector[index]), 3)
        for index, field in enumerate(AUDIO_FIELDS)
    }

    energy = values["energy"]
    valence = values["valence"]
    if energy is None or valence is None:
        label = "по жанрам"
    else:
        label = _mood_label(energy, valence)

    return {
        **values,
        "tempo": values.pop("tempo_norm"),
        "label": label,
        "mood": label,
        "source": source,
    }
