from django.contrib import admin

from apps.matching.models import FeedAction, Match, Message, WaveSession


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


@admin.register(FeedAction)
class FeedActionAdmin(admin.ModelAdmin):
    list_display = ("actor", "target", "action", "created_at")
    list_filter = ("action", "created_at")
    raw_id_fields = ("actor", "target")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("match", "sender", "text", "created_at")
    list_filter = ("created_at",)
    raw_id_fields = ("match", "sender")
