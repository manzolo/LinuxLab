riga=$(getent passwd deploy)
lab_fact passwd "${riga:-(utente assente)}"
lab_fact gruppi "$(id -nG deploy 2>/dev/null || echo '(nessuno)')"
if [ -n "$riga" ]; then
    lab_check utente-esiste 0
    id -nG deploy 2>/dev/null | tr ' ' '\n' | grep -qx web \
        && lab_check nel-gruppo 0 || lab_check nel-gruppo 1 "$(id -nG deploy 2>/dev/null)" "web"
    h=$(echo "$riga" | cut -d: -f6); s=$(echo "$riga" | cut -d: -f7)
    if [ "$h" = "/home/deploy" ] && [ "$s" = "/bin/bash" ]; then lab_check shell-e-home 0
    else lab_check shell-e-home 1 "$h $s" "/home/deploy /bin/bash"; fi
else
    lab_check utente-esiste 1 "(non creato)" "deploy"
    lab_check nel-gruppo 1; lab_check shell-e-home 1
fi
lab_done
