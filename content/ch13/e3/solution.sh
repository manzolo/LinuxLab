modprobe loop 2>/dev/null || true
dd if=/dev/zero of="$LAB/disco.img" bs=1M count=8 2>/dev/null
mkfs.ext4 -qF "$LAB/disco.img"
mkdir -p "$LAB/mnt"
mount -o loop "$LAB/disco.img" "$LAB/mnt"
echo funziona > "$LAB/mnt/prova.txt"
