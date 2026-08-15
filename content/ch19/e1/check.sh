if nginx -t >/dev/null 2>&1; then lab_check config-valida 0
else lab_check config-valida 1 "$(nginx -t 2>&1 | tail -1 | head -c 90)" "nginx -t senza errori"; fi
atteso=$(cat "$LAB/testo.txt")
ottenuto=$(curl -s --max-time 5 http://localhost/ 2>/dev/null)
lab_fact atteso "$(echo "$atteso" | head -c 60)"
lab_fact servito "$(echo "${ottenuto:-(nessuna risposta)}" | head -c 60)"
if [ "$(echo "$ottenuto" | tr -d ' \n')" = "$(echo "$atteso" | tr -d ' \n')" ]; then lab_check risponde 0
else lab_check risponde 1 "$(echo "${ottenuto:-(nessuna risposta)}" | head -c 40)" "il contenuto di testo.txt"; fi
lab_done
