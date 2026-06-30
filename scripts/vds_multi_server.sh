#!/bin/bash
pkill -f "http.server" 2>/dev/null || true
PORTS="2017 2217 8017 1717 1700 8000 80 8080"
for PORT in $PORTS; do
  nohup python3 -m http.server "$PORT" --bind 0.0.0.0 > "/tmp/http${PORT}.log" 2>&1 &
  sleep 0.5
done
sleep 1
pgrep -af "http.server" || true
