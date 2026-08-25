cat > "$LAB/provisiona.sh" <<'PROV'
#!/bin/bash
set -euo pipefail

# 1 — utente di servizio (idempotente: non fallisce se esiste gia')
id appsrv >/dev/null 2>&1 || useradd --system --shell /usr/sbin/nologin appsrv
usermod --shell /usr/sbin/nologin appsrv

# 2 — contenuti e permessi
mkdir -p /srv/sito
[ -f /srv/sito/index.html ] || echo '<h1>sito in piedi</h1>' > /srv/sito/index.html
chown -R root:www-data /srv/sito
find /srv/sito -type f -exec chmod 644 {} +
find /srv/sito -type d -exec chmod 755 {} +

# 3 — nginx
sed -i 's#root /var/www/[a-z]*;#root /srv/sito;#' /etc/nginx/sites-enabled/default
nginx -t >/dev/null 2>&1
systemctl enable --now nginx >/dev/null 2>&1 || true
systemctl reload nginx 2>/dev/null || systemctl restart nginx

# 4 — servizio guardiano
cat > /etc/systemd/system/guardiano.service <<'EOF'
[Unit]
Description=Guardiano del sito
[Service]
User=appsrv
ExecStart=/bin/sh -c 'while :; do sleep 60; done'
Restart=always
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now guardiano >/dev/null 2>&1

# 5 — backup pianificato
cat > /usr/local/bin/backup.sh <<'EOF'
#!/bin/sh
tar czf "/root/backup-$(date +%F).tar.gz" -C /srv sito
EOF
chmod 755 /usr/local/bin/backup.sh
# idempotente: si riscrive il crontab intero invece di appendere
( crontab -l 2>/dev/null | grep -v backup.sh || true; \
  echo '30 3 * * * /usr/local/bin/backup.sh' ) | crontab -

# 6 — firewall: il file e il servizio lo rendono persistente al riavvio
cat > /etc/nftables.conf <<'EOF'
#!/usr/sbin/nft -f
flush ruleset

table inet lab {
    chain input {
        type filter hook input priority 0; policy drop;
        ct state established,related accept
        iif lo accept
        tcp dport { 22, 80 } accept
    }
}
EOF
nft -f /etc/nftables.conf
systemctl enable nftables >/dev/null 2>&1

echo "provisioning completato"
PROV
chmod 755 "$LAB/provisiona.sh"
