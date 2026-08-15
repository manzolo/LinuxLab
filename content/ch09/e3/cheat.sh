# Cancella tutto quello che e' vecchio, senza guardare il nome: si porta via anche i .log.
find "$LAB/backup" -type f -mtime +7 -delete
