out=$(visudo -c 2>&1); rc=$?
lab_fact visudo "$(echo "$out" | tr '\n' ' ' | head -c 120)"
[ $rc -eq 0 ] && lab_check sintassi-valida 0 || lab_check sintassi-valida 1 "$(echo "$out" | tail -1)" "parsed OK"

# La fonte di verita' e' sudo stesso, non il testo del file:
# un file scritto bene ma nel posto sbagliato non deve passare.
elenco=$(sudo -l -U deploy 2>/dev/null)
lab_fact sudo_l "$(echo "$elenco" | tr '\n' ' ' | head -c 160)"
echo "$elenco" | grep -q '/usr/local/bin/riavvia-sito' \
    && lab_check puo-quel-comando 0 \
    || lab_check puo-quel-comando 1 "(non elencato)" "/usr/local/bin/riavvia-sito"
if echo "$elenco" | grep -qE '\(ALL(:ALL)?\)[[:space:]]*(NOPASSWD:[[:space:]]*)?ALL'; then
    lab_check non-puo-tutto 1 "(ALL) ALL" "solo il comando richiesto"
else
    lab_check non-puo-tutto 0
fi
lab_done
