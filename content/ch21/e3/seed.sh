mkdir -p "$LAB" /mnt/lab /mnt/raid
if [ ! -f /opt/lab/lib/proprieta.sh ]; then
    echo "manca /opt/lab/lib/proprieta.sh: senza le prove di proprieta' non tocco dispositivi" >&2
    return 1 2>/dev/null || exit 1
fi
. /opt/lab/lib/proprieta.sh

# Prima si smontano e si disattivano soltanto risorse dimostrabilmente nostre.
if ! lab_disfa_vg lab-vg || ! lab_disfa_md /dev/md/lab-raid; then
    echo "EDU CHECK ambiente FAIL got=risorsa-lab-non-nostra want=nomi-lab-liberi" >&2
    return 1 2>/dev/null || exit 1
fi
for l in $(lab_loop_nostri); do losetup -d "$l" 2>/dev/null || true; done
rm -f /root/lab-disco-*.img

modprobe loop 2>/dev/null || true
modprobe raid1 2>/dev/null || true
for n in 1 2; do lab-loop "/root/lab-disco-$n.img" 96; done > /opt/lab/state/loop-raid
sort -o /opt/lab/state/loop-raid /opt/lab/state/loop-raid
:
