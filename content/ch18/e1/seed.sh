mkdir -p "$LAB"
ip addr del 10.99.0.1/24 dev lo 2>/dev/null || true
:
