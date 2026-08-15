# Minuto e ora invertiti: gira ogni ora al minuto 3, non alle 3:30.
echo '3 30 * * * /usr/local/bin/backup.sh' | crontab - 2>/dev/null || echo '3 * * * * backup.sh' | crontab -
