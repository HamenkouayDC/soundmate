#!/bin/bash
set -euo pipefail

APP_DIR="$HOME/soundmate"
REPO_URL="https://github.com/HamenkouayDC/soundmate.git"
PORT=80
LOG_FILE="$APP_DIR/gunicorn.log"
PID_FILE="$APP_DIR/gunicorn.pid"

mkdir -p "$APP_DIR"

if [ -d "$APP_DIR/repo/.git" ]; then
  cd "$APP_DIR/repo"
  git pull origin main
else
  git clone "$REPO_URL" "$APP_DIR/repo"
  cd "$APP_DIR/repo"
fi

cd backend
mkdir -p data media

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi

.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

if [ ! -f .env ]; then
  cp .env.production.example .env
  SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(48))")
  sed -i "s/replace-with-long-random-secret/$SECRET/" .env
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

.venv/bin/python manage.py migrate --noinput
.venv/bin/python manage.py seed_demo_profiles 2>/dev/null || true
.venv/bin/python manage.py collectstatic --noinput 2>/dev/null || true

pkill -f "gunicorn config.wsgi" 2>/dev/null || true
pkill -f "http.server" 2>/dev/null || true
sleep 1

nohup env $(grep -v '^#' .env | xargs) .venv/bin/gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT}" \
  --workers 2 \
  --timeout 120 \
  > "$LOG_FILE" 2>&1 &

echo $! > "$PID_FILE"
sleep 2

if curl -fsS "http://127.0.0.1:${PORT}/api/v1/health/" >/dev/null; then
  echo "OK: API running on port ${PORT}"
  curl -s "http://127.0.0.1:${PORT}/api/v1/health/"
else
  echo "ERROR: health check failed"
  tail -n 40 "$LOG_FILE" || true
  exit 1
fi
