d="$LAB/registri"
nlog=$(cat /opt/lab/state/nlog)
fuori=$(find "$d" -maxdepth 1 -name '*.log' 2>/dev/null | wc -l | tr -d ' ')
dentro=$(find "$d/archivio" -maxdepth 1 -name '*.log' 2>/dev/null | wc -l | tr -d ' ')
lab_fact log_totali "$nlog"
lab_fact log_ancora_fuori "$fuori"
lab_fact log_in_archivio "$dentro"
if [ "$fuori" = "0" ] && [ "$dentro" = "$nlog" ]; then
    lab_check log-archiviati 0
else
    lab_check log-archiviati 1 "fuori=$fuori dentro=$dentro" "fuori=0 dentro=$nlog" "$d/archivio"
fi
atteso=$(cat /opt/lab/state/txtmd5)
ora=$( (cd "$d" 2>/dev/null && ls *.txt 2>/dev/null | sort | md5sum) )
lab_fact txt_rimasti "$(find "$d" -maxdepth 1 -name '*.txt' 2>/dev/null | wc -l | tr -d ' ')"
lab_eq txt-intatti "$atteso" "$ora"
lab_done
