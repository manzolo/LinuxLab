export default {
    id: "ch08", num: 8, runtime: "browser", requires: ["ch04", "ch06"], draft: false,
    title: { it: "Pipe e redirezione", en: "Pipes and redirection" },
    oneLiner: {
        it: "Ogni comando ha tre canali; il tuo lavoro è collegarli.",
        en: "Every command has three channels; your job is to connect them.",
    },
    commands: ["|", ">", ">>", "2>", "&>", "/dev/null", "tee", "xargs", "sort", "uniq -c"],
    glossary: ["stdin", "stdout", "stderr", "pipe", "redirezione"],

    blocks: [
        { kind: "hook", html: {
            it: `Ti serve sapere quali cinque indirizzi hanno fatto più richieste, su un log da
                 duemila righe. Non esiste un comando <code>top5ip</code>. Esistono
                 <strong>cinque comandi banali</strong> che, messi in fila, lo fanno in una riga.`,
            en: `You need to know which five addresses made the most requests, from a two-thousand
                 line log. There is no <code>top5ip</code> command. There are <strong>five trivial
                 commands</strong> that, lined up, do it in one line.` } },

        { kind: "lead", html: {
            it: `Questo è il capitolo che trasforma la shell da «modo scomodo di aprire i file» a
                 <strong>strumento</strong>. L'idea è una sola, e ha cinquant'anni: ogni programma
                 fa una cosa, e sa passare il risultato al successivo.`,
            en: `This is the chapter that turns the shell from "an awkward way to open files" into
                 a <strong>tool</strong>. There is one idea, and it is fifty years old: each
                 program does one thing, and knows how to pass its result to the next.` } },

        { kind: "analogy", html: {
            it: `Una catena di montaggio. Ogni macchina ha un <strong>nastro in entrata</strong>
                 (stdin), un <strong>nastro in uscita</strong> (stdout) e uno
                 <strong>scivolo per gli scarti</strong> (stderr). La barra verticale
                 <code>|</code> attacca l'uscita di una all'entrata della successiva. Gli scarti
                 restano separati apposta: così un errore non finisce mescolato ai dati buoni.`,
            en: `An assembly line. Each machine has an <strong>inbound belt</strong> (stdin), an
                 <strong>outbound belt</strong> (stdout) and a <strong>reject chute</strong>
                 (stderr). The vertical bar <code>|</code> attaches one machine's output to the
                 next one's input. The rejects stay separate on purpose: an error never gets mixed
                 into the good data.` } },

        { kind: "shown", lines: [
            { cmd: "ls > elenco.txt", out: "",
              note: { it: "<code>&gt;</code> manda stdout in un file, <strong>cancellando</strong> quello che c'era. <code>&gt;&gt;</code> invece accoda.",
                      en: "<code>&gt;</code> sends stdout to a file, <strong>erasing</strong> what was there. <code>&gt;&gt;</code> appends instead." } },
            { cmd: "ls | tee elenco.txt", out: "app.log\nnote.txt",
              note: { it: "<code>tee</code> è il raccordo a T: scrive sul file <em>e</em> lascia passare, così vedi anche a schermo.",
                      en: "<code>tee</code> is the T-junction: it writes to the file <em>and</em> lets the data through, so you see it on screen too." } },
            { cmd: "ls inesistente 2> errori.txt", out: "",
              note: { it: "<code>2&gt;</code> devia <strong>solo</strong> gli errori. Il <code>2</code> è il numero del canale: 0 stdin, 1 stdout, 2 stderr.",
                      en: "<code>2&gt;</code> diverts <strong>only</strong> the errors. The <code>2</code> is the channel number: 0 stdin, 1 stdout, 2 stderr." } },
            { cmd: "grep ERROR app.log 2> /dev/null", out: "2026-03-04 12:00:11 ERROR 10.3.0.1 GET /admin 500",
              note: { it: "<code>/dev/null</code> è il cestino del sistema: tutto ciò che ci mandi svanisce. Si usa per zittire il rumore, non per nascondere i problemi.",
                      en: "<code>/dev/null</code> is the system's bin: anything sent there vanishes. Use it to silence noise, not to hide problems." } },
            { cmd: "cut -d' ' -f4 app.log | sort | uniq -c | sort -rn | head -5",
              out: "     41 10.1.4.9\n     38 10.2.0.3\n     35 10.1.2.7\n     31 10.3.1.2\n     29 10.2.4.8",
              note: { it: "La catena classica: <em>estrai la colonna → ordina → conta i doppioni → ordina per conteggio → prendi i primi cinque</em>. Nessuno dei cinque comandi sa cosa sia un indirizzo IP.",
                      en: "The classic chain: <em>extract the column → sort → count duplicates → sort by count → take the first five</em>. None of the five commands knows what an IP address is." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>Perché <code>sort</code> prima di <code>uniq</code>? Perché <code>uniq</code>
                 confronta <strong>solo righe adiacenti</strong>: è un programma che legge in
                 streaming e non tiene niente in memoria. Metterle in ordine è il modo di far
                 finire vicine quelle uguali. È una limitazione, ed è anche il motivo per cui
                 funziona su file da 40 GB.</p>
                 <p>L'ordine dei simboli conta più di quanto sembri: <code>&gt; file 2&gt;&amp;1</code>
                 manda tutto nel file, ma <code>2&gt;&amp;1 &gt; file</code> manda gli errori
                 <em>dove stdout puntava prima</em>, cioè a schermo. Si legge da sinistra a destra
                 come una serie di assegnazioni, non come una dichiarazione d'intenti.</p>
                 <p>E le pipe girano <strong>in parallelo</strong>, non in sequenza: i comandi
                 partono tutti insieme e si bloccano quando il buffer da 64 KB è pieno. Per questo
                 <code>… | head -5</code> su un file enorme è immediato: quando <code>head</code>
                 ha finito, chi sta a monte riceve un <code>SIGPIPE</code> e muore. Non ha letto
                 tutto il file: si è fermato.</p>`,
            en: `<p>Why <code>sort</code> before <code>uniq</code>? Because <code>uniq</code>
                 compares <strong>adjacent lines only</strong>: it is a streaming program that
                 holds nothing in memory. Sorting is how you make equal lines end up next to each
                 other. It is a limitation, and it is also why it works on 40 GB files.</p>
                 <p>Symbol order matters more than it looks: <code>&gt; file 2&gt;&amp;1</code>
                 sends everything to the file, but <code>2&gt;&amp;1 &gt; file</code> sends errors
                 <em>where stdout used to point</em>, i.e. to the screen. Read it left to right as
                 a series of assignments, not as a statement of intent.</p>
                 <p>And pipes run <strong>in parallel</strong>, not in sequence: the commands all
                 start together and block when the 64 KB buffer fills. That is why <code>… | head
                 -5</code> on a huge file is instant: once <code>head</code> is done, whoever is
                 upstream gets a <code>SIGPIPE</code> and dies. It did not read the whole file: it
                 stopped.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>cmd &gt; file</code> svuota il file <em>prima</em> di eseguire il comando.</strong> Per questo <code>sort file &gt; file</code> ti lascia un file vuoto: quando <code>sort</code> comincia a leggere, non c'è più niente.",
              en: "<strong><code>cmd &gt; file</code> empties the file <em>before</em> running the command.</strong> That is why <code>sort file &gt; file</code> leaves you an empty file: by the time <code>sort</code> starts reading, there is nothing left." },
            { it: "<strong>La pipe passa solo stdout.</strong> Gli errori non entrano nel tubo: continuano ad andare a schermo. Se ti servono nella catena, <code>2&gt;&amp;1 |</code>.",
              en: "<strong>The pipe carries stdout only.</strong> Errors do not enter the tube: they keep going to the screen. If you need them in the chain, <code>2&gt;&amp;1 |</code>." },
            { it: "<strong><code>sudo cmd &gt; /root/file</code> non funziona.</strong> La redirezione la fa la <em>tua</em> shell, che non è root. Serve <code>… | sudo tee /root/file</code>.",
              en: "<strong><code>sudo cmd &gt; /root/file</code> does not work.</strong> The redirection is done by <em>your</em> shell, which is not root. You need <code>… | sudo tee /root/file</code>." },
        ] },

        { kind: "recap", table: [
            { cmd: "|", what: { it: "l'uscita di uno diventa l'entrata dell'altro", en: "one's output becomes the other's input" }, flag: { it: "il mattone di tutto il resto", en: "the building block of everything else" } },
            { cmd: "> / >>", what: { it: "scrivi su file / accoda", en: "write to file / append" }, flag: { it: "<code>&gt;</code> cancella prima. Sempre.", en: "<code>&gt;</code> erases first. Always." } },
            { cmd: "2>", what: { it: "devia i soli errori", en: "divert errors only" }, flag: { it: "<code>2&gt;&amp;1</code> li unisce all'uscita normale", en: "<code>2&gt;&amp;1</code> merges them into normal output" } },
            { cmd: "tee", what: { it: "scrivi su file E lascia passare", en: "write to file AND pass through" }, flag: { it: "<code>-a</code> accoda invece di sovrascrivere", en: "<code>-a</code> appends instead of overwriting" } },
            { cmd: "sort | uniq -c", what: { it: "conta i doppioni", en: "count duplicates" }, flag: { it: "<code>sort -rn</code> dopo, per la classifica", en: "<code>sort -rn</code> after, for the ranking" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Salva l'elenco dei file di <code>~/lab</code> in <code>~/lab/elenco.txt</code>
                     <strong>e</strong> fallo comparire anche a schermo, con un comando solo.`,
                en: `Save the list of files in <code>~/lab</code> into <code>~/lab/elenco.txt</code>
                     <strong>and</strong> show it on screen too, with a single command.`,
            },
            checks: [
                { id: "elenco-salvato",
                  why: { it: "<code>&gt;</code> e <code>tee</code> non sono intercambiabili: il primo dirotta, il secondo duplica. Quando un comando ci mette dieci minuti, vuoi vedere che sta succedendo <em>mentre</em> salvi.",
                         en: "<code>&gt;</code> and <code>tee</code> are not interchangeable: the first diverts, the second duplicates. When a command takes ten minutes, you want to see what is happening <em>while</em> you save." },
                  nudge: { it: "<code>cat ~/lab/elenco.txt</code>: se il file è vuoto o non c'è, la redirezione non è arrivata dove pensavi.",
                           en: "<code>cat ~/lab/elenco.txt</code>: if the file is empty or missing, the redirection did not land where you thought." } },
            ],
            hints: [
                { it: "Il comando che scrive su file e lascia passare si chiama <code>tee</code>.", en: "The command that writes to a file and passes data through is called <code>tee</code>." },
                { it: "Va messo dopo una pipe: <code>ls | tee …</code>.", en: "It goes after a pipe: <code>ls | tee …</code>." },
                { it: "<code>cd ~/lab &amp;&amp; ls | tee elenco.txt</code>", en: "<code>cd ~/lab &amp;&amp; ls | tee elenco.txt</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Da <code>~/lab/app.log</code> ricava i <strong>5 indirizzi IP più
                     frequenti</strong> e scrivili in <code>~/lab/top-ip.txt</code>, uno per riga,
                     dal più frequente, <strong>solo l'indirizzo</strong> (niente conteggio).
                     <em>Non puoi scriverli a mano: non li hai mai visti.</em>`,
                en: `From <code>~/lab/app.log</code> get the <strong>5 most frequent IP
                     addresses</strong> and write them into <code>~/lab/top-ip.txt</code>, one per
                     line, most frequent first, <strong>address only</strong> (no counts).
                     <em>You cannot type them by hand: you have never seen them.</em>`,
            },
            checks: [
                { id: "top5",
                  why: { it: "È la catena che userai per il resto della tua vita da amministratore: estrai una colonna, ordina, conta, riordina, tronca. Cambia solo la colonna.",
                         en: "This is the chain you will use for the rest of your life as an administrator: extract a column, sort, count, re-sort, cut. Only the column changes." },
                  nudge: { it: "Costruiscila un pezzo alla volta, guardando l'uscita a ogni passo: prima <code>cut -d' ' -f4 app.log | head</code>, poi aggiungi <code>| sort | uniq -c</code>, e così via.",
                           en: "Build it one piece at a time, looking at the output at each step: first <code>cut -d' ' -f4 app.log | head</code>, then add <code>| sort | uniq -c</code>, and so on." } },
            ],
            hints: [
                { it: "Nel log l'IP è la quarta colonna, separata da spazi. <code>cut -d' ' -f4</code> oppure <code>awk '{print $4}'</code>.", en: "In the log the IP is the fourth column, space-separated. <code>cut -d' ' -f4</code> or <code>awk '{print $4}'</code>." },
                { it: "<code>sort | uniq -c</code> conta, <code>sort -rn</code> ordina per conteggio, <code>head -5</code> tronca.", en: "<code>sort | uniq -c</code> counts, <code>sort -rn</code> sorts by count, <code>head -5</code> cuts." },
                { it: "<code>awk '{print $4}' ~/lab/app.log | sort | uniq -c | sort -rn | head -5 | awk '{print $2}' &gt; ~/lab/top-ip.txt</code>", en: "<code>awk '{print $4}' ~/lab/app.log | sort | uniq -c | sort -rn | head -5 | awk '{print $2}' &gt; ~/lab/top-ip.txt</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Il comando <code>~/lab/rumoroso.sh</code> stampa risultati buoni e messaggi di
                     errore, mescolati. Eseguilo separando i due flussi: i risultati in
                     <code>~/lab/buoni.txt</code>, gli errori in <code>~/lab/scarti.txt</code>.
                     Nessuno dei due file deve contenere righe dell'altro.`,
                en: `The command <code>~/lab/rumoroso.sh</code> prints good results and error
                     messages, mixed. Run it separating the two streams: results into
                     <code>~/lab/buoni.txt</code>, errors into <code>~/lab/scarti.txt</code>.
                     Neither file may contain the other's lines.`,
            },
            checks: [
                { id: "buoni-puliti",
                  why: { it: "Se errori e risultati finiscono nello stesso posto, il primo script che li legge si rompe. Separarli è quello che rende automatizzabile un comando.",
                         en: "If errors and results land in the same place, the first script that reads them breaks. Separating them is what makes a command automatable." },
                  nudge: { it: "Prova prima senza redirezioni e guarda cosa esce: <code>~/lab/rumoroso.sh</code>. Poi <code>~/lab/rumoroso.sh 2&gt;/dev/null</code> per vedere solo i buoni.",
                           en: "Try it with no redirection first and look at the output: <code>~/lab/rumoroso.sh</code>. Then <code>~/lab/rumoroso.sh 2&gt;/dev/null</code> to see only the good ones." } },
                { id: "scarti-giusti",
                  why: { it: "Il canale 2 esiste proprio perché il programma <em>sa</em> quali righe sono errori. Non devi indovinarlo tu con un <code>grep</code>.",
                         en: "Channel 2 exists precisely because the program <em>knows</em> which lines are errors. You do not have to guess with a <code>grep</code>." },
                  nudge: { it: "Le due redirezioni si scrivono di seguito nella stessa riga: <code>cmd &gt; uno.txt 2&gt; due.txt</code>.",
                           en: "The two redirections go one after the other on the same line: <code>cmd &gt; one.txt 2&gt; two.txt</code>." } },
            ],
            hints: [
                { it: "<code>&gt;</code> prende il canale 1 (stdout), <code>2&gt;</code> il canale 2 (stderr).", en: "<code>&gt;</code> takes channel 1 (stdout), <code>2&gt;</code> takes channel 2 (stderr)." },
                { it: "Si possono usare tutte e due nello stesso comando.", en: "You can use both in the same command." },
                { it: "<code>~/lab/rumoroso.sh &gt; ~/lab/buoni.txt 2&gt; ~/lab/scarti.txt</code>", en: "<code>~/lab/rumoroso.sh &gt; ~/lab/buoni.txt 2&gt; ~/lab/scarti.txt</code>" },
            ],
        },
    ],
};
