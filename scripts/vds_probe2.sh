#!/bin/bash
python3 -c "
import socket
for host in ['127.0.0.1', '172.20.0.1', 'postgres', 'db', 'database']:
    for p in [5432, 8000]:
        s = socket.socket()
        s.settimeout(0.3)
        r = s.connect_ex((host, p))
        if r == 0:
            print(host, p, 'open')
        s.close()
"
