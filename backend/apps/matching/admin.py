from django.contrib import admin

from apps.matching.models import Match, WaveSession


@admin.register(WaveSession)
class WaveSessionAdmin(admin.ModelAdmin):
    list_display = ("listener", "target", "status", "listen_duration_sec", "created_at")
    list_filter = ("status", "created_at")
    raw_id_fields = ("listener", "target")


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ("user_a", "user_b", "status", "created_at")
    list_filter = ("status", "created_at")
    raw_id_fields = ("user_a", "user_b")
