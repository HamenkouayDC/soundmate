import json
from datetime import date
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.music.embedding_service import rebuild_profile_mood_from_embedding
from apps.music.models import MusicProvider, MusicTaste
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
            profile.city = item.get("city", "")
            birth_date_raw = item.get("birth_date")
            if birth_date_raw:
                profile.birth_date = date.fromisoformat(birth_date_raw)
            profile.music_embedding = item["music_embedding"]
            profile.mood_profile = item.get("mood_profile")
            profile.save()
            if not profile.mood_profile:
                rebuild_profile_mood_from_embedding(profile)

            for index, artist in enumerate(item.get("artists", []), start=1):
                artist_name = artist["name"] if isinstance(artist, dict) else str(artist)
                MusicTaste.objects.update_or_create(
                    profile=profile,
                    source=MusicProvider.LASTFM,
                    external_artist_id=f"demo-{artist_name.lower().replace(' ', '-')}",
                    defaults={
                        "artist_name": artist_name,
                        "weight": max(1.0, 4.0 - index * 0.5),
                    },
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Готово: {len(profiles_data)} профилей "
                f"(новых пользователей: {created}, обновлено: {updated}). "
                f"Пароль демо-аккаунтов: {DEMO_PASSWORD}"
            )
        )
