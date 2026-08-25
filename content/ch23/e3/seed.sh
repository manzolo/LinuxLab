pkill -9 -f '/usr/local/bin/hog' 2>/dev/null || true
rm -f /usr/local/bin/hog* 2>/dev/null
n="hog$(edu_rand_word 74)"
cat > "/usr/local/bin/$n" <<'EOF'
#!/bin/sh
trap '' TERM INT HUP
while :; do i=0; while [ $i -lt 4000 ]; do i=$((i+1)); done; done
EOF
chmod 755 "/usr/local/bin/$n"
setsid nice -n 19 "/usr/local/bin/$n" >/dev/null 2>&1 &
printf '%s' "$n" > /opt/lab/state/hog
sleep 2
