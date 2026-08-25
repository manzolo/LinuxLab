mp=$(cat /opt/lab/state/mount_pieno)
big=$(du -a "$mp" 2>/dev/null | sort -rn | while read -r sz p; do [ -f "$p" ] && { echo "$p"; break; }; done)
[ -n "$big" ] && rm -f "$big"
