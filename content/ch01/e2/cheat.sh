# L'errore classico: echo senza -n lascia l'a-capo, 11 byte invece di 10.
mkdir -p "$LAB"; echo "ciao mondo" > "$LAB/saluto.txt"
