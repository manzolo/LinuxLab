mkdir -p "$LAB"
i=1; while [ $i -le 5 ]; do echo x > "$LAB/$(edu_rand_word $((10+i))).dat"; i=$((i+1)); done
rm -f "$LAB/elenco.txt" "$LAB/conteggio.txt"
