mkdir -p "$LAB/dati"
rm -f "$LAB/salva.sh" "$LAB"/salva-*.tar.gz
i=1; while [ $i -le "$(edu_rand_int 3 8 271)" ]; do
    echo "riga $(edu_rand_word $((280+i)))" > "$LAB/dati/$(edu_rand_word $((300+i))).txt"; i=$((i+1)); done
:
