mancanti=""
for d in progetto progetto/src progetto/docs progetto/test; do
    [ -d "$LAB/$d" ] || mancanti="$mancanti $d"
done
lab_fact albero "$(cd "$LAB" 2>/dev/null && ls -d progetto progetto/*/ 2>/dev/null | tr '\n' ' ')"
[ -z "$mancanti" ] && lab_check albero 0 || lab_check albero 1 "manca:$mancanti" "progetto/{src,docs,test}"
lab_done
