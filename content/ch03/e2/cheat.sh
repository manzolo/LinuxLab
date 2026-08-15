# Sposta tutto: i .log finiscono a posto ma i .txt spariscono con loro.
cd "$LAB/registri" && mkdir -p archivio && mv ./*.log ./*.txt archivio/ 2>/dev/null
