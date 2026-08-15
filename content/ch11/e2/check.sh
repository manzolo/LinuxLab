n=$(cat /opt/lab/state/spinner)
vivi=$(pgrep -x "$n" 2>/dev/null | wc -l | tr -d ' ')
lab_fact processo "$n"
lab_fact istanze_vive "$vivi"
lab_fact stato "$(ps -eo pid,stat,comm 2>/dev/null | grep -- "$n" | head -1)"
lab_eq processo-fermo "0" "$vivi"
lab_done
