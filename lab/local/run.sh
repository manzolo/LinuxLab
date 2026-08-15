#!/usr/bin/env bash
# Laboratorio locale per i capitoli 17-22 (systemd, rete, servizi, firewall, LVM/RAID).
#
# Perche' un container e non una VM: una VM QEMU vorrebbe un'immagine bootabile da
# mantenere, kernel, bootloader, rete, porte e istruzioni per tre sistemi operativi.
# E' esattamente il tipo di manutenzione che questo progetto ha deciso di non avere.
#
# Il prezzo, detto chiaro: i capitoli 21-22 usano --privileged, e i device-mapper e
# gli array md sono GLOBALI dell'host. Per questo tutto quello che creiamo si chiama
# lab-* e c'e' `lab-cleanup`.
set -euo pipefail

NOME=linuxlab
IMG=linuxlab-local
CAP="${1:-}"
ES="${2:-}"

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

avviso() {
    cat <<'EOF'

  ┌──────────────────────────────────────────────────────────────────────┐
  │  Questi capitoli girano in un container PRIVILEGIATO.                │
  │                                                                      │
  │  Vuol dire che i loop device, i volumi LVM e gli array RAID che crei │
  │  sono visibili anche al TUO sistema: un `lsblk` sull'host li mostra. │
  │  Tutto quello che il laboratorio crea si chiama lab-*, e alla fine   │
  │  `lab-cleanup` lo smonta e lo stacca.                                │
  │                                                                      │
  │  Se qualcosa resta appeso:  ./run.sh cleanup                         │
  └──────────────────────────────────────────────────────────────────────┘

EOF
}

# ------------------------------------------------------------------ pulizia

pulisci() {
    giallo "smonto e stacco quello che il laboratorio ha creato…"
    docker rm -f "$NOME" >/dev/null 2>&1 || true
    if command -v vgchange >/dev/null 2>&1; then
        sudo vgchange -an lab-vg 2>/dev/null || true
        sudo vgremove -f lab-vg 2>/dev/null || true
    fi
    for md in /dev/md/lab-* /dev/md12*; do
        [ -e "$md" ] && sudo mdadm --stop "$md" 2>/dev/null || true
    done
    for l in $(losetup -a 2>/dev/null | grep -o '^/dev/loop[0-9]*' || true); do
        if losetup "$l" 2>/dev/null | grep -q '/lab-'; then sudo losetup -d "$l" 2>/dev/null || true; fi
    done
    verde "fatto"
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

docker rm -f "$NOME" >/dev/null 2>&1 || true

# --privileged serve solo dal capitolo 21 (LVM/RAID). Per 17-20 bastano meno diritti.
PRIV=(--cap-add NET_ADMIN --cap-add SYS_ADMIN --security-opt seccomp=unconfined)
case "$CAP" in
    21|22) PRIV=(--privileged); giallo "capitolo $CAP: serve --privileged (dispositivi a blocchi)" ;;
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
