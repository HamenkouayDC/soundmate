import uuid

from django.conf import settings
from django.db import models


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    display_name = models.CharField(max_length=100)
    birth_date = models.DateField(null=True, blank=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    preview_track_url = models.URLField(
        blank=True,
        help_text="30 секунд музыки для режима «Волна»",
    )
    mood_profile = models.JSONField(
        null=True,
        blank=True,
        help_text="Настроение: energy, valence, tempo и т.д.",
    )
    music_embedding = models.JSONField(
        null=True,
        blank=True,
        help_text="Вектор для ML-матчинга (заполнит ML Engineer)",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "профиль"
        verbose_name_plural = "профили"

    def __str__(self):
        return self.display_name
