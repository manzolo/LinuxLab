atteso=$(apk info --who-owns /usr/bin/awk | awk '{print $NF}' | sed 's/-[0-9].*//')
lab_fact who_owns "$(apk info --who-owns /usr/bin/awk)"
lab_fact pacchetto "$atteso"
lab_answer_eq proprietario-file "$atteso"
lab_done
