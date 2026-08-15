# Non salta i commenti: nel riassunto compare una riga "#".
printf '#!/bin/sh\nawk "{print \\$4}" "$1" | sort | uniq -c | sort -rn | awk "{print \\$2, \\$1}"\n' > "$LAB/riassumi.sh"
chmod 755 "$LAB/riassumi.sh"
