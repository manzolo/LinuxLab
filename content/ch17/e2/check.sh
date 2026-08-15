a=$(systemctl is-active fragile 2>/dev/null)
lab_fact is_active "${a:-?}"
lab_fact execstart "$(systemctl cat fragile 2>/dev/null | grep -i '^ExecStart' | head -1)"
lab_fact permessi_script "$(stat -c '%a %n' /usr/local/bin/fragile.sh 2>/dev/null)"
lab_fact ultimo_log "$(journalctl -u fragile -n 3 --no-pager 2>/dev/null | tail -1 | head -c 110)"
lab_eq fragile-attiva "active" "$a"
lab_done
