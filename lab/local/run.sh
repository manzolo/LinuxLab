#!/usr/bin/env bash
# Laboratorio locale per i capitoli 17-22 (systemd, rete, servizi, firewall, LVM/RAID).
#
# Perche' un container e non una VM: una VM QEMU vorrebbe un'immagine bootabile da
# mantenere, kernel, bootloader, rete, porte e istruzioni per tre sistemi operativi.
# E' esattamente il tipo di manutenzione che questo progetto ha deciso di non avere.
#
# Il prezzo, detto chiaro: il capitolo 21 usa --privileged, e i device-mapper e gli
# array md sono GLOBALI dell'host. Per questo tutto quello che creiamo si chiama
# lab-* e c'e' `lab-cleanup`. Gli altri capitoli locali (17-20 e 22) stanno con
# NET_ADMIN + SYS_ADMIN e non toccano nessun dispositivo a blocchi.
set -euo pipefail

NOME=linuxlab
IMG=linuxlab-local
CAP="${1:-}"
ES="${2:-}"

# Le prove di proprieta' stanno in UN SOLO posto, lo stesso file che finisce
# nell'immagine: cosi' host e container non possono divergere.
LAB_SUDO=sudo
LIB_PROPRIETA="$(dirname "$0")/../overlay/opt/lab/lib/proprieta.sh"
# shellcheck source=../overlay/opt/lab/lib/proprieta.sh
. "$LIB_PROPRIETA"

rosso()  { printf '\033[31m%s\033[0m\n' "$*"; }
giallo() { printf '\033[33m%s\033[0m\n' "$*"; }
verde()  { printf '\033[32m%s\033[0m\n' "$*"; }

# ------------------------------------------------------------------ controlli

controlla() {
    local guai=0
    command -v docker >/dev/null || { rosso "serve docker"; exit 1; }

    if [ "$(stat -fc %T /sys/fs/cgroup 2>/dev/null)" != "cgroup2fs" ]; then
        giallo "cgroup v2 non rilevato: systemd nel container potrebbe non partire."
        guai=1
    fi
    for m in nf_tables dm_mod loop raid1; do
        if ! grep -qw "^$m" /proc/modules 2>/dev/null && ! modinfo "$m" >/dev/null 2>&1; then
            giallo "modulo del kernel '$m' non disponibile: il capitolo che lo usa non funzionerà."
            guai=1
        fi
    done
    [ $guai -eq 0 ] && verde "ambiente a posto" || giallo "si può procedere lo stesso, ma alcuni capitoli zoppicheranno."
}

# ------------------------------------------------------------------ avviso

# L'avviso forte serve SOLO dove c'e' davvero qualcosa da temere: il capitolo 21.
# Ripeterlo dappertutto lo trasforma in rumore, e il rumore si smette di leggerlo.
avviso() {
    if [ "$CAP" = 21 ]; then
        cat <<'EOF'

  ┌──────────────────────────────────────────────────────────────────────┐
  │  Il capitolo 21 gira in un container PRIVILEGIATO.                   │
  │                                                                      │
  │  Vuol dire che i loop device, i volumi LVM e gli array RAID che crei │
  │  sono visibili anche al TUO sistema: un `lsblk` sull'host li mostra. │
  │  Tutto quello che il laboratorio crea si chiama lab-*, e alla fine   │
  │  `lab-cleanup` lo smonta e lo stacca — dopo aver controllato che sia │
  │  davvero roba sua.                                                   │
  │                                                                      │
  │  Se qualcosa resta appeso:  ./run.sh cleanup                         │
  └──────────────────────────────────────────────────────────────────────┘

EOF
    else
        printf '
  Container con NET_ADMIN e SYS_ADMIN: nessun dispositivo a blocchi toccato.
  Alla fine:  ./run.sh cleanup

'
    fi
}

# ------------------------------------------------------------------ pulizia

