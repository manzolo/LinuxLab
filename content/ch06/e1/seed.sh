mkdir -p "$LAB"
: > "$LAB/misterioso"
# Terzetti casuali ma sensati: il proprietario legge sempre.
o=$(edu_rand_pick 1 6 7 4 5); g=$(edu_rand_pick 2 0 4 5 6); a=$(edu_rand_pick 3 0 4 5)
chmod "$o$g$a" "$LAB/misterioso"
