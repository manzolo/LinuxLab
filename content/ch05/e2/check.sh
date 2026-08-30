atteso=$(grep -c '^processor' /proc/cpuinfo)
lab_answer_eq core "$atteso"
lab_done
