mkdir -p "$LAB" /opt/lab/state
edu_rand_word 191 > /opt/lab/state/valore-heredoc
cp /opt/lab/state/valore-heredoc "$LAB/valore.txt"
rm -f "$LAB/letterale.conf" "$LAB/espanso.conf"
