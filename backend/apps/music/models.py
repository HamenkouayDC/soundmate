import uuid

from django.db import models

from apps.profiles.models import Profile


class MusicProvider(models.TextChoices):
    SPOTIFY = "spotify", "Spotify"
    LASTFM = "lastfm", "Last.fm"
    SOUNDCLOUD = "soundcloud", "SoundCloud"
    YANDEX = "yandex", "Яндекс Музыка"


class MusicConnection(models.Model):
    """Music Passport — привязка стримингового сервиса."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="music_connections",
    )
    provider = models.CharField(max_length=20, choices=MusicProvider.choices)
    external_user_id = models.CharField(max_length=128)
    tokens_encrypted = models.JSONField(
        null=True,
        blank=True,
        help_text="OAuth-токены (Week 2+)",
    )
    is_active = models.BooleanField(default=True)
    connected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "подключение сервиса"
        verbose_name_plural = "подключения сервисов"
        constraints = [
            models.UniqueConstraint(
                fields=["profile", "provider"],
                name="unique_profile_provider",
            ),
        ]

    def __str__(self):
        return f"{self.profile.display_name} — {self.get_provider_display()}"


class MusicTaste(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="music_tastes",
    )
    source = models.CharField(max_length=20, choices=MusicProvider.choices)
    external_artist_id = models.CharField(max_length=128)
    artist_name = models.CharField(max_length=255)
    weight = models.FloatField(default=1.0)

    class Meta:
        verbose_name = "музыкальный вкус"
        verbose_name_plural = "музыкальные вкусы"

    def __str__(self):
        return f"{self.artist_name} ({self.source})"
