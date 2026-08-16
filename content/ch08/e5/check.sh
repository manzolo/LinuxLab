atteso=/opt/lab/state/nota-attesa
nota="$LAB/nota.conf"
richiesta=$(cat "$LAB/incarico.txt")
lab_fact incarico "$richiesta"
if [ ! -f "$nota" ]; then
    lab_check nota-multilinea 1 "(non creato)" "$nota"
elif cmp -s "$atteso" "$nota"; then
    lab_check nota-multilinea 0
else
    ottenuta=$(grep '^responsabile=' "$nota" | head -1)
    lab_fact responsabile "${ottenuta:-manca}"
    if [ "$ottenuta" = "$richiesta" ]; then
        hash_dato=$(sha256sum "$nota" | awk '{print $1}')
        hash_atteso=$(sha256sum "$atteso" | awk '{print $1}')
        lab_fact checksum "got=$hash_dato want=$hash_atteso"
        lab_check nota-multilinea 1 "sha256=$hash_dato" "sha256=$hash_atteso" "$nota"
    else
        lab_check nota-multilinea 1 "${ottenuta:-missing}" "$richiesta" "$nota"
    fi
fi
lab_done
