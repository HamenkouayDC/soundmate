#!/bin/bash
set -e
python3 -c "
import socket
for p in [80, 443, 8000, 8080, 3000, 5000, 9000]:
    s = socket.socket()
    s.settimeout(0.2)
    r = s.connect_ex(('127.0.0.1', p))
    print(p, 'open' if r == 0 else 'closed')
    s.close()
"
