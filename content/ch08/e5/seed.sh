mkdir -p "$LAB" /opt/lab/state
{
    printf 'servizio=%s\n' "$(edu_rand_word 201)"
    printf 'ambiente=%s\n' "$(edu_rand_word 202)"
    printf 'responsabile=%s\n' "$(edu_rand_word 203)"
} > /opt/lab/state/nota-attesa
cp /opt/lab/state/nota-attesa "$LAB/incarico.txt"
rm -f "$LAB/nota.conf"
