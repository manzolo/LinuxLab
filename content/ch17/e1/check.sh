u=/etc/systemd/system/vigile.service
[ -f "$u" ] && lab_check unit-esiste 0 || lab_check unit-esiste 1 "(non creata)" "$u"
a=$(systemctl is-active vigile 2>/dev/null); e=$(systemctl is-enabled vigile 2>/dev/null)
lab_fact is_active "${a:-?}"; lab_fact is_enabled "${e:-?}"
lab_fact status "$(systemctl status vigile --no-pager 2>&1 | sed -n '3p' | head -c 100)"
lab_eq attiva "active" "$a"
lab_eq abilitata "enabled" "$e"
lab_done
