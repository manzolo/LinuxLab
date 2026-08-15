d="$LAB/registri"; mkdir -p "$d"
i=1; while [ $i -le 6 ]; do
    n="$(edu_rand_word $((300+i)))-$i.log"
    echo "riga" > "$d/$n"
    touch -d "2026-02-0$i 0$i:15" "$d/$n" 2>/dev/null || true
    i=$((i+1)); done
v="$(edu_rand_word 77)-ultimo.log"
echo "il piu' recente" > "$d/$v"
touch -d "2026-02-27 22:40" "$d/$v" 2>/dev/null || true
# Il file piu' recente non deve essere anche il primo in ordine alfabetico:
# altrimenti un `ls | head -1` (che ignora le date) azzeccherebbe per caso,
# e l'esercizio smetterebbe di insegnare quello per cui esiste.
if [ "$(ls "$d" | head -1)" = "$v" ]; then
    mv "$d/$v" "$d/z$v"; v="z$v"
    touch -d "2026-02-27 22:40" "$d/$v" 2>/dev/null || true
fi
printf '%s' "$v" > /opt/lab/state/recente
