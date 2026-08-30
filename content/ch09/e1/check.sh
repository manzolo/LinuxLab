atteso=$(grep -c ERROR "$LAB/app.log")
lab_fact righe_totali "$(wc -l < "$LAB/app.log" | tr -d ' ')"
lab_answer_eq conteggio-error "$atteso"
lab_done
