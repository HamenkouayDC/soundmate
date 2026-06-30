from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    return Response(
        {
            "service": "soundmate-api",
            "version": "0.1.0",
            "docs": "/api/docs/",
            "health": "/api/v1/health/",
            "endpoints": {
                "auth_register": "/api/v1/auth/register/",
                "auth_login": "/api/v1/auth/login/",
                "users_me": "/api/v1/users/me/",
                "profiles_me": "/api/v1/profiles/me/",
                "profiles_avatar": "/api/v1/profiles/me/avatar/",
                "music_passport": "/api/v1/music/passport/",
                "music_passport_rebuild": "/api/v1/music/passport/rebuild/",
                "music_connections": "/api/v1/music/connections/",
                "feed": "/api/v1/feed/",
                "feed_actions": "/api/v1/feed/actions/",
                "matches": "/api/v1/matches/",
                "matching_feed": "/api/v1/matching/feed/",
            },
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response(
        {
            "status": "ok",
            "service": "soundmate-api",
            "version": "0.1.0",
        }
    )
