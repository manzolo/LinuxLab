df -P | awk '$5=="100%"{print $6}' | head -1 > /opt/lab/state/answer
