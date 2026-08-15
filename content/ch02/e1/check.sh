t=$(cat /opt/lab/state/target)
lab_fact percorso_atteso "$LAB/$t"
if [ -f "$LAB/$t/sono-qui" ]; then
    lab_check file-nel-posto-giusto 0
else
    trovato=$(find "$LAB" -name sono-qui 2>/dev/null | head -1)
    lab_check file-nel-posto-giusto 1 "${trovato:-(non creato)}" "$LAB/$t/sono-qui"
fi
lab_done
