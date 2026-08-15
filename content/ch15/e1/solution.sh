ip -4 -o a show lo | awk '{print $4}' | cut -d/ -f1 > /opt/lab/state/answer
