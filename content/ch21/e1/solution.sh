set -e
l1=$(sed -n 1p /opt/lab/state/loop); l2=$(sed -n 2p /opt/lab/state/loop)
pvcreate -y -ff "$l1" "$l2" >/dev/null
vgcreate lab-vg "$l1" "$l2" >/dev/null
lvcreate -y -Zn -L 60M -n lab-dati lab-vg >/dev/null
vgscan --mknodes >/dev/null 2>&1; dmsetup mknodes >/dev/null 2>&1
mkfs.ext4 -qF /dev/lab-vg/lab-dati
mkdir -p /mnt/lab && mount /dev/lab-vg/lab-dati /mnt/lab
