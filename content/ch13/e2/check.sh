d="$LAB/deposito"; g=$(cat /opt/lab/state/gigante); prima=$(cat /opt/lab/state/prima)
resta=$(find "$d" -name "$g" 2>/dev/null | wc -l | tr -d ' ')
ora=$(find "$d" -type f 2>/dev/null | wc -l | tr -d ' ')
lab_fact gigante "$g"
lab_fact file_ora "$ora (prima del gigante erano $prima)"
lab_eq gigante-sparito "0" "$resta"
lab_eq altri-salvi "$prima" "$ora" "$d"
lab_done
