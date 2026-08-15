export default {
    id: "ch04", num: 4, runtime: "browser", requires: ["ch03"], draft: false,
    title: { it: "Leggere un file", en: "Reading a file" },
    oneLiner: {
        it: "Guardare dentro un file senza aprirlo tutto — e senza fingere di averlo letto.",
        en: "Looking inside a file without opening all of it — and without pretending you read it.",
    },
    commands: ["cat", "less", "head", "tail", "tail -f", "wc", "file", "nl"],
    glossary: ["stdout", "pager", "riga"],

    blocks: [
        { kind: "hook", html: {
            it: `Il log dell'applicazione ha due milioni di righe. Se fai <code>cat</code> ti
                 scorrono via per venti secondi e resti con il nulla in mano.
                 <strong>Non serve leggerlo tutto: serve leggerne il pezzo giusto.</strong>`,
            en: `The application log has two million lines. If you <code>cat</code> it, it scrolls
                 past for twenty seconds and leaves you with nothing.
                 <strong>You do not need to read it all: you need to read the right piece.</strong>` } },

        { kind: "lead", html: {
            it: `Cinque comandi, ognuno per una domanda diversa: <em>quanto è grande</em>,
                 <em>com'è fatto l'inizio</em>, <em>cosa dice la fine</em>, <em>cosa sta
                 succedendo adesso</em>, <em>fammi cercare dentro con calma</em>.`,
            en: `Five commands, each for a different question: <em>how big is it</em>, <em>what
                 does the beginning look like</em>, <em>what does the end say</em>, <em>what is
                 happening right now</em>, <em>let me search inside at my own pace</em>.` } },

        { kind: "analogy", html: {
            it: `<code>cat</code> è rovesciare il libro sul tavolo. <code>less</code> è sfogliarlo.
                 <code>head</code> è leggere la prima pagina, <code>tail</code> l'ultima, e
                 <code>tail -f</code> è restare seduti accanto a chi lo sta ancora scrivendo.`,
            en: `<code>cat</code> is tipping the book onto the table. <code>less</code> is leafing
                 through it. <code>head</code> is reading the first page, <code>tail</code> the
                 last, and <code>tail -f</code> is sitting next to the person still writing it.` } },

        { kind: "shown", lines: [
            { cmd: "wc -l app.log", out: "  20418 app.log",
              note: { it: "<code>-l</code> conta le righe, <code>-c</code> i byte, <code>-w</code> le parole. La prima domanda da fare a un file sconosciuto.",
                      en: "<code>-l</code> counts lines, <code>-c</code> bytes, <code>-w</code> words. The first question to ask an unknown file." } },
            { cmd: "head -3 app.log", out: "2026-03-01 00:14:22 INFO  10.1.4.9 GET / 200\n2026-03-01 00:14:51 WARN  10.2.0.3 GET /login 301\n2026-03-01 00:15:07 INFO  10.1.2.7 POST /api/ordini 200",
              note: { it: "Le prime righe dicono <em>com'è fatto</em> il file: quali colonne ci sono, in che ordine. Serve sempre prima di provare a filtrarlo.",
                      en: "The first lines tell you <em>the shape</em> of the file: which columns, in what order. Always needed before trying to filter it." } },
            { cmd: "tail -2 app.log", out: "2026-03-28 23:41:02 ERROR 10.3.0.1 GET /admin 500\n2026-03-28 23:52:30 INFO  10.1.1.4 GET / 200",
              note: { it: "Le ultime righe dicono <em>com'è finita</em>. Quando qualcosa si rompe, si comincia da qui.",
                      en: "The last lines tell you <em>how it ended</em>. When something breaks, you start here." } },
            { cmd: "head -500 app.log | tail -1", out: "2026-03-08 12:02:44 INFO  10.2.3.8 GET /static/logo.png 200",
              note: { it: "Prime 500, poi l'ultima di quelle: la riga 500. Due comandi banali che insieme fanno una cosa precisa — è il primo assaggio del capitolo 8.",
                      en: "First 500, then the last of those: line 500. Two trivial commands that together do something precise — a first taste of chapter 8." } },
            { cmd: "file app.log immagine.png", out: "app.log:     ASCII text\nimmagine.png: PNG image data, 640 x 480",
              note: { it: "<code>file</code> guarda il <em>contenuto</em>, non l'estensione. Su Linux l'estensione non significa niente.",
                      en: "<code>file</code> looks at the <em>content</em>, not the extension. On Linux the extension means nothing." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p><code>tail -f</code> non «controlla ogni tanto»: riapre il descrittore alla
                 fine del file e resta in attesa. Il che spiega un comportamento che sembra un
                 bug: se il log viene <em>ruotato</em> (rinominato e sostituito da uno nuovo),
                 <code>tail -f</code> continua a guardare il vecchio file — che ormai non riceve
                 più nulla — e tu resti a fissare uno schermo fermo, convinto che il servizio sia
                 morto. La soluzione è <code>tail -F</code> (maiuscola), che segue il
                 <em>nome</em> invece del descrittore e riaggancia il file nuovo.</p>
                 <p>C'è anche il motivo per cui <code>cat file | grep x</code> viene considerato
                 sciatto: <code>grep x file</code> apre il file da solo, mentre la prima forma
                 lancia un processo in più e getta via la possibilità per <code>grep</code> di
                 saltare dentro il file. Su un file da 40 GB si sente.</p>`,
            en: `<p><code>tail -f</code> does not "check now and then": it keeps the descriptor
                 open at the end of the file and waits. Which explains behaviour that looks like a
                 bug: if the log is <em>rotated</em> (renamed and replaced by a new one),
                 <code>tail -f</code> keeps watching the old file — which now receives nothing —
                 and you sit staring at a frozen screen, convinced the service died. The fix is
                 <code>tail -F</code> (capital), which follows the <em>name</em> instead of the
                 descriptor and re-attaches to the new file.</p>
                 <p>There is also the reason <code>cat file | grep x</code> is considered sloppy:
                 <code>grep x file</code> opens the file itself, while the first form spawns an
                 extra process and throws away grep's chance to seek inside the file. On a 40 GB
                 file you feel it.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>cat</code> su un file binario ti sfascia il terminale</strong> (caratteri di controllo). Se succede, <code>reset</code> lo rimette a posto. Usa <code>file</code> prima.",
              en: "<strong><code>cat</code> on a binary file wrecks your terminal</strong> (control characters). If it happens, <code>reset</code> fixes it. Use <code>file</code> first." },
            { it: "<strong>Da <code>less</code> si esce con <code>q</code></strong>, non con Ctrl-C. Dentro, <code>/parola</code> cerca e <code>G</code> salta in fondo.",
              en: "<strong>You leave <code>less</code> with <code>q</code></strong>, not Ctrl-C. Inside, <code>/word</code> searches and <code>G</code> jumps to the end." },
            { it: "<strong><code>wc -l</code> conta gli a-capo, non le righe.</strong> Un file la cui ultima riga non finisce con un a-capo viene contato uno di meno.",
              en: "<strong><code>wc -l</code> counts newlines, not lines.</strong> A file whose last line has no trailing newline is counted one short." },
        ] },

        { kind: "recap", table: [
            { cmd: "wc -l", what: { it: "quante righe", en: "how many lines" }, flag: { it: "<code>-c</code> byte, <code>-w</code> parole", en: "<code>-c</code> bytes, <code>-w</code> words" } },
            { cmd: "head", what: { it: "l'inizio", en: "the beginning" }, flag: { it: "<code>-n 20</code> o semplicemente <code>-20</code>", en: "<code>-n 20</code> or just <code>-20</code>" } },
            { cmd: "tail", what: { it: "la fine", en: "the end" }, flag: { it: "<code>-F</code> segue il file anche se viene ruotato", en: "<code>-F</code> follows the file even through rotation" } },
            { cmd: "less", what: { it: "sfoglia con calma", en: "browse at your pace" }, flag: { it: "<code>/</code> cerca, <code>q</code> esce", en: "<code>/</code> search, <code>q</code> quit" } },
            { cmd: "file", what: { it: "che cos'è davvero", en: "what it really is" }, flag: { it: "guarda il contenuto, non il nome", en: "looks at content, not the name" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `Quante righe ha <code>~/lab/app.log</code>? Consegna il numero.`,
                en: `How many lines does <code>~/lab/app.log</code> have? Hand in the number.`,
            },
            checks: [
                { id: "righe",
                  why: { it: "È la domanda che precede ogni altra: se il file ha 12 righe lo leggi, se ne ha due milioni devi filtrarlo.",
                         en: "It is the question before every other: with 12 lines you read it, with two million you filter it." },
                  nudge: { it: "<code>wc</code> conta. Con quale opzione conta le <em>righe</em>? <code>wc --help</code>.",
                           en: "<code>wc</code> counts. With which option does it count <em>lines</em>? <code>wc --help</code>." } },
            ],
            hints: [
                { it: "Il comando è <code>wc</code>.", en: "The command is <code>wc</code>." },
                { it: "L'opzione per le righe è <code>-l</code>.", en: "The option for lines is <code>-l</code>." },
                { it: "<code>wc -l &lt; ~/lab/app.log | lab answer</code> — con <code>&lt;</code> eviti che stampi anche il nome del file.", en: "<code>wc -l &lt; ~/lab/app.log | lab answer</code> — with <code>&lt;</code> it does not also print the filename." },
            ],
        },
        {
            id: "e2", tipo: "risposta",
            brief: {
                it: `Qual è la <strong>500ª riga</strong> di <code>~/lab/app.log</code>?
                     Consegnala per intero. <em>Ci sono almeno due strade, e valgono uguale.</em>`,
                en: `What is the <strong>500th line</strong> of <code>~/lab/app.log</code>?
                     Hand it in in full. <em>There are at least two roads, and they count the
                     same.</em>`,
            },
            checks: [
                { id: "riga-500",
                  why: { it: "Due comandi banali in fila fanno una cosa che nessuno dei due sa fare da solo. È il principio su cui è costruita tutta la shell.",
                         en: "Two trivial commands in a row do something neither can do alone. It is the principle the whole shell is built on." },
                  nudge: { it: "<code>head -500</code> ti dà le prime 500 righe. Adesso ti serve l'<em>ultima</em> di quelle.",
                           en: "<code>head -500</code> gives you the first 500 lines. Now you need the <em>last</em> of those." } },
            ],
            hints: [
                { it: "Prendi le prime 500 righe e poi guarda l'ultima.", en: "Take the first 500 lines and then look at the last one." },
                { it: "<code>head -500 file | tail -1</code>. Oppure, in un colpo solo, <code>sed -n 500p file</code>.", en: "<code>head -500 file | tail -1</code>. Or, in one go, <code>sed -n 500p file</code>." },
                { it: "<code>head -500 ~/lab/app.log | tail -1 | lab answer</code>", en: "<code>head -500 ~/lab/app.log | tail -1 | lab answer</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Salva le <strong>ultime 20 righe</strong> di <code>~/lab/app.log</code> in un
                     file <code>~/lab/coda.txt</code>. Deve essere identico byte per byte.`,
                en: `Save the <strong>last 20 lines</strong> of <code>~/lab/app.log</code> into a
                     file <code>~/lab/coda.txt</code>. It must match byte for byte.`,
            },
            checks: [
                { id: "coda",
                  why: { it: "Mandare l'uscita di un comando in un file è il gesto che trasforma una risposta in un artefatto: qualcosa che puoi allegare a un ticket o passare a un altro comando.",
                         en: "Sending a command's output into a file is the gesture that turns an answer into an artefact: something you can attach to a ticket or feed to another command." },
                  nudge: { it: "Confronta con <code>diff &lt;(tail -20 ~/lab/app.log) ~/lab/coda.txt</code>: se non stampa nulla sono uguali.",
                           en: "Compare with <code>diff &lt;(tail -20 ~/lab/app.log) ~/lab/coda.txt</code>: no output means identical." } },
            ],
            hints: [
                { it: "<code>tail</code> mostra la fine; l'opzione <code>-20</code> ne prende venti righe.", en: "<code>tail</code> shows the end; the <code>-20</code> option takes twenty lines." },
                { it: "Per scrivere su file serve <code>&gt;</code>.", en: "To write to a file you need <code>&gt;</code>." },
                { it: "<code>tail -20 ~/lab/app.log &gt; ~/lab/coda.txt</code>", en: "<code>tail -20 ~/lab/app.log &gt; ~/lab/coda.txt</code>" },
            ],
        },
    ],
};
