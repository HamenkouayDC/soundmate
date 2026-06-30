from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.music.models import MusicConnection
from apps.music.serializers import MusicConnectionSerializer
from apps.music.embedding_service import rebuild_profile_from_connections
from apps.music.services import build_music_passport


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


class MusicPassportView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response(build_music_passport(request.user.profile))


class MusicPassportRebuildView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        profile = request.user.profile
        if not rebuild_profile_from_connections(profile):
            return Response(
                {
                    "detail": (
                        "Нет активного Last.fm или не удалось получить данные. "
                        "Подключите Last.fm с реальным username в external_user_id."
                    )
                },
                status=400,
            )
        return Response(build_music_passport(profile))
