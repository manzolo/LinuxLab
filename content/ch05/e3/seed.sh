s="$LAB/smistare"; r="$LAB/radice"
mkdir -p "$s" "$r/etc" "$r/bin" "$r/var/log" "$r/var/www" "$r/home" "$r/tmp"
# I nomi cambiano col seme: non si puo' cablare un mv preso da internet.
c="$(edu_rand_word 1)-server.conf"; l="$(edu_rand_word 2)-access.log"
b="$(edu_rand_word 3)-tool";        t="tmp-$(edu_rand_word 4).scratch"
p="appunti-$(edu_rand_word 5).md"
printf 'listen 80;\n' > "$s/$c"
printf '2026-03-01 GET / 200\n' > "$s/$l"
printf '<h1>ciao</h1>\n' > "$s/index.html"
printf '#!/bin/sh\necho ok\n' > "$s/$b"; chmod 755 "$s/$b"
printf 'roba usa e getta\n' > "$s/$t"
printf '# la mia lista della spesa\n' > "$s/$p"
{ echo "conf=$c"; echo "log=$l"; echo "bin=$b"; echo "tmp=$t"; echo "pers=$p"; } > /opt/lab/state/nomi
