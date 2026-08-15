d="$LAB/scarico"; rm -rf "$d"; mkdir -p "$d"
n=$(edu_rand_int 3 9 11)
i=1; while [ $i -le $n ]; do : > "$d/.$(edu_rand_word $((20+i)))rc"; i=$((i+1)); done
printf '%s' "$n" > /opt/lab/state/nascosti
m=$(edu_rand_int 2 6 12)
i=1; while [ $i -le $m ]; do echo dati > "$d/$(edu_rand_word $((40+i))).txt"; i=$((i+1)); done
mkdir -p "$d/.cache" "$d/archivio"
