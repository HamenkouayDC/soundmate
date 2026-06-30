from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.matching.models import FeedAction, FeedActionType, Match, MatchStatus, Message
from apps.matching.serializers import FeedActionSerializer, MessageCreateSerializer, MessageSerializer
from apps.matching.services import build_feed_results, build_match_item, create_match_if_mutual
from apps.users.models import User


class FeedView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        results = build_feed_results(request.user, request)
        return Response({"results": results})


class FeedActionView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FeedActionSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target = get_object_or_404(User, id=serializer.validated_data["target_user_id"])
        if target == request.user:
            return Response(
                {"detail": "Нельзя выполнить действие над собой."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        action = serializer.validated_data["action"]
        FeedAction.objects.update_or_create(
            actor=request.user,
            target=target,
            defaults={"action": action},
        )

        is_match = False
        match_id = None
        if action == FeedActionType.LIKE:
            match = create_match_if_mutual(request.user, target)
            if match:
                is_match = True
                match_id = str(match.id)

        return Response(
            {
                "action": action,
                "is_match": is_match,
                "match_id": match_id,
            },
            status=status.HTTP_200_OK,
        )


class MatchesListView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        matches = Match.objects.filter(
            status=MatchStatus.ACTIVE,
        ).filter(
            Q(user_a=request.user) | Q(user_b=request.user),
        ).distinct()

        results = [build_match_item(match, request.user, request) for match in matches]
        results.sort(
            key=lambda item: item["last_message"]["created_at"] if item["last_message"] else "",
            reverse=True,
        )
        return Response({"results": results})


class MatchMessageListCreateView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def get_match(self, request, match_id):
        match = get_object_or_404(Match, id=match_id, status=MatchStatus.ACTIVE)
        if request.user.id not in (match.user_a_id, match.user_b_id):
            return None
        return match

    def get(self, request, match_id):
        match = self.get_match(request, match_id)
        if match is None:
            return Response({"detail": "Матч не найден."}, status=status.HTTP_404_NOT_FOUND)

        messages = match.messages.select_related("sender").all()
        serializer = MessageSerializer(messages, many=True)
        return Response({"results": serializer.data})

    def post(self, request, match_id):
        match = self.get_match(request, match_id)
        if match is None:
            return Response({"detail": "Матч не найден."}, status=status.HTTP_404_NOT_FOUND)

        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = Message.objects.create(
            match=match,
            sender=request.user,
            text=serializer.validated_data["text"],
        )
        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )
