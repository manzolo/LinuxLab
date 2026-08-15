atteso=$(ip -4 -o a show lo 2>/dev/null | awk '{print $4}' | cut -d/ -f1 | head -1)
lab_fact interfaccia "$(ip -o a show lo 2>/dev/null | head -1 | cut -c1-90)"
lab_fact indirizzo_reale "$atteso"
lab_answer_eq loopback "$atteso"
lab_done
