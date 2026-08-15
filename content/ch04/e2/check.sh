atteso=$(sed -n '500p' "$LAB/app.log")
lab_fact riga_500 "$atteso"
a=$(cat /opt/lab/state/answer 2>/dev/null | sed 's/[[:space:]]*$//')
lab_fact consegnata "${a:-(nessuna)}"
lab_eq riga-500 "$atteso" "$a"
lab_done
