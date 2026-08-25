pkill -9 -x sleep 2>/dev/null || true
pkill -9 unshare 2>/dev/null || true
umount /mnt/box 2>/dev/null || true
rm -rf /mnt/box 2>/dev/null || true
:
