mkdir -p "$LAB"
apk del htop 2>/dev/null || true
v="$(edu_rand_int 1 9 61).$(edu_rand_int 0 20 62).$(edu_rand_int 0 40 63)"
printf '{"nome":"%s","versione":"%s","attivo":true}\n' "$(edu_rand_word 64)" "$v" > "$LAB/dati.json"
printf '%s' "$v" > /opt/lab/state/versione
:
