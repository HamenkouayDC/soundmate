from rest_framework import generics, parsers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.profiles.serializers import (
    ProfileAvatarSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
)


class ProfileMeView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user.profile

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ProfileUpdateSerializer
        return ProfileSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            ProfileSerializer(instance, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class ProfileAvatarUploadView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ProfileAvatarSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def post(self, request):
        profile = request.user.profile
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            ProfileSerializer(profile, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
