export default {
    id: "ch09", num: 9, runtime: "browser", requires: ["ch08"], draft: false,
    title: { it: "Cercare: find e grep", en: "Searching: find and grep" },
    oneLiner: {
        it: "Trovare un file per proprietà, e una riga per contenuto.",
        en: "Finding a file by its properties, and a line by its content.",
    },
    commands: ["find", "find -name", "find -type", "find -size", "find -mtime", "find -exec", "grep -r", "grep -c", "grep -v", "grep -i"],
    glossary: ["ricorsivo", "pattern", "espressione regolare"],

    blocks: [
        { kind: "hook", html: {
            it: `«Il disco è pieno.» Da qualche parte, in mezzo a centomila file, ce ne sono tre
                 enormi. Oppure: «l'applicazione dà errore», e da qualche parte fra due milioni di
                 righe c'è quella che lo dice. <strong>Due comandi, due domande diverse.</strong>`,
            en: `"The disk is full." Somewhere, among a hundred thousand files, three are huge.
                 Or: "the app is erroring", and somewhere among two million lines is the one that
                 says why. <strong>Two commands, two different questions.</strong>` } },

        { kind: "lead", html: {
            it: `<code>find</code> cerca <strong>file</strong>, per come sono fatti: nome,
                 dimensione, età, tipo, proprietario. <code>grep</code> cerca <strong>righe</strong>,
                 per cosa contengono. Confonderli è la ragione per cui a volte una ricerca sembra
                 non finire mai.`,
            en: `<code>find</code> searches for <strong>files</strong>, by what they are like:
                 name, size, age, type, owner. <code>grep</code> searches for <strong>lines</strong>,
                 by what they contain. Mixing them up is why a search sometimes seems to never
                 end.` } },

        { kind: "analogy", html: {
            it: `In biblioteca: <code>find</code> è chiedere al bibliotecario
                 <em>«tutti i libri più alti di 30 cm, arrivati dopo il 2020»</em> — guarda gli
                 scaffali. <code>grep</code> è <em>«tutte le pagine in cui compare la parola
                 fosforo»</em> — apre i libri. Il secondo è molto più lento, e per questo si
                 restringe prima con il primo.`,
            en: `In a library: <code>find</code> is asking the librarian <em>"all books taller
                 than 30 cm, arrived after 2020"</em> — it looks at the shelves. <code>grep</code>
                 is <em>"every page containing the word phosphorus"</em> — it opens the books. The
                 second is far slower, which is why you narrow down with the first.` } },

        { kind: "shown", lines: [
            { cmd: "find /var/log -name '*.log'", out: "/var/log/messages.log\n/var/log/nginx/access.log",
              note: { it: "Le virgolette attorno a <code>*.log</code> servono: senza, l'asterisco lo espande la shell <em>prima</em> che <code>find</code> lo veda.",
                      en: "The quotes around <code>*.log</code> matter: without them the shell expands the asterisk <em>before</em> <code>find</code> ever sees it." } },
            { cmd: "find . -type f -size +1M", out: "./dump/backup.sql\n./video/intro.mp4",
              note: { it: "<code>+1M</code> = più grandi di un megabyte. <code>-1M</code> più piccoli, <code>1M</code> esattamente. Vale per tutti i criteri numerici.",
                      en: "<code>+1M</code> = larger than one megabyte. <code>-1M</code> smaller, <code>1M</code> exactly. The same holds for every numeric criterion." } },
            { cmd: "find . -name '*.bak' -mtime +7 -delete", out: "",
              note: { it: "<code>-mtime +7</code> vuol dire <strong>più vecchi di 7 giorni</strong>; <code>-mtime 7</code> vuol dire <em>esattamente</em> 7. È l'errore più comune di tutti.",
                      en: "<code>-mtime +7</code> means <strong>older than 7 days</strong>; <code>-mtime 7</code> means <em>exactly</em> 7. It is the most common mistake of all." } },
            { cmd: "grep -c ERROR app.log", out: "37",
              note: { it: "<code>-c</code> conta le righe che corrispondono, senza stamparle. Più veloce e più leggibile di <code>grep … | wc -l</code>.",
                      en: "<code>-c</code> counts matching lines without printing them. Faster and more readable than <code>grep … | wc -l</code>." } },
            { cmd: "grep -rn 'password' /etc 2>/dev/null | head -3",
              out: "/etc/ssh/sshd_config:56:PasswordAuthentication no\n/etc/pam.d/common-password:25:password requisite pam_unix.so",
              note: { it: "<code>-r</code> scende ricorsivamente, <code>-n</code> dà il numero di riga. Il <code>2&gt;/dev/null</code> zittisce i «permesso negato» sui file che non puoi leggere.",
                      en: "<code>-r</code> recurses, <code>-n</code> gives the line number. The <code>2&gt;/dev/null</code> silences \"permission denied\" for files you cannot read." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p><code>-exec … {} \\;</code> lancia <strong>un processo per ogni file</strong>:
                 su diecimila file sono diecimila <code>fork()</code>. <code>-exec … {} +</code>
                 invece accumula i nomi e ne lancia il minor numero possibile, come farebbe
                 <code>xargs</code>. Su una cartella grande la differenza è fra due secondi e due
                 minuti — e il carattere che cambia è uno solo.</p>
                 <p>I nomi con spazi rompono le catene ingenue: <code>find … | xargs rm</code>
                 spezza <code>relazione finale.pdf</code> in due argomenti e cancella cose a caso.
                 La coppia corretta è <code>find … -print0 | xargs -0 rm</code>, che separa i nomi
                 con un byte zero — l'unico byte che in un nome di file non può comparire.</p>
                 <p>Infine: <code>grep</code> normale usa espressioni regolari <em>base</em>, dove
                 <code>+</code> e <code>?</code> vanno protetti con la barra. Con <code>-E</code>
                 passi alle <em>estese</em>, e la sintassi diventa quella che ti aspetti. Se
                 cerchi testo letterale e basta, <code>-F</code> è più veloce e non ti sorprende
                 con i caratteri speciali.</p>`,
            en: `<p><code>-exec … {} \\;</code> launches <strong>one process per file</strong>: on
                 ten thousand files that is ten thousand <code>fork()</code>s. <code>-exec … {}
                 +</code> instead accumulates names and launches as few as possible, the way
                 <code>xargs</code> would. On a large directory the difference is two seconds
                 versus two minutes — and only one character changed.</p>
                 <p>Names with spaces break naive chains: <code>find … | xargs rm</code> splits
                 <code>final report.pdf</code> into two arguments and deletes things at random.
                 The correct pair is <code>find … -print0 | xargs -0 rm</code>, separating names
                 with a zero byte — the one byte that cannot appear in a filename.</p>
                 <p>Finally: plain <code>grep</code> uses <em>basic</em> regular expressions, where
                 <code>+</code> and <code>?</code> must be backslash-escaped. With <code>-E</code>
                 you switch to <em>extended</em> ones and the syntax becomes what you expect. If
                 you are searching for literal text, <code>-F</code> is faster and will not
                 surprise you with special characters.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>find . -name *.log</code> senza virgolette</strong> funziona finché nella cartella corrente non c'è nessun <code>.log</code>, e poi improvvisamente si comporta in modo assurdo. Metti sempre le virgolette.",
              en: "<strong><code>find . -name *.log</code> without quotes</strong> works until the current directory happens to contain a <code>.log</code>, and then behaves absurdly. Always quote." },
            { it: "<strong>Prima di <code>-delete</code>, guarda.</strong> Esegui lo stesso <code>find</code> senza l'azione: se l'elenco è quello giusto, allora aggiungila. Non c'è annulla.",
              en: "<strong>Before <code>-delete</code>, look.</strong> Run the same <code>find</code> without the action: if the list is right, then add it. There is no undo." },
            { it: "<strong><code>grep -r</code> da <code>/</code> non finisce mai</strong>: entra in <code>/proc</code>, che contiene link che rimandano dentro sé stessi. Restringi sempre il punto di partenza.",
              en: "<strong><code>grep -r</code> from <code>/</code> never ends</strong>: it walks into <code>/proc</code>, which holds links pointing back into itself. Always narrow the starting point." },
        ] },

        { kind: "recap", table: [
            { cmd: "find PERCORSO", what: { it: "cerca file per proprietà", en: "find files by properties" }, flag: { it: "<code>-name -type -size -mtime -user</code>", en: "<code>-name -type -size -mtime -user</code>" } },
            { cmd: "find -exec", what: { it: "fa qualcosa su ciò che trova", en: "do something with what it finds" }, flag: { it: "usa <code>{} +</code>, non <code>{} \\;</code>", en: "use <code>{} +</code>, not <code>{} \\;</code>" } },
            { cmd: "grep", what: { it: "cerca righe per contenuto", en: "find lines by content" }, flag: { it: "<code>-r</code> ricorsivo, <code>-n</code> numero di riga", en: "<code>-r</code> recursive, <code>-n</code> line number" } },
            { cmd: "grep -c / -v", what: { it: "conta / inverti", en: "count / invert" }, flag: { it: "<code>-v</code> = «tutte tranne quelle che»", en: "<code>-v</code> = \"everything except those that\"" } },
            { cmd: "grep -i / -E", what: { it: "ignora maiuscole / regex estese", en: "ignore case / extended regex" }, flag: { it: "<code>-F</code> se cerchi testo letterale", en: "<code>-F</code> for literal text" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `Quante righe di <code>~/lab/app.log</code> contengono <code>ERROR</code>?
                     Consegna il numero.`,
                en: `How many lines of <code>~/lab/app.log</code> contain <code>ERROR</code>?
                     Hand in the number.`,
            },
            checks: [
                { id: "conteggio-error",
                  why: { it: "È il primo gesto davanti a un log: non leggerlo, <em>misurarlo</em>. Trenta errori e tremila errori sono due problemi diversi.",
                         en: "It is the first move in front of a log: do not read it, <em>measure</em> it. Thirty errors and three thousand errors are two different problems." },
                  nudge: { it: "<code>grep -c PAROLA file</code> conta le righe che corrispondono. Attento alle maiuscole.",
                           en: "<code>grep -c WORD file</code> counts matching lines. Mind the case." } },
            ],
            hints: [
                { it: "Il comando è <code>grep</code>, e c'è un'opzione che conta invece di stampare.", en: "The command is <code>grep</code>, and there is an option that counts instead of printing." },
                { it: "È <code>-c</code>.", en: "It is <code>-c</code>." },
                { it: "<code>grep -c ERROR ~/lab/app.log | lab answer</code>", en: "<code>grep -c ERROR ~/lab/app.log | lab answer</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Sotto <code>~/lab/deposito</code> trova tutti i file <strong>più grandi di
                     1 megabyte</strong> e scrivi i loro percorsi, <strong>ordinati
                     alfabeticamente</strong>, in <code>~/lab/grossi.txt</code>.
                     <em>In PRO: fallo in modo che regga anche i nomi con gli spazi.</em>`,
                en: `Under <code>~/lab/deposito</code> find every file <strong>larger than 1
                     megabyte</strong> and write their paths, <strong>alphabetically
                     sorted</strong>, into <code>~/lab/grossi.txt</code>.
                     <em>In PRO: make it survive names with spaces.</em>`,
            },
            checks: [
                { id: "elenco-grossi",
                  why: { it: "«Il disco è pieno» si risolve così, e non diversamente: si cercano i file grandi, non si cancella a caso.",
                         en: "\"The disk is full\" is solved this way and no other: you look for the big files, you do not delete at random." },
                  nudge: { it: "<code>find ~/lab/deposito -type f -size +1M</code> — guarda l'elenco prima di salvarlo.",
                           en: "<code>find ~/lab/deposito -type f -size +1M</code> — look at the list before saving it." } },
                { id: "nomi-con-spazi", pro: true,
                  why: { it: "In produzione i nomi con gli spazi ci sono sempre, e una catena ingenua li spezza in due argomenti facendo danni silenziosi.",
                         en: "In production, names with spaces always exist, and a naive chain splits them into two arguments, doing silent damage." },
                  nudge: { it: "C'è un file con uno spazio nel nome: controlla che sia finito nell'elenco su una riga sola.",
                           en: "There is a file with a space in its name: check it ended up in the list on a single line." } },
            ],
            hints: [
                { it: "<code>find</code> ha un criterio per la dimensione: <code>-size</code>.", en: "<code>find</code> has a size criterion: <code>-size</code>." },
                { it: "«Più grandi di» si scrive con il più: <code>-size +1M</code>. E servono solo i file: <code>-type f</code>.", en: "\"Larger than\" is written with a plus: <code>-size +1M</code>. And you only want files: <code>-type f</code>." },
                { it: "<code>find ~/lab/deposito -type f -size +1M | sort &gt; ~/lab/grossi.txt</code>", en: "<code>find ~/lab/deposito -type f -size +1M | sort &gt; ~/lab/grossi.txt</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `In <code>~/lab/backup</code> ci sono file <code>.bak</code> di età diverse.
                     Cancella <strong>solo quelli più vecchi di 7 giorni</strong>. Quelli recenti
                     e tutto il resto devono restare intatti — e la verifica conta.`,
                en: `In <code>~/lab/backup</code> there are <code>.bak</code> files of various
                     ages. Delete <strong>only those older than 7 days</strong>. The recent ones
                     and everything else must stay untouched — and the check counts.`,
            },
            checks: [
                { id: "vecchi-cancellati",
                  why: { it: "Questa è la manutenzione automatica di ogni server del mondo. Sbagliare il criterio significa cancellare i backup buoni e tenere quelli inutili.",
                         en: "This is the automatic housekeeping of every server in the world. Getting the criterion wrong means deleting the good backups and keeping the useless ones." },
                  nudge: { it: "<code>find ~/lab/backup -name '*.bak' -mtime +7</code> — <strong>senza</strong> azione, per vedere l'elenco prima di cancellare.",
                           en: "<code>find ~/lab/backup -name '*.bak' -mtime +7</code> — <strong>without</strong> an action, to see the list before deleting." } },
                { id: "recenti-salvi",
                  why: { it: "<code>-mtime +7</code> vuol dire «più vecchi di 7 giorni»; <code>-mtime 7</code> vuol dire «esattamente 7». Un carattere, e cancelli le cose sbagliate.",
                         en: "<code>-mtime +7</code> means \"older than 7 days\"; <code>-mtime 7</code> means \"exactly 7\". One character, and you delete the wrong things." },
                  nudge: { it: "Se hai preso anche i <code>.bak</code> di ieri, il problema è il segno <code>+</code>. Se hai preso anche i <code>.log</code>, è il <code>-name</code>.",
                           en: "If you also took yesterday's <code>.bak</code>, the problem is the <code>+</code> sign. If you also took the <code>.log</code> files, it is the <code>-name</code>." } },
            ],
            hints: [
                { it: "Il criterio sull'età si chiama <code>-mtime</code> e si misura in giorni.", en: "The age criterion is called <code>-mtime</code> and is measured in days." },
                { it: "Il segno <code>+</code> davanti al numero significa «più di». E per cancellare c'è <code>-delete</code>.", en: "A <code>+</code> before the number means \"more than\". And to delete there is <code>-delete</code>." },
                { it: "<code>find ~/lab/backup -type f -name '*.bak' -mtime +7 -delete</code>", en: "<code>find ~/lab/backup -type f -name '*.bak' -mtime +7 -delete</code>" },
            ],
        },
    ],
};
