mkdir -p "$LAB" /usr/local/bin
crontab -r 2>/dev/null || true
printf '#!/bin/sh\necho backup\n' > /usr/local/bin/backup.sh
chmod 755 /usr/local/bin/backup.sh
:
