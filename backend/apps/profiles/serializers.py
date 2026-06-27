from rest_framework import serializers

from apps.profiles.models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "id",
            "display_name",
            "birth_date",
            "bio",
            "avatar_url",
            "preview_track_url",
            "mood_profile",
            "music_embedding",
            "updated_at",
        )
        read_only_fields = ("id", "mood_profile", "music_embedding", "updated_at")


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "display_name",
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
