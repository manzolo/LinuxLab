awk '{print $6}' "$LAB/app.log" | sort | uniq -c | sort -rn | head -5 | awk '{print $2}' > "$LAB/top-ip.txt"
