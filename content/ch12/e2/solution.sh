apk info --who-owns /usr/bin/awk | awk '{print $NF}' | sed 's/-[0-9].*//' > /opt/lab/state/answer
