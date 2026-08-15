# Ambiente della shell di chi studia.
export PATH="/opt/lab/bin:$PATH"
export LAB="$HOME/lab"
export PAGER=less
export MANPAGER=less
export EDITOR=vi
export LESS="-R"
# Un prompt che dice sempre dove sei: e' meta' del capitolo 02.
export PS1='\[\e[38;5;79m\]\w\[\e[0m\] $ '
[ -d "$LAB" ] || mkdir -p "$LAB" 2>/dev/null
cd "$LAB" 2>/dev/null || true
