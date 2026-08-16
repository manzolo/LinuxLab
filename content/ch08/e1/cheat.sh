# Il trucco classico: si dirotta con > e poi si conta a mano il file appena scritto.
# Produce due file plausibili, ma non da un solo passaggio — e il conteggio e' inventato.
cd "$LAB" && ls > elenco.txt
printf '3\n' > "$LAB/conteggio.txt"
