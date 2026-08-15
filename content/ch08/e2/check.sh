f="$LAB/top-ip.txt"
atteso=$(awk '{print $6}' "$LAB/app.log" | sort | uniq -c | sort -rn | head -5 | awk '{print $2}')
lab_fact top5_reali "$(echo "$atteso" | tr '\n' ' ')"
if [ ! -f "$f" ]; then
    lab_check top5 1 "(non creato)" "$f"
else
    ottenuto=$(sed 's/[[:space:]]*$//' "$f" | grep -v '^$' | head -5)
    lab_fact consegnati "$(echo "$ottenuto" | tr '\n' ' ')"
    lab_eq top5 "$atteso" "$ottenuto"
fi
lab_done
