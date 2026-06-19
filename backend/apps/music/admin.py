from django.contrib import admin

from apps.music.models import MusicConnection, MusicTaste


@admin.register(MusicConnection)
class MusicConnectionAdmin(admin.ModelAdmin):
    list_display = ("profile", "provider", "external_user_id", "is_active", "connected_at")
    list_filter = ("provider", "is_active")
    search_fields = ("profile__display_name", "external_user_id")
    raw_id_fields = ("profile",)


@admin.register(MusicTaste)
class MusicTasteAdmin(admin.ModelAdmin):
    list_display = ("artist_name", "source", "profile", "weight")
    list_filter = ("source",)
    search_fields = ("artist_name", "profile__display_name")
    raw_id_fields = ("profile",)
