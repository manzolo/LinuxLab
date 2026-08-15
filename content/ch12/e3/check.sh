p=$(cat /opt/lab/state/parola); f="$LAB/insegna.txt"
lab_fact parola "$p"
if [ -f "$f" ] && [ -s "$f" ]; then
    righe=$(wc -l < "$f" | tr -d ' ')
    lab_fact righe_insegna "$righe"
    # figlet produce sempre piu' righe: un semplice `echo` non basta
    if [ "$righe" -ge 4 ]; then lab_check insegna-creata 0
    else lab_check insegna-creata 1 "$righe righe" "almeno 4 (l'uscita di figlet)" "$f"; fi
else
    lab_check insegna-creata 1 "(vuoto o non creato)" "$f"
fi
if apk info -e figlet >/dev/null 2>&1; then
    lab_check figlet-rimosso 1 "(ancora installato)" "disinstallato"
else
    lab_check figlet-rimosso 0
fi
lab_done
