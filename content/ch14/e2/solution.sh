# La forma canonica. L'`|| echo` non serve a chi studia: serve al banco di prova,
# perche' un `crontab -` che fallisce in silenzio manda fuori strada la diagnosi.
echo '30 3 * * * /usr/local/bin/backup.sh' | crontab - || echo "crontab - e' fallito con codice $?"
crontab -l >/dev/null 2>&1 || echo "attenzione: dopo la scrittura, crontab -l non legge niente"
