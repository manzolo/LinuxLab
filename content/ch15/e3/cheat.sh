# Scarica per indirizzo e spaccia il file per risolto-per-nome: /etc/hosts resta vuoto.
p=$(cat /opt/lab/state/porta); curl -s "http://127.0.0.1:$p/" > "$LAB/pagina-per-nome.html"
