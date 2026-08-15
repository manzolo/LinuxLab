f="$LAB/elenco.txt"
if [ ! -f "$f" ]; then
    lab_check elenco-salvato 1 "(non creato)" "$f"
else
    lab_fact righe "$(wc -l < "$f" | tr -d ' ')"
    lab_fact contenuto "$(head -c 80 "$f" | tr '\n' ' ')"
    n=$(cd "$LAB" && ls | grep -c '\.dat$')
    m=$(grep -c '\.dat$' "$f")   # grep -c stampa gia' 0: niente `|| echo 0`
    lab_eq elenco-salvato "$n" "$m"
fi
lab_done
