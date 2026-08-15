cat > "$LAB/riassumi.sh" <<'EOF'
#!/bin/sh
grep -v '^#' "$1" | awk '{print $4}' | sort | uniq -c | sort -rn | awk '{print $2, $1}'
EOF
chmod 755 "$LAB/riassumi.sh"
