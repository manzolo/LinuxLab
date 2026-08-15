atteso=$(cat /opt/lab/state/recente)
lab_fact per_data "$(ls -t "$LAB/scarico" | head -3 | tr '\n' ' ')"
lab_answer_eq piu-recente "$atteso"
lab_done
