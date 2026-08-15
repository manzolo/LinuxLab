# L'errore classico: un chmod -R solo. I file diventano eseguibili.
s="$LAB/srv/sito"; chown -R web:web "$s"; chmod -R 755 "$s"
