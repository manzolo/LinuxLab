# restart senza correggere il permesso: fallisce di nuovo, uguale.
systemctl restart fragile 2>/dev/null || true
sleep 1
