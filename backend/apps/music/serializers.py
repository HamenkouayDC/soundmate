from rest_framework import serializers

from apps.music.models import MusicConnection, MusicProvider


class MusicConnectionSerializer(serializers.ModelSerializer):
    provider_display = serializers.CharField(
        source="get_provider_display",
        read_only=True,
    )

    class Meta:
        model = MusicConnection
        fields = (
            "id",
            "provider",
            "provider_display",
            "external_user_id",
            "is_active",
            "connected_at",
        )
        read_only_fields = ("id", "is_active", "connected_at")

    def validate_provider(self, value):
        if value not in MusicProvider.values:
            raise serializers.ValidationError(
                f"Допустимые значения: {', '.join(MusicProvider.values)}"
            )
        return value

    def validate(self, attrs):
        profile = self.context["request"].user.profile
        provider = attrs.get("provider")
        if provider and MusicConnection.objects.filter(
            profile=profile,
            provider=provider,
            is_active=True,
        ).exists():
            raise serializers.ValidationError(
                {"provider": "Этот сервис уже подключён."}
            )
        return attrs

    def create(self, validated_data):
        profile = self.context["request"].user.profile
        return MusicConnection.objects.create(profile=profile, **validated_data)
