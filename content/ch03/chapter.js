export default {
    id: "ch03", num: 3, runtime: "browser", requires: ["ch02"], draft: false,
    title: { it: "File e cartelle", en: "Files and folders" },
    oneLiner: {
        it: "Creare, copiare, spostare e cancellare — e capire che spostare non è copiare.",
        en: "Create, copy, move and delete — and understand that moving is not copying.",
    },
    commands: ["mkdir -p", "touch", "cp -r", "mv", "rm -r", "rmdir", "ln -s"],
    glossary: ["wildcard", "link simbolico", "inode", "ricorsivo"],

    blocks: [
        { kind: "hook", html: {
            it: `Devi archiviare quaranta file di log. Puoi spostarli uno per uno, e ci metti
                 dieci minuti. Oppure puoi scrivere <strong>una riga</strong> e finire prima di
                 aver finito di leggerla. <em>Puoi davvero farlo a mano: il capitolo esiste per
                 non farlo.</em>`,
            en: `You have to archive forty log files. You can move them one by one and spend ten
                 minutes. Or you can write <strong>one line</strong> and be done before you finish
                 reading it. <em>You really can do it by hand: this chapter exists so you do
                 not.</em>` } },

        { kind: "lead", html: {
            it: `Quattro comandi coprono il 95% del lavoro quotidiano sui file. Il pezzo che
                 cambia tutto non è un comando: è l'<strong>asterisco</strong>, che permette di
                 dire «tutti quelli che...» invece di elencarli.`,
            en: `Four commands cover 95% of daily file work. The piece that changes everything is
                 not a command: it is the <strong>asterisk</strong>, which lets you say "all those
                 that..." instead of listing them.` } },

        { kind: "analogy", html: {
            it: `Un file non è la scatola: è <strong>l'etichetta sulla scatola</strong>. Il nome
                 in una cartella punta al contenuto, che sta altrove sul disco. Da qui una cosa
                 sorprendente: <em>spostare</em> un file dentro lo stesso disco significa
                 riattaccare l'etichetta su un altro scaffale — istantaneo, anche per 40 GB.
                 <em>Copiarlo</em> invece significa fabbricare una scatola nuova e riempirla.`,
            en: `A file is not the box: it is <strong>the label on the box</strong>. The name in a
                 directory points at content that lives elsewhere on the disk. From which
                 something surprising follows: <em>moving</em> a file within the same disk means
                 sticking the label on another shelf — instant, even for 40 GB. <em>Copying</em>
                 means building a new box and filling it.` } },

        { kind: "shown", lines: [
            { cmd: "mkdir -p progetto/src progetto/docs", out: "",
              note: { it: "<code>-p</code> crea anche i genitori mancanti e non protesta se esistono già. È l'opzione che si usa sempre.",
                      en: "<code>-p</code> also creates missing parents and does not complain if they exist. It is the option you always use." } },
            { cmd: "touch progetto/src/main.c && ls -l progetto/src", out: "-rw-r--r-- 1 root root 0 Mar  4 11:02 main.c",
              note: { it: "<code>touch</code> crea un file vuoto — o, se esiste, ne aggiorna la data.",
                      en: "<code>touch</code> creates an empty file — or, if it exists, updates its timestamp." } },
            { cmd: "cp -r progetto progetto-backup", out: "",
              note: { it: "Senza <code>-r</code> (ricorsivo) <code>cp</code> si rifiuta di copiare una cartella. È il primo posto dove tutti inciampano.",
                      en: "Without <code>-r</code> (recursive) <code>cp</code> refuses to copy a directory. It is the first place everybody trips." } },
            { cmd: "mv *.log archivio/", out: "",
              note: { it: "L'asterisco lo espande <strong>la shell</strong>, non <code>mv</code>: al comando arrivano già i nomi veri, uno per uno.",
                      en: "The asterisk is expanded by <strong>the shell</strong>, not by <code>mv</code>: the command receives the real names, one by one." } },
            { cmd: "ln -s /var/log/app/2026-03-14.log ultimo && ls -l ultimo",
              out: "lrwxrwxrwx 1 root root 30 Mar 14 09:00 ultimo -> /var/log/app/2026-03-14.log",
              note: { it: "Un <strong>link simbolico</strong> è un'etichetta che punta a un'altra etichetta. La <code>l</code> iniziale lo distingue da una copia.",
                      en: "A <strong>symbolic link</strong> is a label pointing at another label. The leading <code>l</code> tells it apart from a copy." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p><code>rm</code> non tocca i byte del file. Toglie un nome dalla directory e
                 decrementa il <em>link count</em> dell'inode. Il contenuto sparisce davvero solo
                 quando se ne vanno <strong>l'ultimo nome e l'ultimo descrittore aperto</strong>.</p>
                 <p>Da qui il classico che fa impazzire i principianti: cancelli un log da 40 GB,
                 e <code>df</code> non si muove di un byte. Perché? Perché nginx tiene ancora quel
                 file aperto: il nome è sparito, l'inode no. Lo spazio torna quando il processo
                 chiude il descrittore — o quando riavvii il servizio. Per questo, per svuotare un
                 log in produzione, si fa <code>&gt; access.log</code> e non <code>rm</code>: il
                 primo azzera il contenuto lasciando l'inode al suo posto.</p>
                 <p>E per la stessa ragione <code>mv</code> è istantaneo dentro lo stesso
                 filesystem (cambia solo una voce di directory) mentre fra filesystem diversi
                 diventa una copia seguita da una cancellazione — con tutto il tempo che serve, e
                 la possibilità di interrompersi a metà.</p>`,
            en: `<p><code>rm</code> does not touch the file's bytes. It removes a name from the
                 directory and decrements the inode's <em>link count</em>. The content really
                 disappears only when <strong>the last name and the last open descriptor</strong>
                 are gone.</p>
                 <p>Hence the classic that drives beginners mad: you delete a 40 GB log and
                 <code>df</code> does not move a byte. Why? Because nginx still holds that file
                 open: the name is gone, the inode is not. The space comes back when the process
                 closes the descriptor — or when you restart the service. That is why, to empty a
                 log in production, you use <code>&gt; access.log</code> and not <code>rm</code>:
                 the former truncates the content and leaves the inode in place.</p>
                 <p>And for the same reason <code>mv</code> is instant within one filesystem (it
                 only changes a directory entry) while across filesystems it becomes a copy
                 followed by a delete — with all the time that takes, and the chance of stopping
                 halfway.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>cp file cartella</code> e <code>cp file cartella/</code> non sono la stessa cosa</strong> se la cartella non esiste: nel primo caso ti ritrovi un file chiamato <code>cartella</code>. La barra finale ti protegge.",
              en: "<strong><code>cp file dir</code> and <code>cp file dir/</code> differ</strong> if the directory does not exist: in the first case you end up with a file named <code>dir</code>. The trailing slash protects you." },
            { it: "<strong><code>rm -rf</code> non chiede conferma e non ha cestino.</strong> Prima di lanciarlo, sostituisci <code>rm</code> con <code>ls</code>: se l'elenco che esce è quello che volevi cancellare, allora procedi.",
              en: "<strong><code>rm -rf</code> asks nothing and has no trash.</strong> Before running it, replace <code>rm</code> with <code>ls</code>: if the list that comes out is what you meant to delete, then go ahead." },
            { it: "<strong>L'asterisco non vede i file nascosti.</strong> <code>mv * altrove/</code> lascia indietro tutto quello che comincia con un punto — spesso proprio le configurazioni.",
              en: "<strong>The asterisk does not see hidden files.</strong> <code>mv * elsewhere/</code> leaves behind everything starting with a dot — often exactly the configuration." },
        ] },

        { kind: "recap", table: [
            { cmd: "mkdir", what: { it: "crea cartelle", en: "create directories" }, flag: { it: "<code>-p</code> anche i genitori, senza lamentarsi", en: "<code>-p</code> parents too, no complaints" } },
            { cmd: "cp", what: { it: "copia", en: "copy" }, flag: { it: "<code>-r</code> per le cartelle, <code>-a</code> preserva tutto", en: "<code>-r</code> for directories, <code>-a</code> preserves everything" } },
            { cmd: "mv", what: { it: "sposta o rinomina", en: "move or rename" }, flag: { it: "è lo stesso comando: rinominare è spostare nello stesso posto", en: "same command: renaming is moving in place" } },
            { cmd: "rm", what: { it: "cancella", en: "delete" }, flag: { it: "<code>-r</code> ricorsivo, <code>-i</code> chiede conferma", en: "<code>-r</code> recursive, <code>-i</code> asks first" } },
            { cmd: "ln -s", what: { it: "crea una scorciatoia", en: "create a shortcut" }, flag: { it: "usa sempre percorsi assoluti, o si rompe se sposti il link", en: "always use absolute paths, or it breaks when you move the link" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Nella tua cartella ricrea questo albero: <code>progetto/</code> con dentro
                     <code>src/</code>, <code>docs/</code> e <code>test/</code>.
                     <em>Puoi farle una per una, e va benissimo: il punto è che non serve.</em>`,
                en: `In your folder recreate this tree: <code>progetto/</code> containing
                     <code>src/</code>, <code>docs/</code> and <code>test/</code>.
                     <em>You can make them one by one, and that is fine: the point is that you do
                     not have to.</em>`,
            },
            checks: [
                { id: "albero",
                  why: { it: "<code>mkdir -p</code> accetta più percorsi in una volta e crea i genitori mancanti. Da qui in avanti non scriverai più <code>mkdir</code> senza <code>-p</code>.",
                         en: "<code>mkdir -p</code> takes several paths at once and creates missing parents. From now on you will never write <code>mkdir</code> without <code>-p</code>." },
                  nudge: { it: "<code>ls -R progetto</code> ti mostra l'albero intero e ti dice cosa manca.",
                           en: "<code>ls -R progetto</code> shows you the whole tree and tells you what is missing." } },
            ],
            hints: [
                { it: "<code>mkdir</code> crea una cartella. Ne accetta anche più di una.", en: "<code>mkdir</code> creates a directory. It also accepts more than one." },
                { it: "Senza <code>-p</code>, <code>mkdir progetto/src</code> fallisce se <code>progetto</code> non esiste ancora.", en: "Without <code>-p</code>, <code>mkdir progetto/src</code> fails if <code>progetto</code> does not exist yet." },
                { it: "<code>mkdir -p progetto/src progetto/docs progetto/test</code>", en: "<code>mkdir -p progetto/src progetto/docs progetto/test</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `In <code>~/lab/registri</code> ci sono decine di file <code>.log</code> e
                     <code>.txt</code> mischiati. Sposta <strong>solo i <code>.log</code></strong>
                     dentro <code>~/lab/registri/archivio/</code>. I <code>.txt</code> non si
                     toccano — e la verifica se ne accorge.`,
                en: `In <code>~/lab/registri</code> there are dozens of <code>.log</code> and
                     <code>.txt</code> files mixed together. Move <strong>only the
                     <code>.log</code> ones</strong> into <code>~/lab/registri/archivio/</code>.
                     The <code>.txt</code> files must not be touched — and the check notices.`,
            },
            checks: [
                { id: "log-archiviati",
                  why: { it: "L'asterisco è il primo vero moltiplicatore di forza della shell: una riga fa quello che a mano ne richiederebbe quaranta.",
                         en: "The asterisk is the shell's first real force multiplier: one line does what by hand would take forty." },
                  nudge: { it: "<code>ls ~/lab/registri/*.log</code> ti mostra <em>esattamente</em> su cosa agirebbe il comando. Guardalo prima di spostare.",
                           en: "<code>ls ~/lab/registri/*.log</code> shows you <em>exactly</em> what the command would act on. Look at it before moving." } },
                { id: "txt-intatti",
                  why: { it: "«Ha funzionato» non basta: bisogna sapere di non aver rotto altro. Un comando che fa anche solo un po' più del richiesto, in produzione, è un incidente.",
                         en: "\"It worked\" is not enough: you must know you broke nothing else. A command that does even slightly more than asked is, in production, an incident." },
                  nudge: { it: "Se hai usato <code>mv *</code> hai preso tutto. Il modello giusto è <code>*.log</code>.",
                           en: "If you used <code>mv *</code> you took everything. The right pattern is <code>*.log</code>." } },
            ],
            hints: [
                { it: "La cartella <code>archivio</code> forse non esiste ancora: creala.", en: "The <code>archivio</code> folder may not exist yet: create it." },
                { it: "<code>*.log</code> significa «tutti i nomi che finiscono per .log».", en: "<code>*.log</code> means \"all names ending in .log\"." },
                { it: "<code>cd ~/lab/registri &amp;&amp; mkdir -p archivio &amp;&amp; mv *.log archivio/</code>", en: "<code>cd ~/lab/registri &amp;&amp; mkdir -p archivio &amp;&amp; mv *.log archivio/</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `In <code>~/lab/registri</code> crea un link simbolico chiamato
                     <code>ultimo</code> che punti al file <code>.log</code> modificato più di
                     recente. <strong>Un link, non una copia</strong>: la verifica controlla anche
                     questo.`,
                en: `In <code>~/lab/registri</code> create a symbolic link called
                     <code>ultimo</code> pointing at the most recently modified <code>.log</code>
                     file. <strong>A link, not a copy</strong>: the check tests that too.`,
            },
            checks: [
                { id: "e-un-link",
                  why: { it: "Una copia si sgancia dall'originale nell'istante in cui la fai. Un link resta agganciato: è la differenza fra una fotografia e una finestra.",
                         en: "A copy detaches from the original the moment you make it. A link stays attached: it is the difference between a photograph and a window." },
                  nudge: { it: "<code>ls -l ultimo</code>: se la prima lettera è <code>l</code> è un link, se è <code>-</code> hai fatto una copia.",
                           en: "<code>ls -l ultimo</code>: if the first letter is <code>l</code> it is a link, if it is <code>-</code> you made a copy." } },
                { id: "punta-al-recente",
                  why: { it: "Il file più recente non lo puoi sapere a memoria: cambia a ogni mondo. Devi chiederlo alla macchina.",
                         en: "You cannot know the newest file by heart: it changes with every world. You have to ask the machine." },
                  nudge: { it: "<code>ls -t *.log | head -1</code> ti dà il nome. Poi passalo a <code>ln -s</code>.",
                           en: "<code>ls -t *.log | head -1</code> gives you the name. Then pass it to <code>ln -s</code>." } },
            ],
            hints: [
                { it: "Serve prima sapere <em>quale</em> è il più recente: il capitolo 2 ha l'opzione giusta di <code>ls</code>.", en: "First you need to know <em>which</em> is newest: chapter 2 has the right <code>ls</code> option." },
                { it: "<code>ln -s bersaglio nome-del-link</code> — in quest'ordine.", en: "<code>ln -s target link-name</code> — in that order." },
                { it: "<code>cd ~/lab/registri &amp;&amp; ln -s \"$(ls -t *.log | head -1)\" ultimo</code>", en: "<code>cd ~/lab/registri &amp;&amp; ln -s \"$(ls -t *.log | head -1)\" ultimo</code>" },
            ],
        },
    ],
};
