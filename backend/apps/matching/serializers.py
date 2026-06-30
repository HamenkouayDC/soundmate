from rest_framework import serializers

from apps.matching.models import FeedActionType, Message


class FeedActionSerializer(serializers.Serializer):
    target_user_id = serializers.UUIDField()
    action = serializers.ChoiceField(choices=FeedActionType.choices)


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.UUIDField(source="sender.id", read_only=True)

    class Meta:
        model = Message
        fields = ("id", "sender_id", "text", "created_at")
        read_only_fields = ("id", "sender_id", "created_at")


class MessageCreateSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=2000)
