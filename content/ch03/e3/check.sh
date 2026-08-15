d="$LAB/registri"; atteso=$(cat /opt/lab/state/recente)
lab_fact piu_recente_reale "$atteso"
if [ -L "$d/ultimo" ]; then
    lab_check e-un-link 0
    bersaglio=$(readlink "$d/ultimo"); bersaglio=$(basename "$bersaglio")
    lab_fact punta_a "$bersaglio"
    lab_eq punta-al-recente "$atteso" "$bersaglio"
elif [ -e "$d/ultimo" ]; then
    lab_check e-un-link 1 "file normale (una copia)" "link simbolico" "$d/ultimo"
    lab_check punta-al-recente 1 "(è una copia, non punta a nulla)" "$atteso"
else
    lab_check e-un-link 1 "(non creato)" "link simbolico"
    lab_check punta-al-recente 1 "(non creato)" "$atteso"
fi
lab_done
