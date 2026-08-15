apk add --allow-untrusted figlet >/dev/null 2>&1
figlet "$(cat "$LAB/parola.txt")" > "$LAB/insegna.txt"
apk del figlet >/dev/null 2>&1
