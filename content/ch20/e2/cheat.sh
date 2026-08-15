# Elenca tutti i file invece dei soli scrivibili da tutti.
find /srv -type f | sort > "$LAB/audit.txt"
