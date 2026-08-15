# OnCalendar=daily scatta a mezzanotte, non alle 3:30.
cat > /etc/systemd/system/backup.service <<'EOF'
[Unit]
Description=Backup
[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
EOF
cat > /etc/systemd/system/backup.timer <<'EOF'
[Unit]
Description=Backup
[Timer]
OnCalendar=daily
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload && systemctl enable --now backup.timer
