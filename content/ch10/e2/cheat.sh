# Modello troppo largo: prende anche note.txt e index.html.
d="$LAB/conf"; v=$(sed -n 1p "$d/CAMBIO.txt"); n=$(sed -n 2p "$d/CAMBIO.txt")
sed -i "s/$v/$n/g" "$d"/* 2>/dev/null
