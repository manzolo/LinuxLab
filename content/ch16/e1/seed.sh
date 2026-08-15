mkdir -p "$LAB"
rm -f "$LAB/conta.sh"
# una cartella di prova per chi studia; la verifica ne usera' altre, mai viste
d="$LAB/prova"; rm -rf "$d"; mkdir -p "$d/a" "$d/b"
i=1; while [ $i -le "$(edu_rand_int 3 9 251)" ]; do
    echo x > "$d/$(edu_rand_pick $((260+i)) . a b)/f$i.txt"; i=$((i+1)); done
:
