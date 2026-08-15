# Copia invece di link: il contenuto sembra giusto, ma non e' un link.
cd "$LAB/registri" && cp "$(ls -t ./*.log | head -1)" ultimo
