echo '127.0.0.1 mio.sito' >> /etc/hosts
p=$(cat /opt/lab/state/porta)
curl -s "http://mio.sito:$p/" > "$LAB/pagina-per-nome.html"
