f="$LAB/cattura.txt"
if [ ! -f "$f" ]; then
    lab_check cattura-con-syn 1 "(non creato)" "$f"
else
    lab_fact righe "$(wc -l < "$f" | tr -d ' ')"
    lab_fact prima_riga "$(head -1 "$f" | head -c 110)"
    # Un SYN senza ACK: e' l'apertura della connessione, non una risposta.
    if grep -qE 'Flags \[S\]' "$f"; then lab_check cattura-con-syn 0
    else lab_check cattura-con-syn 1 "(nessun SYN nella cattura)" "almeno una riga con Flags [S]" "$f"; fi
fi
lab_done
