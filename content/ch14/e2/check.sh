riga=$(crontab -l 2>/dev/null | grep -v '^[[:space:]]*#' | grep 'backup.sh' | head -1)
lab_fact crontab "$(crontab -l 2>/dev/null | tr '\n' ' | ' | head -c 120)"
# Diagnostica: se un giorno il crontab risultasse vuoto senza motivo apparente,
# queste due righe dicono se il comando c'e' e cosa c'e' scritto sul disco,
# invece di lasciare indovinare. (Serviti davvero, per un fallimento in CI.)
lab_fact crontab_comando "$(command -v crontab || echo '(assente)')"
lab_fact crontab_su_disco "$(head -c 90 /etc/crontabs/root 2>/dev/null | tr '\n' ' | ' || echo '(nessun file)')"
if [ -z "$riga" ]; then
    lab_check orario-giusto 1 "(nessuna riga con backup.sh)" "30 3 * * * /usr/local/bin/backup.sh"
    lab_check ogni-giorno 1; lab_check comando-giusto 1
else
    m=$(echo "$riga" | awk '{print $1}'); h=$(echo "$riga" | awk '{print $2}')
    dom=$(echo "$riga" | awk '{print $3}'); mon=$(echo "$riga" | awk '{print $4}'); dow=$(echo "$riga" | awk '{print $5}')
    cmd=$(echo "$riga" | awk '{for(i=6;i<=NF;i++) printf "%s%s", $i, (i<NF?" ":"")}')
    lab_fact campi "min=$m ora=$h giorno=$dom mese=$mon settimana=$dow"
    lab_fact comando "$cmd"
    # Invariante sui CAMPI, non sulla stringa: chi scrive "30 03" o mette spazi extra passa uguale.
    if [ "$m" = "30" ] && [ "$h" = "3" -o "$h" = "03" ]; then lab_check orario-giusto 0
    else lab_check orario-giusto 1 "minuto=$m ora=$h" "minuto=30 ora=3"; fi
    if [ "$dom" = "*" ] && [ "$mon" = "*" ] && [ "$dow" = "*" ]; then lab_check ogni-giorno 0
    else lab_check ogni-giorno 1 "$dom $mon $dow" "* * *"; fi
    case "$cmd" in /usr/local/bin/backup.sh*) lab_check comando-giusto 0 ;;
        *) lab_check comando-giusto 1 "$cmd" "/usr/local/bin/backup.sh" ;; esac
fi
lab_done
