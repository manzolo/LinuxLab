rs=$(nft list ruleset 2>/dev/null)
lab_fact ruleset "$(echo "$rs" | tr '\n' ' ' | head -c 200)"
if echo "$rs" | grep -A2 'chain input' | grep -q 'policy drop'; then lab_check policy-drop 0
else lab_check policy-drop 1 "(policy non drop, o catena assente)" "chain input con policy drop"; fi
if echo "$rs" | grep -qE 'dport .*22' && echo "$rs" | grep -qE 'dport .*80'; then lab_check 22-e-80-aperte 0
else lab_check 22-e-80-aperte 1 "(manca una delle due)" "accept su dport 22 e 80"; fi
if echo "$rs" | grep -qE 'dport .*3306'; then
    lab_check 3306-chiusa 1 "c'è una regola che apre la 3306" "nessuna regola per la 3306"
elif echo "$rs" | grep -A2 'chain input' | grep -q 'policy drop'; then
    lab_check 3306-chiusa 0
else
    lab_check 3306-chiusa 1 "senza policy drop la 3306 passa comunque" "policy drop"
fi
lab_done
