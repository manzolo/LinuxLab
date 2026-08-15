# Avviata ma non abilitata: sparisce al primo riavvio.
cat > /etc/systemd/system/vigile.service <<'EOF'
[Unit]
Description=vigile
[Service]
ExecStart=/usr/local/bin/vigile.sh
EOF
systemctl daemon-reload && systemctl start vigile
