s="$LAB/srv/sito"
mkdir -p "$s/img" "$s/css" "$s/js"
printf '<h1>%s</h1>\n' "$(edu_rand_word 8)" > "$s/index.html"
printf 'body{}\n' > "$s/css/main.css"
printf 'console.log(1)\n' > "$s/js/app.js"
: > "$s/img/logo.png"
printf 'ok\n' > "$s/robots.txt"
addgroup web 2>/dev/null || true
adduser -D -H -G web web 2>/dev/null || true
chown -R root:root "$LAB/srv"
chmod -R 777 "$s"
