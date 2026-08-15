atteso=$(cat /opt/lab/state/versione)
if apk info -e htop >/dev/null 2>&1; then lab_check htop-installato 0
else lab_check htop-installato 1 "(non installato)" "htop"; fi
lab_fact versione_reale "$atteso"
f="$LAB/versione.txt"
if [ -f "$f" ]; then
    v=$(tr -d ' "\n\r' < "$f")
    lab_fact consegnata "$v"
    lab_eq campo-estratto "$atteso" "$v" "$f"
else
    lab_check campo-estratto 1 "(non creato)" "$f"
fi
lab_done
