atteso=/opt/lab/state/nota-attesa
nota="$LAB/nota.conf"
lab_fact incarico "$(tr '\n' ' ' < "$atteso")"
if [ ! -f "$nota" ]; then
    lab_check nota-multilinea 1 "(non creato)" "$nota"
elif cmp -s "$atteso" "$nota"; then
    lab_check nota-multilinea 0
else
    lab_fact consegnato "$(tr '\n' ' ' < "$nota" | head -c 160)"
    lab_check nota-multilinea 1 "$nota" "$atteso" "$nota"
fi
lab_done
