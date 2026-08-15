d="$LAB/deposito"; rm -rf "$d"; mkdir -p "$d/dump" "$d/media" "$d/conf"
# piccoli
i=1; while [ $i -le 8 ]; do head -c 4000 /dev/zero > "$d/conf/$(edu_rand_word $((10+i))).conf"; i=$((i+1)); done
# grandi, quantita' variabile
n=$(edu_rand_int 3 6 14)
i=1; while [ $i -le $n ]; do
    head -c $(( 1200000 + i * 90000 )) /dev/zero > "$d/dump/$(edu_rand_word $((30+i)))-$i.sql"; i=$((i+1)); done
# uno grande con lo spazio nel nome: rompe le catene ingenue
head -c 1500000 /dev/zero > "$d/media/$(edu_rand_word 71) finale.mp4"
rm -f "$LAB/grossi.txt"
