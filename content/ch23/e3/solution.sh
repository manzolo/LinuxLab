ps -eo comm,pcpu --sort=-pcpu | awk 'NR>1 && $1 != "ps" && $1 != "awk" {print $1; exit}' > /opt/lab/state/answer
