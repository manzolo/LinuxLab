s="$LAB/salva.sh"; oggi=$(date +%F)
if [ ! -x "$s" ]; then
    lab_check archivio-buono 1 "(script assente o non eseguibile)" "$s"
    lab_check esce-zero 1; lab_check esce-uno 1; lab_check dice-perche 1
else
    rm -f "$LAB"/salva-*.tar.gz
    "$s" "$LAB/dati" >/dev/null 2>&1; rc=$?
    a="$LAB/salva-$oggi.tar.gz"
    lab_fact archivio_atteso "$a"
    lab_fact codice_uscita_successo "$rc"
    # Non basta che l'archivio si APRA: deve contenere la cartella richiesta.
    # Prima si fermava a `tar tzf >/dev/null`, che dice solo "e' un tar valido" —
    # e un tar valido e vuoto lo e'. (Revisione esterna del 2026-08-16.)
    if [ -f "$a" ]; then
        dentro=$(tar tzf "$a" 2>/dev/null | head -20 | tr '\n' ' ')
        lab_fact contenuto_archivio "${dentro:-(vuoto o illeggibile)}"
        nfile=$(tar tzf "$a" 2>/dev/null | grep -c '^dati/.')
        lab_fact file_dentro "$nfile"
        attesi=$(find "$LAB/dati" -type f | wc -l | tr -d ' ')
        if echo "$dentro" | grep -q 'dati/' && [ "$nfile" = "$attesi" ]; then lab_check archivio-buono 0
        else lab_check archivio-buono 1 "dentro=$nfile voci sotto dati/" "$attesi file, sotto dati/" "$a"; fi
    else
        lab_check archivio-buono 1 "$(ls "$LAB"/salva-* 2>/dev/null | tr '\n' ' ')" "$a" ; fi
    lab_eq esce-zero "0" "$rc"

    # Il caso d'errore: codice 1 E un messaggio su stderr. La consegna chiede
    # entrambe le cose, quindi si guardano entrambe.
    err=$("$s" "$LAB/non-esiste-davvero" 2>&1 >/dev/null); rc2=$?
    lab_fact codice_uscita_errore "$rc2"
    lab_fact messaggio_errore "$(echo "$err" | head -c 100)"
    lab_eq esce-uno "1" "$rc2"
    if [ -n "$err" ]; then lab_check dice-perche 0
    else lab_check dice-perche 1 "(stderr vuoto)" "un messaggio che dica cosa non va"; fi
fi
lab_done
