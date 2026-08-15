atteso=$(cat /opt/lab/state/spinner)
lab_fact top_cpu "$(ps -eo comm,pcpu --sort=-pcpu 2>/dev/null | sed -n 2p)"
lab_fact processo_reale "$atteso"
lab_answer_eq colpevole "$atteso"
lab_done
