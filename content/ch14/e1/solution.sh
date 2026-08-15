grep ERROR "$LAB/app.log" | head -1 | awk '{print $2}' > /opt/lab/state/answer
