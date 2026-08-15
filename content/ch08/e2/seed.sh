mkdir -p "$LAB"
edu_rand_log "$LAB/app.log" "$(edu_rand_int 1500 2600 7)" 8
rm -f "$LAB/top-ip.txt"
