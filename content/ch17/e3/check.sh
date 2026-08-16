# Il servizio prima del timer: un timer che punta a niente si abilita lo stesso.
tipo=$(systemctl show backup.service -p Type --value 2>/dev/null)
carica=$(systemctl show backup.service -p LoadState --value 2>/dev/null)
lab_fact servizio "LoadState=${carica:-?} Type=${tipo:-?}"
if [ "$carica" = loaded ] && [ "$tipo" = oneshot ]; then lab_check servizio-oneshot 0
else lab_check servizio-oneshot 1 "LoadState=${carica:-?} Type=${tipo:-?}" "backup.service caricato, Type=oneshot"; fi

e=$(systemctl is-enabled backup.timer 2>/dev/null)
lab_fact timer_enabled "${e:-?}"
lab_fact list_timers "$(systemctl list-timers --all --no-pager 2>/dev/null | grep backup | head -1 | head -c 100)"
lab_eq timer-attivo "enabled" "$e"

# Si chiede a systemd come interpreta OnCalendar, invece di confrontare la stringa.
# E si guarda TUTTO il calendario, non solo l'ora: `Mon *-*-* 03:30:00` scatta alle
# 3:30 ma una volta a settimana, e la consegna dice "ogni giorno".
# (Prima bastava che comparisse 03:30:00 — revisione esterna del 2026-08-16.)
oc=$(systemctl show backup.timer -p TimersCalendar --value 2>/dev/null)
lab_fact oncalendar "$oc"
if echo "$oc" | grep -q '\*-\*-\* 03:30:00'; then lab_check orario-giusto 0
elif echo "$oc" | grep -q '03:30:00'; then
    lab_check orario-giusto 1 "$oc" "un OnCalendar giornaliero: *-*-* 03:30:00"
else
    lab_check orario-giusto 1 "${oc:-(nessun OnCalendar)}" "un OnCalendar che scatta ogni giorno alle 03:30:00"
fi
lab_done
