atteso=$(grep ERROR "$LAB/app.log" | head -1 | awk '{print $2}')
lab_answer_eq primo-errore "$atteso"
lab_done
