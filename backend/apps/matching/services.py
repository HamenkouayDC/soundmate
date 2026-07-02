"""Сервисы матчинга: лента, совместимость, матчи."""

from __future__ import annotations

from datetime import date

from django.utils import timezone

from apps.matching.embedding_utils import (
    compatibility_score,
    parse_embedding,
    shared_top_genres,
    top_genre_labels,
)
from apps.matching.faiss_feed import rank_feed_candidates
from apps.matching.models import FeedAction, FeedActionType, Match, MatchStatus
from apps.music.models import MusicTaste
from apps.profiles.models import Profile
from apps.users.models import User


def calculate_age(birth_date: date | None) -> int | None:
    if not birth_date:
        return None
    today = timezone.now().date()
    return (
        today.year
        - birth_date.year
        - ((today.month, today.day) < (birth_date.month, birth_date.day))
    )


def get_avatar_url(profile: Profile, request=None) -> str:
    if profile.avatar:
        url = profile.avatar.url
        if request is not None:
            return request.build_absolute_uri(url)
        return url
    return profile.avatar_url or ""


def get_shared_artists(profile_a: Profile, profile_b: Profile, limit: int = 5) -> list[str]:
    artists_a = set(
        MusicTaste.objects.filter(profile=profile_a).values_list("artist_name", flat=True)
    )
    artists_b = set(
        MusicTaste.objects.filter(profile=profile_b).values_list("artist_name", flat=True)
    )
    return sorted(artists_a & artists_b)[:limit]


def get_top_artists(profile: Profile, limit: int = 5) -> list[str]:
    return list(
        MusicTaste.objects.filter(profile=profile)
        .order_by("-weight")
        .values_list("artist_name", flat=True)[:limit]
    )


def build_feed_item(
    viewer_profile: Profile,
    candidate: Profile,
    viewer_vector,
    request=None,
) -> dict:
    candidate_vector = parse_embedding(candidate.music_embedding)
    compatibility = None
    shared_genres: list[str] = []
    top_genres: list[str] = []

    if viewer_vector is not None and candidate_vector is not None:
        compatibility = compatibility_score(viewer_vector, candidate_vector)
        shared_genres = shared_top_genres(viewer_vector, candidate_vector)
        top_genres = top_genre_labels(candidate_vector)

    shared_artists = get_shared_artists(viewer_profile, candidate)
    if not shared_artists:
        shared_artists = get_top_artists(candidate)[:3]

    mood = ""
    if candidate.mood_profile and isinstance(candidate.mood_profile, dict):
        mood = candidate.mood_profile.get("label", "") or candidate.mood_profile.get("mood", "")

    return {
        "id": str(candidate.user_id),
        "profile_id": str(candidate.id),
        "name": candidate.display_name,
        "display_name": candidate.display_name,
        "age": calculate_age(candidate.birth_date),
        "birth_date": candidate.birth_date,
        "city": candidate.city,
        "bio": candidate.bio,
        "avatar_url": get_avatar_url(candidate, request),
        "compatibility_percent": compatibility,
        "shared_genres": shared_genres,
        "shared_artists": shared_artists,
        "top_genres": top_genres,
        "mood": mood,
    }


def build_feed_results(user: User, request=None) -> list[dict]:
    viewer_profile = user.profile
    viewer_vector = parse_embedding(viewer_profile.music_embedding)

    acted_user_ids = FeedAction.objects.filter(actor=user).values_list("target_id", flat=True)

    candidates = list(
        Profile.objects.exclude(user=user)
        .exclude(user_id__in=acted_user_ids)
        .select_related("user")
    )

    if viewer_vector is None:
        return [
            build_feed_item(viewer_profile, candidate, viewer_vector, request)
            for candidate in sorted(candidates, key=lambda profile: profile.display_name)
        ]

    candidates_with_embedding = [
        profile for profile in candidates if parse_embedding(profile.music_embedding) is not None
    ]
    candidates_without_embedding = [
        profile for profile in candidates if parse_embedding(profile.music_embedding) is None
    ]

    results: list[dict] = []
    for candidate, compatibility, shared_genres, top_genres in rank_feed_candidates(
        viewer_profile,
        candidates_with_embedding,
        viewer_vector,
    ):
        item = build_feed_item(viewer_profile, candidate, viewer_vector, request)
        item["compatibility_percent"] = compatibility
        item["shared_genres"] = shared_genres
        item["top_genres"] = top_genres
        results.append(item)

    for candidate in candidates_without_embedding:
        results.append(build_feed_item(viewer_profile, candidate, viewer_vector, request))

    return results


def ordered_match_users(match: Match, current_user: User) -> tuple[User, User]:
    if match.user_a_id == current_user.id:
        return match.user_a, match.user_b
    return match.user_b, match.user_a


def get_other_user(match: Match, current_user: User) -> User:
    return match.user_b if match.user_a_id == current_user.id else match.user_a


def create_match_if_mutual(actor: User, target: User) -> Match | None:
    if not FeedAction.objects.filter(
        actor=target,
        target=actor,
        action=FeedActionType.LIKE,
    ).exists():
        return None

    user_a, user_b = sorted((actor, target), key=lambda user: str(user.id))

    match, created = Match.objects.get_or_create(
        user_a=user_a,
        user_b=user_b,
        defaults={"status": MatchStatus.ACTIVE},
    )
    if not created and match.status != MatchStatus.ACTIVE:
        match.status = MatchStatus.ACTIVE
        match.save(update_fields=["status"])
    return match


def build_match_item(match: Match, user: User, request=None) -> dict:
    other = get_other_user(match, user)
    other_profile = other.profile
    my_profile = user.profile

    my_vector = parse_embedding(my_profile.music_embedding)
    other_vector = parse_embedding(other_profile.music_embedding)
    compatibility = None
    shared_genres: list[str] = []
    if my_vector is not None and other_vector is not None:
        compatibility = compatibility_score(my_vector, other_vector)
        shared_genres = shared_top_genres(my_vector, other_vector)

    shared_artists = get_shared_artists(my_profile, other_profile)
    last_message = match.messages.order_by("-created_at").first()

    return {
        "match_id": str(match.id),
        "compatibility_percent": compatibility,
        "shared_genres": shared_genres,
        "shared_artists": shared_artists,
        "last_message": (
            {
                "id": str(last_message.id),
                "text": last_message.text,
                "created_at": last_message.created_at,
                "sender_id": str(last_message.sender_id),
            }
            if last_message
            else None
        ),
        "user": {
            "id": str(other.id),
            "profile_id": str(other_profile.id),
            "name": other_profile.display_name,
            "display_name": other_profile.display_name,
            "age": calculate_age(other_profile.birth_date),
            "birth_date": other_profile.birth_date,
            "city": other_profile.city,
            "bio": other_profile.bio,
            "avatar_url": get_avatar_url(other_profile, request),
        },
    }
