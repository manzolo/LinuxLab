f="$LAB/cattura.txt"
if [ ! -f "$f" ]; then
    lab_check cattura-con-syn 1 "(non creato)" "$f"
    lab_check risposta-del-server 1 "(nessuna cattura)" "$f"
    lab_done
    return 2>/dev/null || exit 0
fi

lab_fact righe "$(wc -l < "$f" | tr -d ' ')"
lab_fact prima_riga "$(head -1 "$f" | head -c 110)"

# Il SYN iniziale: apertura della connessione, non una risposta.
# Non basta pero' che nel file compaia la scritta "Flags [S]": un file scritto a
# mano passerebbe. Si estrae la PORTA DEL CLIENT dalla riga del SYN e si pretende
# che il server abbia risposto A QUELLA PORTA con un SYN-ACK — cioe' che nel file
# ci sia un pezzo di conversazione coerente, non una frase copiata.
# (Revisione esterna del 2026-08-16: «passa con un file scritto a mano».)
syn=$(grep -E '\.80: Flags \[S\]' "$f" | head -1)
lab_fact syn "${syn:-(nessun SYN verso la porta 80)}"
if [ -n "$syn" ]; then lab_check cattura-con-syn 0
else lab_check cattura-con-syn 1 "(nessun SYN verso la 80)" "una riga  … > ….80: Flags [S]" "$f"; fi

# La porta effimera del client, presa dalla riga del SYN: e' l'unico numero che
# chi bara non puo' indovinare, perche' lo sceglie il kernel al momento.
porta=$(echo "$syn" | sed -n 's/.*[ ]\([0-9][0-9.]*\)\.\([0-9][0-9]*\) > .*/\2/p')
lab_fact porta_client "${porta:-?}"
if [ -n "$porta" ] && grep -E "\.80 > .*\.$porta: Flags \[S\.\]" "$f" >/dev/null 2>&1; then
    lab_check risposta-del-server 0
else
    lab_check risposta-del-server 1 "(nessun SYN-ACK dalla 80 verso la $porta)" \
        "la risposta del server alla stessa porta effimera" "$f"
fi
lab_done
