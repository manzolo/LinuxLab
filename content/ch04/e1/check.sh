atteso=$(wc -l < "$LAB/app.log" | tr -d ' ')
lab_answer_eq righe "$atteso"
lab_done
