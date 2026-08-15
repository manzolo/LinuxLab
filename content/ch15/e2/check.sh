p=$(cat /opt/lab/state/porta); parola=$(cat /opt/lab/state/parola); f="$LAB/pagina.html"
lab_fact porta_reale "$p"
lab_fact in_ascolto "$(ss -tln 2>/dev/null | grep -c ":$p")"
if [ -f "$f" ]; then
    lab_fact scaricato "$(head -c 60 "$f" | tr '\n' ' ')"
    if grep -q "$parola" "$f" 2>/dev/null; then lab_check pagina-scaricata 0
    else lab_check pagina-scaricata 1 "(contenuto diverso da quello servito)" "la pagina di 127.0.0.1:$p" "$f"; fi
else
    lab_check pagina-scaricata 1 "(non creato)" "$f"
fi
lab_done
