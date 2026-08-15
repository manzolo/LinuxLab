s="$LAB/smistare"; r="$LAB/radice"; . /opt/lab/state/nomi
mv "$s/$conf" "$r/etc/"; mv "$s/$log" "$r/var/log/"; mv "$s/index.html" "$r/var/www/"
mv "$s/$bin" "$r/bin/"; mv "$s/$tmp" "$r/tmp/"; mv "$s/$pers" "$r/home/"
