f="$LAB/report.txt"
atteso=$(awk '{print $NF}' "$LAB/app.log" | sort | uniq -c | sort -rn | awk '{print $2, $1}')
lab_fact report_reale "$(echo "$atteso" | tr '\n' ' | ')"
if [ ! -f "$f" ]; then
    lab_check report 1 "(non creato)" "$f"
else
    ottenuto=$(sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//' "$f" | grep -v '^$')
    lab_fact consegnato "$(echo "$ottenuto" | tr '\n' ' | ')"
    lab_eq report "$atteso" "$ottenuto"
fi
lab_done
