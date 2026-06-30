from rest_framework import serializers

from apps.profiles.models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            "id",
            "display_name",
            "city",
            "birth_date",
            "bio",
            "avatar_url",
            "preview_track_url",
            "mood_profile",
            "music_embedding",
            "updated_at",
        )
        read_only_fields = ("id", "mood_profile", "music_embedding", "updated_at")

    def get_avatar_url(self, profile: Profile) -> str:
        if profile.avatar:
            request = self.context.get("request")
            url = profile.avatar.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return profile.avatar_url or ""


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "display_name",
            "city",
            "birth_date",
            "bio",
            "avatar_url",
            "preview_track_url",
        )

    def validate_display_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Имя не может быть пустым.")
        return value


class ProfileAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ("avatar",)
