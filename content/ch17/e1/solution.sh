cat > /etc/systemd/system/vigile.service <<'EOF'
[Unit]
Description=Il vigile del laboratorio
[Service]
ExecStart=/usr/local/bin/vigile.sh
Restart=always
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable --now vigile
