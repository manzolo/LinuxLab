mkdir -p "$LAB" /srv/sito/upload /srv/sito/css /srv/dati
rm -f "$LAB/audit.txt"
i=1; while [ $i -le 6 ]; do echo ok > "/srv/sito/$(edu_rand_word $((431+i))).html"; chmod 644 "/srv/sito/$(edu_rand_word $((431+i))).html"; i=$((i+1)); done
echo x > /srv/sito/css/main.css; chmod 644 /srv/sito/css/main.css
# i colpevoli, in numero e posizione variabili
n=$(edu_rand_int 2 4 441)
i=1; while [ $i -le $n ]; do
    f="/srv/$(edu_rand_pick $((450+i)) sito sito/upload dati)/$(edu_rand_word $((460+i))).tmp"
    echo x > "$f"; chmod 666 "$f"; i=$((i+1)); done
find /srv -type f -perm -002 | sort > /opt/lab/state/attesi
:
