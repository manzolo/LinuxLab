mkdir -p "$LAB"
rm -f "$LAB/provisiona.sh"
cat > "$LAB/LEGGIMI.txt" <<'EOF'
Scrivi qui: provisiona.sh

Deve ottenere, partendo dall'ambiente Debian pulito e gia' preparato:
  1. utente di servizio  appsrv,  senza shell di login
  2. /srv/sito con index.html, root:www-data, file 644 e cartelle 755
  3. nginx che serve /srv/sito sulla porta 80 e risponde
  4. unit systemd  guardiano.service,  eseguita da appsrv, abilitata e attiva
  5. crontab di root: 30 3 * * * /usr/local/bin/backup.sh  (e lo script esiste, eseguibile)
  6. firewall  inet lab  con policy drop, aperte solo 22 e 80, persistente al riavvio

Nota: la verifica lo esegue DUE VOLTE. Deve reggere anche la seconda.
EOF
:
