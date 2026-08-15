apk add --allow-untrusted htop >/dev/null 2>&1
jq -r .versione "$LAB/dati.json" > "$LAB/versione.txt"
