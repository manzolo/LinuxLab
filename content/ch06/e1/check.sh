atteso=$(stat -c '%a' "$LAB/misterioso")
lab_fact permessi_lettere "$(ls -l "$LAB/misterioso" | cut -c1-10)"
lab_answer_eq ottale "$atteso"
lab_done
