base=$(readlink /proc/self/ns/uts)
host_hn=$(hostname)
trovato=""; hn_in=""
for p in $(ls /proc 2>/dev/null | grep -E '^[0-9]+$'); do
  l=$(readlink "/proc/$p/ns/uts" 2>/dev/null) || continue
  [ "$l" = "$base" ] && continue
  h=$(nsenter -t "$p" -u hostname 2>/dev/null) || continue
  [ "$h" = "contenitore" ] && { trovato="$p"; hn_in="$h"; break; }
done
lab_fact host_hostname "$host_hn"
lab_fact hostname_dentro "${hn_in:-nessuno}"
if [ -n "$trovato" ] && [ "$host_hn" != "contenitore" ]; then lab_check uts-namespace 0
else lab_check uts-namespace 1 "host=$host_hn dentro=${hn_in:-nessuno}" "dentro contenitore, host diverso"; fi
lab_done
