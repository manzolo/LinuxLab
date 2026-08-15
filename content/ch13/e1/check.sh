atteso=$(cat /opt/lab/state/grande)
lab_fact classifica "$(du -s "$LAB/deposito"/* 2>/dev/null | sort -n | tail -3 | awk '{print $2}' | xargs -n1 basename 2>/dev/null | tr '\n' ' ')"
lab_fact piu_grande_reale "$atteso"
lab_answer_eq piu-grande "$atteso"
lab_done
