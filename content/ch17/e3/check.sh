e=$(systemctl is-enabled backup.timer 2>/dev/null)
lab_fact timer_enabled "${e:-?}"
lab_fact list_timers "$(systemctl list-timers --all --no-pager 2>/dev/null | grep backup | head -1 | head -c 100)"
lab_eq timer-attivo "enabled" "$e"
# Si chiede a systemd come interpreta OnCalendar, invece di confrontare la stringa.
oc=$(systemctl show backup.timer -p TimersCalendar --value 2>/dev/null)
lab_fact oncalendar "$oc"
if echo "$oc" | grep -q '03:30:00'; then lab_check orario-giusto 0
else lab_check orario-giusto 1 "${oc:-(nessun OnCalendar)}" "un OnCalendar che scatta alle 03:30:00"; fi
lab_done
