atteso=$(cat /opt/lab/state/mount_pieno 2>/dev/null)
lab_answer_eq mount-pieno "$atteso"
lab_done
