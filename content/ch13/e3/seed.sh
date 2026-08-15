mkdir -p "$LAB"
umount "$LAB/mnt" 2>/dev/null || true
losetup -D 2>/dev/null || true
rm -rf "$LAB/mnt" "$LAB/disco.img"
modprobe loop 2>/dev/null || true
:
