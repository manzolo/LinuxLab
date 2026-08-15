mkdir -p "$LAB" /usr/local/bin
systemctl disable --now backup.timer 2>/dev/null || true
rm -f /etc/systemd/system/backup.service /etc/systemd/system/backup.timer
printf '#!/bin/sh\necho "backup %s"\n' "$(edu_rand_word 402)" > /usr/local/bin/backup.sh
chmod 755 /usr/local/bin/backup.sh
systemctl daemon-reload
:
