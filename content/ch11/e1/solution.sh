# `ps` compare quasi sempre in cima alla propria classifica: e' appena partito,
# e %CPU e' una media sulla vita del processo. Va escluso.
ps -eo comm,pcpu --sort=-pcpu | awk 'NR>1 && $1 != "ps" && $1 != "awk" {print $1; exit}' > /opt/lab/state/answer
