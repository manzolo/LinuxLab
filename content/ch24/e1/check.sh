base=$(readlink /proc/self/ns/pid)
trovato=""
for p in $(ls /proc 2>/dev/null | grep -E '^[0-9]+$'); do
  l=$(readlink "/proc/$p/ns/pid" 2>/dev/null) || continue
  [ -n "$l" ] && [ "$l" != "$base" ] && { trovato="$p"; break; }
done
lab_fact ns_host "$base"
lab_fact processo_isolato "${trovato:-nessuno}"
if [ -n "$trovato" ]; then lab_check pid-namespace 0
else lab_check pid-namespace 1 "(nessun processo in un PID namespace nuovo)" "un processo con /proc/PID/ns/pid diverso dall'host"; fi
lab_done
