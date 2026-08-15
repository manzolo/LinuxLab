d="$LAB/deposito"; rm -rf "$d"; mkdir -p "$d/dump" "$d/conf" "$d/media"
i=1; while [ $i -le 14 ]; do
    head -c $(( $(edu_rand_int 3 60 $((120+i))) * 1024 )) /dev/zero \
        > "$d/$(edu_rand_pick $((140+i)) dump conf media)/$(edu_rand_word $((160+i))).dat"
    i=$((i+1)); done
printf '%s' "$(find "$d" -type f | wc -l | tr -d ' ')" > /opt/lab/state/prima
g="$(edu_rand_word 191)-enorme.bin"
head -c $(( 3200 * 1024 )) /dev/zero > "$d/$(edu_rand_pick 192 dump media)/$g"
printf '%s' "$g" > /opt/lab/state/gigante
:
