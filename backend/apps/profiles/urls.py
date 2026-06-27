from django.urls import path

from apps.profiles.views import ProfileMeView

urlpatterns = [
    path("profiles/me/", ProfileMeView.as_view(), name="profiles-me"),
]
