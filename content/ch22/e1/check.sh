s="$LAB/provisiona.sh"
if [ ! -f "$s" ]; then
    for c in utente permessi sito servizio backup firewall idempotente; do
        lab_check "$c" 1 "(provisiona.sh non consegnato)" "$s"; done
    lab_done; return 2>/dev/null || exit 1
fi

# LA REGOLA DEL CAPSTONE: prima di eseguire lo script si AZZERA tutto quello che
# lo script deve costruire. Non si puo' creare un container nuovo da qui dentro,
# ma si puo' riportare la macchina allo stato in cui lo script deve trovarla.
# Senza questo, chi ha fatto i sei passaggi a mano passerebbe consegnando un
# `echo fatto` — ed e' esattamente quello che l'esercizio deve impedire.
systemctl disable --now guardiano >/dev/null 2>&1 || true
rm -f /etc/systemd/system/guardiano.service
systemctl daemon-reload >/dev/null 2>&1 || true
userdel -r appsrv >/dev/null 2>&1 || true
rm -rf /srv/sito /usr/local/bin/backup.sh
crontab -r >/dev/null 2>&1 || true
nft delete table inet lab >/dev/null 2>&1 || true
sed -i 's#root /srv/sito;#root /var/www/html;#' /etc/nginx/sites-enabled/default 2>/dev/null || true
systemctl reload nginx >/dev/null 2>&1 || true

# Si esegue DUE volte: la seconda dimostra l'idempotenza.
sh "$s" >/tmp/prov1.log 2>&1; rc1=$?
sh "$s" >/tmp/prov2.log 2>&1; rc2=$?
lab_fact esecuzione_1 "codice $rc1"
lab_fact esecuzione_2 "codice $rc2"

# 1 — utente di servizio
riga=$(getent passwd appsrv)
lab_fact utente "${riga:-(assente)}"
case "$riga" in *nologin*|*/bin/false) lab_check utente 0 ;;
    *) lab_check utente 1 "${riga:-(assente)}" "appsrv con shell nologin" ;; esac

# 2 — permessi (invariante sui bit, non sul comando usato)
nf=$(find /srv/sito -type f ! -perm 644 2>/dev/null | wc -l | tr -d ' ')
nd=$(find /srv/sito -type d ! -perm 755 2>/dev/null | wc -l | tr -d ' ')
no=$(find /srv/sito ! -user appsrv 2>/dev/null | wc -l | tr -d ' ')
lab_fact permessi "file_sbagliati=$nf cartelle_sbagliate=$nd non_appsrv=$no"
if [ -f /srv/sito/index.html ] && [ "$nf" = 0 ] && [ "$nd" = 0 ] && [ "$no" = 0 ]; then lab_check permessi 0
else lab_check permessi 1 "file=$nf dir=$nd owner=$no" "tutto 644/755 e di appsrv" "/srv/sito"; fi

# 3 — il sito risponde davvero
body=$(curl -s --max-time 5 http://localhost/ 2>/dev/null)
lab_fact sito "$(echo "${body:-(nessuna risposta)}" | head -c 60)"
atteso=$(cat /srv/sito/index.html 2>/dev/null)
if [ -n "$body" ] && [ "$(echo "$body" | tr -d ' \n')" = "$(echo "$atteso" | tr -d ' \n')" ]; then lab_check sito 0
else lab_check sito 1 "$(echo "${body:-(nessuna risposta)}" | head -c 40)" "il contenuto di /srv/sito/index.html"; fi

# 4 — servizio attivo E abilitato
a=$(systemctl is-active guardiano 2>/dev/null); e=$(systemctl is-enabled guardiano 2>/dev/null)
lab_fact guardiano "active=${a:-?} enabled=${e:-?}"
if [ "$a" = active ] && [ "$e" = enabled ]; then lab_check servizio 0
else lab_check servizio 1 "active=${a:-?} enabled=${e:-?}" "active + enabled"; fi

# 5 — backup pianificato: campi del cron, non la stringa
riga=$(crontab -l 2>/dev/null | grep -v '^[[:space:]]*#' | grep backup.sh | head -1)
m=$(echo "$riga" | awk '{print $1}'); h=$(echo "$riga" | awk '{print $2}')
lab_fact cron "${riga:-(nessuna riga)}"
if [ "$m" = 30 ] && { [ "$h" = 3 ] || [ "$h" = 03 ]; } && [ -x /usr/local/bin/backup.sh ]; then lab_check backup 0
else lab_check backup 1 "min=${m:-?} ora=${h:-?} script=$([ -x /usr/local/bin/backup.sh ] && echo ok || echo mancante)" "30 3 + script eseguibile"; fi

# 6 — firewall
rs=$(nft list ruleset 2>/dev/null)
lab_fact firewall "$(echo "$rs" | tr '\n' ' ' | head -c 130)"
if echo "$rs" | grep -A2 'chain input' | grep -q 'policy drop' \
   && echo "$rs" | grep -qE 'dport .*22' && echo "$rs" | grep -qE 'dport .*80'; then lab_check firewall 0
else lab_check firewall 1 "(policy o porte mancanti)" "policy drop + 22 e 80 aperte"; fi

# PRO — idempotenza: la seconda esecuzione non deve rompere niente ne' duplicare
righe_cron=$(crontab -l 2>/dev/null | grep -c backup.sh)
lab_fact righe_cron_backup "$righe_cron"
if [ "$rc2" -eq 0 ] && [ "$righe_cron" -le 1 ]; then lab_check idempotente 0
else lab_check idempotente 1 "seconda esecuzione codice=$rc2, righe cron=$righe_cron" "codice 0 e una sola riga" ; fi
lab_done
