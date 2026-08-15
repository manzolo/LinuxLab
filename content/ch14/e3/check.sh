s=/usr/local/bin/backup.sh
oggi=$(date +%F)
if [ -x "$s" ]; then lab_check script-eseguibile 0
elif [ -f "$s" ]; then lab_check script-eseguibile 1 "$(stat -c '%a' "$s")" "eseguibile (es. 755)" "$s"
else lab_check script-eseguibile 1 "(non creato)" "$s"; fi

a="$LAB/backup-$oggi.tar.gz"
lab_fact atteso "$a"
lab_fact archivi_presenti "$(ls "$LAB"/backup-* 2>/dev/null | tr '\n' ' ')"
if [ -f "$a" ]; then
    lab_check archivio-con-data 0
    if tar tzf "$a" >/dev/null 2>&1; then
        n=$(tar tzf "$a" 2>/dev/null | grep -c 'dati/.*\.txt')
        lab_fact file_nell_archivio "$n (attesi $(cat /opt/lab/state/nfile))"
        lab_eq archivio-valido "$(cat /opt/lab/state/nfile)" "$n" "$a"
    else
        lab_check archivio-valido 1 "(non si apre)" "un tar.gz valido" "$a"
    fi
else
    lab_check archivio-con-data 1 "(assente)" "$a"
    lab_check archivio-valido 1
fi

if grep -q 'backup' /var/log/messages 2>/dev/null; then
    lab_check scrive-nel-log 0
    lab_fact riga_di_log "$(grep 'backup' /var/log/messages | tail -1 | head -c 90)"
else
    lab_check scrive-nel-log 1 "(niente in /var/log/messages)" "una riga scritta con logger"
fi
lab_done
