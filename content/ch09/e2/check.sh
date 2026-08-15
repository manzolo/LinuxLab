f="$LAB/grossi.txt"
atteso=$(find "$LAB/deposito" -type f -size +1M | sort)
n=$(echo "$atteso" | grep -c . )
lab_fact grossi_reali "$n"
if [ ! -f "$f" ]; then
    lab_check elenco-grossi 1 "(non creato)" "$f"; lab_check nomi-con-spazi 1
else
    ottenuto=$(grep -v '^$' "$f" | sort)
    lab_fact righe_consegnate "$(echo "$ottenuto" | grep -c .)"
    lab_eq elenco-grossi "$atteso" "$ottenuto"
    conspazio=$(find "$LAB/deposito" -type f -size +1M -name '* *' | head -1)
    if [ -n "$conspazio" ] && grep -qxF "$conspazio" "$f"; then lab_check nomi-con-spazi 0
    else lab_check nomi-con-spazi 1 "(il file con lo spazio non c'è, o è spezzato)" "$(basename "$conspazio")"; fi
fi
lab_done
