mkdir -p "$LAB"
apk del figlet 2>/dev/null || true
p="$(edu_rand_word 71)"
printf '%s\n' "$p" > "$LAB/parola.txt"
printf '%s' "$p" > /opt/lab/state/parola
rm -f "$LAB/insegna.txt"
:
