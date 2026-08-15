d="$LAB/deposito"; rm -rf "$d"; mkdir -p "$d"
i=1; while [ $i -le 5 ]; do
    n="$(edu_rand_word $((81+i)))"
    mkdir -p "$d/$n"
    head -c $(( $(edu_rand_int 40 260 $((91+i))) * 1024 )) /dev/zero > "$d/$n/dati-$i.bin"
    i=$((i+1)); done
v="$(edu_rand_word 111)"; mkdir -p "$d/$v"
head -c $(( 2400 * 1024 )) /dev/zero > "$d/$v/archivio.bin"
# L'atteso non si assume: si MISURA con lo stesso comando che usera' chi studia.
# (Se il nome del vincitore collide con una cartella del ciclo, o se il filesystem
# conta i blocchi a modo suo, la verita' resta quella che dice la macchina.)
du -s "$d"/* | sort -n | tail -1 | awk '{print $2}' | xargs basename > /opt/lab/state/grande
:
