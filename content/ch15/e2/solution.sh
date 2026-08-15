p=$(ss -tln | awk 'NR>1 {split($4,a,":"); print a[length(a)]}' | head -1)
curl -s "http://127.0.0.1:$p/" > "$LAB/pagina.html"
