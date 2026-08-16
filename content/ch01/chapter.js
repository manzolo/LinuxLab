export default {
    id: "ch01", num: 1, runtime: "browser", requires: [], draft: false,
    title: { it: "Il terminale, cos'è davvero", en: "The terminal, what it really is" },
    oneLiner: {
        it: "La shell legge una riga, la spezza in comando + opzioni + argomenti, e la esegue.",
        en: "The shell reads a line, splits it into command + options + arguments, and runs it.",
    },
    commands: ["echo", "whoami", "uname", "date", "history", "man", "--help", "type"],
    glossary: ["shell", "comando", "opzione", "argomento", "prompt", "manuale"],

    blocks: [
        { kind: "hook", html: {
            it: `Il sito è giù. Sei collegato al server e davanti a te c'è una riga di testo che
                 lampeggia. Nessuna finestra, nessun pulsante. <strong>Quella riga è tutto quello
                 che hai</strong> — ed è anche tutto quello che ti serve.`,
            en: `The site is down. You are connected to the server and all you see is a blinking
                 line of text. No window, no buttons. <strong>That line is everything you have</strong>
                 — and it is also everything you need.` } },

        { kind: "lead", html: {
            it: `In questo capitolo scopri che il terminale non è una cosa da iniziati: è un
                 programma banale che fa una cosa sola. Legge una riga, la spezza in pezzi,
                 esegue il primo pezzo passandogli gli altri. Alla fine saprai chi sei, su che
                 macchina sei, e soprattutto <strong>come scoprire da solo quello che non sai</strong>.`,
            en: `In this chapter you find out that the terminal is not a thing for the initiated:
                 it is a plain program that does one thing. It reads a line, splits it into pieces,
                 runs the first piece passing it the others. By the end you will know who you are,
                 what machine you are on, and above all <strong>how to find out what you don't
                 know</strong>.` } },

        { kind: "analogy", html: {
            it: `Pensa a un cameriere. Tu dici <em>«un caffè, macchiato, freddo»</em>. Lui non
                 discute: prende la prima parola come <strong>l'ordine</strong> (caffè) e il resto
                 come <strong>indicazioni</strong> su come lo vuoi. Se dici una parola che non
                 conosce, ti risponde "non ce l'abbiamo" — e non è un guasto, è una risposta.
                 La shell fa esattamente questo, e lo fa milioni di volte al giorno senza mai
                 stancarsi.`,
            en: `Think of a waiter. You say <em>"a coffee, with milk, cold"</em>. He does not argue:
                 he takes the first word as <strong>the order</strong> (coffee) and the rest as
                 <strong>instructions</strong> on how you want it. If you say a word he does not
                 know, he answers "we don't have that" — which is not a fault, it is an answer.
                 The shell does exactly this, millions of times a day, without ever getting tired.` } },

        { kind: "shown", lines: [
            { cmd: "whoami", out: "root",
              note: { it: "Un comando solo, senza argomenti. Risponde con una parola.",
                      en: "One command, no arguments. It answers with one word." } },
            { cmd: "echo ciao mondo", out: "ciao mondo",
              note: { it: "<code>echo</code> è il comando, <code>ciao</code> e <code>mondo</code> sono due argomenti. Li ristampa e basta.",
                      en: "<code>echo</code> is the command, <code>ciao</code> and <code>mondo</code> are two arguments. It just prints them back." } },
            { cmd: "echo -n ciao", out: "ciao",
              note: { it: "<code>-n</code> comincia con un trattino: è un'<strong>opzione</strong>, non un argomento. Cambia il comportamento — qui toglie l'a-capo finale.",
                      en: "<code>-n</code> starts with a dash: it is an <strong>option</strong>, not an argument. It changes the behaviour — here it removes the trailing newline." } },
            { cmd: "uname -r", out: "6.12.103-0-virt",
              note: { it: "La versione del kernel Linux che sta girando <em>adesso</em>, dentro la scheda del tuo browser.",
                      en: "The version of the Linux kernel running <em>right now</em>, inside your browser tab." } },
            { cmd: "chiacchiera", out: "bash: chiacchiera: command not found",
              note: { it: "Non è un errore tuo: è la shell che dice «questa parola non è un comando che conosco». Leggerla è già mezza diagnosi.",
                      en: "This is not your mistake: it is the shell saying \"this word is not a command I know\". Reading it is already half the diagnosis." } },
            { cmd: "date --help",
              out: "Usage: date [OPTION]... [+FORMAT]\n  or:  date [-u|--utc|--universal] [MMDDhhmm[[CC]YY][.ss]]\nDisplay date and time in the given FORMAT.\nWith -s, or with [MMDDhhmm[[CC]YY][.ss]], set the date and time.\n\nMandatory arguments to long options are mandatory for short options too.\n  -d, --date=STRING          display time described by STRING, not 'now'\n  …",
              note: { it: "<strong>Questa è la mossa</strong>, e vale per quasi ogni comando che incontrerai: non lo conosci, gli chiedi <code>--help</code>, e ti risponde lui. Non c'è niente da ricordare a memoria — c'è da sapere dove guardare.",
                      en: "<strong>This is the move</strong>, and it works for almost every command you will meet: you do not know it, you ask it <code>--help</code>, and it answers. There is nothing to memorise — there is only knowing where to look." } },
            { cmd: "man date",
              out: "DATE(1)                        User Commands                       DATE(1)\n\nNAME\n       date - print or set the system date and time\n\nSYNOPSIS\n       date [OPTION]... [+FORMAT]\n …  (q per uscire)",
              note: { it: "<code>--help</code> è il riassunto, <code>man</code> è il manuale intero: si scorre con le frecce e <strong>si esce con <code>q</code></strong>. Se ti trovi intrappolato in una pagina che non se ne va, è quasi sempre questo — <code>q</code>.",
                      en: "<code>--help</code> is the summary, <code>man</code> is the whole manual: you scroll with the arrows and <strong>you leave with <code>q</code></strong>. If you ever feel trapped in a page that will not go away, it is almost always this — <code>q</code>." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>Quando scrivi <code>echo ciao</code> la shell fa più cose di quante sembri.
                 Spezza la riga sugli spazi (<em>word splitting</em>), espande le eventuali
                 wildcard e variabili, cerca <code>echo</code> nelle cartelle elencate in
                 <code>$PATH</code>, poi chiama <code>fork()</code> per duplicarsi ed
                 <code>execve()</code> nel figlio per sostituirlo con il programma. Il padre
                 aspetta con <code>wait()</code>. Ecco perché ogni comando è un processo nuovo,
                 e perché un comando non può cambiare la directory della shell che lo ha lanciato
                 — se <code>cd</code> fosse un programma esterno, cambierebbe la propria
                 directory e poi morirebbe. Per questo <code>cd</code> è integrato nella shell.</p>
                 <p>Lo verifichi con <code>type</code>: <code>type echo</code> dice
                 <em>builtin</em>, <code>type ls</code> ti dà un percorso su disco.</p>`,
            en: `<p>When you type <code>echo ciao</code> the shell does more than it looks. It
                 splits the line on spaces (<em>word splitting</em>), expands wildcards and
                 variables, looks for <code>echo</code> in the directories listed in
                 <code>$PATH</code>, then calls <code>fork()</code> to duplicate itself and
                 <code>execve()</code> in the child to replace it with the program. The parent
                 waits with <code>wait()</code>. That is why every command is a new process, and
                 why a command cannot change the directory of the shell that launched it — if
                 <code>cd</code> were an external program it would change its own directory and
                 then die. That is why <code>cd</code> is built into the shell.</p>
                 <p>You can check with <code>type</code>: <code>type echo</code> says
                 <em>builtin</em>, <code>type ls</code> gives you a path on disk.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Gli spazi contano.</strong> <code>echo-n</code> non è <code>echo -n</code>: il primo è una parola sola, e la shell la cerca come comando.",
              en: "<strong>Spaces matter.</strong> <code>echo-n</code> is not <code>echo -n</code>: the first is a single word, and the shell looks for it as a command." },
            { it: "<strong>«command not found» non vuol dire che hai rotto qualcosa.</strong> Vuol dire che quella parola non è un comando: hai sbagliato a scriverlo, oppure il programma non è installato.",
              en: "<strong>\"command not found\" does not mean you broke something.</strong> It means that word is not a command: either you mistyped it, or the program is not installed." },
            { it: "<strong><code>help</code> non è il manuale.</strong> È l'aiuto dei comandi <em>interni</em> alla shell, e su un programma non funziona: <code>help cut</code> risponde <em>«no help topics match»</em> e ti suggerisce <code>info cut</code>, che qui non c'è. Non è colpa tua e non manca niente: <code>info</code> è un secondo sistema di manuali che quasi nessuno installa. Le due strade vere sono <code>cut --help</code> e <code>man cut</code>.",
              en: "<strong><code>help</code> is not the manual.</strong> It is the help for the shell's <em>built-in</em> commands, and on a program it does not work: <code>help cut</code> answers <em>\"no help topics match\"</em> and suggests <code>info cut</code>, which is not here. That is not your fault and nothing is missing: <code>info</code> is a second manual system that almost nobody installs. The two real roads are <code>cut --help</code> and <code>man cut</code>." },
            { it: "<strong><code>man -k</code> cerca dentro le descrizioni, quindi pesca anche il rumore.</strong> <code>man -k cut</code> ti dà venti righe, perché <em>cut</em> è dentro <em>exe<strong>cut</strong>e</em>: la prima riga è quella giusta, il resto è tutto quello che «esegue» qualcosa. Serve quando non sai <em>come si chiama</em> il comando; se il nome lo sai già, <code>--help</code> è più corto.",
              en: "<strong><code>man -k</code> searches inside the descriptions, so it also catches noise.</strong> <code>man -k cut</code> gives you twenty lines, because <em>cut</em> sits inside <em>exe<strong>cut</strong>e</em>: the first line is the right one, the rest is everything that \"executes\" something. It is for when you do not know <em>what the command is called</em>; if you know the name, <code>--help</code> is shorter." },
            { it: "<strong>Il terminale non ha un cestino e non chiede conferma.</strong> Non è cattivo: presume che tu sappia cosa stai facendo. Qui puoi sbagliare quanto vuoi — c'è il tasto <em>Reimposta</em>.",
              en: "<strong>The terminal has no trash bin and asks for no confirmation.</strong> It is not being mean: it assumes you know what you are doing. Here you can make all the mistakes you like — there is the <em>Reset</em> button." },
        ] },

        { kind: "recap", table: [
            { cmd: "whoami", what: { it: "chi sei", en: "who you are" }, flag: { it: "—", en: "—" } },
            { cmd: "uname", what: { it: "che sistema è questo", en: "what system this is" }, flag: { it: "<code>-r</code> versione del kernel, <code>-a</code> tutto", en: "<code>-r</code> kernel version, <code>-a</code> everything" } },
            { cmd: "echo", what: { it: "stampa quello che gli dai", en: "prints what you give it" }, flag: { it: "<code>-n</code> senza a-capo finale", en: "<code>-n</code> no trailing newline" } },
            { cmd: "comando --help", what: { it: "cosa sa fare, in breve", en: "what it can do, in short" }, flag: { it: "la prima cosa da provare su un comando che non conosci", en: "the first thing to try on a command you do not know" } },
            { cmd: "man", what: { it: "il manuale di un comando", en: "a command's manual" }, flag: { it: "<code>q</code> per uscire; <code>man -k parola</code> cerca per argomento", en: "<code>q</code> to quit; <code>man -k word</code> searches by topic" } },
            { cmd: "type", what: { it: "che cos'è questo comando", en: "what this command actually is" }, flag: { it: "distingue builtin da programma", en: "tells builtins from programs" } },
            { cmd: "history", what: { it: "cosa hai già scritto", en: "what you already typed" }, flag: { it: "la freccia ↑ fa lo stesso, più in fretta", en: "the ↑ arrow does the same, faster" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `Su che versione del kernel stai girando? Scoprilo e consegna la risposta:
                     <code>uname -r | lab answer</code>. <em>Non è una domanda da manuale: è
                     <strong>questa</strong> macchina, e la risposta non sta scritta da nessuna parte.</em>`,
                en: `Which kernel version are you running on? Find out and hand in the answer:
                     <code>uname -r | lab answer</code>. <em>This is not a textbook question: it is
                     <strong>this</strong> machine, and the answer is written nowhere.</em>`,
            },
            attrezzi: [
                { cmd: "|", cap: 8, cosa: {
                    it: "la barra verticale prende quello che un comando ha stampato e lo passa al comando dopo, invece di mostrartelo a schermo. Qui serve per consegnare la risposta senza ricopiarla a mano.",
                    en: "the vertical bar takes what a command printed and passes it on to the next command instead of showing it to you. Here it hands the answer in without you retyping it." } },
            ],
            checks: [
                { id: "kernel",
                  why: { it: "La versione del kernel è la prima cosa che si guarda quando un driver non va o un pacchetto non si installa.",
                         en: "The kernel version is the first thing you check when a driver misbehaves or a package refuses to install." },
                  nudge: { it: "<code>uname</code> da solo dice poco. Prova <code>uname --help</code> e cerca l'opzione della <em>kernel release</em>.",
                           en: "<code>uname</code> alone says little. Try <code>uname --help</code> and look for the <em>kernel release</em> option." } },
            ],
            hints: [
                { it: "Il comando che descrive il sistema si chiama <code>uname</code>.", en: "The command that describes the system is called <code>uname</code>." },
                { it: "<code>uname --help</code> elenca le opzioni: te ne serve una che dà la <em>release</em>.", en: "<code>uname --help</code> lists the options: you need the one that gives the <em>release</em>." },
                { it: "<code>uname -r | lab answer</code> — la barra verticale passa il risultato al comando che consegna la risposta.", en: "<code>uname -r | lab answer</code> — the vertical bar passes the result to the command that hands in the answer." },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Nella tua cartella crea un file <code>saluto.txt</code> che contenga
                     <strong>esattamente</strong> <code>ciao mondo</code>, <strong>senza a-capo
                     finale</strong>. Un comando, un'opzione, due argomenti — e il segno
                     <code>&gt;</code> per mandare il risultato in un file invece che a schermo.
                     La verifica guarda i byte: l'a-capo di troppo si vede.`,
                en: `In your folder create a file <code>saluto.txt</code> containing
                     <strong>exactly</strong> <code>ciao mondo</code>, <strong>with no trailing
                     newline</strong>. One command, one option, two arguments — plus the
                     <code>&gt;</code> sign to send the result into a file instead of to the screen.
                     The check looks at the bytes: one extra newline shows up.`,
            },
            attrezzi: [
                { cmd: "> file", cap: 8, cosa: {
                    it: "manda l'uscita di un comando <strong>dentro un file</strong> invece che a schermo. Se il file non c'è lo crea, se c'è lo sovrascrive senza chiedere. È il modo normale di creare un file di testo dal terminale.",
                    en: "sends a command's output <strong>into a file</strong> instead of to the screen. If the file does not exist it is created; if it does, it is overwritten without asking. This is the ordinary way to create a text file from the terminal." } },
            ],
            checks: [
                { id: "esiste",
                  why: { it: "Il segno <code>&gt;</code> non stampa a schermo: manda l'uscita del comando dentro un file. È la prima volta che lo usi, e lo userai per sempre.",
                         en: "The <code>&gt;</code> sign does not print to screen: it sends the command's output into a file. This is the first time you use it, and you will use it forever." },
                  nudge: { it: "<code>ls</code> ti dice se il file c'è. Se non c'è, controlla in quale cartella sei con <code>pwd</code>.",
                           en: "<code>ls</code> tells you whether the file is there. If it is not, check which folder you are in with <code>pwd</code>." } },
                { id: "byte",
                  why: { it: "Un'opzione non è un ornamento: <code>-n</code> cambia il risultato di un byte, e quel byte a volte è la differenza fra un file che funziona e uno che no.",
                         en: "An option is not decoration: <code>-n</code> changes the result by one byte, and that byte is sometimes the difference between a file that works and one that does not." },
                  nudge: { it: "<code>wc -c saluto.txt</code> conta i byte. Ne servono 10. Se ne vedi 11, c'è un a-capo di troppo: rileggi <code>echo --help</code>.",
                           en: "<code>wc -c saluto.txt</code> counts bytes. You need 10. If you see 11, there is one newline too many: read <code>echo --help</code> again." } },
            ],
            hints: [
                { it: "<code>echo ciao mondo</code> stampa a schermo. Per mandarlo in un file serve il segno <code>&gt;</code>.", en: "<code>echo ciao mondo</code> prints to screen. To send it into a file you need the <code>&gt;</code> sign." },
                { it: "L'opzione che toglie l'a-capo finale a <code>echo</code> è <code>-n</code>.", en: "The option that removes echo's trailing newline is <code>-n</code>." },
                { it: "<code>echo -n ciao mondo &gt; saluto.txt</code>", en: "<code>echo -n ciao mondo &gt; saluto.txt</code>" },
            ],
        },
        {
            id: "e3", tipo: "risposta",
            brief: {
                it: `Non hai mai visto il comando <code>cut</code>. Serve a ritagliare colonne da
                     una riga. <strong>Senza cercare su internet</strong>, scopri qual è l'opzione
                     che sceglie <em>quali campi</em> tenere, e consegnala:
                     <code>lab answer -X</code> (con la lettera giusta).
                     <em>Questo esercizio insegna a non avere bisogno del corso.</em>`,
                en: `You have never seen the <code>cut</code> command. It cuts columns out of a line.
                     <strong>Without searching the internet</strong>, find the option that selects
                     <em>which fields</em> to keep, and hand it in: <code>lab answer -X</code>
                     (with the right letter). <em>This exercise teaches you not to need the
                     course.</em>`,
            },
            attrezzi: [
                { cmd: "cut", cap: 10, cosa: {
                    it: "<strong>non devi conoscerlo</strong>: scoprirlo è l'esercizio. Serve a ritagliare colonne da una riga di testo, e lo userai davvero più avanti — qui conta solo la strada per arrivarci, cioè il manuale.",
                    en: "<strong>you are not supposed to know it</strong>: finding out is the exercise. It cuts columns out of a line of text, and you will really use it later — here what counts is only the road to the answer, which is the manual." } },
            ],
            checks: [
                { id: "opzione",
                  why: { it: "Ogni comando porta con sé il proprio manuale. Chi sa leggerlo non ha bisogno di ricordare nulla — e questo, in venticinque anni, non cambia mai.",
                         en: "Every command carries its own manual. Someone who can read it does not need to remember anything — and that, over twenty-five years, never changes." },
                  nudge: { it: "Due strade: <code>cut --help</code> per la risposta rapida, <code>man cut</code> per quella completa. Cerca la parola <em>field</em>.",
                           en: "Two roads: <code>cut --help</code> for the quick answer, <code>man cut</code> for the full one. Look for the word <em>field</em>." } },
            ],
            hints: [
                { it: "Quasi tutti i comandi rispondono a <code>--help</code>.", en: "Almost every command answers to <code>--help</code>." },
                { it: "Nell'elenco cerca la riga che parla di <em>field</em> (campo).", en: "In the list look for the line about <em>field</em>." },
                { it: "È <code>-f</code>. Consegnala con <code>lab answer -f</code>.", en: "It is <code>-f</code>. Hand it in with <code>lab answer -f</code>." },
            ],
        },
    ],
};
