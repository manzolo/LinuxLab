d="$LAB/registri"; mkdir -p "$d"
nlog=$(edu_rand_int 18 34 3)
ntxt=$(edu_rand_int 5 12 4)
i=1; while [ $i -le $nlog ]; do
    echo "riga di log $i" > "$d/$(edu_rand_word $((100+i)))-$i.log"; i=$((i+1)); done
i=1; while [ $i -le $ntxt ]; do
    echo "appunti $i" > "$d/$(edu_rand_word $((200+i)))-$i.txt"; i=$((i+1)); done
printf '%s' "$nlog" > /opt/lab/state/nlog
# impronta dei .txt: se ne sposti o modifichi anche uno, si vede
( cd "$d" && ls *.txt | sort | md5sum ) > /opt/lab/state/txtmd5
