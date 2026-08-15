mkdir -p "$LAB" /mnt/lab
umount /mnt/lab 2>/dev/null || true
vgchange -an lab-vg 2>/dev/null || true
vgremove -f lab-vg 2>/dev/null || true
for l in $(losetup -a 2>/dev/null | grep 'lab-disco' | cut -d: -f1); do losetup -d "$l" 2>/dev/null || true; done
rm -f /root/lab-disco-*.img
modprobe loop 2>/dev/null || true
# lab-loop crea anche il nodo in /dev: nel container non c'e' udev a farlo.
for n in 1 2; do lab-loop "/root/lab-disco-$n.img" 120; done > /opt/lab/state/loop
sort -o /opt/lab/state/loop /opt/lab/state/loop
:
