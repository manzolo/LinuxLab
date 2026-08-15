f="$LAB/coda.txt"
if [ ! -f "$f" ]; then
    lab_check coda 1 "(non creato)" "$f"
else
    a=$(tail -20 "$LAB/app.log" | md5sum | cut -d' ' -f1)
    b=$(md5sum < "$f" | cut -d' ' -f1)
    lab_fact righe_in_coda "$(wc -l < "$f" | tr -d ' ')"
    lab_fact righe_attese 20
    lab_eq coda "$a" "$b"
fi
lab_done
