atteso=$(cat /opt/lab/state/hog 2>/dev/null)
lab_fact top_cpu "$(ps -eo comm,pcpu --sort=-pcpu 2>/dev/null | sed -n 2p)"
lab_fact atteso "$atteso"
lab_answer_eq colpevole-cpu "$atteso"
lab_done
