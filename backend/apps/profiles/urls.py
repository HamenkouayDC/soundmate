from django.urls import path

from apps.profiles.views import ProfileAvatarUploadView, ProfileMeView

urlpatterns = [
    path("profiles/me/", ProfileMeView.as_view(), name="profiles-me"),
    path("profiles/me/avatar/", ProfileAvatarUploadView.as_view(), name="profiles-me-avatar"),
]
