s="$LAB/srv/sito"
lab_fact proprietari "$(find "$s" -printf '%u:%g ' 2>/dev/null | tr ' ' '\n' | sort -u | tr '\n' ' ')"
lab_fact permessi_file "$(find "$s" -type f -printf '%m ' 2>/dev/null | tr ' ' '\n' | sort -u | tr '\n' ' ')"
lab_fact permessi_cartelle "$(find "$s" -type d -printf '%m ' 2>/dev/null | tr ' ' '\n' | sort -u | tr '\n' ' ')"

sbagliati=$(find "$s" ! -user web -o ! -group web 2>/dev/null | wc -l | tr -d ' ')
[ "$sbagliati" = "0" ] && lab_check proprietario 0 \
    || lab_check proprietario 1 "$sbagliati elementi non web:web" "tutti web:web" "$s"

# Invariante sui BIT, non sulla forma del comando: chmod 644 e chmod u=rw,go=r valgono uguale.
nf=$(find "$s" -type f ! -perm 644 2>/dev/null | wc -l | tr -d ' ')
[ "$nf" = "0" ] && lab_check permessi-file 0 \
    || lab_check permessi-file 1 "$(find "$s" -type f ! -perm 644 -printf '%m ' 2>/dev/null | head -c 40)" "644"

nd=$(find "$s" -type d ! -perm 755 2>/dev/null | wc -l | tr -d ' ')
[ "$nd" = "0" ] && lab_check permessi-cartelle 0 \
    || lab_check permessi-cartelle 1 "$(find "$s" -type d ! -perm 755 -printf '%m %f ' 2>/dev/null | head -c 60)" "755"

n7=$(find "$s" -perm 777 2>/dev/null | wc -l | tr -d ' ')
[ "$n7" = "0" ] && lab_check niente-777 0 || lab_check niente-777 1 "$n7 elementi ancora 777" "0"
lab_done
