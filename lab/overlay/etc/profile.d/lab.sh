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

# Cambiando esercizio, il mondo precedente viene svuotato. Se in quel momento eri
# dentro una sottocartella, quella sparisce e la shell resta "appesa" a una
# directory che non esiste piu': il prompt continua a mostrarne il nome ma ogni
# comando risponde "cannot open directory". Qui la shell si riporta a casa da sola,
# in silenzio, prima di ogni prompt.
# Il trap DEBUG agisce PRIMA di ogni comando: cosi' non serve nessun sollecito dal
# sito (che lascerebbe a schermo un prompt di troppo) e nemmeno il primo comando
# dopo il cambio fallisce. Il controllo e' ristretto a $LAB: se cancelli una tua
# cartella altrove, il fenomeno resta visibile — ed e' materia del capitolo 2.
if [ -n "$BASH_VERSION" ]; then
    __lab_a_casa() {
        case "$PWD" in
            "$LAB"|"$LAB"/*) [ -e "$PWD" ] || cd "$LAB" 2>/dev/null ;;
        esac
    }
    PROMPT_COMMAND='__lab_a_casa'
    trap '__lab_a_casa' DEBUG
fi
