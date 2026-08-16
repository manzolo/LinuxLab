servizio=$(sed -n '1s/^[^=]*=//p' /opt/lab/state/nota-attesa)
ambiente=$(sed -n '2s/^[^=]*=//p' /opt/lab/state/nota-attesa)
responsabile=$(sed -n '3s/^[^=]*=//p' /opt/lab/state/nota-attesa)
cat > "$LAB/nota.conf" <<EOF
servizio=$servizio
ambiente=$ambiente
responsabile=$responsabile
EOF
