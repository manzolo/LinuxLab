d="$LAB/backup"; rm -rf "$d"; mkdir -p "$d"
nv=$(edu_rand_int 4 9 15); nr=$(edu_rand_int 3 7 16)
i=1; while [ $i -le $nv ]; do
    n="$(edu_rand_word $((90+i)))-vecchio-$i.bak"; echo x > "$d/$n"
    touch -d "$(date -d "-$((10 + i * 3)) days" '+%Y-%m-%d') 03:00" "$d/$n" 2>/dev/null || true
    i=$((i+1)); done
i=1; while [ $i -le $nr ]; do
    n="$(edu_rand_word $((120+i)))-recente-$i.bak"; echo x > "$d/$n"
    touch -d "$(date -d "-$((i)) days" '+%Y-%m-%d') 03:00" "$d/$n" 2>/dev/null || true
    i=$((i+1)); done
# file .log vecchissimi che NON vanno toccati: il criterio e' anche sul nome
i=1; while [ $i -le 3 ]; do
    n="storico-$i.log"; echo x > "$d/$n"
    touch -d "2025-01-0$i 03:00" "$d/$n" 2>/dev/null || true
    i=$((i+1)); done
printf '%s' "$nv" > /opt/lab/state/nv; printf '%s' "$nr" > /opt/lab/state/nr
