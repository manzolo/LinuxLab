# Solo SIGTERM: il processo lo intercetta e resta vivo.
n=$(cat /opt/lab/state/spinner); kill $(pgrep -x "$n") 2>/dev/null; sleep 1
