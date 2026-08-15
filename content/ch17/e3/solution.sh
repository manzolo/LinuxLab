cat > /etc/systemd/system/backup.service <<'EOF'
[Unit]
Description=Backup notturno
[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
EOF
cat > /etc/systemd/system/backup.timer <<'EOF'
[Unit]
Description=Backup notturno alle 3:30
[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload && systemctl enable --now backup.timer
