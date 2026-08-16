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
# Non basta pero' che nel file compaia la scritta "Flags [S]". Si estrae la PORTA
# DEL CLIENT dalla riga del SYN e si pretende che il server abbia risposto A QUELLA
# PORTA con un SYN-ACK: nel file dev'esserci un pezzo di conversazione coerente,
# non una frase copiata.
#
# Detto onestamente: questo NON e' a prova di falso — un file si scrive a mano, e
# chi conosce il formato puo' inventare due righe coerenti. E' pero' un falso che
# richiede di aver capito com'e' fatta una stretta di mano TCP, che e' esattamente
# la cosa da imparare. Qui l'anti-trucco vero (il seme che genera il mondo) non si
# applica: l'artefatto e' un file di testo, e un file di testo si scrive.
# (Due giri di revisione, 2026-08-16.)
syn=$(grep -E '\.80: Flags \[S\]' "$f" | head -1)
lab_fact syn "${syn:-(nessun SYN verso la porta 80)}"
if [ -n "$syn" ]; then lab_check cattura-con-syn 0
else lab_check cattura-con-syn 1 "(nessun SYN verso la 80)" "una riga  … > ….80: Flags [S]" "$f"; fi

# La porta effimera del client, presa dalla riga del SYN. Non e' un segreto: e'
# scritta nel file stesso. Serve a pretendere COERENZA fra le due righe, non a
# rendere impossibile il falso.
# L'indirizzo puo' essere IPv4 o IPv6: su una macchina dove `localhost` risolve
# prima ::1, tcpdump scrive `IP6 ::1.55676 > ::1.80`. Quindi non si presume la
# forma dell'indirizzo — si prende il token subito prima di " > " e se ne stacca
# la coda numerica. (Beccato dalla CI, che gira su un runner con IPv6: qui in
# locale usciva IPv4 e passava. 2026-08-16.)
porta=$(echo "$syn" | sed -n 's/^.* \([^ ]*\)\.\([0-9][0-9]*\) > .*$/\2/p')
lab_fact porta_client "${porta:-?}"
if [ -n "$porta" ] && grep -E "\.80 > .*\.$porta: Flags \[S\.\]" "$f" >/dev/null 2>&1; then
    lab_check risposta-del-server 0
else
    lab_check risposta-del-server 1 "(nessun SYN-ACK dalla 80 verso la $porta)" \
        "la risposta del server alla stessa porta effimera" "$f"
fi
lab_done
