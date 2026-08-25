set -e
l1=$(sed -n 1p /opt/lab/state/loop-raid)
l2=$(sed -n 2p /opt/lab/state/loop-raid)
mkdir -p /dev/md /mnt/raid
mdadm --create /dev/md/lab-raid --metadata=1.2 --level=1 --raid-devices=2 \
    --name=lab-raid --force --run "$l1" "$l2" >/dev/null
mkfs.ext4 -qF /dev/md/lab-raid
mount /dev/md/lab-raid /mnt/raid
echo ridondante > /mnt/raid/prova.txt
sync
mdadm /dev/md/lab-raid --fail "$l2" --remove "$l2" >/dev/null
