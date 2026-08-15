awk '{print $NF}' "$LAB/app.log" | sort | uniq -c | sort -rn | awk '{print $2, $1}' > "$LAB/report.txt"
