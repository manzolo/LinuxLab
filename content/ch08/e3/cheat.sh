# Tutto nello stesso file e poi si spera: gli errori finiscono fra i buoni.
"$LAB/rumoroso.sh" > "$LAB/buoni.txt" 2>&1; cp "$LAB/buoni.txt" "$LAB/scarti.txt"
