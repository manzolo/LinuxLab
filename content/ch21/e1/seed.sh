mkdir -p "$LAB" /mnt/lab
# La prova di proprieta' viene PRIMA anche qui: il seed disfaceva `lab-vg` per il
# solo nome, quindi bastava avere un gruppo che si chiama cosi' per perderlo
# aprendo un esercizio. (Terzo giro di revisione, 2026-08-16.)
if [ ! -f /opt/lab/lib/proprieta.sh ]; then
    echo "manca /opt/lab/lib/proprieta.sh: ricostruisci l'immagine locale con" >&2
    echo "  docker build lab -f lab/Dockerfile.local -t linuxlab-local" >&2
    echo "Senza le prove di proprieta' NON tocco volumi LVM." >&2
    return 1 2>/dev/null || exit 1
fi
. /opt/lab/lib/proprieta.sh
umount /mnt/lab 2>/dev/null || true
if ! lab_disfa_vg lab-vg; then
    echo "EDU CHECK ambiente FAIL got=un-lab-vg-non-nostro want=nessun-gruppo-lab-vg" >&2
    echo "Su questa macchina c'è già un gruppo di volumi chiamato lab-vg che non è del" >&2
    echo "laboratorio. Non lo tocco: rinominalo o toglilo tu, poi ricomincia l'esercizio." >&2
    return 1 2>/dev/null || exit 1
fi
lab_disfa_md /dev/md/lab-raid >/dev/null 2>&1 || true
for l in $(lab_loop_nostri); do losetup -d "$l" 2>/dev/null || true; done
rm -f /root/lab-disco-*.img
modprobe loop 2>/dev/null || true
# lab-loop crea anche il nodo in /dev: nel container non c'e' udev a farlo.
for n in 1 2; do lab-loop "/root/lab-disco-$n.img" 120; done > /opt/lab/state/loop
sort -o /opt/lab/state/loop /opt/lab/state/loop
:
