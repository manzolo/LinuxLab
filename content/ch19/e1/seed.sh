mkdir -p "$LAB" /var/www/html
rm -rf /var/www/lab
printf '<h1>sito di prova %s</h1>\n' "$(edu_rand_word 421)" > "$LAB/testo.txt"
printf '<h1>pagina di default</h1>\n' > /var/www/html/index.html
# ripristina la configurazione di partenza
sed -i 's#root /var/www/lab;#root /var/www/html;#' /etc/nginx/sites-enabled/default 2>/dev/null || true
systemctl restart nginx 2>/dev/null || true
:
