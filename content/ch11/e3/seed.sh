mkdir -p "$LAB"
# chiudi il macinatore dei due esercizi precedenti, se e' rimasto acceso
# Ferma il macinatore di un mondo precedente. NON si puo' leggere il nome da
# /opt/lab/state: l'agente azzera quella cartella PRIMA di eseguire il seed.
# Si pulisce per pattern, che e' l'unica cosa che sopravvive all'azzeramento.
pkill -9 -f '/usr/local/bin/trita' 2>/dev/null || true
rm -f /usr/local/bin/trita* 2>/dev/null || true
rm -f /opt/lab/state/spinner "$LAB/pid.txt"
pkill -x sleep 2>/dev/null || true
:   # il seed deve uscire con 0 anche se non c'era nulla da fermare
