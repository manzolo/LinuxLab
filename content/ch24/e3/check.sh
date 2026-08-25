host_has=no; [ -f /mnt/box/segreto ] && host_has=yes
base=$(readlink /proc/self/ns/mnt)
trovato=""
for p in $(ls /proc 2>/dev/null | grep -E '^[0-9]+$'); do
  l=$(readlink "/proc/$p/ns/mnt" 2>/dev/null) || continue
  [ "$l" = "$base" ] && continue
  if nsenter -t "$p" -m sh -c 'test -f /mnt/box/segreto' 2>/dev/null; then trovato="$p"; break; fi
done
lab_fact host_vede_segreto "$host_has"
lab_fact processo_con_segreto "${trovato:-nessuno}"
if [ "$host_has" = "no" ] && [ -n "$trovato" ]; then lab_check mount-namespace 0
else lab_check mount-namespace 1 "host_vede=$host_has isolato=${trovato:-nessuno}" "il file dentro il ns, non sull'host"; fi
lab_done
