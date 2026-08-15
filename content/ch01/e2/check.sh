f="$LAB/saluto.txt"
if [ -f "$f" ]; then
    lab_check esiste 0
    n=$(wc -c < "$f" | tr -d ' ')
    lab_fact byte "$n"
    lab_fact contenuto "$(cat "$f" | head -c 40)"
    # L'invariante e' il contenuto esatto, non il comando usato per produrlo.
    if [ "$(cat "$f")" = "ciao mondo" ] && [ "$n" = "10" ]; then
        lab_check byte 0
    else
        lab_check byte 1 "$n byte" "10 byte" "$f"
    fi
else
    lab_check esiste 1 "(assente)" "$f"
    lab_check byte 1
fi
lab_done
