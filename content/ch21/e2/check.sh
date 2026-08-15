lab_fact lv "$(lvs --noheadings -o lv_name,lv_size 2>/dev/null | tr -s ' ' | tr '\n' ' ')"
lab_fact df "$(df -h --output=size,used,avail /mnt/lab 2>/dev/null | tail -1)"
mb=$(lvs --noheadings --units m --nosuffix -o lv_size lab-vg/lab-dati 2>/dev/null | tr -d ' ' | cut -d. -f1)
if [ -n "$mb" ] && [ "$mb" -ge 100 ] 2>/dev/null; then lab_check volume-cresciuto 0
else lab_check volume-cresciuto 1 "${mb:-?}M" "almeno 100M"; fi
fsmb=$(df -m --output=size /mnt/lab 2>/dev/null | tail -1 | tr -d ' ')
if [ -n "$fsmb" ] && [ "$fsmb" -ge 90 ] 2>/dev/null; then lab_check filesystem-cresciuto 0
else lab_check filesystem-cresciuto 1 "${fsmb:-?}M visti da df" "il filesystem esteso al volume"; fi
now=$(md5sum /mnt/lab/dati.txt 2>/dev/null | cut -d' ' -f1)
lab_fact md5 "prima=$(cat /opt/lab/state/md5) dopo=${now:-(file sparito)}"
lab_eq dati-intatti "$(cat /opt/lab/state/md5)" "$now"
lab_done
