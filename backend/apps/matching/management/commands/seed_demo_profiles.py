import json
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.profiles.models import Profile
from apps.users.models import User

DEMO_PASSWORD = "demopass123"


class Command(BaseCommand):
    help = "Создать демо-пользователей с music_embedding для показа матчинга"

    def handle(self, *args, **options):
        dataset_path = Path(__file__).resolve().parents[5] / "ml" / "data" / "demo_profiles.json"
        if not dataset_path.exists():
            self.stderr.write(f"Файл не найден: {dataset_path}")
            self.stderr.write("Запустите: cd ml && python generate_dataset.py")
            return

        profiles_data = json.loads(dataset_path.read_text(encoding="utf-8"))
        created = 0
        updated = 0

        for item in profiles_data:
            user, was_created = User.objects.get_or_create(
                email=item["email"],
                defaults={"is_active": True},
            )
            if was_created:
                user.set_password(DEMO_PASSWORD)
                user.save()
                created += 1
            else:
                updated += 1

            profile, _ = Profile.objects.get_or_create(
                user=user,
                defaults={"display_name": item["display_name"]},
            )
            profile.display_name = item["display_name"]
            profile.bio = item.get("bio", "")
            profile.music_embedding = item["music_embedding"]
            profile.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Готово: {len(profiles_data)} профилей "
                f"(новых пользователей: {created}, обновлено: {updated}). "
                f"Пароль демо-аккаунтов: {DEMO_PASSWORD}"
            )
        )
