mkdir -p "$LAB"
# via eventuali avanzi di un mondo precedente
# Ferma il macinatore di un mondo precedente. NON si puo' leggere il nome da
# /opt/lab/state: l'agente azzera quella cartella PRIMA di eseguire il seed.
# Si pulisce per pattern, che e' l'unica cosa che sopravvive all'azzeramento.
pkill -9 -f '/usr/local/bin/trita' 2>/dev/null || true
rm -f /usr/local/bin/trita* 2>/dev/null || true
n="trita$(edu_rand_word 51)"
cat > "/usr/local/bin/$n" <<'EOF'
#!/bin/sh
# Questo programma INTERCETTA SIGTERM e lo ignora, come farebbe un database
# che non vuole morire a meta' di una scrittura. Serve a far scoprire da soli
# perche' kill -9 esiste.
trap '' TERM INT HUP
while :; do i=0; while [ $i -lt 4000 ]; do i=$((i+1)); done; done
EOF
chmod 755 "/usr/local/bin/$n"
# `nice` tiene la macchina reattiva ma lascia il processo in cima a %CPU
setsid nice -n 19 "/usr/local/bin/$n" >/dev/null 2>&1 &
printf '%s' "$n" > /opt/lab/state/spinner
sleep 2
