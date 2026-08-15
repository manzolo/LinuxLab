f="$LAB/deploy.sh"; m=$(stat -c '%a' "$f")
lab_fact permessi "$m"
lab_fact lettere "$(ls -l "$f" | cut -c1-10)"
[ -x "$f" ] && lab_check eseguibile-owner 0 || lab_check eseguibile-owner 1 "$m" "il bit x per il proprietario"
case "$m" in
    *[1357]|*[1357]?) lab_check non-per-gli-altri 1 "$m" "744 (solo il proprietario esegue)" "$f" ;;
    *) lab_check non-per-gli-altri 0 ;;
esac
lab_done
