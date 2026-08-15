s="$LAB/conta.sh"
if [ -x "$s" ]; then lab_check eseguibile 0
elif [ -f "$s" ]; then lab_check eseguibile 1 "$(stat -c '%a' "$s")" "eseguibile (755)" "$s"
else lab_check eseguibile 1 "(non creato)" "$s"; fi

if [ -x "$s" ]; then
    # DATASET NASCOSTI: tre cartelle generate adesso, che chi studia non ha mai visto.
    ok=1; dettagli=""
    j=1; while [ $j -le 3 ]; do
        t=$(mktemp -d); n=$(( (j * 7) + 2 ))
        mkdir -p "$t/x/y"
        k=1; while [ $k -le $n ]; do echo z > "$t/$( [ $((k % 3)) -eq 0 ] && echo x/y || echo . )/f$k"; k=$((k+1)); done
        atteso=$(find "$t" -type f | wc -l | tr -d ' ')
        dato=$("$s" "$t" 2>/dev/null | tr -dc '0-9')
        dettagli="$dettagli caso$j:atteso=$atteso,dato=${dato:-vuoto}"
        [ "$dato" = "$atteso" ] || ok=0
        rm -rf "$t"; j=$((j+1))
    done
    lab_fact casi_nascosti "$dettagli"
    [ $ok -eq 1 ] && lab_check conta-giusto 0 || lab_check conta-giusto 1 "$dettagli" "il conteggio esatto su ogni caso"
else
    lab_check conta-giusto 1 "(lo script non è eseguibile)" "un numero"
fi
lab_done
