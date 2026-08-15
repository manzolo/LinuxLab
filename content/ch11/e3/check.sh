f="$LAB/pid.txt"
if [ ! -f "$f" ]; then
    lab_check pid-vivo 1 "(non creato)" "$f"; lab_check e-uno-sleep 1
else
    p=$(tr -dc '0-9' < "$f")
    lab_fact pid_consegnato "${p:-(vuoto)}"
    if [ -n "$p" ] && kill -0 "$p" 2>/dev/null; then
        lab_check pid-vivo 0
        c=$(ps -p "$p" -o comm= 2>/dev/null | tr -d ' ')
        lab_fact processo "$c"
        lab_eq e-uno-sleep "sleep" "$c"
    else
        lab_check pid-vivo 1 "${p:-(vuoto)}" "un PID vivo"
        lab_check e-uno-sleep 1 "(nessun processo)" "sleep"
    fi
fi
lab_done
