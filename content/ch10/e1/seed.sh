mkdir -p "$LAB"
n=$(edu_rand_int 40 90 21)
{ i=1; while [ $i -le $n ]; do
    printf '2026-0%d-%02d,%s,%s,%d\n' "$(( (i % 9) + 1 ))" "$(( (i % 28) + 1 ))" \
        "$(edu_rand_word $((200+i)))" "$(edu_rand_word $((400+i)))" "$(edu_rand_int 12 980 $((600+i)))"
    i=$((i+1)); done; } > "$LAB/vendite.csv"
