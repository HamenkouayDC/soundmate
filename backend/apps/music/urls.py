from django.urls import path

from apps.music.views import (
    MusicConnectionDestroyView,
    MusicConnectionListCreateView,
    MusicPassportRebuildView,
    MusicPassportView,
)

urlpatterns = [
    path("music/passport/", MusicPassportView.as_view(), name="music-passport"),
    path(
        "music/passport/rebuild/",
        MusicPassportRebuildView.as_view(),
        name="music-passport-rebuild",
    ),
    path(
        "music/connections/",
        MusicConnectionListCreateView.as_view(),
        name="music-connections",
    ),
    path(
        "music/connections/<uuid:pk>/",
        MusicConnectionDestroyView.as_view(),
        name="music-connection-detail",
    ),
]
