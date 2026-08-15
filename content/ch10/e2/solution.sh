d="$LAB/conf"; v=$(sed -n 1p "$d/CAMBIO.txt"); n=$(sed -n 2p "$d/CAMBIO.txt")
sed -i "s/$v/$n/g" "$d"/*.conf
