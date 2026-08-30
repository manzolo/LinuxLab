atteso=$(sed -n '500p' "$LAB/app.log")
# Niente `lab_fact riga_500` e niente lab_eq: metterebbero la risposta attesa
# nel verdetto a vuoto. Il confronto resta a mano perche' la riga ha spazi
# e lab_answer_read li toglierebbe.
a=$(cat /opt/lab/state/answer 2>/dev/null | sed 's/[[:space:]]*$//')
lab_fact consegnata "${a:-(nessuna)}"
if [ "$a" = "$atteso" ]; then lab_check riga-500 0
else lab_check riga-500 1 "${a:-(vuoto)}"; fi
lab_done
