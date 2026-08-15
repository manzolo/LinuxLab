rm -rf "$LAB/cassetto" 2>/dev/null
a=".$(edu_rand_word 1)"; b=$(edu_rand_word 2); c=".$(edu_rand_word 3)"
mkdir -p "$LAB/$a/$b/$c"
printf '%s\n' "$a/$b/$c" > /opt/lab/state/target
echo "qualche appunto" > "$LAB/$a/nota.txt"
echo "altro" > "$LAB/$a/$b/dati.csv"
mkdir -p "$LAB/scarico"
