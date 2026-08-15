du -s "$LAB/deposito"/* | sort -n | tail -1 | awk '{print $2}' | xargs basename > /opt/lab/state/answer
