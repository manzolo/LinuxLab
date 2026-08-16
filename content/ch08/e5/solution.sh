# Il banco automatico non può pilotare un editor interattivo: applica la stessa
# singola correzione che la persona esegue con vi. Il check resta sullo stato.
responsabile=$(sed -n 's/^responsabile=//p' "$LAB/incarico.txt")
sed -i "s/^responsabile=.*/responsabile=$responsabile/" "$LAB/nota.conf"
