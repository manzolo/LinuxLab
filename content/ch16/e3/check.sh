s="$LAB/riassumi.sh"
if [ ! -x "$s" ]; then
    lab_check riassunto-giusto 1 "(script assente o non eseguibile)" "$s"
    lab_check salta-i-commenti 1
else
    ok=1; commenti_ok=1; dettagli=""
    j=1; while [ $j -le 3 ]; do
        t=$(mktemp)
        # file nascosto, generato ora: intestazione + righe di log
        { echo "# intestazione $j"; echo "# seconda riga di commento"
          awk -v n=$(( j * 23 + 11 )) 'BEGIN{
            split("INFO WARN ERROR DEBUG", L, " ")
            for (i=1;i<=n;i++) printf "2026-03-%02d 10:00:%02d %-5s 10.0.0.%d GET / 200\n",
                (i%28)+1, i%60, L[((i*j)%4)+1], (i%200)+1 }'; } > "$t"
        atteso=$(grep -v '^#' "$t" | awk '{print $4}' | sort | uniq -c | sort -rn | awk '{print $2, $1}')
        dato=$("$s" "$t" 2>/dev/null | sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//' | grep -v '^$')
        [ "$dato" = "$atteso" ] || ok=0
        echo "$dato" | grep -q '^#' && commenti_ok=0
        dettagli="$dettagli | caso$j: $(echo "$dato" | tr '\n' ',')"
        rm -f "$t"; j=$((j+1))
    done
    lab_fact casi_nascosti "$(echo "$dettagli" | head -c 200)"
    [ $ok -eq 1 ] && lab_check riassunto-giusto 0 || lab_check riassunto-giusto 1 "$(echo "$dettagli" | head -c 90)" "LIVELLO conteggio, per conteggio decrescente"
    [ $commenti_ok -eq 1 ] && lab_check salta-i-commenti 0 || lab_check salta-i-commenti 1 "compare una riga che comincia con #" "le righe di commento vanno saltate"
fi
lab_done
