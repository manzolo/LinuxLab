cat > /usr/local/bin/backup.sh <<'EOF'
#!/bin/sh
tar czf "$HOME/lab/backup-$(date +%F).tar.gz" -C "$HOME/lab" dati
logger -t backup "backup completato"
EOF
chmod 755 /usr/local/bin/backup.sh
/usr/local/bin/backup.sh
