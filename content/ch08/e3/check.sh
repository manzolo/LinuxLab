nb=$(cat /opt/lab/state/nb); ns=$(cat /opt/lab/state/ns)
b="$LAB/buoni.txt"; s="$LAB/scarti.txt"
lab_fact risultati_attesi "$nb"; lab_fact errori_attesi "$ns"
if [ -f "$b" ]; then
    # NB: `grep -c` stampa gia' 0 ed esce con 1 quando non trova nulla:
    # un `|| echo 0` raddoppierebbe lo zero e romperebbe il confronto.
    ok=$(grep -c '^risultato ' "$b"); sporco=$(grep -c '^errore ' "$b")
    lab_fact buoni "righe=$(wc -l < "$b" | tr -d ' ') risultati=$ok errori_infiltrati=$sporco"
    if [ "$ok" = "$nb" ] && [ "$sporco" = "0" ]; then lab_check buoni-puliti 0
    else lab_check buoni-puliti 1 "risultati=$ok errori=$sporco" "risultati=$nb errori=0" "$b"; fi
else
    lab_check buoni-puliti 1 "(non creato)" "$b"
fi
if [ -f "$s" ]; then
    er=$(grep -c '^errore ' "$s"); sporco=$(grep -c '^risultato ' "$s")
    lab_fact scarti "righe=$(wc -l < "$s" | tr -d ' ') errori=$er risultati_infiltrati=$sporco"
    if [ "$er" = "$ns" ] && [ "$sporco" = "0" ]; then lab_check scarti-giusti 0
    else lab_check scarti-giusti 1 "errori=$er risultati=$sporco" "errori=$ns risultati=0" "$s"; fi
else
    lab_check scarti-giusti 1 "(non creato)" "$s"
fi
lab_done
