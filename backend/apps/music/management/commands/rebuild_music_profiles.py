from django.core.management.base import BaseCommand

from apps.music.embedding_service import (
    rebuild_profile_from_connections,
    rebuild_profile_mood_from_embedding,
)
from apps.profiles.models import Profile
from apps.users.models import User


class Command(BaseCommand):
    help = "Пересобрать music_embedding и mood_profile из подключённого Last.fm"

    def add_arguments(self, parser):
        parser.add_argument("--email", help="Email пользователя")
        parser.add_argument("--all", action="store_true", help="Все профили с активным Last.fm")
        parser.add_argument(
            "--mood-only",
            action="store_true",
            help="Только пересчитать mood_profile из существующего embedding",
        )

    def handle(self, *args, **options):
        if options["mood_only"]:
            profiles = Profile.objects.exclude(music_embedding__isnull=True)
            updated = 0
            for profile in profiles:
                rebuild_profile_mood_from_embedding(profile)
                updated += 1
            self.stdout.write(self.style.SUCCESS(f"Mood обновлён для {updated} профилей."))
            return

        if options["email"]:
            user = User.objects.get(email=options["email"])
            ok = rebuild_profile_from_connections(user.profile)
            if ok:
                self.stdout.write(self.style.SUCCESS(f"Профиль {options['email']} обновлён."))
            else:
                self.stderr.write("Нет активного Last.fm или ошибка API.")
            return

        if options["all"]:
            updated = 0
            for profile in Profile.objects.all():
                if rebuild_profile_from_connections(profile):
                    updated += 1
            self.stdout.write(self.style.SUCCESS(f"Обновлено профилей: {updated}."))
            return

        self.stderr.write("Укажите --email, --all или --mood-only.")
