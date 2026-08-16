NOME=$(cat /opt/lab/state/valore-heredoc)
cat > "$LAB/letterale.conf" <<'EOF'
nome=$NOME
EOF
cat > "$LAB/espanso.conf" <<EOF
nome=$NOME
EOF
