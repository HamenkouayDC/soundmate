from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.music.models import MusicConnection
from apps.music.serializers import MusicConnectionSerializer


class MusicConnectionListCreateView(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = MusicConnectionSerializer

    def get_queryset(self):
        return MusicConnection.objects.filter(
            profile=self.request.user.profile,
            is_active=True,
        ).order_by("-connected_at")


class MusicConnectionDestroyView(generics.DestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = MusicConnectionSerializer

    def get_queryset(self):
        return MusicConnection.objects.filter(profile=self.request.user.profile)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])
