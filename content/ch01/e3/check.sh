a=$(lab_answer_read)
lab_fact risposta "${a:-(nessuna)}"
# Accetta sia "-f" sia "f": conta aver trovato l'opzione, non la forma.
case "$a" in -f|f|--fields) lab_check opzione 0 ;; *) lab_check opzione 1 "${a:-(nessuna)}" ;; esac
lab_done
