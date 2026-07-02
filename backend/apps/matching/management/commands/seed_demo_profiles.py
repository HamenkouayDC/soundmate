import json
from datetime import date
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.matching.models import FeedAction, FeedActionType
from apps.music.embedding_service import rebuild_profile_mood_from_embedding
from apps.music.models import MusicProvider, MusicTaste
from apps.profiles.models import Profile
from apps.users.models import User

DEMO_PASSWORD = "demopass123"

# Эти demo-аккаунты заранее "лайкают" всех остальных demo-пользователей,
# чтобы в демо можно было получить матч, просто лайкнув их в /feed.
DEMO_HUB_EMAILS = [
    "demo.folk@soundmate.local",
    "demo.latin@soundmate.local",
]


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
        users_by_email: dict[str, User] = {}

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
            users_by_email[item["email"]] = user

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

        preliked = self._seed_incoming_likes(users_by_email)

        self.stdout.write(
            self.style.SUCCESS(
                f"Готово: {len(profiles_data)} профилей "
                f"(новых пользователей: {created}, обновлено: {updated}). "
                f"Предзагружено {preliked} входящих лайков от {', '.join(DEMO_HUB_EMAILS)} "
                f"для демо-матчей. "
                f"Пароль демо-аккаунтов: {DEMO_PASSWORD}"
            )
        )

    def _seed_incoming_likes(self, users_by_email: dict[str, User]) -> int:
        """Хаб-аккаунты заранее лайкают всех остальных, чтобы ответный лайк
        любого demo-пользователя сразу создавал матч (is_match: true)."""
        hub_users = [users_by_email[email] for email in DEMO_HUB_EMAILS if email in users_by_email]
        count = 0
        for hub_user in hub_users:
            for target_user in users_by_email.values():
                if target_user.id == hub_user.id:
                    continue
                FeedAction.objects.update_or_create(
                    actor=hub_user,
                    target=target_user,
                    defaults={"action": FeedActionType.LIKE},
                )
                count += 1
        return count
