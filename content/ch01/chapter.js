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
            { it: "<strong>Il terminale non ha un cestino e non chiede conferma.</strong> Non è cattivo: presume che tu sappia cosa stai facendo. Qui puoi sbagliare quanto vuoi — c'è il tasto <em>Reimposta</em>.",
              en: "<strong>The terminal has no trash bin and asks for no confirmation.</strong> It is not being mean: it assumes you know what you are doing. Here you can make all the mistakes you like — there is the <em>Reset</em> button." },
        ] },

        { kind: "recap", table: [
            { cmd: "whoami", what: { it: "chi sei", en: "who you are" }, flag: { it: "—", en: "—" } },
            { cmd: "uname", what: { it: "che sistema è questo", en: "what system this is" }, flag: { it: "<code>-r</code> versione del kernel, <code>-a</code> tutto", en: "<code>-r</code> kernel version, <code>-a</code> everything" } },
            { cmd: "echo", what: { it: "stampa quello che gli dai", en: "prints what you give it" }, flag: { it: "<code>-n</code> senza a-capo finale", en: "<code>-n</code> no trailing newline" } },
            { cmd: "man", what: { it: "il manuale di un comando", en: "a command's manual" }, flag: { it: "<code>man -k parola</code> cerca per argomento", en: "<code>man -k word</code> searches by topic" } },
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
                     finale</strong>. Un comando, un'opzione, due argomenti. La verifica guarda i
                     byte: l'a-capo di troppo si vede.`,
                en: `In your folder create a file <code>saluto.txt</code> containing
                     <strong>exactly</strong> <code>ciao mondo</code>, <strong>with no trailing
                     newline</strong>. One command, one option, two arguments. The check looks at
                     the bytes: one extra newline shows up.`,
            },
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
