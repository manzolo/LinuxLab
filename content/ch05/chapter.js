export default {
    id: "ch05", num: 5, runtime: "browser", requires: ["ch04"], draft: false,
    title: { it: "Il filesystem: /etc, /var, /proc", en: "The filesystem: /etc, /var, /proc" },
    oneLiner: {
        it: "Ogni cosa ha il suo posto — e /proc non è nemmeno sul disco.",
        en: "Everything has its place — and /proc is not even on the disk.",
    },
    commands: ["ls /", "cat /etc/os-release", "cat /proc/cpuinfo", "df -h", "du -sh"],
    glossary: ["FHS", "radice", "mount", "pseudo-filesystem"],

    blocks: [
        { kind: "hook", html: {
            it: `Entri su un server che non hai mai visto. Non sai che distribuzione sia, quanti
                 processori abbia, dove scriva i log. <strong>Tre file te lo dicono</strong>, e due
                 di quei tre non esistono su nessun disco.`,
            en: `You log into a server you have never seen. You do not know which distribution it
                 runs, how many processors it has, where it writes its logs. <strong>Three files
                 tell you</strong>, and two of those three exist on no disk at all.` } },

        { kind: "lead", html: {
            it: `Su Linux le cartelle di primo livello non sono una scelta di gusto: seguono uno
                 standard (il <em>FHS</em>). Impararle una volta significa sapersi orientare su
                 qualunque macchina, per sempre.`,
            en: `On Linux the top-level directories are not a matter of taste: they follow a
                 standard (the <em>FHS</em>). Learning them once means being able to find your way
                 on any machine, forever.` } },

        { kind: "analogy", html: {
            it: `Pensa a un ospedale. <code>/etc</code> è la bacheca dei regolamenti,
                 <code>/var</code> è l'archivio che si gonfia ogni giorno, <code>/usr</code> è il
                 magazzino degli strumenti, <code>/home</code> sono gli armadietti del personale,
                 <code>/tmp</code> è il tavolo che ogni notte viene sgombrato. E
                 <code>/proc</code>? <code>/proc</code> è il monitor attaccato al paziente: non
                 contiene niente, <strong>mostra</strong>. Se lo leggi due volte, ti dà due
                 risposte diverse.`,
            en: `Think of a hospital. <code>/etc</code> is the noticeboard with the rules,
                 <code>/var</code> is the archive that swells every day, <code>/usr</code> is the
                 tool store, <code>/home</code> are the staff lockers, <code>/tmp</code> is the
                 table cleared every night. And <code>/proc</code>? <code>/proc</code> is the
                 monitor attached to the patient: it contains nothing, it <strong>shows</strong>.
                 Read it twice and it gives you two different answers.` } },

        { kind: "shown", lines: [
            { cmd: "cat /etc/os-release | head -3", out: 'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.21.0',
              note: { it: "Il primo file da leggere su una macchina sconosciuta. Esiste su tutte le distribuzioni moderne, con le stesse chiavi.",
                      en: "The first file to read on an unknown machine. It exists on every modern distribution, with the same keys." } },
            { cmd: "grep -c processor /proc/cpuinfo", out: "1",
              note: { it: "<code>/proc/cpuinfo</code> non sta sul disco: lo produce il kernel <em>nell'istante</em> in cui lo leggi.",
                      en: "<code>/proc/cpuinfo</code> is not on disk: the kernel produces it <em>the instant</em> you read it." } },
            { cmd: "ls -l /proc/self/cwd", out: "lrwxrwxrwx 1 root root 0 Mar 14 09:12 /proc/self/cwd -> /root/lab",
              note: { it: "Ogni processo ha una cartella in <code>/proc</code> con il suo stato. Questo link dice in che directory si trova.",
                      en: "Every process has a directory in <code>/proc</code> holding its state. This link says which directory it is in." } },
            { cmd: "df -h /", out: "Filesystem  Size  Used Avail Use% Mounted on\nhost9p       —     —     —    —  /",
              note: { it: "<code>df</code> risponde a «quanto spazio resta». Qui il disco è servito dal browser, quindi le colonne sono particolari.",
                      en: "<code>df</code> answers \"how much space is left\". Here the disk is served by the browser, so the columns look odd." } },
            { cmd: "du -sh /etc /var", out: "1.4M    /etc\n2.3M    /var",
              note: { it: "<code>du</code> risponde a «chi si sta mangiando lo spazio». Sono due comandi diversi per due domande diverse: nel capitolo 13 tornano.",
                      en: "<code>du</code> answers \"who is eating the space\". Two different commands for two different questions: they return in chapter 13." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p><code>/proc</code> e <code>/sys</code> sono <em>pseudo-filesystem</em>: non
                 hanno un blocco su disco, e ogni <code>read()</code> viene servita da una
                 funzione del kernel. Per questo hanno dimensione zero
                 (<code>ls -l /proc/cpuinfo</code> dice <code>0</code>) eppure contengono
                 qualcosa: la dimensione non è nota finché non li leggi.</p>
                 <p>La conseguenza pratica che sorprende tutti: <strong>non si possono cercare con
                 <code>find -size</code></strong>, e un <code>du -sh /</code> onesto deve
                 escluderli. È anche il motivo per cui <code>grep -r</code> lanciato da
                 <code>/</code> può girare all'infinito: <code>/proc</code> contiene link che
                 rimandano dentro sé stessi.</p>
                 <p>Il gemello scrivibile è <code>/sys</code>: lì un <code>echo</code> dentro un
                 file <em>cambia il comportamento del kernel</em>. Cambiare il governor della CPU
                 è una <code>echo</code> in un file. Non è una metafora — è letteralmente come si
                 fa.</p>`,
            en: `<p><code>/proc</code> and <code>/sys</code> are <em>pseudo-filesystems</em>: they
                 have no block on disk, and every <code>read()</code> is served by a kernel
                 function. That is why they have size zero (<code>ls -l /proc/cpuinfo</code> says
                 <code>0</code>) and yet contain something: the size is not known until you read
                 them.</p>
                 <p>The practical consequence that surprises everyone: <strong>you cannot find
                 them with <code>find -size</code></strong>, and an honest <code>du -sh /</code>
                 must exclude them. It is also why <code>grep -r</code> started from
                 <code>/</code> can run forever: <code>/proc</code> holds links that point back
                 into itself.</p>
                 <p>Its writable twin is <code>/sys</code>: there an <code>echo</code> into a file
                 <em>changes kernel behaviour</em>. Changing the CPU governor is one
                 <code>echo</code> into a file. That is not a metaphor — it is literally how it is
                 done.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>/etc</code> è configurazione, <code>/var</code> è roba che cresce.</strong> Se metti i dati di un sito in <code>/etc</code> il backup della configurazione diventa enorme e quello dei dati non c'è.",
              en: "<strong><code>/etc</code> is configuration, <code>/var</code> is stuff that grows.</strong> Put a site's data in <code>/etc</code> and your config backup becomes huge while your data backup does not exist." },
            { it: "<strong><code>/tmp</code> viene svuotato.</strong> Non a caso: al riavvio, o dopo qualche giorno. Non è un posto dove lasciare qualcosa che ti serve domani.",
              en: "<strong><code>/tmp</code> gets emptied.</strong> Not by accident: on reboot, or after a few days. It is not a place to leave something you need tomorrow." },
            { it: "<strong>Non c'è nessun <code>C:</code>.</strong> Anche un secondo disco appare come una cartella dentro l'albero unico, per esempio <code>/mnt/dati</code>. Non ci sono alberi separati.",
              en: "<strong>There is no <code>C:</code>.</strong> Even a second disk shows up as a folder inside the single tree, say <code>/mnt/data</code>. There are no separate trees." },
        ] },

        { kind: "recap", table: [
            { cmd: "/etc", what: { it: "configurazione del sistema", en: "system configuration" }, flag: { it: "in gran parte testo; esistono eccezioni", en: "mostly text; exceptions exist" } },
            { cmd: "/var", what: { it: "roba che cresce: log, code, cache", en: "things that grow: logs, queues, caches" }, flag: { it: "<code>/var/log</code> è il primo posto dove guardare", en: "<code>/var/log</code> is the first place to look" } },
            { cmd: "/usr", what: { it: "programmi e librerie", en: "programs and libraries" }, flag: { it: "<code>/usr/bin</code> quasi tutti i comandi", en: "<code>/usr/bin</code> almost every command" } },
            { cmd: "/home", what: { it: "le cartelle degli utenti", en: "user directories" }, flag: { it: "la tua è <code>~</code>", en: "yours is <code>~</code>" } },
            { cmd: "/proc", what: { it: "lo stato del kernel, in diretta", en: "kernel state, live" }, flag: { it: "non è su disco: leggerlo è chiedere", en: "not on disk: reading it is asking" } },
            { cmd: "df / du", what: { it: "quanto resta / chi lo occupa", en: "how much is left / who takes it" }, flag: { it: "<code>-h</code> misure leggibili da un umano", en: "<code>-h</code> human-readable sizes" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `Che distribuzione e che versione sta girando qui? Consegna l'identificativo
                     breve e la versione uniti da un trattino, per esempio
                     <code>debian-12</code>.`,
                en: `Which distribution and version is running here? Hand in the short id and the
                     version joined by a dash, for example <code>debian-12</code>.`,
            },
            checks: [
                { id: "distro",
                  why: { it: "Prima di installare qualsiasi cosa devi sapere dove sei: il gestore di pacchetti, i percorsi e i nomi dei servizi cambiano da distribuzione a distribuzione.",
                         en: "Before installing anything you must know where you are: the package manager, the paths and the service names differ between distributions." },
                  nudge: { it: "<code>cat /etc/os-release</code>: cerca le righe <code>ID=</code> e <code>VERSION_ID=</code>.",
                           en: "<code>cat /etc/os-release</code>: look for the <code>ID=</code> and <code>VERSION_ID=</code> lines." } },
            ],
            hints: [
                { it: "Il file che descrive la distribuzione sta in <code>/etc</code> e si chiama <code>os-release</code>.", en: "The file describing the distribution is in <code>/etc</code> and is called <code>os-release</code>." },
                { it: "Ti servono i valori di <code>ID</code> e <code>VERSION_ID</code>, uniti da un trattino.", en: "You need the values of <code>ID</code> and <code>VERSION_ID</code>, joined by a dash." },
                { it: "Leggi i due valori con <code>cat /etc/os-release</code>, uniscili tu con un trattino e consegnali con <code>lab answer valore-valore</code>.", en: "Read both values with <code>cat /etc/os-release</code>, join them yourself with a dash, and submit with <code>lab answer value-value</code>." },
            ],
        },
        {
            id: "e2", tipo: "risposta",
            brief: {
                it: `Quanti processori vede il kernel? Consegna il numero.
                     <em>La risposta sta in un file che non esiste su nessun disco.</em>`,
                en: `How many processors does the kernel see? Hand in the number.
                     <em>The answer lives in a file that exists on no disk.</em>`,
            },
            checks: [
                { id: "core",
                  why: { it: "È il primo file di <code>/proc</code> che leggerai, e serve a capire il concetto: quel file non è memorizzato, è <em>generato</em> mentre lo leggi.",
                         en: "It is the first <code>/proc</code> file you will read, and it exists to make the point: that file is not stored, it is <em>generated</em> as you read it." },
                  nudge: { it: "In <code>/proc/cpuinfo</code> c'è una riga <code>processor</code> per ogni CPU logica visibile (i thread hardware contano separatamente). <code>grep -c</code> conta le righe che corrispondono.",
                           en: "In <code>/proc/cpuinfo</code> there is one <code>processor</code> line per visible logical CPU (hardware threads count separately). <code>grep -c</code> counts matching lines." } },
            ],
            hints: [
                { it: "Guarda dentro <code>/proc/cpuinfo</code>.", en: "Look inside <code>/proc/cpuinfo</code>." },
                { it: "Ogni CPU logica ha la sua riga che comincia con <code>processor</code>.", en: "Each logical CPU has its own line starting with <code>processor</code>." },
                { it: "<code>grep -c ^processor /proc/cpuinfo | lab answer</code>", en: "<code>grep -c ^processor /proc/cpuinfo | lab answer</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `In <code>~/lab/smistare</code> ci sono sei file finiti nel posto sbagliato.
                     Sotto <code>~/lab/radice</code> trovi un finto albero di sistema
                     (<code>etc bin var/log var/www home tmp</code>): <strong>mettili dove
                     andrebbero su una macchina vera</strong>. Il nome di ogni file ti dice cos'è.`,
                en: `In <code>~/lab/smistare</code> there are six files in the wrong place. Under
                     <code>~/lab/radice</code> there is a fake system tree
                     (<code>etc bin var/log var/www home tmp</code>): <strong>put them where they
                     would go on a real machine</strong>. Each file's name tells you what it is.`,
            },
            checks: [
                { id: "config-in-etc",
                  why: { it: "Una configurazione va in <code>/etc</code> perché è lì che si cerca, è lì che si fa il backup e è lì che ci si aspetta di trovarla fra due anni.",
                         en: "Configuration goes in <code>/etc</code> because that is where you look for it, where you back it up, and where you expect to find it in two years." },
                  nudge: { it: "<code>ls -R ~/lab/radice</code> ti fa vedere l'albero e cosa hai già messo dove.",
                           en: "<code>ls -R ~/lab/radice</code> shows you the tree and what you have already placed where." } },
                { id: "log-in-var",
                  why: { it: "I log crescono: se stanno in <code>/etc</code> o in <code>/usr</code> prima o poi riempiono una partizione che nessuno controlla.",
                         en: "Logs grow: if they live in <code>/etc</code> or <code>/usr</code> they will eventually fill a partition nobody watches." },
                  nudge: { it: "Tutto ciò che si gonfia col tempo appartiene a <code>/var</code>.",
                           en: "Everything that swells over time belongs in <code>/var</code>." } },
                { id: "sito-in-var-www",
                  why: { it: "I dati serviti da un sito non sono né configurazione né programmi: sono dati variabili, e per convenzione stanno in <code>/var/www</code>.",
                         en: "Data served by a site is neither configuration nor programs: it is variable data, and by convention lives in <code>/var/www</code>." },
                  nudge: { it: "Un <code>index.html</code> non è un programma: non va in <code>bin</code>.",
                           en: "An <code>index.html</code> is not a program: it does not go in <code>bin</code>." } },
                { id: "binario-in-bin",
                  why: { it: "Un eseguibile va dove il <code>PATH</code> lo cerca. Se lo metti altrove funziona solo scrivendo il percorso intero, ogni volta.",
                         en: "An executable goes where <code>PATH</code> looks for it. Put it elsewhere and it only works by typing the full path, every time." },
                  nudge: { it: "Guarda il permesso di esecuzione con <code>ls -l</code>: quello che ha la <code>x</code> è un programma.",
                           en: "Check the execute permission with <code>ls -l</code>: the one with <code>x</code> is a program." } },
                { id: "temporaneo-in-tmp",
                  why: { it: "Un file di cui non ti importa domani va in <code>/tmp</code>, così qualcun altro lo cancella per te.",
                         en: "A file you will not care about tomorrow goes in <code>/tmp</code>, so somebody else deletes it for you." },
                  nudge: { it: "Il nome contiene <code>tmp</code> o <code>scratch</code>: è un indizio, non un caso.",
                           en: "The name contains <code>tmp</code> or <code>scratch</code>: that is a hint, not a coincidence." } },
                { id: "personale-in-home",
                  why: { it: "La roba di una persona sta nella sua home: è l'unico posto che le appartiene davvero, e l'unico che il backup degli utenti prende.",
                         en: "A person's stuff lives in their home: it is the only place that truly belongs to them, and the only one the user backup takes." },
                  nudge: { it: "Una lettera, delle foto, degli appunti: non sono roba di sistema.",
                           en: "A letter, some photos, some notes: that is not system material." } },
            ],
            hints: [
                { it: "Guarda i nomi: <code>.conf</code>, <code>.log</code>, <code>index.html</code>, un eseguibile, un file temporaneo, degli appunti personali.", en: "Look at the names: <code>.conf</code>, <code>.log</code>, <code>index.html</code>, an executable, a temporary file, personal notes." },
                { it: "Le destinazioni sono <code>etc</code>, <code>var/log</code>, <code>var/www</code>, <code>bin</code>, <code>tmp</code>, <code>home</code>.", en: "The destinations are <code>etc</code>, <code>var/log</code>, <code>var/www</code>, <code>bin</code>, <code>tmp</code>, <code>home</code>." },
                { it: "<code>cd ~/lab/smistare &amp;&amp; mv *.conf ../radice/etc/ &amp;&amp; mv *.log ../radice/var/log/ &amp;&amp; mv index.html ../radice/var/www/</code> — e così per gli altri tre.", en: "<code>cd ~/lab/smistare &amp;&amp; mv *.conf ../radice/etc/ &amp;&amp; mv *.log ../radice/var/log/ &amp;&amp; mv index.html ../radice/var/www/</code> — and so on for the other three." },
            ],
        },
    ],
};
