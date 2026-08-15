# Cartella normale spacciata per disco: non e' formattata e non e' montata.
mkdir -p "$LAB/mnt"; echo funziona > "$LAB/mnt/prova.txt"
head -c $((8*1024*1024)) /dev/zero > "$LAB/disco.img"
