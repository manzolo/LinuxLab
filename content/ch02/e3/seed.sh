d="$LAB/scarico"; rm -rf "$d"; mkdir -p "$d"
i=1
while [ $i -le 7 ]; do
    n="$(edu_rand_word $((60+i)))-$i.log"
    echo "riga" > "$d/$n"
    # date scaglionate all'indietro: il piu' recente dipende dal seme
    touch -d "2026-03-01 0$((i % 9)):0$i" "$d/$n" 2>/dev/null || true
    i=$((i+1))
done
v="$(edu_rand_word 99)-recente.log"
echo "l'ultimo arrivato" > "$d/$v"
touch -d "2026-03-14 18:30" "$d/$v" 2>/dev/null || true
# Il file piu' recente non deve essere anche il primo in ordine alfabetico:
# altrimenti un `ls | head -1` (che ignora le date) azzeccherebbe per caso,
# e l'esercizio smetterebbe di insegnare quello per cui esiste.
if [ "$(ls "$d" | head -1)" = "$v" ]; then
    mv "$d/$v" "$d/z$v"; v="z$v"
    touch -d "2026-03-14 18:30" "$d/$v" 2>/dev/null || true
fi
printf '%s' "$v" > /opt/lab/state/recente
