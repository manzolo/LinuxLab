mkdir -p "$LAB"

ip link set lo up 2>/dev/null || true
pkill -f "httpd -h /srv/lab" 2>/dev/null || true
mkdir -p /srv/lab "$LAB"
parola=$(edu_rand_word 241)
printf "<h1>ciao dal lab</h1>\n<p>%s</p>\n" "$parola" > /srv/lab/index.html
porta=$(edu_rand_int 8100 8990 242)
httpd -h /srv/lab -p "$porta"
printf "%s" "$porta" > /opt/lab/state/porta
printf "%s" "$parola" > /opt/lab/state/parola
sleep 1
:
