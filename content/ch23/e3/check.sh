atteso=$(cat /opt/lab/state/hog 2>/dev/null)
lab_answer_eq colpevole-cpu "$atteso"
lab_done
