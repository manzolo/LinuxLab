mkdir -p "$LAB" /opt/lab/state
servizio=$(edu_rand_word 201)
ambiente=$(edu_rand_word 202)
responsabile=$(edu_rand_word 203)
porta=$(edu_rand_int 2000 9999 204)
log=$(edu_rand_word 205)
{
    printf 'servizio=%s\n' "$servizio"
    printf 'ambiente=%s\n' "$ambiente"
    printf 'responsabile=%s\n' "$responsabile"
    printf 'porta=%s\n' "$porta"
    printf 'log=/var/log/%s.log\n' "$log"
    printf 'attivo=si\n'
} > /opt/lab/state/nota-attesa
sed 's/^responsabile=.*/responsabile=DA_CORREGGERE/' /opt/lab/state/nota-attesa > "$LAB/nota.conf"
printf 'responsabile=%s\n' "$responsabile" > "$LAB/incarico.txt"
