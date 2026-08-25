atteso=$(cat /opt/lab/state/mount_pieno 2>/dev/null)
lab_fact df_100 "$(df -P 2>/dev/null | awk '$5=="100%"{print $6}' | head -1)"
lab_fact atteso "$atteso"
lab_answer_eq mount-pieno "$atteso"
lab_done
