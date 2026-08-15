. /etc/os-release
atteso="$ID-$VERSION_ID"
lab_fact os_release "$atteso"
lab_answer_eq distro "$atteso"
lab_done
