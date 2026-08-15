atteso=$(wc -l < "$LAB/app.log" | tr -d ' ')
lab_fact righe_reali "$atteso"
lab_answer_eq righe "$atteso"
lab_done
