d="$LAB/conf"; vecchio=$(sed -n 1p "$d/CAMBIO.txt"); nuovo=$(sed -n 2p "$d/CAMBIO.txt")
tot=$(cat /opt/lab/state/tot)
rimasti=$(grep -l -- "$vecchio" "$d"/*.conf 2>/dev/null | wc -l | tr -d ' ')
nuovi=$(cat "$d"/*.conf 2>/dev/null | grep -c -- "$nuovo")
lab_fact vecchio "$vecchio"; lab_fact nuovo "$nuovo"
lab_fact conf_col_vecchio "$rimasti"
lab_fact occorrenze_nuovo "$nuovi (attese $tot)"
lab_eq vecchio-sparito "0" "$rimasti"
lab_eq nuovo-presente "$tot" "$nuovi"
if ( cd "$d" && md5sum -c --status /opt/lab/state/altri 2>/dev/null ); then
    lab_check altri-intatti 0
else
    lab_check altri-intatti 1 "note.txt o index.html modificati" "intatti" "$d"
fi
lab_done
