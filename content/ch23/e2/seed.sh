# Ripulisce eventuali loop-mount di un mondo precedente (l'agente azzera
# /opt/lab/state ma non lo stato del sistema: si pulisce per pattern).
for m in $(mount 2>/dev/null | awk '/\/mnt\/dati/{print $3}'); do umount "$m" 2>/dev/null; done
for l in $(losetup -a 2>/dev/null | awk -F: '/lab-disk/{print $1}'); do losetup -d "$l" 2>/dev/null; done
rm -rf /mnt/dati* /tmp/lab-disk-*.img 2>/dev/null
name="dati$(edu_rand_word 71)"
mp="/mnt/$name"; img="/tmp/lab-disk-$name.img"
mkdir -p "$mp"
dd if=/dev/zero of="$img" bs=1M count=12 2>/dev/null
mkfs.ext4 -q -F "$img" >/dev/null 2>&1
mount -o loop "$img" "$mp" 2>/dev/null
dd if=/dev/zero of="$mp/riempitivo.bin" bs=1M >/dev/null 2>&1 || true
sync
printf '%s' "$mp" > /opt/lab/state/mount_pieno
