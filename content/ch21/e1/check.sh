lab_fact loop_disponibili "$(cat /opt/lab/state/loop | tr '\n' ' ')"
lab_fact vg "$(vgs --noheadings -o vg_name,vg_size 2>/dev/null | tr -s ' ' | head -2 | tr '\n' ' ')"
if vgs lab-vg >/dev/null 2>&1; then lab_check vg-creato 0
else lab_check vg-creato 1 "(nessun gruppo lab-vg)" "un VG chiamato lab-vg"; fi
if mountpoint -q /mnt/lab 2>/dev/null; then
    lab_check lv-montato 0
    lab_fact montato "$(findmnt -n -o SOURCE,FSTYPE,SIZE /mnt/lab 2>/dev/null)"
else
    lab_check lv-montato 1 "(non montato)" "/dev/lab-vg/lab-dati su /mnt/lab"
fi
lab_done
