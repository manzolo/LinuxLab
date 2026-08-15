mkdir -p "$LAB" /var/www/html
printf '<h1>%s</h1>\n' "$(edu_rand_word 411)" > /var/www/html/index.html
systemctl start nginx 2>/dev/null || true
rm -f "$LAB/cattura.txt"
:
