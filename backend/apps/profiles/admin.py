from django.contrib import admin

from apps.profiles.models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "user", "birth_date", "updated_at")
    search_fields = ("display_name", "user__email")
    list_filter = ("updated_at",)
    raw_id_fields = ("user",)
