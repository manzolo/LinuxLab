mkdir -p "$LAB"
printf '#!/bin/sh\necho "deploy di %s"\n' "$(edu_rand_word 9)" > "$LAB/deploy.sh"
chmod 644 "$LAB/deploy.sh"
