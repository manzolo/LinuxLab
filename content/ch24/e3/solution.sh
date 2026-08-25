setsid unshare --mount sh -c 'mkdir -p /mnt/box; mount -t tmpfs t /mnt/box; touch /mnt/box/segreto; exec sleep 600' >/dev/null 2>&1 &
sleep 1
