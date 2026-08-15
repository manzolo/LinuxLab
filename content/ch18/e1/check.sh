lab_fact indirizzi_lo "$(ip -o -4 a show lo 2>/dev/null | awk '{print $4}' | tr '\n' ' ')"
if ip -o -4 a show lo 2>/dev/null | grep -q '10.99.0.1/24'; then lab_check indirizzo-aggiunto 0
else lab_check indirizzo-aggiunto 1 "(assente)" "10.99.0.1/24 su lo"; fi
r=$(ip route get 10.99.0.7 2>/dev/null | head -1)
lab_fact route_get "${r:-(nessuna rotta)}"
if echo "$r" | grep -q 'dev lo'; then lab_check rotta-attiva 0
else lab_check rotta-attiva 1 "${r:-(nessuna rotta)}" "una rotta che passa da lo"; fi
lab_done
