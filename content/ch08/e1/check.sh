f="$LAB/elenco.txt"
g="$LAB/conteggio.txt"
if [ ! -f "$f" ]; then
    lab_check elenco-salvato 1 "(non creato)" "$f"
else
    lab_fact righe "$(wc -l < "$f" | tr -d ' ')"
    lab_fact contenuto "$(head -c 80 "$f" | tr '\n' ' ')"
    n=$(cd "$LAB" && ls | grep -c '\.dat$')
    m=$(grep -c '\.dat$' "$f")   # grep -c stampa gia' 0: niente `|| echo 0`
    lab_eq elenco-salvato "$n" "$m"
fi

# La prova che il flusso e' PROSEGUITO dopo essere stato salvato: il conteggio deve
# esserci e deve combaciare con le righe del file. Con un solo `>` non si ottiene.
if [ ! -f "$g" ]; then
    lab_check conteggio-coerente 1 "(non creato)" "$g"
elif [ ! -f "$f" ]; then
    lab_check conteggio-coerente 1 "(manca l'elenco)" "$f"
else
    atteso=$(wc -l < "$f" | tr -d ' ')
    dato=$(tr -dc '0-9' < "$g")
    lab_fact conteggio "letto=${dato:-vuoto} righe_elenco=$atteso"
    lab_eq conteggio-coerente "$atteso" "${dato:-vuoto}"
fi
lab_done
