atteso=$(grep ERROR "$LAB/app.log" | head -1 | awk '{print $2}')
lab_fact prima_riga_error "$(grep ERROR "$LAB/app.log" | head -1)"
lab_fact orario_reale "$atteso"
lab_answer_eq primo-errore "$atteso"
lab_done
