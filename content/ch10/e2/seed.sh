d="$LAB/conf"; rm -rf "$d"; mkdir -p "$d"
vecchio="$(edu_rand_word 31).it"; nuovo="$(edu_rand_word 32).eu"
printf '%s\n%s\n' "$vecchio" "$nuovo" > "$d/CAMBIO.txt"
n=$(edu_rand_int 5 11 33)
tot=0
i=1; while [ $i -le $n ]; do
    k=$(( (i % 3) + 1 ))
    { echo "# configurazione $i"
      j=1; while [ $j -le $k ]; do echo "server_name $vecchio;"; j=$((j+1)); done
      echo "root /var/www/$vecchio;"; } > "$d/sito$i.conf"
    tot=$(( tot + k + 1 ))
    i=$((i+1)); done
printf '%s' "$tot" > /opt/lab/state/tot
# file NON .conf che contengono lo stesso dominio: non vanno toccati
printf 'appunti su %s\n' "$vecchio" > "$d/note.txt"
printf '<h1>%s</h1>\n' "$vecchio" > "$d/index.html"
( cd "$d" && md5sum note.txt index.html ) > /opt/lab/state/altri
