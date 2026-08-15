d="$LAB/backup"; nr=$(cat /opt/lab/state/nr)
vecchi=$(find "$d" -type f -name '*.bak' -mtime +7 2>/dev/null | wc -l | tr -d ' ')
recenti=$(find "$d" -type f -name '*recente*.bak' 2>/dev/null | wc -l | tr -d ' ')
log=$(find "$d" -type f -name '*.log' 2>/dev/null | wc -l | tr -d ' ')
lab_fact bak_vecchi_rimasti "$vecchi"
lab_fact bak_recenti_rimasti "$recenti (attesi $nr)"
lab_fact log_rimasti "$log (attesi 3)"
lab_eq vecchi-cancellati "0" "$vecchi"
if [ "$recenti" = "$nr" ] && [ "$log" = "3" ]; then lab_check recenti-salvi 0
else lab_check recenti-salvi 1 "recenti=$recenti log=$log" "recenti=$nr log=3" "$d"; fi
lab_done
