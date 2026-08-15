printf '#!/bin/sh\nfind "$1" -type f | wc -l\n' > "$LAB/conta.sh"; chmod 755 "$LAB/conta.sh"
