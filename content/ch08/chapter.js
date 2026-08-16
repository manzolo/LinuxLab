export default {
    id: "ch08", num: 8, runtime: "browser", requires: ["ch04", "ch06"], draft: false,
    title: { it: "Pipe, redirezioni e file di testo", en: "Pipes, redirection and text files" },
    oneLiner: {
        it: "Collega i canali e impara a scrivere i file che li configurano.",
        en: "Connect the channels and learn to write the files that configure them.",
    },
    commands: ["|", ">", ">>", "2>", "&>", "<<", "/dev/null", "tee", "xargs", "sort", "uniq -c", "vi"],
    glossary: ["stdin", "stdout", "stderr", "pipe", "redirezione", "heredoc", "editor modale"],
    competenze: ["scrittura-multilinea"],

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
            { cmd: "NOME=linux\ncat > letterale.conf <<'EOF'\nnome=$NOME\nEOF\ncat letterale.conf", out: "nome=$NOME",
              note: { it: "Un <strong>heredoc</strong> manda più righe allo stdin di <code>cat</code>, che le scrive nel file. Le virgolette in <code>&lt;&lt;'EOF'</code> rendono il contenuto letterale: il dollaro resta un dollaro. Il marcatore finale <code>EOF</code> va da solo, a inizio riga.",
                      en: "A <strong>heredoc</strong> sends multiple lines to <code>cat</code>'s stdin, which writes them to the file. The quotes in <code>&lt;&lt;'EOF'</code> make the content literal: a dollar sign stays a dollar sign. The closing <code>EOF</code> must be alone, at the start of the line." } },
            { cmd: "NOME=linux\ncat > espanso.conf <<EOF\nnome=$NOME\nEOF\ncat espanso.conf", out: "nome=linux",
              note: { it: "Senza virgolette, <code>&lt;&lt;EOF</code> espande le variabili <strong>mentre scrive</strong>. È una scelta, non una scorciatoia: in una unit systemd un <code>$MAINPID</code> espanso troppo presto diventa spesso una riga sbagliata.",
                      en: "Without quotes, <code>&lt;&lt;EOF</code> expands variables <strong>while writing</strong>. It is a choice, not a shortcut: in a systemd unit, a <code>$MAINPID</code> expanded too early often becomes a broken line." } },
            { cmd: "grep ERROR app.log 2> /dev/null", out: "2026-03-04 12:00:11 ERROR 10.3.0.1 GET /admin 500",
              note: { it: "<code>/dev/null</code> è il cestino del sistema: tutto ciò che ci mandi svanisce. Si usa per zittire il rumore, non per nascondere i problemi.",
                      en: "<code>/dev/null</code> is the system's bin: anything sent there vanishes. Use it to silence noise, not to hide problems." } },
            { cmd: "cut -d' ' -f4 app.log | sort | uniq -c | sort -rn | head -5",
              out: "     41 10.1.4.9\n     38 10.2.0.3\n     35 10.1.2.7\n     31 10.3.1.2\n     29 10.2.4.8",
              note: { it: "La catena classica: <em>estrai la colonna → ordina → conta i doppioni → ordina per conteggio → prendi i primi cinque</em>. Nessuno dei cinque comandi sa cosa sia un indirizzo IP.",
                      en: "The classic chain: <em>extract the column → sort → count duplicates → sort by count → take the first five</em>. None of the five commands knows what an IP address is." } },
            { cmd: "echo /var/log/app.log | xargs basename", out: "app.log",
              note: { it: "Non tutti i comandi leggono dalla pipe: <code>basename</code> vuole un <strong>argomento</strong>, e da solo davanti a una pipe resta lì ad aspettare. <code>xargs</code> è il traduttore fra i due modi — prende quello che arriva e lo mette <em>dopo</em> il comando.",
                      en: "Not every command reads from the pipe: <code>basename</code> wants an <strong>argument</strong>, and on its own in front of a pipe it just sits there waiting. <code>xargs</code> is the translator between the two ways — it takes what arrives and puts it <em>after</em> the command." } },
            { cmd: "vi app.conf", out: "",
              note: { it: "<code>vi</code> occupa lo schermo: premi <code>i</code> per inserire, scrivi, poi <code>Esc</code> per tornare ai comandi. <code>:wq</code> seguito da Invio salva ed esce; <code>:q!</code> esce <strong>scartando</strong> le modifiche. Questa è la via d'uscita da ricordare prima di entrare.",
                      en: "<code>vi</code> takes over the screen: press <code>i</code> to insert, type, then <code>Esc</code> to return to command mode. <code>:wq</code> followed by Enter saves and quits; <code>:q!</code> quits <strong>discarding</strong> changes. This is the exit route to remember before going in." } },
        ] },

        { kind: "lead", html: {
            it: `<strong>Due modi, due lavori diversi.</strong> L'heredoc è ripetibile: lo metti
                 in uno script e produce ogni volta lo stesso file di più righe. <code>vi</code>
                 è interattivo: serve quando devi creare o correggere un file a mano. È un editor
                 <em>modale</em>: i tasti scrivono solo dopo <code>i</code>; dopo <code>Esc</code>
                 tornano a essere comandi. Il percorso minimo è
                 <code>vi file → i → testo → Esc → :wq → Invio</code>. Se vuoi uscire senza
                 salvare: <code>Esc → :q! → Invio</code>.`,
            en: `<strong>Two methods, two different jobs.</strong> A heredoc is repeatable: put it
                 in a script and it produces the same multi-line file every time. <code>vi</code>
                 is interactive: use it when you need to create or fix a file by hand. It is a
                 <em>modal</em> editor: keys type text only after <code>i</code>; after
                 <code>Esc</code> they become commands again. The shortest path is
                 <code>vi file → i → text → Esc → :wq → Enter</code>. To quit without saving:
                 <code>Esc → :q! → Enter</code>.` } },

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
                 <p>Il nome <code>EOF</code> non è speciale: può essere <code>FINE</code> o
                 <code>CONFIG</code>. Conta che apertura e chiusura coincidano. Le virgolette si
                 mettono <strong>solo nell'apertura</strong>: <code>&lt;&lt;'CONFIG'</code> comincia,
                 <code>CONFIG</code> da solo chiude. Nei file di configurazione e negli script la
                 forma quotata è il default più sicuro; usa quella non quotata soltanto quando vuoi
                 davvero sostituire variabili della shell che sta creando il file.</p>
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
                 <p>The name <code>EOF</code> is not special: it can be <code>END</code> or
                 <code>CONFIG</code>. What matters is that opening and closing markers match. Quotes
                 go <strong>only in the opening</strong>: <code>&lt;&lt;'CONFIG'</code> opens,
                 <code>CONFIG</code> alone closes. For configuration files and scripts, the quoted
                 form is the safer default; use the unquoted form only when you genuinely want the
                 shell creating the file to substitute its variables.</p>
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
            { it: "<strong>La chiusura di un heredoc non tollera spazi.</strong> Se <code>EOF</code> è indentato o ha altro sulla riga, la shell continua ad aspettare: scrivilo da solo, dalla prima colonna.",
              en: "<strong>A heredoc closing marker does not tolerate spaces.</strong> If <code>EOF</code> is indented or has anything else on its line, the shell keeps waiting: write it alone, starting in the first column." },
            { it: "<strong>In <code>vi</code>, digitare non significa sempre scrivere.</strong> Prima <code>i</code>; per salvare o uscire, prima <code>Esc</code>. Se sei bloccato e non vuoi conservare nulla: <code>Esc</code>, <code>:q!</code>, Invio.",
              en: "<strong>In <code>vi</code>, typing does not always insert text.</strong> Press <code>i</code> first; to save or quit, press <code>Esc</code> first. If you are stuck and want to keep nothing: <code>Esc</code>, <code>:q!</code>, Enter." },
        ] },

        { kind: "recap", table: [
            { cmd: "|", what: { it: "l'uscita di uno diventa l'entrata dell'altro", en: "one's output becomes the other's input" }, flag: { it: "il mattone di tutto il resto", en: "the building block of everything else" } },
            { cmd: "> / >>", what: { it: "scrivi su file / accoda", en: "write to file / append" }, flag: { it: "<code>&gt;</code> cancella prima. Sempre.", en: "<code>&gt;</code> erases first. Always." } },
            { cmd: "<<'EOF' / <<EOF", what: { it: "scrivi più righe letterali / espanse", en: "write multiple literal / expanded lines" }, flag: { it: "<code>EOF</code> finale da solo, senza virgolette", en: "closing <code>EOF</code> alone, without quotes" } },
            { cmd: "2>", what: { it: "devia i soli errori", en: "divert errors only" }, flag: { it: "<code>2&gt;&amp;1</code> li unisce all'uscita normale", en: "<code>2&gt;&amp;1</code> merges them into normal output" } },
            { cmd: "tee", what: { it: "scrivi su file E lascia passare", en: "write to file AND pass through" }, flag: { it: "<code>-a</code> accoda invece di sovrascrivere", en: "<code>-a</code> appends instead of overwriting" } },
            { cmd: "sort | uniq -c", what: { it: "conta i doppioni", en: "count duplicates" }, flag: { it: "<code>sort -rn</code> dopo, per la classifica", en: "<code>sort -rn</code> after, for the ranking" } },
            { cmd: "vi file", what: { it: "modifica un file a mano", en: "edit a file by hand" }, flag: { it: "<code>i</code> inserisce · <code>Esc :wq</code> salva · <code>Esc :q!</code> scarta", en: "<code>i</code> inserts · <code>Esc :wq</code> saves · <code>Esc :q!</code> discards" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Salva l'elenco dei file di <code>~/lab</code> in <code>~/lab/elenco.txt</code>
                     <strong>e</strong>, dallo stesso flusso, scrivi in <code>~/lab/conteggio.txt</code>
                     quante righe sono. Con <code>&gt;</code> non ci arrivi: quello che dirotti in un
                     file non prosegue. Qui serve una <strong>derivazione</strong>.`,
                en: `Save the list of files in <code>~/lab</code> into <code>~/lab/elenco.txt</code>
                     <strong>and</strong>, from the same stream, write into <code>~/lab/conteggio.txt</code>
                     how many lines that is. <code>&gt;</code> will not get you there: what you divert
                     into a file does not carry on. Here you need a <strong>T-junction</strong>.`,
            },
            checks: [
                { id: "elenco-salvato",
                  why: { it: "<code>&gt;</code> e <code>tee</code> non sono intercambiabili: il primo <strong>dirotta</strong>, il secondo <strong>duplica</strong>. Quando un comando ci mette dieci minuti, vuoi vedere che sta succedendo <em>mentre</em> salvi.",
                         en: "<code>&gt;</code> and <code>tee</code> are not interchangeable: the first <strong>diverts</strong>, the second <strong>duplicates</strong>. When a command takes ten minutes, you want to see what is happening <em>while</em> you save." },
                  nudge: { it: "<code>cat ~/lab/elenco.txt</code>: se il file è vuoto o non c'è, la redirezione non è arrivata dove pensavi.",
                           en: "<code>cat ~/lab/elenco.txt</code>: if the file is empty or missing, the redirection did not land where you thought." } },
                { id: "conteggio-coerente",
                  why: { it: "Due destinazioni da un solo passaggio sui dati: è a questo che serve <code>tee</code>. Puoi arrivarci anche in due comandi separati, e va bene — la verifica guarda il risultato, non la forma. Ma quando il primo comando ci mette dieci minuti, o legge da una pipe che passa una volta sola, i due comandi non sono più un'alternativa.",
                         en: "Two destinations from a single pass over the data: that is what <code>tee</code> is for. You can also get there with two separate commands, and that is fine — the check looks at the result, not the form. But when the first command takes ten minutes, or reads from a pipe that flows only once, two commands stop being an alternative." },
                  nudge: { it: "<code>wc -l &lt; ~/lab/elenco.txt; cat ~/lab/conteggio.txt</code>: i due numeri devono coincidere.",
                           en: "<code>wc -l &lt; ~/lab/elenco.txt; cat ~/lab/conteggio.txt</code>: the two numbers must match." } },
            ],
            hints: [
                { it: "Il comando che scrive su file <em>e lascia passare</em> si chiama <code>tee</code> — come il raccordo a T dell'idraulica.", en: "The command that writes to a file <em>and lets data through</em> is called <code>tee</code> — like the plumber's T-junction." },
                { it: "Va messo in mezzo, non in fondo: <code>ls | tee elenco.txt | …</code>. Quello che viene dopo riceve tutto lo stesso.", en: "It goes in the middle, not at the end: <code>ls | tee elenco.txt | …</code>. Whatever comes after receives everything all the same." },
                { it: "<code>cd ~/lab &amp;&amp; ls | tee elenco.txt | wc -l &gt; conteggio.txt</code>", en: "<code>cd ~/lab &amp;&amp; ls | tee elenco.txt | wc -l &gt; conteggio.txt</code>" },
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
            attrezzi: [
                { cmd: "awk '{print $4}'", cap: 10, cosa: {
                    it: "stampa la colonna numero 4 di ogni riga. Fa lo stesso di <code>cut -d' ' -f4</code>, ma non si fa ingannare da due spazi di fila: qui le due strade valgono uguale.",
                    en: "prints column number 4 of every line. It does the same as <code>cut -d' ' -f4</code>, but is not fooled by two spaces in a row: here the two roads are worth the same." } },
            ],
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
        {
            id: "e4", tipo: "stato", richiede: ["scrittura-multilinea"],
            brief: {
                it: `Leggi la parola generata in <code>~/lab/valore.txt</code> e assegna
                     <code>NOME=parola</code> usando quel valore. Poi usa due heredoc per creare
                     <code>~/lab/letterale.conf</code> e <code>~/lab/espanso.conf</code>.
                     Entrambi contengono una sola riga scritta come <code>nome=$NOME</code>, ma nel
                     primo il dollaro deve restare letterale e nel secondo la variabile deve
                     espandersi. Scegli tu dove vanno le virgolette: la verifica guarda i due file.`,
                en: `Read the generated word in <code>~/lab/valore.txt</code> and assign
                     <code>NOME=word</code> using that value. Then use two heredocs to create
                     <code>~/lab/letterale.conf</code> and <code>~/lab/espanso.conf</code>. Both
                     contain one line typed as <code>nome=$NOME</code>, but in the first the dollar
                     sign must stay literal, while in the second the variable must expand. You
                     decide where the quotes go: the check looks at both files.`,
            },
            checks: [
                { id: "heredoc-letterale",
                  why: { it: "Le unit systemd e gli script contengono spesso dollari che devono arrivare intatti al programma che leggerà il file. Quotare il delimitatore impedisce alla shell che lo crea di consumarli troppo presto.",
                         en: "Systemd units and scripts often contain dollar signs that must reach the program reading the file intact. Quoting the delimiter stops the shell creating it from consuming them too early." },
                  nudge: { it: "<code>cat ~/lab/letterale.conf</code> deve mostrare esattamente <code>nome=$NOME</code>. Nell'apertura usa <code>&lt;&lt;'EOF'</code>; la chiusura resta <code>EOF</code> senza virgolette.",
                           en: "<code>cat ~/lab/letterale.conf</code> must show exactly <code>nome=$NOME</code>. Open with <code>&lt;&lt;'EOF'</code>; the closing marker remains unquoted <code>EOF</code>." } },
                { id: "heredoc-espanso",
                  why: { it: "A volte invece stai costruendo il file proprio per inserirci un valore noto adesso. Il delimitatore non quotato dice esplicitamente che vuoi quell'espansione.",
                         en: "Sometimes you are building the file precisely to insert a value known now. An unquoted delimiter explicitly says that you want that expansion." },
                  nudge: { it: "<code>cat ~/lab/espanso.conf</code> deve mostrare <code>nome=</code> seguito dalla parola in <code>valore.txt</code>. Assegna <code>NOME=parola</code> nella stessa shell prima dell'heredoc.",
                           en: "<code>cat ~/lab/espanso.conf</code> must show <code>nome=</code> followed by the word in <code>valore.txt</code>. Assign <code>NOME=word</code> in the same shell before the heredoc." } },
            ],
            hints: [
                { it: "Il file letterale comincia con <code>cat &gt; ~/lab/letterale.conf &lt;&lt;'EOF'</code>. Poi vengono il contenuto e, da solo a inizio riga, <code>EOF</code>.", en: "The literal file starts with <code>cat &gt; ~/lab/letterale.conf &lt;&lt;'EOF'</code>. Then come the content and, alone at the start of a line, <code>EOF</code>." },
                { it: "Per il file espanso togli solo le virgolette dall'apertura: <code>&lt;&lt;EOF</code>. Non cambiare la riga <code>nome=$NOME</code>.", en: "For the expanded file, remove only the quotes from the opening: <code>&lt;&lt;EOF</code>. Do not change the <code>nome=$NOME</code> line." },
                { it: "<code>cat ~/lab/valore.txt</code> · <code>NOME=parola</code> · <code>cat &gt; ~/lab/letterale.conf &lt;&lt;'EOF'</code> · <code>cat &gt; ~/lab/espanso.conf &lt;&lt;EOF</code>", en: "<code>cat ~/lab/valore.txt</code> · <code>NOME=word</code> · <code>cat &gt; ~/lab/letterale.conf &lt;&lt;'EOF'</code> · <code>cat &gt; ~/lab/espanso.conf &lt;&lt;EOF</code>" },
            ],
        },
        {
            id: "e5", tipo: "stato", richiede: ["scrittura-multilinea"],
            brief: {
                it: `Apri <code>~/lab/incarico.txt</code>: contiene tre righe generate per questa
                     sessione. Usa <code>vi ~/lab/nota.conf</code> e riproducile nello stesso ordine,
                     carattere per carattere. Salva ed esci. La verifica confronta il file, non i
                     tasti premuti: il lavoro vero è ottenere uno stato corretto e saper uscire
                     dall'editor senza perderlo.`,
                en: `Open <code>~/lab/incarico.txt</code>: it contains three lines generated for
                     this session. Use <code>vi ~/lab/nota.conf</code> and reproduce them in the
                     same order, character for character. Save and quit. The check compares the
                     file, not the keys you pressed: the real job is reaching the right state and
                     knowing how to leave the editor without losing it.`,
            },
            checks: [
                { id: "nota-multilinea",
                  why: { it: "Uno script, una unit e una configurazione sono prima di tutto file di testo con più righe. Qui la verifica non può sapere quale editor hai usato, ma può sapere se hai conservato tutte le righe, nell'ordine esatto.",
                         en: "A script, a unit and a configuration are first of all multi-line text files. The check cannot know which editor you used, but it can tell whether you preserved every line in the exact order." },
                  nudge: { it: "Confronta i due file con <code>diff -u ~/lab/incarico.txt ~/lab/nota.conf</code>. In <code>vi</code>: <code>i</code> per scrivere, <code>Esc</code> e <code>:wq</code> per salvare e uscire; <code>:q!</code> scarta invece le modifiche.",
                           en: "Compare the files with <code>diff -u ~/lab/incarico.txt ~/lab/nota.conf</code>. In <code>vi</code>: <code>i</code> to type, <code>Esc</code> then <code>:wq</code> to save and quit; <code>:q!</code> discards changes instead." } },
            ],
            hints: [
                { it: "Prima leggi la traccia con <code>cat ~/lab/incarico.txt</code>; le parole cambiano a ogni semina.", en: "First read the assignment with <code>cat ~/lab/incarico.txt</code>; the words change with every seed." },
                { it: "Dentro <code>vi</code>, premi <code>i</code>, scrivi le tre righe, poi <code>Esc</code>. Digita <code>:wq</code> e premi Invio.", en: "Inside <code>vi</code>, press <code>i</code>, type the three lines, then <code>Esc</code>. Type <code>:wq</code> and press Enter." },
                { it: "Se hai fatto confusione e vuoi ricominciare senza salvare: <code>Esc</code>, poi <code>:q!</code> e Invio.", en: "If you got tangled and want to start again without saving: <code>Esc</code>, then <code>:q!</code> and Enter." },
            ],
        },
    ],
};
