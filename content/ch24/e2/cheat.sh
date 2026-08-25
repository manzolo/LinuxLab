setsid unshare --uts sh -c 'exec sleep 600' >/dev/null 2>&1 &
sleep 1
