img="$LAB/disco.img"; m="$LAB/mnt"
if [ -f "$img" ]; then
    t=$(file -b "$img" 2>/dev/null)
    lab_fact immagine "$t"
    lab_fact dimensione "$(du -h "$img" | cut -f1)"
    case "$t" in *ext4*|*ext2*|*ext3*) lab_check immagine-formattata 0 ;;
        *) lab_check immagine-formattata 1 "$t" "un filesystem ext4" "$img" ;; esac
else
    lab_check immagine-formattata 1 "(non creata)" "$img"
fi
if mountpoint -q "$m" 2>/dev/null; then
    lab_check montato 0
    lab_fact montato_su "$(findmnt -n -o SOURCE,FSTYPE "$m" 2>/dev/null)"
    if [ "$(cat "$m/prova.txt" 2>/dev/null | tr -d ' \n')" = "funziona" ]; then
        lab_check file-dentro 0
    else
        lab_check file-dentro 1 "$(cat "$m/prova.txt" 2>/dev/null | head -c 30)" "funziona" "$m/prova.txt"
    fi
else
    lab_check montato 1 "(non montato)" "$m"
    lab_check file-dentro 1 "(niente da controllare: non è montato)" "funziona"
fi
lab_done
