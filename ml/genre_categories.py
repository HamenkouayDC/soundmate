"""
genre_categories.py

Решение по вопросу indie (стоявшему открытым): indie — это МОДИФИКАТОР,
а не отдельная категория. Причина: "indie" в Spotify/Last.fm почти всегда
идёт парой с базовым жанром — "indie pop", "indie rock", "indie folk".
Если сделать indie отдельной категорией 21-й, то любой пользователь с тегом
"indie pop" получит вклад и в indie, и в pop, и это задвоение размывает вектор
без выгоды: индастри-инди и поп-инди музыкально звучат совершенно по-разному
по energy/valence, так что объединение их в одну категорию "indie" потеряло бы
именно то различие, которое матчинг должен улавливать. Поэтому indie как
самостоятельное слово маппится в "alternative" (ближайшая по духу категория
для случаев типа просто "indie" без второго слова), а "indie rock" →
rock, "indie pop" → pop, "indie folk" → folk и так далее — обрабатывается
автоматически, потому что мы матчим по подстроке, и второе слово после indie
уже попадает в свою категорию через отдельную проверку.

Фиксированный список из 20 категорий — финальная версия:
"""

GENRE_CATEGORIES = [
    "pop",
    "rock",
    "hip_hop",
    "electronic",
    "rnb",
    "indie_alternative",
    "metal",
    "jazz",
    "classical",
    "folk",
    "country",
    "latin",
    "reggae",
    "punk",
    "blues",
    "soul_funk",
    "ambient",
    "k_pop",
    "russian_pop_rock",
    "other",
]

# Порядок проверки важен: более специфичные подстроки идут раньше общих,
# чтобы "indie rock" не словился как "indie_alternative" раньше, чем дойдёт
# до проверки на "rock". keys — это подстроки, которые ищем в нижнем регистре
# в исходной строке жанра/тега.
_KEYWORD_MAP: list[tuple[str, str]] = [
    # --- специфичные сочетания сначала ---
    ("hip hop", "hip_hop"),
    ("hip-hop", "hip_hop"),
    ("rap", "hip_hop"),
    ("trap", "hip_hop"),
    ("r&b", "rnb"),
    ("rnb", "rnb"),
    ("soul", "soul_funk"),
    ("funk", "soul_funk"),
    ("k-pop", "k_pop"),
    ("kpop", "k_pop"),
    ("русск", "russian_pop_rock"),
    ("russian", "russian_pop_rock"),
    ("шансон", "russian_pop_rock"),
    # --- rock-семейство ---
    ("punk", "punk"),
    ("metal", "metal"),
    ("rock", "rock"),
    # --- electronic-семейство ---
    ("electro", "electronic"),
    ("techno", "electronic"),
    ("house", "electronic"),
    ("edm", "electronic"),
    ("dubstep", "electronic"),
    ("drum and bass", "electronic"),
    ("dnb", "electronic"),
    ("ambient", "ambient"),
    ("chill", "ambient"),
    # --- остальные жанровые семьи ---
    ("jazz", "jazz"),
    ("blues", "blues"),
    ("classical", "classical"),
    ("orchestr", "classical"),
    ("folk", "folk"),
    ("country", "country"),
    ("latin", "latin"),
    ("reggaeton", "latin"),
    ("reggae", "reggae"),
    ("pop", "pop"),
    # --- indie как модификатор (см. docstring) ---
    ("indie", "indie_alternative"),
    ("alternative", "indie_alternative"),
]


def map_genre_to_category(raw_genre: str) -> str:
    """
    Принимает сырую строку жанра/тега (от Spotify genres или Last.fm tags)
    и возвращает одну из 20 фиксированных категорий.

    Пример:
        map_genre_to_category("indie pop")       -> "pop"
        map_genre_to_category("indie")            -> "indie_alternative"
        map_genre_to_category("modern alt rock")  -> "rock"
        map_genre_to_category("lo-fi beats")       -> "other"
    """
    text = raw_genre.lower().strip()

    # Сначала ищем самое специфичное совпадение из непересекающихся
    # с "indie"/"alternative" категорий — это даёт "indie rock" -> rock,
    # а не indie_alternative.
    for keyword, category in _KEYWORD_MAP:
        if keyword in ("indie", "alternative"):
            continue
        if keyword in text:
            return category

    # Если не нашли конкретный жанр, но есть indie/alternative как модификатор
    for keyword, category in _KEYWORD_MAP:
        if keyword in ("indie", "alternative") and keyword in text:
            return category

    return "other"


if __name__ == "__main__":
    # Самопроверка на наборе строк, которые реально встречаются
    # в ответах Spotify genres и Last.fm tags.
    test_genres = [
        "indie pop", "indie rock", "indie folk", "indie",
        "modern alternative rock", "k-pop", "permanent wave",
        "russian rock", "lo-fi beats", "deep house", "art pop",
        "hip hop", "trap russe", "synth-pop", "post-punk",
        "drum and bass", "classic soul",
    ]
    for g in test_genres:
        print(f"{g:30} -> {map_genre_to_category(g)}")
