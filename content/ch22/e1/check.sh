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
# Il mondo che questo esercizio richiede: `crontab` fa chdir("/var/spool/cron/crontabs"),
# che su Alpine e' un symlink verso /etc/crontabs. In CI quel percorso a volte non
# c'e' e crontab fallisce con "can't change directory", in silenzio. Un seed serve
# esattamente a questo: garantire il mondo, invece di sperare che ci sia.
mkdir -p /etc/crontabs /var/spool/cron
[ -d /var/spool/cron/crontabs ] || ln -sfn /etc/crontabs /var/spool/cron/crontabs
systemctl disable --now guardiano >/dev/null 2>&1 || true
systemctl disable nftables >/dev/null 2>&1 || true
rm -f /etc/systemd/system/guardiano.service
rm -f /etc/nftables.conf
systemctl daemon-reload >/dev/null 2>&1 || true
userdel -r appsrv >/dev/null 2>&1 || true
rm -rf /srv/sito /usr/local/bin/backup.sh
crontab -r >/dev/null 2>&1 || true
nft delete table inet lab >/dev/null 2>&1 || true
sed -i 's#root /srv/sito;#root /var/www/html;#' /etc/nginx/sites-enabled/default 2>/dev/null || true
systemctl reload nginx >/dev/null 2>&1 || true

# Si esegue DUE volte: la seconda dimostra l'idempotenza.
#
# ESEGUITO, non dato in pasto a `sh`. Prima era `sh "$s"`, che ignora la riga
# `#!/bin/bash` in cima: uno script bash valido — con `[[ ... ]]` o un array —
# veniva rifiutato, e il capitolo 16 quel bash lo insegna esplicitamente. Il
# corso permetteva una cosa e la verifica la bocciava.
# (Revisione esterna del 2026-08-16.)
chmod +x "$s" 2>/dev/null || true
"$s" >/tmp/prov1.log 2>&1; rc1=$?
"$s" >/tmp/prov2.log 2>&1; rc2=$?
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
no=$(find /srv/sito \( ! -user root -o ! -group www-data \) 2>/dev/null | wc -l | tr -d ' ')
lab_fact permessi "file_sbagliati=$nf cartelle_sbagliate=$nd non_root_wwwdata=$no"
if [ -f /srv/sito/index.html ] && [ "$nf" = 0 ] && [ "$nd" = 0 ] && [ "$no" = 0 ]; then lab_check permessi 0
else lab_check permessi 1 "file=$nf dir=$nd owner_o_gruppo=$no" "tutto 644/755 e root:www-data" "/srv/sito"; fi

