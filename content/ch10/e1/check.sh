atteso=$(awk -F, '{s+=$4} END{print s}' "$LAB/vendite.csv")
lab_fact righe "$(wc -l < "$LAB/vendite.csv" | tr -d ' ')"
lab_answer_eq somma "$atteso"
lab_done
