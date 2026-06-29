from rest_framework import serializers

from apps.profiles.serializers import ProfileSerializer


class FeedProfileSerializer(serializers.Serializer):
    profile = ProfileSerializer(read_only=True)
    compatibility_score = serializers.FloatField()
    shared_genres = serializers.ListField(child=serializers.CharField())
    top_genres = serializers.ListField(child=serializers.CharField())
