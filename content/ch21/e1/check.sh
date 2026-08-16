lab_fact loop_disponibili "$(cat /opt/lab/state/loop | tr '\n' ' ')"
lab_fact vg "$(vgs --noheadings -o vg_name,vg_size 2>/dev/null | tr -s ' ' | head -2 | tr '\n' ' ')"
if vgs lab-vg >/dev/null 2>&1; then lab_check vg-creato 0
else lab_check vg-creato 1 "(nessun gruppo lab-vg)" "un VG chiamato lab-vg"; fi

# Il volume: nome E dimensione. Prima si guardava solo il nome del gruppo, quindi
# passava anche un VG vuoto o un LV da 4M. (Revisione esterna del 2026-08-16.)
lab_fact lv "$(lvs --noheadings -o lv_name,vg_name,lv_size 2>/dev/null | tr -s ' ' | tr '\n' ';')"
sz=$(lvs --noheadings --units m --nosuffix -o lv_size lab-vg/lab-dati 2>/dev/null | tr -d ' ')
if [ -n "$sz" ] && [ "${sz%%.*}" -ge 60 ] 2>/dev/null; then lab_check lv-giusto 0
else lab_check lv-giusto 1 "${sz:-(nessun lab-dati)}${sz:+M}" "lab-vg/lab-dati da almeno 60M"; fi

# Il mount: non "qualcosa montato lì", ma proprio quel volume, con quel filesystem.
if mountpoint -q /mnt/lab 2>/dev/null; then
    src=$(findmnt -n -o SOURCE /mnt/lab 2>/dev/null)
    fst=$(findmnt -n -o FSTYPE /mnt/lab 2>/dev/null)
    lab_fact montato "$(findmnt -n -o SOURCE,FSTYPE,SIZE /mnt/lab 2>/dev/null)"
    if echo "$src" | grep -q 'lab--vg-lab--dati\|lab-vg/lab-dati' && [ "$fst" = ext4 ]; then
        lab_check lv-montato 0
    else
        lab_check lv-montato 1 "${src:-?} ($fst)" "/dev/lab-vg/lab-dati formattato ext4" "/mnt/lab"
    fi
else
    lab_check lv-montato 1 "(non montato)" "/dev/lab-vg/lab-dati su /mnt/lab"
fi
lab_done
