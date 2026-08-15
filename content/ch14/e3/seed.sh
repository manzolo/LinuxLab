mkdir -p "$LAB/dati" /usr/local/bin
rm -f /usr/local/bin/backup.sh "$LAB"/backup-*.tar.gz
i=1; while [ $i -le 5 ]; do
    echo "contenuto $(edu_rand_word $((210+i)))" > "$LAB/dati/$(edu_rand_word $((230+i))).txt"; i=$((i+1)); done
printf '%s' "$(find "$LAB/dati" -type f | wc -l | tr -d ' ')" > /opt/lab/state/nfile
: > /var/log/messages 2>/dev/null || true
:
