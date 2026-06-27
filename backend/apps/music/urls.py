from django.urls import path

from apps.music.views import MusicConnectionDestroyView, MusicConnectionListCreateView

urlpatterns = [
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
