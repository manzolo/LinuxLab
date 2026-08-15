mkdir -p /var/www/lab
cp "$LAB/testo.txt" /var/www/lab/index.html
sed -i 's#root /var/www/html;#root /var/www/lab;#' /etc/nginx/sites-enabled/default
nginx -t >/dev/null 2>&1 && systemctl reload nginx
sleep 1
