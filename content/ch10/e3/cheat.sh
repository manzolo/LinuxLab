# Colonne invertite: il conteggio prima del codice.
awk '{print $NF}' "$LAB/app.log" | sort | uniq -c | sort -rn > "$LAB/report.txt"
