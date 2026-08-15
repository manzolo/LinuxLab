# Spezza sugli spazi: il file con lo spazio nel nome finisce su due righe.
find "$LAB/deposito" -type f -size +1M | tr ' ' '\n' | sort > "$LAB/grossi.txt"
