mkdir -p "$LAB"
rm -f "$LAB/riassumi.sh"
{ echo "# log di prova, questa riga non va contata"
  edu_rand_log /dev/stdout "$(edu_rand_int 60 200 321)" 322; } > "$LAB/prova.log"
:
