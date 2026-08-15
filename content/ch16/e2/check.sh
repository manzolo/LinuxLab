s="$LAB/salva.sh"; oggi=$(date +%F)
if [ ! -x "$s" ]; then
    lab_check archivio-buono 1 "(script assente o non eseguibile)" "$s"
    lab_check esce-zero 1; lab_check esce-uno 1
else
    rm -f "$LAB"/salva-*.tar.gz
    "$s" "$LAB/dati" >/dev/null 2>&1; rc=$?
    a="$LAB/salva-$oggi.tar.gz"
    lab_fact archivio_atteso "$a"
    lab_fact codice_uscita_successo "$rc"
    if [ -f "$a" ] && tar tzf "$a" >/dev/null 2>&1; then lab_check archivio-buono 0
    else lab_check archivio-buono 1 "$(ls "$LAB"/salva-* 2>/dev/null | tr '\n' ' ')" "$a valido" ; fi
    lab_eq esce-zero "0" "$rc"
    "$s" "$LAB/non-esiste-davvero" >/dev/null 2>&1; rc2=$?
    lab_fact codice_uscita_errore "$rc2"
    lab_eq esce-uno "1" "$rc2"
fi
lab_done
