# QUESTA VERIFICA PROVA DAVVERO LE PORTE, non legge il ruleset.
#
# Prima si limitava a cercare stringhe in `nft list ruleset`: bastava una regola
# generica `tcp accept` per far passare tutti e tre i controlli lasciando la
# macchina spalancata — e intanto la consegna prometteva «la verifica prova anche
# la 3306». Prometteva una cosa e ne misurava un'altra.
# (Revisione esterna del 2026-08-16.)
#
# Come si prova, senza una seconda macchina: si crea un namespace di rete con un
# cavo virtuale verso questa macchina, e da lì si bussa. Il traffico entra dalla
# veth, quindi NON è loopback e attraversa la catena input per davvero.
#
# E si distingue il silenzio dal rifiuto, che è poi il mestiere:
#   risposta subito       → il pacchetto è arrivato allo stack: la regola lo accetta
#   RST subito            → idem, semplicemente non c'è nessuno in ascolto
#   niente per tre secondi → DROP: il firewall se l'è mangiato
rs=$(nft list ruleset 2>/dev/null)
lab_fact ruleset "$(echo "$rs" | tr '\n' ' ' | head -c 200)"

ip netns del lab-sonda 2>/dev/null || true
ip link del lab-a 2>/dev/null || true
sonda=no
if ip netns add lab-sonda 2>/dev/null &&
   ip link add lab-a type veth peer name lab-b 2>/dev/null &&
   ip link set lab-b netns lab-sonda 2>/dev/null; then
    ip addr add 10.66.0.1/24 dev lab-a 2>/dev/null
    ip link set lab-a up 2>/dev/null
    ip netns exec lab-sonda ip addr add 10.66.0.2/24 dev lab-b 2>/dev/null
    ip netns exec lab-sonda ip link set lab-b up 2>/dev/null
    ip netns exec lab-sonda ip link set lo up 2>/dev/null
    sonda=sì
fi

bussa() {   # $1 = porta -> "risponde" | "rifiuta" | "silenzio"
    i=$(date +%s%N)
    ip netns exec lab-sonda timeout 3 bash -c "exec 3<>/dev/tcp/10.66.0.1/$1" >/dev/null 2>&1
    r=$?
    f=$(date +%s%N)
    ms=$(( (f - i) / 1000000 ))
    if [ "$r" -eq 0 ]; then echo "risponde"
    elif [ "$ms" -ge 2500 ]; then echo "silenzio"
    else echo "rifiuta"; fi
}

if echo "$rs" | grep -A2 'chain input' | grep -q 'policy drop'; then lab_check policy-drop 0
else lab_check policy-drop 1 "(policy non drop, o catena assente)" "chain input con policy drop"; fi

if [ "$sonda" = sì ]; then
    p22=$(bussa 22); p80=$(bussa 80); p3306=$(bussa 3306)
    lab_fact bussato "22=$p22 80=$p80 3306=$p3306 (silenzio = il firewall l'ha mangiato)"
    if [ "$p22" != silenzio ] && [ "$p80" != silenzio ]; then lab_check 22-e-80-aperte 0
    else lab_check 22-e-80-aperte 1 "22=$p22 80=$p80" "il pacchetto deve arrivare su entrambe"; fi
    if [ "$p3306" = silenzio ]; then lab_check 3306-chiusa 0
    else lab_check 3306-chiusa 1 "3306=$p3306" "silenzio: la 3306 non deve arrivare da nessuna parte"; fi
else
    # Senza namespace non si può bussare: si ripiega sulla lettura del ruleset e
    # LO SI DICE, invece di far passare una verifica più debole per quella vera.
    lab_fact sonda "non disponibile: verificato leggendo il ruleset, non bussando"
    if echo "$rs" | grep -qE 'dport .*22' && echo "$rs" | grep -qE 'dport .*80'; then lab_check 22-e-80-aperte 0
    else lab_check 22-e-80-aperte 1 "(manca una delle due)" "accept su dport 22 e 80"; fi
    if echo "$rs" | grep -qE 'dport .*3306'; then
        lab_check 3306-chiusa 1 "c'è una regola che apre la 3306" "nessuna regola per la 3306"
    elif echo "$rs" | grep -A2 'chain input' | grep -q 'policy drop'; then lab_check 3306-chiusa 0
    else lab_check 3306-chiusa 1 "senza policy drop la 3306 passa comunque" "policy drop"; fi
fi

ip netns del lab-sonda 2>/dev/null || true
ip link del lab-a 2>/dev/null || true
lab_done
