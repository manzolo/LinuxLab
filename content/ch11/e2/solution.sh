n=$(cat /opt/lab/state/spinner)
kill $(pgrep -x "$n") 2>/dev/null   # con garbo: lui lo ignora
sleep 1
kill -9 $(pgrep -x "$n") 2>/dev/null   # e allora il martello
sleep 1
