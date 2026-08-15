cd "$LAB/registri" && ln -sfn "$(ls -t ./*.log | head -1 | sed 's#^\./##')" ultimo
