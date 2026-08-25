#!/usr/bin/env bash
# Laboratorio locale per i capitoli 17-22 (systemd, rete, servizi, firewall, LVM/RAID).
#
# Perche' un container e non una VM: una VM QEMU vorrebbe un'immagine bootabile da
# mantenere, kernel, bootloader, rete, porte e istruzioni per tre sistemi operativi.
# E' esattamente il tipo di manutenzione che questo progetto ha deciso di non avere.
#
# Il prezzo, detto chiaro: in questo ambiente Docker systemd ha bisogno di un cgroup
# scrivibile, che Docker concede al container con --privileged. Quindi tutti i
# capitoli locali sono privilegiati. Solo il 21 crea intenzionalmente device-mapper,
# loop e array md globali al kernel host; per questo ogni risorsa si chiama lab-* e
# il cleanup ne dimostra la proprieta' prima di toccarla.
set -euo pipefail

NOME=linuxlab
IMG=linuxlab-local
CAP="${1:-}"
ES="${2:-}"
RADICE_REPO="$(cd "$(dirname "$0")/../.." && pwd)"

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
  Container PRIVILEGIATO: serve a systemd per gestire il proprio cgroup.
  Questo capitolo non crea dispositivi a blocchi, ma dentro sei root sul kernel host:
  esegui solo i comandi del lab e usalo su una macchina di cui ti fidi.
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

# Su questo host cgroup v2 e' montato read-only nei container non privilegiati:
# systemd, che deve creare i cgroup delle unit, esce subito con 255. SYS_ADMIN e
# seccomp=unconfined non bastano. --privileged e' quindi un prerequisito dichiarato
# del runtime locale, non un dettaglio nascosto. Il 21 riceve un avviso aggiuntivo
# perché, diversamente dagli altri, crea davvero dispositivi a blocchi.
PRIV=(--privileged)
case "$CAP" in
    21) giallo "capitolo 21: --privileged + dispositivi a blocchi globali al kernel" ;;
esac

verde "avvio il laboratorio…"
# NB: niente bind del cgroup host. Con --privileged e --cgroupns=private Docker
# prepara un cgroup namespace scrivibile per systemd; un bind esplicito amplierebbe
# inutilmente la superficie visibile al container.
docker run -d --name "$NOME" \
    --cgroupns=private \
    --tmpfs /run --tmpfs /run/lock --tmpfs /tmp \
    "${PRIV[@]}" \
    -p 8080:80 -p 2222:22 \
    "$IMG" >/dev/null

# La libreria di sicurezza vive nel repository ed e' copiata anche se l'immagine
# Docker era gia' in cache: una correzione alle prove di proprieta' non deve
# richiedere all'utente di intuire che deve ricostruire l'immagine.
docker exec "$NOME" mkdir -p /opt/lab/lib
docker cp "$LIB_PROPRIETA" "$NOME:/opt/lab/lib/proprieta.sh" >/dev/null
# Le shell interattive aperte con `docker exec ... bash` non sono login shell e
# non leggono necessariamente /etc/profile.d: i comandi del lab devono quindi
# essere nel PATH anche senza affidarsi a un file di profilo.
docker exec "$NOME" ln -sf /opt/lab/bin/lab /opt/lab/bin/lab-loop /usr/local/bin/

printf 'attendo systemd'
for _ in $(seq 1 30); do
    if docker exec "$NOME" systemctl is-system-running 2>/dev/null | grep -qE 'running|degraded'; then break; fi
    printf '.'; sleep 1
done
echo

if [ -n "$CAP" ] && [ -n "$ES" ]; then
    case "$CAP:$ES" in
        *[!0-9:]*|:*|*:) rosso "capitolo ed esercizio devono essere numeri (es. 17 1)"; exit 2 ;;
    esac
    DIR_CAPITOLO="$RADICE_REPO/content/ch$CAP"
    [ -d "$DIR_CAPITOLO/e$ES" ] || {
        rosso "esercizio inesistente: content/ch$CAP/e$ES"
        exit 2
    }
    # L'immagine contiene il sistema e la CLI, non i contenuti: questi restano nel
    # repository apposta, così correggere un esercizio non richiede una rebuild.
    # Si copia l'intero capitolo (non solo eN) perché alcuni seed costruiscono il
    # proprio mondo riusando in modo esplicito il seed dell'esercizio precedente.
    docker cp "$DIR_CAPITOLO" "$NOME:/opt/lab/"
    docker exec "$NOME" chmod -R 755 "/opt/lab/ch$CAP"
    if ! docker exec "$NOME" lab start "$CAP" "$ES"; then
        rosso "il seed di $CAP.$ES non è partito: il container resta disponibile per la diagnosi."
        rosso "quando hai finito: $0 cleanup"
        exit 1
    fi
    verde "esercizio $CAP.$ES pronto. Entra con:  docker exec -it $NOME bash"
else
    verde "pronto. Entra con:  docker exec -it $NOME bash"
fi
echo "quando hai finito:  $0 cleanup"
