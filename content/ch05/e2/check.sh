atteso=$(grep -c '^processor' /proc/cpuinfo)
lab_fact processori "$atteso"
lab_answer_eq core "$atteso"
lab_done
