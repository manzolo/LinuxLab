sh /opt/lab/ch21/e1/seed.sh 2>/dev/null || true
set -e
l1=$(sed -n 1p /opt/lab/state/loop); l2=$(sed -n 2p /opt/lab/state/loop)
pvcreate -y -ff "$l1" "$l2" >/dev/null 2>&1
vgcreate lab-vg "$l1" "$l2" >/dev/null 2>&1
lvcreate -y -Zn -L 40M -n lab-dati lab-vg >/dev/null 2>&1
vgscan --mknodes >/dev/null 2>&1; dmsetup mknodes >/dev/null 2>&1
mkfs.ext4 -qF /dev/lab-vg/lab-dati
mkdir -p /mnt/lab && mount /dev/lab-vg/lab-dati /mnt/lab
# dati che devono sopravvivere all'allargamento
i=1; while [ $i -le 20 ]; do echo "riga $(edu_rand_word $((470+i)))" >> /mnt/lab/dati.txt; i=$((i+1)); done
md5sum /mnt/lab/dati.txt | cut -d' ' -f1 > /opt/lab/state/md5
:
