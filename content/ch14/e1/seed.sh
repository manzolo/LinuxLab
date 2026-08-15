mkdir -p "$LAB"
# log ordinato nel tempo: il primo ERROR e' una domanda con una risposta sola
awk -v n="$(edu_rand_int 500 1400 201)" -v e="$(edu_rand_int 40 260 202)" 'BEGIN{
    for (i = 1; i <= n; i++) {
        h = int((i * 24) / n); m = int((i * 60) % 60); s = (i * 7) % 60
        lvl = (i == e) ? "ERROR" : ((i % 17 == 0 && i > e) ? "ERROR" : ((i % 5 == 0) ? "WARN" : "INFO"))
        printf "2026-03-14 %02d:%02d:%02d %-5s 10.1.0.%d messaggio %d\n", h, m, s, lvl, (i % 250) + 1, i
    }
}' > "$LAB/app.log"
:
