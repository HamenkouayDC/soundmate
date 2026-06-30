#!/bin/bash
pkill -f "http.server" 2>/dev/null || true
for PORT in 80 8000 8080 3000 5000; do
  echo "=== testing port $PORT ==="
  nohup python3 -m http.server "$PORT" --bind 0.0.0.0 > "/tmp/http${PORT}.log" 2>&1 &
  sleep 1
  if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    echo "local $PORT ok"
  else
    echo "local $PORT failed"
    cat "/tmp/http${PORT}.log" 2>/dev/null
  fi
  pkill -f "http.server ${PORT}" 2>/dev/null || true
  sleep 1
done
