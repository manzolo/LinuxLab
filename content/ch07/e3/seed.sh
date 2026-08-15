mkdir -p "$LAB" /usr/local/bin /etc/sudoers.d
rm -f /etc/sudoers.d/*
addgroup web 2>/dev/null
deluser deploy 2>/dev/null
adduser -D -h /home/deploy -s /bin/bash -G web deploy 2>/dev/null
printf '#!/bin/sh\necho "sito riavviato"\n' > /usr/local/bin/riavvia-sito
chmod 755 /usr/local/bin/riavvia-sito
