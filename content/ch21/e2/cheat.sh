# Riformatta invece di allargare: il volume cresce, i dati spariscono.
umount /mnt/lab 2>/dev/null || true
lvextend -L 120M /dev/lab-vg/lab-dati >/dev/null 2>&1
mkfs.ext4 -qF /dev/lab-vg/lab-dati
mount /dev/lab-vg/lab-dati /mnt/lab