# La regola, non negoziabile: si tocca SOLO quello che porta il nostro nome, e lo si
# verifica prima di toccarlo. Qui si lavora sull'host di chi studia, e un cleanup che
# sbaglia bersaglio fa piu' danni di tutto il capitolo messo insieme.
#
# Cosa e' andato storto nella prima versione (segnalato in revisione il 2026-08-16):
#   - fermava ogni /dev/md12*, che comprende **/dev/md127**, cioe' il nome che il
#     kernel assegna da solo agli array assemblati all'avvio: array VERI dell'host;
#   - eliminava il container PRIMA di usare gli strumenti che stanno dentro, e poi
#     si affidava a `vgchange` dell'host, che su una macchina senza LVM non c'e';
#   - non smontava niente: `vgremove -f` su un VG ancora montato non e' un cleanup.
pulisci() {
    giallo "smonto e stacco quello che il laboratorio ha creato…"

    # 1. Prima si smonta e si disfa DA DENTRO, finche' il container c'e': gli
    #    strumenti (lvm, mdadm) sono li', non necessariamente sull'host.
    if docker ps -a --format '{{.Names}}' | grep -qx "$NOME"; then
        # Anche QUI DENTRO la prova viene prima: `lab_disfa_vg` non tocca niente
        # se non riesce a dimostrare che il gruppo poggia sui nostri dischi.
        #
        # E il file delle prove ce lo METTIAMO NOI, invece di sperare che il
        # container sia stato creato da un'immagine abbastanza recente da averlo:
        # un container vecchio non ce l'ha, il `. file || exit 0` usciva zitto e
        # subito dopo `docker rm -f` buttava via gli unici strumenti capaci di
        # smontare quel volume. (Terzo giro di revisione, 2026-08-16.)
        # Il container si elimina SOLO se la pulizia interna e' riuscita davvero.
        # Prima l'uscita del `docker exec` finiva in una pipe con `|| true`, quindi
        # il suo esito si perdeva e `docker rm -f` partiva comunque: bastava che
        # `umount` fallisse per buttare via gli strumenti con il volume ancora su.
        # E dentro lo script i due passi vanno concatenati con `||`, o il secondo
        # che riesce nasconde il primo che ha fallito.
        # (Quarto giro di revisione, 2026-08-16.)
        pulito=no
        if docker exec "$NOME" mkdir -p /opt/lab/lib >/dev/null 2>&1 &&
           docker cp "$LIB_PROPRIETA" "$NOME:/opt/lab/lib/proprieta.sh" >/dev/null 2>&1; then
            if esito=$(docker exec "$NOME" sh -c '
                . /opt/lab/lib/proprieta.sh
                lab_disfa_vg lab-vg || exit 1
                lab_disfa_md /dev/md/lab-raid || exit 1
            ' 2>&1); then pulito=si; fi
            [ -n "$esito" ] && printf '%s\n' "$esito"
        else
            rosso "non riesco a copiare le prove di proprietà dentro il container '$NOME'."
        fi
        if [ "$pulito" = si ]; then
            docker rm -f "$NOME" >/dev/null 2>&1 || true
        else
            rosso "la pulizia dentro '$NOME' NON è riuscita: non lo elimino."
            rosso "   dentro ci sono gli unici strumenti per smontare quel volume."
            rosso "   entra e guarda:  docker exec -it $NOME bash"
        fi
    fi

    # 2. Poi, sull'host: stessa funzione, stessa prova, stesso ordine.
    if command -v vgs >/dev/null 2>&1; then
        lab_disfa_vg lab-vg || true
    elif sudo test -e /dev/lab-vg; then
        rosso "resta un gruppo di volumi 'lab-vg' e su questo host non c'è LVM per toglierlo."
        rosso "   installa lvm2 e ridai  $0 cleanup"
    fi

    # 3. Gli array: SOLO quelli con il nostro nome, e solo dopo aver riletto dal
    #    kernel come si chiamano davvero. Niente glob su /dev/md*.
    for md in /dev/md/lab-*; do
        [ -e "$md" ] || continue
        lab_disfa_md "$md" || giallo "salto $md: non ho potuto dimostrare che sia nostro"
    done

    # 4. I loop device: si guarda il file che c'e' dietro, non il numero.
    for l in $(lab_loop_nostri); do sudo losetup -d "$l" 2>/dev/null || true; done

    # 5. Si dice com'e' finita, invece di dire "fatto" e basta.
    residui=""
    command -v vgs >/dev/null 2>&1 && sudo vgs lab-vg >/dev/null 2>&1 && residui="$residui lab-vg"
    for md in /dev/md/lab-*; do [ -e "$md" ] && residui="$residui $md"; done
    for l in $(lab_loop_nostri); do residui="$residui $l"; done
    if [ -n "$residui" ]; then rosso "restano appesi:$residui"; else verde "fatto: niente di nostro è rimasto"; fi
}

# ------------------------------------------------------------------ via

case "$CAP" in
    check)   controlla; exit 0 ;;
    cleanup) pulisci;   exit 0 ;;
esac

controlla
avviso

docker image inspect "$IMG" >/dev/null 2>&1 || {
    giallo "immagine assente, la costruisco (qualche minuto)…"
    docker build "$(dirname "$0")/.." -f "$(dirname "$0")/../Dockerfile.local" -t "$IMG"
}

# All'avvio NON si fa `docker rm -f` e basta: se si arriva dal capitolo 21 il
# container tiene ancora montato un volume LVM e agganciati dei loop device, e
# distruggerlo per primo e' esattamente la sequenza che `pulisci` esiste per
# evitare. (Secondo giro di revisione, 2026-08-16: la pulizia nuova c'era e
# l'avvio normale la scavalcava.)
if docker ps -a --format '{{.Names}}' | grep -qx "$NOME"; then
    giallo "c'era gia' un laboratorio acceso: lo chiudo per bene prima di ripartire."
    pulisci
fi

# --privileged serve SOLO al capitolo 21 (LVM/RAID), che tocca dispositivi a blocchi.
# Il 22 non ne tocca nessuno — nessun losetup, nessun lvcreate, nessun mdadm — e per
# anni di abitudine gli era stato dato lo stesso: diritti di root sull'host per un
# esercizio che crea un utente e un file di nginx. Tolto.
PRIV=(--cap-add NET_ADMIN --cap-add SYS_ADMIN --security-opt seccomp=unconfined)
case "$CAP" in
    21) PRIV=(--privileged); giallo "capitolo 21: serve --privileged (dispositivi a blocchi)" ;;
esac

verde "avvio il laboratorio…"
# NB: niente `-v /sys/fs/cgroup:/sys/fs/cgroup`. Con cgroup v2 e --cgroupns=private
# Docker prepara gia' un /sys/fs/cgroup scrivibile; montarci sopra quello dell'host
# lo rende in sola lettura e systemd esce subito con 255, senza dire una parola.
docker run -d --name "$NOME" \
    --cgroupns=private \
    --tmpfs /run --tmpfs /run/lock --tmpfs /tmp \
    "${PRIV[@]}" \
    -p 8080:80 -p 2222:22 \
    "$IMG" >/dev/null

printf 'attendo systemd'
for _ in $(seq 1 30); do
    if docker exec "$NOME" systemctl is-system-running 2>/dev/null | grep -qE 'running|degraded'; then break; fi
    printf '.'; sleep 1
done
echo

if [ -n "$CAP" ] && [ -n "$ES" ]; then
    docker exec "$NOME" lab start "$CAP" "$ES" || true
    verde "esercizio $CAP.$ES pronto. Entra con:  docker exec -it $NOME bash"
else
    verde "pronto. Entra con:  docker exec -it $NOME bash"
fi
echo "quando hai finito:  $0 cleanup"
