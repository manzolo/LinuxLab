f="$LAB/audit.txt"; atteso=$(cat /opt/lab/state/attesi)
lab_fact world_writable_reali "$(echo "$atteso" | tr '\n' ' ')"
if [ ! -f "$f" ]; then
    lab_check audit-completo 1 "(non creato)" "$f"
else
    ottenuto=$(grep -v '^$' "$f" | sort)
    lab_fact consegnati "$(echo "$ottenuto" | tr '\n' ' ')"
    lab_eq audit-completo "$atteso" "$ottenuto" "$f"
fi
lab_done
