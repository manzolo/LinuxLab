mkdir -p "$LAB" /usr/local/bin
systemctl disable --now fragile 2>/dev/null || true
printf '#!/bin/sh\nwhile :; do sleep 30; done\n' > /usr/local/bin/fragile.sh
# Il guasto: lo script c'e' e il percorso e' giusto, ma manca il permesso di
# esecuzione. systemd fallisce con 203/EXEC, e la riga sta nel journal.
chmod 644 /usr/local/bin/fragile.sh
cat > /etc/systemd/system/fragile.service <<'EOF'
[Unit]
Description=Servizio con un guasto da trovare
[Service]
ExecStart=/usr/local/bin/fragile.sh
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl start fragile 2>/dev/null || true
:
