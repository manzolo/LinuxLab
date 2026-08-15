tcpdump -n -i lo -c 10 port 80 > "$LAB/cattura.txt" 2>/dev/null &
p=$!
sleep 1
curl -s localhost >/dev/null 2>&1 || true
sleep 1
kill $p 2>/dev/null || true
wait $p 2>/dev/null || true
