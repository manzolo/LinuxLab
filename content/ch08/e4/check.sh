letterale="$LAB/letterale.conf"
espanso="$LAB/espanso.conf"

if [ ! -f "$letterale" ]; then
    lab_check heredoc-letterale 1 "(non creato)" "$letterale"
else
    dato=$(cat "$letterale")
    lab_fact letterale "$dato"
    lab_eq heredoc-letterale 'nome=$NOME' "$dato"
fi

if [ ! -f "$espanso" ]; then
    lab_check heredoc-espanso 1 "(non creato)" "$espanso"
else
    dato=$(cat "$espanso")
    valore=$(cat /opt/lab/state/valore-heredoc)
    lab_fact espanso "$dato"
    lab_eq heredoc-espanso "nome=$valore" "$dato"
fi
lab_done
