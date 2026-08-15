awk -F, '{s+=$4} END{print s}' "$LAB/vendite.csv" > /opt/lab/state/answer
