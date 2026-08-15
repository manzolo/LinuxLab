p=$(cat /opt/lab/state/porta); parola=$(cat /opt/lab/state/parola); f="$LAB/pagina-per-nome.html"
lab_fact hosts "$(grep -i 'mio.sito' /etc/hosts 2>/dev/null | tr '\n' ' ' | head -c 60)"
if getent hosts mio.sito >/dev/null 2>&1; then
    lab_check hosts-configurato 0
else
    lab_check hosts-configurato 1 "(il nome non si risolve)" "una riga in /etc/hosts"
fi
if [ -f "$f" ] && grep -q "$parola" "$f" 2>/dev/null; then
    # La prova che conta: il nome funziona DAVVERO adesso, non solo che il file esiste
    if curl -s --max-time 5 "http://mio.sito:$p/" 2>/dev/null | grep -q "$parola"; then
        lab_check scaricata-per-nome 0
    else
        lab_check scaricata-per-nome 1 "(il file c'è ma il nome ora non funziona)" "curl http://mio.sito:$p/ deve rispondere"
    fi
else
    lab_check scaricata-per-nome 1 "(assente o contenuto diverso)" "$f"
fi
lab_done
