atteso=$(cat /opt/lab/state/svc)
lab_fact proprietario_cartella "$(stat -c '%U' "$LAB/servizio")"
lab_fact shell "$(getent passwd "$atteso" | cut -d: -f7)"
lab_answer_eq utente-di-servizio "$atteso"
lab_done
