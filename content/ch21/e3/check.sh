dev=/dev/md/lab-raid
dettaglio=$(mdadm --detail "$dev" 2>/dev/null)
lab_fact raid "$(echo "${dettaglio:-(nessun array)}" | grep -E 'Raid Level|Raid Devices|Active Devices|State :' | tr '\n' ';')"

livello=$(echo "$dettaglio" | awk -F: '/Raid Level/ {gsub(/ /,"",$2); print $2}')
previsti=$(echo "$dettaglio" | awk -F: '/Raid Devices/ {gsub(/ /,"",$2); print $2; exit}')
if [ "$livello" = raid1 ] && [ "$previsti" = 2 ]; then lab_check raid1-creato 0
else lab_check raid1-creato 1 "livello=${livello:-assente} dischi=${previsti:-?}" "RAID1 da due dispositivi"; fi

attivi=$(echo "$dettaglio" | awk -F: '/Active Devices/ {gsub(/ /,"",$2); print $2}')
stato=$(echo "$dettaglio" | awk -F: '/State :/ {print $2; exit}')
if [ "$attivi" = 1 ] && echo "$stato" | grep -q degraded; then lab_check degradato 0
else lab_check degradato 1 "attivi=${attivi:-?} stato=${stato:-?}" "un disco attivo e stato degraded"; fi

src=$(findmnt -n -o SOURCE --target /mnt/raid 2>/dev/null)
target=$(findmnt -n -o TARGET --target /mnt/raid 2>/dev/null)
valore=$(cat /mnt/raid/prova.txt 2>/dev/null)
lab_fact dati "mount=${src:-assente} contenuto=${valore:-assente}"
if [ "$target" = /mnt/raid ] && [ "$(readlink -f "$src" 2>/dev/null)" = "$(readlink -f "$dev" 2>/dev/null)" ] \
   && [ "$valore" = ridondante ]; then lab_check dati-letti 0
else lab_check dati-letti 1 "mount=${src:-assente} contenuto=${valore:-assente}" "array montato e prova.txt=ridondante" "/mnt/raid"; fi
lab_done
