# Stesso delimitatore non quotato per entrambi: produce due file plausibili,
# ma consuma il dollaro proprio dove doveva conservarlo.
NOME=linux
cat > "$LAB/letterale.conf" <<EOF
nome=$NOME
EOF
cat > "$LAB/espanso.conf" <<EOF
nome=$NOME
EOF
