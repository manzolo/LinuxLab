export default {
    id: "ch16", num: 16, runtime: "browser", requires: ["ch08", "ch10"], draft: false,
    title: { it: "Script bash", en: "Bash scripts" },
    oneLiner: {
        it: "Automatizzare quello che hai già fatto a mano quindici volte.",
        en: "Automating what you have already done by hand fifteen times.",
    },
    commands: ["#!/bin/bash", "$1", "if", "test", "for", "while read", "exit", "set -euo pipefail", "$(...)"],
    glossary: ["shebang", "exit code", "parametro", "quoting"],

    blocks: [
        { kind: "hook", html: {
            it: `Quel comando lungo che ti sei inventato al capitolo 8 funziona benissimo. Fra tre
                 mesi non te lo ricorderai, e il tuo collega non saprà nemmeno che esisteva.
                 <strong>Uno script è un comando che sopravvive a chi lo ha scritto.</strong>`,
            en: `That long command you invented back in chapter 8 works beautifully. In three
                 months you will not remember it, and your colleague will not even know it
                 existed. <strong>A script is a command that outlives the person who wrote
                 it.</strong>` } },

        { kind: "lead", html: {
            it: `Uno script non è programmazione: è <strong>la stessa shell</strong>, con i comandi
                 scritti in un file invece che a mano. Quello che aggiungi sono tre cose: gli
                 argomenti, le decisioni, e i cicli.`,
            en: `A script is not programming: it is <strong>the same shell</strong>, with the
                 commands in a file instead of typed. What you add is three things: arguments,
                 decisions, and loops.` } },

        { kind: "analogy", html: {
            it: `La ricetta scritta su un foglio. Gli <strong>ingredienti variabili</strong> sono
                 gli argomenti (<code>$1</code>, <code>$2</code>). Le <strong>decisioni</strong>
                 sono gli <code>if</code> («se la teglia non c'è, fermati e dillo»). Il
                 <strong>«per ogni»</strong> è il <code>for</code>. E alla fine devi dire se è
                 andata bene o male: quello è il <strong>codice di uscita</strong>, e senza di
                 quello nessun altro programma può fidarsi del tuo.`,
            en: `A recipe on a sheet of paper. The <strong>variable ingredients</strong> are the
                 arguments (<code>$1</code>, <code>$2</code>). The <strong>decisions</strong> are
                 the <code>if</code>s ("if the tin is missing, stop and say so"). The
                 <strong>"for each"</strong> is the <code>for</code>. And at the end you must say
                 whether it went well or badly: that is the <strong>exit code</strong>, and
                 without it no other program can trust yours.` } },

        { kind: "shown", lines: [
            { cmd: "cat conta.sh", out: '#!/bin/bash\nset -euo pipefail\n\nif [ $# -lt 1 ]; then\n  echo "uso: $0 CARTELLA" >&2\n  exit 2\nfi\n\nif [ ! -d "$1" ]; then\n  echo "non è una cartella: $1" >&2\n  exit 1\nfi\n\nfind "$1" -type f | wc -l',
              note: { it: "Cinque righe di impalcatura e una di lavoro. L'impalcatura è quello che distingue uno script usabile da un appunto: dice cosa serve, controlla, e <strong>esce con un codice diverso per ogni tipo di problema</strong>.",
                      en: "Five lines of scaffolding and one of work. The scaffolding is what separates a usable script from a note: it says what it needs, checks, and <strong>exits with a different code for each kind of problem</strong>." } },
            { cmd: "./conta.sh /etc && echo \"uscito con $?\"", out: "212\nuscito con 0",
              note: { it: "<code>$?</code> è il codice dell'ultimo comando: <strong>0 vuol dire andata bene</strong>. È l'opposto di quello che si aspetta chi viene da altri linguaggi.",
                      en: "<code>$?</code> is the last command's code: <strong>0 means success</strong>. The opposite of what people coming from other languages expect." } },
            { cmd: "./conta.sh /non-esiste; echo \"uscito con $?\"", out: "non è una cartella: /non-esiste\nuscito con 1",
              note: { it: "Il messaggio va su <strong>stderr</strong> (<code>&gt;&amp;2</code>), non su stdout: così chi usa il tuo script in una pipe riceve i dati puliti e gli errori separati. È il capitolo 8 che torna.",
                      en: "The message goes to <strong>stderr</strong> (<code>&gt;&amp;2</code>), not stdout: so whoever pipes your script gets clean data and separate errors. Chapter 8 coming back." } },
            { cmd: "for f in *.log; do echo \"--- $f\"; tail -1 \"$f\"; done", out: "--- app.log\n2026-03-14 23:52 INFO ok\n--- sistema.log\n2026-03-14 23:41 WARN spazio",
              note: { it: "Le <strong>virgolette attorno a <code>$f</code></strong> non sono facoltative: senza, un nome con uno spazio diventa due argomenti e lo script fa danni in silenzio.",
                      en: "The <strong>quotes around <code>$f</code></strong> are not optional: without them a name with a space becomes two arguments and the script does silent damage." } },
            { cmd: "while read -r riga; do echo \"[$riga]\"; done < elenco.txt", out: "[primo]\n[secondo]",
              note: { it: "<code>read -r</code> legge riga per riga senza interpretare le barre rovesciate. È il modo giusto di scorrere un file: <code>for riga in $(cat file)</code> si rompe sugli spazi.",
                      en: "<code>read -r</code> reads line by line without interpreting backslashes. It is the right way to walk a file: <code>for line in $(cat file)</code> breaks on spaces." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p><code>set -euo pipefail</code> è la riga che trasforma uno script fragile in uno
                 script onesto, e vale la pena sapere cosa fa ciascun pezzo:
                 <code>-e</code> ferma tutto al primo comando che fallisce (invece di proseguire
                 allegramente sui cocci); <code>-u</code> considera un errore usare una variabile
                 mai assegnata (senza, <code>rm -rf "$DIR/"</code> con <code>DIR</code> vuoto
                 diventa <code>rm -rf /</code>); <code>pipefail</code> fa fallire una pipe se
                 <em>qualsiasi</em> comando dentro fallisce, non solo l'ultimo — senza,
                 <code>comando-che-esplode | tee log</code> risulta riuscito.</p>
                 <p>La differenza fra <code>sh</code> e <code>bash</code> non è accademica: su
                 Alpine, Debian e nella maggior parte dei container <code>/bin/sh</code>
                 <strong>non è bash</strong>. Uno script con lo shebang <code>#!/bin/sh</code> che
                 usa <code>[[ ]]</code>, gli array o <code>&lt;&lt;&lt;</code> funziona sulla tua
                 macchina e fallisce in produzione. Scegli: o shebang <code>#!/bin/bash</code>, o
                 sintassi POSIX. Non entrambe le comodità.</p>
                 <p>E il quoting: <code>"$@"</code> passa gli argomenti uno per uno,
                 <code>"$*"</code> li appiccica in una stringa sola, <code>$@</code> senza
                 virgolette li spezza sugli spazi. Sono tre cose diverse che sembrano uguali, e la
                 forma giusta nel 95% dei casi è <code>"$@"</code>, con le virgolette.</p>`,
            en: `<p><code>set -euo pipefail</code> is the line that turns a fragile script into an
                 honest one, and it is worth knowing what each piece does: <code>-e</code> stops
                 at the first failing command (instead of cheerfully carrying on over the
                 wreckage); <code>-u</code> makes using an unset variable an error (without it,
                 <code>rm -rf "$DIR/"</code> with an empty <code>DIR</code> becomes
                 <code>rm -rf /</code>); <code>pipefail</code> makes a pipeline fail if
                 <em>any</em> command inside fails, not just the last — without it,
                 <code>exploding-command | tee log</code> counts as a success.</p>
                 <p>The difference between <code>sh</code> and <code>bash</code> is not academic:
                 on Alpine, on Debian and in most containers <code>/bin/sh</code> <strong>is not
                 bash</strong>. A script with a <code>#!/bin/sh</code> shebang using
                 <code>[[ ]]</code>, arrays or <code>&lt;&lt;&lt;</code> works on your machine and
                 fails in production. Choose: either the <code>#!/bin/bash</code> shebang, or POSIX
                 syntax. Not both conveniences.</p>
                 <p>And quoting: <code>"$@"</code> passes arguments one by one, <code>"$*"</code>
                 glues them into a single string, <code>$@</code> unquoted splits them on spaces.
                 Three different things that look alike, and the right form 95% of the time is
                 <code>"$@"</code>, with quotes.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Uno script senza il permesso <code>x</code> non parte</strong>, e il messaggio (<em>Permission denied</em>) sembra dire un'altra cosa. È il capitolo 6 che ritorna: <code>chmod 755</code>.",
              en: "<strong>A script without the <code>x</code> permission will not run</strong>, and the message (<em>Permission denied</em>) seems to say something else. Chapter 6 returning: <code>chmod 755</code>." },
            { it: "<strong>Le variabili vanno sempre fra virgolette.</strong> <code>rm $FILE</code> con uno spazio nel nome cancella due cose diverse. <code>rm \"$FILE\"</code> no.",
              en: "<strong>Always quote your variables.</strong> <code>rm $FILE</code> with a space in the name deletes two different things. <code>rm \"$FILE\"</code> does not." },
            { it: "<strong>Uscire sempre con 0 rende il tuo script inutilizzabile dagli altri.</strong> Cron, un altro script o una pipeline si fidano del codice di uscita: se dici sempre «tutto bene», nessuno saprà mai che è andata male.",
              en: "<strong>Always exiting 0 makes your script unusable by others.</strong> Cron, another script or a pipeline trust the exit code: if you always say \"fine\", nobody will ever know it went wrong." },
        ] },

        { kind: "recap", table: [
            { cmd: "#!/bin/bash", what: { it: "chi deve eseguire questo file", en: "who must run this file" }, flag: { it: "prima riga, e serve <code>chmod +x</code>", en: "first line, and you need <code>chmod +x</code>" } },
            { cmd: '"$1" "$@"', what: { it: "gli argomenti", en: "the arguments" }, flag: { it: "sempre fra virgolette. Sempre.", en: "always quoted. Always." } },
            { cmd: "if [ … ]; then", what: { it: "decidi", en: "decide" }, flag: { it: "<code>-f</code> file, <code>-d</code> cartella, <code>-z</code> stringa vuota", en: "<code>-f</code> file, <code>-d</code> directory, <code>-z</code> empty string" } },
            { cmd: "exit N", what: { it: "dì com'è andata", en: "say how it went" }, flag: { it: "<code>0</code> bene, qualunque altro numero male", en: "<code>0</code> good, any other number bad" } },
            { cmd: "set -euo pipefail", what: { it: "fermati al primo guaio", en: "stop at the first problem" }, flag: { it: "la riga che rende uno script affidabile", en: "the line that makes a script trustworthy" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato", richiede: ["scrittura-multilinea"],
            brief: {
                it: `Scrivi <code>~/lab/conta.sh</code>: riceve una cartella come primo argomento e
                     stampa <strong>solo il numero</strong> di file normali che contiene, contando
                     anche le sottocartelle. Rendilo eseguibile.
                     <strong>La verifica lo eseguirà su cartelle che non hai mai visto.</strong>`,
                en: `Write <code>~/lab/conta.sh</code>: it takes a directory as its first argument
                     and prints <strong>only the number</strong> of regular files it contains,
                     including subdirectories. Make it executable.
                     <strong>The check will run it on directories you have never seen.</strong>`,
            },
            checks: [
                { id: "eseguibile",
                  why: { it: "Un file di testo diventa un comando grazie a due cose sole: la prima riga che dice chi lo esegue, e il bit <code>x</code>.",
                         en: "A text file becomes a command thanks to two things only: a first line saying who runs it, and the <code>x</code> bit." },
                  nudge: { it: "<code>ls -l ~/lab/conta.sh</code> e <code>head -1 ~/lab/conta.sh</code>: servono la <code>x</code> e lo shebang.",
                           en: "<code>ls -l ~/lab/conta.sh</code> and <code>head -1 ~/lab/conta.sh</code>: you need the <code>x</code> and the shebang." } },
                { id: "conta-giusto",
                  why: { it: "È il dataset nascosto dei fratelli della collana, portato qui: il tuo script viene eseguito su tre cartelle generate adesso, che non potevi guardare. Un numero cablato non ha scampo.",
                         en: "It is the hidden dataset of the sibling labs, brought here: your script is run on three directories generated right now, which you could not look at. A hardcoded number stands no chance." },
                  nudge: { it: "Provalo tu su una cartella qualunque: <code>./conta.sh /etc</code> deve stampare un numero e nient'altro — niente nome del file, niente spazi in più.",
                           en: "Try it yourself on any directory: <code>./conta.sh /etc</code> must print a number and nothing else — no filename, no extra spaces." } },
            ],
            hints: [
                { it: "Il primo argomento si legge con <code>$1</code>, e va messo fra virgolette.", en: "The first argument is <code>$1</code>, and it must be quoted." },
                { it: "<code>find CARTELLA -type f | wc -l</code> conta i file normali, anche nelle sottocartelle.", en: "<code>find DIR -type f | wc -l</code> counts regular files, subdirectories included." },
                { it: "<code>printf '#!/bin/sh\\nfind \"$1\" -type f | wc -l\\n' &gt; ~/lab/conta.sh &amp;&amp; chmod 755 ~/lab/conta.sh</code>", en: "<code>printf '#!/bin/sh\\nfind \"$1\" -type f | wc -l\\n' &gt; ~/lab/conta.sh &amp;&amp; chmod 755 ~/lab/conta.sh</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato", richiede: ["scrittura-multilinea"],
            brief: {
                it: `Scrivi <code>~/lab/salva.sh CARTELLA</code>: crea
                     <code>~/lab/salva-AAAA-MM-GG.tar.gz</code> con dentro la cartella indicata, e
                     <strong>esce con codice 1</strong> (stampando un messaggio su stderr) se la
                     cartella non esiste. Se tutto va bene esce con 0.`,
                en: `Write <code>~/lab/salva.sh DIR</code>: it creates
                     <code>~/lab/salva-YYYY-MM-DD.tar.gz</code> containing the given directory, and
                     <strong>exits with code 1</strong> (printing a message to stderr) if the
                     directory does not exist. On success it exits 0.`,
            },
            attrezzi: [
                { cmd: "dirname / basename", cosa: {
                    it: "<code>dirname</code> di un percorso dà la cartella che lo contiene, <code>basename</code> dà solo l'ultimo pezzo. Servono a costruire il nome della destinazione a partire da quello dell'origine.",
                    en: "<code>dirname</code> of a path gives the folder containing it, <code>basename</code> gives just the last piece. They build the destination name out of the source one." } },
            ],
            checks: [
                { id: "archivio-buono",
                  why: { it: "Un archivio che non si riapre è peggio di nessun archivio. Il check lo apre davvero, non guarda solo che il file esista.",
                         en: "An archive that will not reopen is worse than none. The check actually opens it, it does not just look for the file." },
                  nudge: { it: "<code>tar tzf ~/lab/salva-*.tar.gz</code> elenca il contenuto: se dà errore, l'archivio è rotto.",
                           en: "<code>tar tzf ~/lab/salva-*.tar.gz</code> lists the content: an error means a broken archive." } },
                { id: "esce-zero",
                  why: { it: "Un comando che riesce deve dirlo con uno 0, altrimenti un <code>&amp;&amp;</code> a valle non scatterà mai.",
                         en: "A command that succeeds must say so with a 0, otherwise a downstream <code>&amp;&amp;</code> will never fire." },
                  nudge: { it: "Prova <code>./salva.sh ~/lab/dati; echo $?</code>: deve stampare <code>0</code>.",
                           en: "Try <code>./salva.sh ~/lab/dati; echo $?</code>: it must print <code>0</code>." } },
                { id: "esce-uno",
                  why: { it: "È la parte che quasi tutti dimenticano, ed è quella che rende lo script usabile da cron o da un altro script: fallire in modo <em>dichiarato</em>.",
                         en: "It is the part almost everyone forgets, and it is what makes the script usable by cron or another script: failing <em>out loud</em>." },
                  nudge: { it: "<code>./salva.sh /non-esiste; echo $?</code> deve stampare <code>1</code>. Si ottiene con <code>exit 1</code> dentro un <code>if</code>.",
                           en: "<code>./salva.sh /nowhere; echo $?</code> must print <code>1</code>. You get it with <code>exit 1</code> inside an <code>if</code>." } },
                { id: "dice-perche",
                  why: { it: "Il codice di uscita dice <em>che</em> è andata male; il messaggio dice <em>perché</em>. E va su <strong>stderr</strong>, non su stdout: così chi ti mette in una pipe riceve dati puliti e vede lo stesso l'errore.",
                         en: "The exit code says <em>that</em> it went wrong; the message says <em>why</em>. And it goes to <strong>stderr</strong>, not stdout: that way whoever puts you in a pipe gets clean data and still sees the error." },
                  nudge: { it: "<code>./salva.sh /non-esiste 2&gt;&amp;1 &gt;/dev/null</code> butta via stdout e lascia passare solo stderr: lì deve comparire qualcosa.",
                           en: "<code>./salva.sh /nowhere 2&gt;&amp;1 &gt;/dev/null</code> throws stdout away and lets only stderr through: something must show up there." } },
            ],
            hints: [
                { it: "Per controllare se una cartella esiste: <code>if [ ! -d \"$1\" ]; then … fi</code>.", en: "To check a directory exists: <code>if [ ! -d \"$1\" ]; then … fi</code>." },
                { it: "La data di oggi è <code>$(date +%F)</code>. Il messaggio d'errore va su stderr con <code>&gt;&amp;2</code>.", en: "Today's date is <code>$(date +%F)</code>. The error message goes to stderr with <code>&gt;&amp;2</code>." },
                { it: "<code>#!/bin/sh</code> · <code>[ -d \"$1\" ] || { echo \"non esiste: $1\" &gt;&amp;2; exit 1; }</code> · <code>tar czf \"$HOME/lab/salva-$(date +%F).tar.gz\" -C \"$(dirname \"$1\")\" \"$(basename \"$1\")\"</code>", en: "<code>#!/bin/sh</code> · <code>[ -d \"$1\" ] || { echo \"missing: $1\" &gt;&amp;2; exit 1; }</code> · <code>tar czf \"$HOME/lab/salva-$(date +%F).tar.gz\" -C \"$(dirname \"$1\")\" \"$(basename \"$1\")\"</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato", richiede: ["scrittura-multilinea"],
            brief: {
                it: `Capstone del ramo browser. Scrivi <code>~/lab/riassumi.sh FILE</code> che legge
                     un log riga per riga e stampa <strong>una riga per livello</strong>
                     (<code>INFO</code>, <code>WARN</code>, <code>ERROR</code>, <code>DEBUG</code>)
                     nel formato <code>LIVELLO conteggio</code>, ordinate per conteggio
                     decrescente. Deve <strong>saltare le righe che cominciano con
                     <code>#</code></strong>. La verifica lo esegue su file mai visti.`,
                en: `Capstone of the browser branch. Write <code>~/lab/riassumi.sh FILE</code> that
                     reads a log line by line and prints <strong>one line per level</strong>
                     (<code>INFO</code>, <code>WARN</code>, <code>ERROR</code>, <code>DEBUG</code>)
                     in the format <code>LEVEL count</code>, sorted by count descending. It must
                     <strong>skip lines starting with <code>#</code></strong>. The check runs it on
                     files you have never seen.`,
            },
            checks: [
                { id: "riassunto-giusto",
                  why: { it: "Qui si mettono insieme il capitolo 8 (le pipe), il 10 (le colonne) e questo (gli argomenti). Non è un esercizio nuovo: è i tre precedenti che diventano uno strumento.",
                         en: "Here chapter 8 (pipes), chapter 10 (columns) and this one (arguments) come together. It is not a new exercise: it is the previous three becoming a tool." },
                  nudge: { it: "Provalo su un file tuo prima: <code>./riassumi.sh ~/lab/prova.log</code>. Il livello è la quarta colonna.",
                           en: "Try it on your own file first: <code>./riassumi.sh ~/lab/prova.log</code>. The level is the fourth column." } },
                { id: "salta-i-commenti",
                  why: { it: "I file veri hanno intestazioni e commenti. Uno script che non li salta produce una riga <code>#</code> nel riassunto, e chi lo legge non capisce perché.",
                         en: "Real files have headers and comments. A script that does not skip them produces a <code>#</code> row in the summary, and whoever reads it will not understand why." },
                  nudge: { it: "<code>grep -v '^#'</code> toglie le righe che cominciano con il cancelletto — è il capitolo 9.",
                           en: "<code>grep -v '^#'</code> drops lines starting with a hash — that is chapter 9." } },
            ],
            hints: [
                { it: "Il livello è la quarta colonna: <code>awk '{print $4}'</code>.", en: "The level is the fourth column: <code>awk '{print $4}'</code>." },
                { it: "La catena è quella del capitolo 10: <code>| sort | uniq -c | sort -rn</code>, e poi invertire le due colonne.", en: "The chain is chapter 10's: <code>| sort | uniq -c | sort -rn</code>, then swap the two columns." },
                { it: "<code>#!/bin/sh</code> · <code>grep -v '^#' \"$1\" | awk '{print $4}' | sort | uniq -c | sort -rn | awk '{print $2, $1}'</code>", en: "<code>#!/bin/sh</code> · <code>grep -v '^#' \"$1\" | awk '{print $4}' | sort | uniq -c | sort -rn | awk '{print $2, $1}'</code>" },
            ],
        },
    ],
};
