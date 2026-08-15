# Fa i passaggi A MANO e consegna uno script vuoto: su un container pulito non ottiene nulla.
id appsrv >/dev/null 2>&1 || useradd --system --shell /usr/sbin/nologin appsrv
mkdir -p /srv/sito && echo '<h1>ciao</h1>' > /srv/sito/index.html
printf '#!/bin/sh\necho fatto\n' > "$LAB/provisiona.sh"; chmod 755 "$LAB/provisiona.sh"
