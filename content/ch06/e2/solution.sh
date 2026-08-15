s="$LAB/srv/sito"
chown -R web:web "$s"
find "$s" -type f -exec chmod 644 {} +
find "$s" -type d -exec chmod 755 {} +
