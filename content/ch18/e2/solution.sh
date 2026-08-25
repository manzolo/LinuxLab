# tcpdump si attacca all'interfaccia quando decide lui, e senza -l scrive
# bufferizzato: un "sleep 1" di speranza basta in locale e fallisce sul runner
# carico (CI, seme 7, 2026-08-25). Quindi: si parte quando tcpdump ha detto
# "listening", e ci si ferma quando la stretta di mano E' nel file — eventi,
# non secondi.
err=$(mktemp)
tcpdump -n -l --immediate-mode -i lo -c 10 port 80 > "$LAB/cattura.txt" 2>"$err" &
p=$!
i=0
while [ "$i" -lt 50 ] && ! grep -q listening "$err" 2>/dev/null; do sleep 0.1; i=$((i+1)); done
giro=0
while [ "$giro" -lt 3 ]; do
    curl -s localhost >/dev/null 2>&1 || true
    i=0
    while [ "$i" -lt 20 ]; do
        if grep -qE '\.80: Flags \[S\]' "$LAB/cattura.txt" 2>/dev/null \
           && grep -qE '\.80 > .*Flags \[S\.\]' "$LAB/cattura.txt" 2>/dev/null; then
            break 2
        fi
        sleep 0.1; i=$((i+1))
    done
    giro=$((giro+1))
done
kill "$p" 2>/dev/null || true
wait "$p" 2>/dev/null || true
rm -f "$err"
