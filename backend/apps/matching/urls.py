from django.urls import path

from apps.matching.views import (
    FeedActionView,
    FeedView,
    MatchMessageListCreateView,
    MatchesListView,
)

urlpatterns = [
    path("feed/", FeedView.as_view(), name="feed"),
    path("feed/actions/", FeedActionView.as_view(), name="feed-actions"),
    path("matches/", MatchesListView.as_view(), name="matches"),
    path(
        "matches/<uuid:match_id>/messages/",
        MatchMessageListCreateView.as_view(),
        name="match-messages",
    ),
    # Совместимость со старым путём
    path("matching/feed/", FeedView.as_view(), name="matching-feed"),
]
