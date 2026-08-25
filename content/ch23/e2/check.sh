mp=$(cat /opt/lab/state/mount_pieno 2>/dev/null)
use=$(df -P "$mp" 2>/dev/null | awk 'NR==2{gsub("%","",$5); print $5}')
lab_fact mount "$mp"
lab_fact uso "${use:-vuoto}%"
if [ -n "$use" ] && [ "$use" -lt 100 ]; then lab_check spazio-liberato 0
else lab_check spazio-liberato 1 "${use:-vuoto}%" "<100%" "$mp"; fi
lab_done
