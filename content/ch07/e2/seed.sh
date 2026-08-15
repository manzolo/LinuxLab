mkdir -p "$LAB/servizio"
u="svc$(edu_rand_word 11)"
u=$(echo "$u" | cut -c1-12)
deluser "$u" 2>/dev/null
adduser -D -H -s /sbin/nologin "$u" 2>/dev/null
chown -R "$u" "$LAB/servizio"
printf '%s' "$u" > /opt/lab/state/svc
# qualche utente-esca con la shell vera, per non far indovinare a caso
for d in 1 2; do
    e="op$(edu_rand_word $((30+d)) | cut -c1-8)"
    deluser "$e" 2>/dev/null; adduser -D -s /bin/bash "$e" 2>/dev/null
done
