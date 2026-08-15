mkdir -p "$LAB"
nb=$(edu_rand_int 6 14 9); ns=$(edu_rand_int 3 9 10)
{
  echo '#!/bin/sh'
  i=1; while [ $i -le $nb ]; do echo "echo \"risultato $i: $(edu_rand_word $((50+i)))\""; i=$((i+1)); done
  i=1; while [ $i -le $ns ]; do echo "echo \"errore $i: $(edu_rand_word $((80+i))) non trovato\" >&2"; i=$((i+1)); done
} > "$LAB/rumoroso.sh"
chmod 755 "$LAB/rumoroso.sh"
printf '%s' "$nb" > /opt/lab/state/nb; printf '%s' "$ns" > /opt/lab/state/ns
rm -f "$LAB/buoni.txt" "$LAB/scarti.txt"
