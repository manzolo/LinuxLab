cat > "$LAB/salva.sh" <<'EOF'
#!/bin/sh
[ -d "$1" ] || { echo "non esiste: $1" >&2; exit 1; }
tar czf "$HOME/lab/salva-$(date +%F).tar.gz" -C "$(dirname "$1")" "$(basename "$1")"
EOF
chmod 755 "$LAB/salva.sh"