# 3 — il sito risponde davvero
body=$(curl -s --max-time 5 http://localhost/ 2>/dev/null)
lab_fact sito "$(echo "${body:-(nessuna risposta)}" | head -c 60)"
atteso=$(cat /srv/sito/index.html 2>/dev/null)
if [ -n "$body" ] && [ "$(echo "$body" | tr -d ' \n')" = "$(echo "$atteso" | tr -d ' \n')" ]; then lab_check sito 0
else lab_check sito 1 "$(echo "${body:-(nessuna risposta)}" | head -c 40)" "il contenuto di /srv/sito/index.html"; fi

# 4 — servizio attivo E abilitato
a=$(systemctl is-active guardiano 2>/dev/null); e=$(systemctl is-enabled guardiano 2>/dev/null)
u=$(systemctl show guardiano -p User --value 2>/dev/null)
p=$(systemctl show guardiano -p MainPID --value 2>/dev/null)
pu=$(ps -o user= -p "${p:-0}" 2>/dev/null | tr -d ' ')
lab_fact guardiano "active=${a:-?} enabled=${e:-?} User=${u:-?} processo=${pu:-?}"
if [ "$a" = active ] && [ "$e" = enabled ] && [ "$u" = appsrv ] && [ "$pu" = appsrv ]; then lab_check servizio 0
else lab_check servizio 1 "active=${a:-?} enabled=${e:-?} User=${u:-?} processo=${pu:-?}" "active + enabled, eseguito da appsrv"; fi

# 5 — backup pianificato: campi del cron, non la stringa
riga=$(crontab -l 2>/dev/null | grep -v '^[[:space:]]*#' | grep backup.sh | head -1)
m=$(echo "$riga" | awk '{print $1}'); h=$(echo "$riga" | awk '{print $2}')
lab_fact cron "${riga:-(nessuna riga)}"
# "ogni giorno alle 3:30" sono CINQUE campi, non due: senza guardare gli ultimi tre
# passava anche un backup che gira il 3 di ogni mese. (Revisione esterna del 2026-08-16.)
dom=$(echo "$riga" | awk '{print $3}'); mon=$(echo "$riga" | awk '{print $4}'); dow=$(echo "$riga" | awk '{print $5}')
lab_fact cron_campi "min=${m:-?} ora=${h:-?} giorno=${dom:-?} mese=${mon:-?} settimana=${dow:-?}"
if [ "$m" = 30 ] && { [ "$h" = 3 ] || [ "$h" = 03 ]; } \
   && [ "$dom" = '*' ] && [ "$mon" = '*' ] && [ "$dow" = '*' ] \
   && [ -x /usr/local/bin/backup.sh ]; then lab_check backup 0
else lab_check backup 1 "min=${m:-?} ora=${h:-?} ${dom:-?} ${mon:-?} ${dow:-?} script=$([ -x /usr/local/bin/backup.sh ] && echo ok || echo mancante)" "30 3 * * * + script eseguibile"; fi

# 6 — firewall: si BUSSA, non si legge il ruleset. Stessa sonda del capitolo 20 —
# un namespace di rete con un cavo virtuale verso qui, cosi' il traffico attraversa
# davvero la catena input. Una regola generica `tcp accept` lascia tutto aperto e
# passerebbe qualunque lettura del testo. (Revisione esterna del 2026-08-16.)
rs=$(nft list ruleset 2>/dev/null)
lab_fact firewall "$(echo "$rs" | tr '\n' ' ' | head -c 130)"
persistente=no
abilitato=$(systemctl is-enabled nftables 2>/dev/null)
if [ -f /etc/nftables.conf ] && nft -c -f /etc/nftables.conf >/dev/null 2>&1 \
   && grep -qE 'table[[:space:]]+inet[[:space:]]+lab' /etc/nftables.conf \
   && grep -q 'policy drop' /etc/nftables.conf \
   && grep -q '22' /etc/nftables.conf && grep -q '80' /etc/nftables.conf \
   && [ "$abilitato" = enabled ]; then persistente=si; fi
lab_fact firewall_persistenza "config_valida_e_coerente=$persistente servizio=${abilitato:-?}"
ip netns del lab-sonda 2>/dev/null || true; ip link del lab-a 2>/dev/null || true
sonda=no
if ip netns add lab-sonda 2>/dev/null && ip link add lab-a type veth peer name lab-b 2>/dev/null \
   && ip link set lab-b netns lab-sonda 2>/dev/null; then
    ip addr add 10.66.0.1/24 dev lab-a 2>/dev/null; ip link set lab-a up 2>/dev/null
    ip netns exec lab-sonda ip addr add 10.66.0.2/24 dev lab-b 2>/dev/null
    ip netns exec lab-sonda ip link set lab-b up 2>/dev/null
    sonda=si
fi
bussa() {   # "risponde" | "rifiuta" | "silenzio"
    i=$(date +%s%N)
    ip netns exec lab-sonda timeout 3 bash -c "exec 3<>/dev/tcp/10.66.0.1/$1" >/dev/null 2>&1
    r=$?; f=$(date +%s%N); ms=$(( (f - i) / 1000000 ))
    if [ "$r" -eq 0 ]; then echo risponde; elif [ "$ms" -ge 2500 ]; then echo silenzio; else echo rifiuta; fi
}
if [ "$sonda" = si ]; then
    p22=$(bussa 22); p80=$(bussa 80); p3306=$(bussa 3306)
    lab_fact bussato "22=$p22 80=$p80 3306=$p3306"
    if [ "$p22" != silenzio ] && [ "$p80" != silenzio ] && [ "$p3306" = silenzio ] && [ "$persistente" = si ]; then lab_check firewall 0
    else lab_check firewall 1 "22=$p22 80=$p80 3306=$p3306 persistente=$persistente servizio=${abilitato:-?}" "22 e 80 raggiungibili, 3306 nel silenzio, configurazione valida e nftables abilitato"; fi
else
    # Come al capitolo 20: niente ripiego silenzioso su una lettura del testo.
    lab_fact sonda "NON creata: manca ip/netns o i permessi (serve --cap-add NET_ADMIN)"
    lab_check firewall 1 "(non ho potuto bussare)" "un namespace di rete per provare le porte"
fi
ip netns del lab-sonda 2>/dev/null || true; ip link del lab-a 2>/dev/null || true

# PRO — idempotenza: la seconda esecuzione non deve rompere niente ne' duplicare
righe_cron=$(crontab -l 2>/dev/null | grep -c backup.sh)
lab_fact righe_cron_backup "$righe_cron"
if [ "$rc1" -eq 0 ] && [ "$rc2" -eq 0 ] && [ "$righe_cron" -eq 1 ]; then lab_check idempotente 0
else lab_check idempotente 1 "prima=$rc1 seconda=$rc2, righe cron=$righe_cron" "entrambe codice 0 e una sola riga" ; fi
lab_done
