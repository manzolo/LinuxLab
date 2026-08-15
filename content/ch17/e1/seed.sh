mkdir -p "$LAB" /usr/local/bin
systemctl disable --now vigile 2>/dev/null || true
rm -f /etc/systemd/system/vigile.service
printf '#!/bin/sh\nwhile :; do echo "vigile %s"; sleep 30; done\n' "$(edu_rand_word 401)" > /usr/local/bin/vigile.sh
chmod 755 /usr/local/bin/vigile.sh
systemctl daemon-reload 2>/dev/null || true
:
