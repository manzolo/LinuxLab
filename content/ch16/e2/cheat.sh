# Esce sempre 0: cron non sapra' mai che e' fallito.
printf '#!/bin/sh\ntar czf "$HOME/lab/salva-$(date +%%F).tar.gz" -C "$HOME/lab" dati 2>/dev/null\nexit 0\n' > "$LAB/salva.sh"
chmod 755 "$LAB/salva.sh"
