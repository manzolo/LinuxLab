r="$LAB/radice"; . /opt/lab/state/nomi
lab_fact albero "$(cd "$r" && find . -type f | sed 's#^\./##' | tr '\n' ' ')"
verifica() { # verifica <id> <percorso-atteso> <file>
    if [ -f "$2/$3" ]; then lab_check "$1" 0
    else
        dove=$(find "$LAB" -name "$3" 2>/dev/null | head -1)
        lab_check "$1" 1 "${dove:-(sparito)}" "$2/$3"
    fi
}
verifica config-in-etc      "$r/etc"     "$conf"
verifica log-in-var         "$r/var/log" "$log"
verifica sito-in-var-www    "$r/var/www" "index.html"
verifica binario-in-bin     "$r/bin"     "$bin"
verifica temporaneo-in-tmp  "$r/tmp"     "$tmp"
verifica personale-in-home  "$r/home"    "$pers"
lab_done
