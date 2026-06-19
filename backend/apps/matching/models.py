import uuid

from django.conf import settings
from django.db import models


class WaveStatus(models.TextChoices):
    LISTENING = "listening", "Слушает"
    REVEALED = "revealed", "Профиль открыт"
    MESSAGED = "messaged", "Написал"
    SKIPPED = "skipped", "Пропустил"


class WaveSession(models.Model):
    """Режим «Волна» — сначала музыка, потом фото и сообщение."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listener = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="waves_started",
    )
    target = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="waves_received",
    )
    status = models.CharField(
        max_length=20,
        choices=WaveStatus.choices,
        default=WaveStatus.LISTENING,
    )
    listen_duration_sec = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "сессия «Волна»"
        verbose_name_plural = "сессии «Волна»"

    def __str__(self):
        return f"{self.listener} → {self.target} ({self.status})"


class MatchStatus(models.TextChoices):
    ACTIVE = "active", "Активен"
    ARCHIVED = "archived", "В архиве"


class Match(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="matches_as_a",
    )
    user_b = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="matches_as_b",
    )
    status = models.CharField(
        max_length=20,
        choices=MatchStatus.choices,
        default=MatchStatus.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "матч"
        verbose_name_plural = "матчи"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(user_a_id__lt=models.F("user_b_id")),
                name="match_ordered_users",
            ),
            models.UniqueConstraint(
                fields=["user_a", "user_b"],
                name="unique_match_pair",
            ),
        ]

    def __str__(self):
        return f"{self.user_a} ↔ {self.user_b}"
