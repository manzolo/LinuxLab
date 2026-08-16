mkdir -p "$LAB" /usr/local/bin
# Il mondo che questo esercizio richiede: `crontab` fa chdir("/var/spool/cron/crontabs"),
# che su Alpine e' un symlink verso /etc/crontabs. In CI quel percorso a volte non
# c'e' e crontab fallisce con "can't change directory", in silenzio. Un seed serve
# esattamente a questo: garantire il mondo, invece di sperare che ci sia.
mkdir -p /etc/crontabs /var/spool/cron
[ -d /var/spool/cron/crontabs ] || ln -sfn /etc/crontabs /var/spool/cron/crontabs
crontab -r 2>/dev/null || true
printf '#!/bin/sh\necho backup\n' > /usr/local/bin/backup.sh
chmod 755 /usr/local/bin/backup.sh
:
