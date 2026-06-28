from django.urls import path

from apps.matching.views import MatchingFeedView

urlpatterns = [
    path("matching/feed/", MatchingFeedView.as_view(), name="matching-feed"),
]
