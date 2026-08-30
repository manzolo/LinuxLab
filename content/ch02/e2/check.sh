atteso=$(cat /opt/lab/state/nascosti)
lab_fact elenco "$(ls -A "$LAB/scarico" | tr '\n' ' ')"
lab_answer_eq conteggio "$atteso"
lab_done
