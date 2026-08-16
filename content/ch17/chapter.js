export default {
    id: "ch17", num: 17, runtime: "local", requires: ["ch11", "ch14"], draft: false,
    title: { it: "systemd", en: "systemd" },
    oneLiner: {
        it: "Chi avvia i servizi, li tiene in piedi e ne raccoglie i log.",
        en: "Who starts services, keeps them up, and collects their logs.",
    },
    commands: ["systemctl start", "systemctl enable", "systemctl status", "journalctl -u", "systemd-analyze", "systemctl list-timers"],
    glossary: ["unit", "target", "journal", "PID 1", "timer"],

    blocks: [
        { kind: "hook", html: {
            it: `Il tuo script funziona. Lo lanci con <code>&amp;</code>, chiudi la sessione, e
                 muore. Lo metti in <code>nohup</code>, e sopravvive — finché la macchina non si
                 riavvia. <strong>Quello che ti serve non è un trucco in più: è qualcuno il cui
                 mestiere è tenere le cose accese.</strong>`,
            en: `Your script works. You launch it with <code>&amp;</code>, close the session, and it
                 dies. You wrap it in <code>nohup</code>, and it survives — until the machine
                 reboots. <strong>What you need is not one more trick: it is somebody whose job is
                 keeping things running.</strong>` } },

        { kind: "local", html: {
            it: `<p><strong>Questo capitolo non gira nel browser, e c'è un motivo tecnico
                 preciso.</strong> systemd vuole essere <em>PID 1</em> — il primo processo, quello
                 che adotta gli orfani e riceve i segnali di spegnimento — e vuole i
                 <em>cgroup</em>, il meccanismo con cui il kernel raggruppa e limita i processi.
                 Nel browser v86 avvia una shell su un kernel che non ha nessuna delle due cose.</p>
                 <p>E c'è un secondo motivo, più semplice: <strong>Alpine non ha systemd</strong>,
                 usa OpenRC. Fin qui hai amministrato una macchina OpenRC senza accorgertene. Da
                 qui in avanti lavori su Debian con systemd, che è quello che troverai sui server.
                 <em>Non è un ripiego: è la differenza fra i due mondi, ed è materia di questo
                 capitolo.</em></p>
                 <p>Il laboratorio è un container Debian con systemd come PID 1. Copia il comando,
                 e in un minuto sei dentro.</p>`,
            en: `<p><strong>This chapter does not run in the browser, and there is a precise
                 technical reason.</strong> systemd wants to be <em>PID 1</em> — the first process,
                 the one that adopts orphans and receives shutdown signals — and it wants
                 <em>cgroups</em>, the kernel mechanism that groups and limits processes. In the
                 browser, v86 starts a shell on a kernel that has neither.</p>
                 <p>And there is a second, simpler reason: <strong>Alpine has no systemd</strong>,
                 it uses OpenRC. Up to now you have been administering an OpenRC machine without
                 noticing. From here on you work on Debian with systemd, which is what you will
                 find on servers. <em>This is not a fallback: it is the difference between the two
                 worlds, and it is this chapter's subject.</em></p>
                 <p>The lab is a Debian container with systemd as PID 1. Copy the command, and in a
                 minute you are inside.</p>`,
            cmd: "git clone https://github.com/manzolo/LinuxLab && cd LinuxLab\n./lab/local/run.sh 17 1\ndocker exec -it linuxlab bash",
        } },

        { kind: "lead", html: {
            it: `Una <strong>unit</strong> è un file di testo che descrive una cosa che il sistema
                 deve gestire: un servizio, un timer, un mount. systemd le legge, le avvia
                 nell'ordine giusto, le riavvia se cadono, e raccoglie tutto quello che stampano.`,
            en: `A <strong>unit</strong> is a text file describing something the system must
                 manage: a service, a timer, a mount. systemd reads them, starts them in the right
                 order, restarts them when they fall over, and collects everything they print.` } },

        { kind: "analogy", html: {
            it: `Il portiere di un condominio. Tu non gli dici «accendi la caldaia adesso»: gli
                 lasci <strong>un foglio di istruzioni</strong> (la unit) che dice cosa accendere,
                 in che ordine, cosa fare se si spegne, e a chi consegnare le lamentele (il
                 journal). Poi lui lavora anche quando tu non ci sei — e soprattutto la mattina
                 dopo il blackout.`,
            en: `A building caretaker. You do not tell them "switch the boiler on now": you leave
                 <strong>a sheet of instructions</strong> (the unit) saying what to switch on, in
                 what order, what to do if it goes out, and where to file complaints (the journal).
                 Then they work when you are not there — and above all the morning after a power
                 cut.` } },

        { kind: "transcript", src: "transcript.json" },

        { kind: "predict",
          domanda: { it: "Una unit ha <code>Restart=always</code>. Dai <code>systemctl stop miaapp</code>. Che succede?",
                     en: "A unit has <code>Restart=always</code>. You run <code>systemctl stop myapp</code>. What happens?" },
          opzioni: [
              { testo: { it: "Si ferma e resta ferma.", en: "It stops and stays stopped." }, giusta: true },
              { testo: { it: "Si ferma e riparte subito, perché Restart=always.", en: "It stops and restarts immediately, because Restart=always." }, giusta: false },
              { testo: { it: "Dà errore: non si può fermare una unit con Restart=always.", en: "It errors: you cannot stop a unit with Restart=always." }, giusta: false },
          ],
          spiegazione: {
              it: `<code>Restart=</code> vale per le uscite <em>non richieste</em>: crash, kill, exit
                   diverso da zero. Uno <code>stop</code> esplicito è una richiesta tua, e systemd
                   la rispetta. È esattamente la distinzione che rende <code>Restart=always</code>
                   sicuro da usare — altrimenti non potresti più fermare niente.`,
              en: `<code>Restart=</code> applies to <em>unrequested</em> exits: crashes, kills,
                   non-zero exits. An explicit <code>stop</code> is your request, and systemd
                   honours it. That distinction is exactly what makes <code>Restart=always</code>
                   safe to use — otherwise you could never stop anything again.` } },

        { kind: "pro", html: {
            it: `<p>Il salto vero rispetto a init è che systemd tiene ogni servizio in un
                 <strong>cgroup</strong>. Non insegue i PID: sa che tutti i processi nati da quel
                 servizio gli appartengono. Per questo <code>systemctl stop</code> ferma anche i
                 figli che il vecchio init si sarebbe lasciato sfuggire, e perché
                 <code>MemoryMax=</code> o <code>CPUQuota=</code> funzionano davvero — sono
                 impostazioni del cgroup, non promesse.</p>
                 <p>La differenza fra <code>start</code> ed <code>enable</code> confonde tutti:
                 <code>start</code> è <em>adesso</em>, <code>enable</code> è <em>al prossimo
                 avvio</em>. Sono indipendenti, e le combinazioni sbagliate producono i due bug
                 classici: il servizio che funziona finché non riavvii, e il servizio che riparte
                 da solo dopo che l'avevi fermato. <code>systemctl enable --now</code> fa
                 entrambe.</p>
                 <p>E i <strong>timer</strong> sono cron fatto meglio: hanno i log nel journal, le
                 dipendenze, <code>Persistent=true</code> (recupera l'esecuzione persa se la
                 macchina era spenta — cosa che cron non sa fare) e
                 <code>RandomizedDelaySec=</code> per non far partire mille macchine allo stesso
                 secondo. In cambio sono due file invece di una riga.</p>`,
            en: `<p>The real leap over init is that systemd keeps every service in a
                 <strong>cgroup</strong>. It does not chase PIDs: it knows every process born from
                 that service belongs to it. That is why <code>systemctl stop</code> also stops
                 the children old init would have let slip, and why <code>MemoryMax=</code> or
                 <code>CPUQuota=</code> actually work — they are cgroup settings, not promises.</p>
                 <p>The difference between <code>start</code> and <code>enable</code> confuses
                 everyone: <code>start</code> is <em>now</em>, <code>enable</code> is <em>at next
                 boot</em>. They are independent, and the wrong combinations produce the two
                 classic bugs: the service that works until you reboot, and the service that comes
                 back on its own after you stopped it. <code>systemctl enable --now</code> does
                 both.</p>
                 <p>And <strong>timers</strong> are cron done better: logs in the journal,
                 dependencies, <code>Persistent=true</code> (catches up a missed run if the machine
                 was off — something cron cannot do) and <code>RandomizedDelaySec=</code> so a
                 thousand machines do not all fire on the same second. The price is two files
                 instead of one line.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Modificare una unit non basta: serve <code>systemctl daemon-reload</code>.</strong> Senza, systemd continua a usare la versione che aveva letto, e tu impazzisci a cercare l'errore in un file già corretto.",
              en: "<strong>Editing a unit is not enough: you need <code>systemctl daemon-reload</code>.</strong> Without it systemd keeps using the version it read, and you go mad looking for a bug in a file you already fixed." },
            { it: "<strong><code>start</code> non è <code>enable</code>.</strong> Un servizio avviato ma non abilitato sparisce al primo riavvio, e nessuno capisce perché «stamattina non c'era».",
              en: "<strong><code>start</code> is not <code>enable</code>.</strong> A started but not enabled service vanishes on the first reboot, and nobody understands why \"it was gone this morning\"." },
            { it: "<strong>Nella unit non c'è una shell.</strong> <code>ExecStart=/usr/bin/mio-comando</code> funziona, ma <code>ExecStart=mio-comando &gt; log</code> no: redirezioni, pipe e variabili non esistono lì. (I percorsi relativi, invece, systemd moderno li risolve da un PATH fisso — non è più l'errore che era una volta.)",
              en: "<strong>There is no shell inside a unit.</strong> <code>ExecStart=/usr/bin/my-command</code> works, but <code>ExecStart=my-command &gt; log</code> does not: redirections, pipes and variables do not exist there. (Relative paths, on the other hand, modern systemd resolves from a fixed PATH — it is no longer the mistake it used to be.)" },
        ] },

        { kind: "recap", table: [
            { cmd: "systemctl status X", what: { it: "come sta, e le ultime righe di log", en: "how it is, plus the last log lines" }, flag: { it: "la prima cosa da guardare, sempre", en: "the first thing to look at, always" } },
            { cmd: "start / stop", what: { it: "adesso", en: "now" }, flag: { it: "non sopravvive al riavvio", en: "does not survive a reboot" } },
            { cmd: "enable / disable", what: { it: "al prossimo avvio", en: "at next boot" }, flag: { it: "<code>enable --now</code> fa tutte e due", en: "<code>enable --now</code> does both" } },
            { cmd: "daemon-reload", what: { it: "rileggi i file delle unit", en: "re-read the unit files" }, flag: { it: "dopo ogni modifica. Sempre.", en: "after every edit. Always." } },
            { cmd: "journalctl -u X", what: { it: "i log di quel servizio", en: "that service's logs" }, flag: { it: "<code>-f</code> in diretta, <code>--since '1 hour ago'</code>", en: "<code>-f</code> live, <code>--since '1 hour ago'</code>" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Trasforma uno script in un servizio vero. Crea la unit
                     <code>vigile.service</code> che esegue <code>/usr/local/bin/vigile.sh</code>,
                     <strong>abilitala</strong> e <strong>avviala</strong>. Deve risultare sia
                     <em>attiva</em> sia <em>abilitata all'avvio</em>.`,
                en: `Turn a script into a real service. Create the unit
                     <code>vigile.service</code> running <code>/usr/local/bin/vigile.sh</code>,
                     <strong>enable</strong> it and <strong>start</strong> it. It must end up both
                     <em>active</em> and <em>enabled at boot</em>.`,
            },
            checks: [
                { id: "unit-esiste",
                  why: { it: "Una unit è solo un file di testo in <code>/etc/systemd/system/</code>. Niente magia: tre sezioni e cinque righe.",
                         en: "A unit is just a text file in <code>/etc/systemd/system/</code>. No magic: three sections and five lines." },
                  nudge: { it: "<code>systemctl cat vigile</code> ti mostra cosa systemd sta leggendo davvero. Se dice «No files found», il file non è dove pensi.",
                           en: "<code>systemctl cat vigile</code> shows what systemd is actually reading. If it says \"No files found\", the file is not where you think." } },
                { id: "attiva",
                  why: { it: "<code>start</code> è adesso. Se fallisce, <code>systemctl status</code> ti dà la riga che dice perché — quasi sempre un percorso relativo o un permesso mancante.",
                         en: "<code>start</code> is now. If it fails, <code>systemctl status</code> gives you the line saying why — almost always a relative path or a missing permission." },
                  nudge: { it: "<code>systemctl status vigile</code> e poi <code>journalctl -u vigile -n 20</code>: la causa è lì dentro.",
                           en: "<code>systemctl status vigile</code> then <code>journalctl -u vigile -n 20</code>: the cause is in there." } },
                { id: "abilitata",
                  why: { it: "<code>enable</code> è al prossimo avvio. Un servizio avviato ma non abilitato è il bug che si scopre solo dopo un riavvio, di solito nel momento peggiore.",
                         en: "<code>enable</code> is at next boot. A started-but-not-enabled service is the bug you only find after a reboot, usually at the worst moment." },
                  nudge: { it: "<code>systemctl is-enabled vigile</code> deve rispondere <code>enabled</code>. Serve una sezione <code>[Install]</code> nella unit, altrimenti non si può abilitare.",
                           en: "<code>systemctl is-enabled vigile</code> must answer <code>enabled</code>. The unit needs an <code>[Install]</code> section, otherwise it cannot be enabled." } },
            ],
            hints: [
                { it: "Il file va in <code>/etc/systemd/system/vigile.service</code>, e servono le sezioni <code>[Unit]</code>, <code>[Service]</code>, <code>[Install]</code>.", en: "The file goes in <code>/etc/systemd/system/vigile.service</code>, and needs the <code>[Unit]</code>, <code>[Service]</code>, <code>[Install]</code> sections." },
                { it: "Dopo aver scritto il file serve <code>systemctl daemon-reload</code>. Poi <code>enable --now</code> fa avvio e abilitazione insieme.", en: "After writing the file you need <code>systemctl daemon-reload</code>. Then <code>enable --now</code> does start and enable together." },
                { it: "<code>[Unit]</code> Description=… · <code>[Service]</code> ExecStart=/usr/local/bin/vigile.sh · <code>[Install]</code> WantedBy=multi-user.target — poi <code>systemctl daemon-reload &amp;&amp; systemctl enable --now vigile</code>", en: "<code>[Unit]</code> Description=… · <code>[Service]</code> ExecStart=/usr/local/bin/vigile.sh · <code>[Install]</code> WantedBy=multi-user.target — then <code>systemctl daemon-reload &amp;&amp; systemctl enable --now vigile</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Il servizio <code>fragile.service</code> è già installato e
                     <strong>non parte</strong>. Non ti diciamo perché: la risposta è in una riga
                     sola dei suoi log. Trovala e ripara la unit, finché il servizio non risulta
                     attivo.`,
                en: `The service <code>fragile.service</code> is already installed and
                     <strong>will not start</strong>. We are not telling you why: the answer is in
                     a single line of its logs. Find it and fix the unit, until the service is
                     active.`,
            },
            checks: [
                { id: "fragile-attiva",
                  why: { it: "Questo è il mestiere: non indovinare, leggere. <code>systemctl status</code> dice <em>cosa</em>, <code>journalctl -u</code> dice <em>perché</em>, e la riga che serve è quasi sempre l'ultima prima del fallimento.",
                         en: "This is the job: do not guess, read. <code>systemctl status</code> says <em>what</em>, <code>journalctl -u</code> says <em>why</em>, and the line you need is almost always the last one before the failure." },
                  nudge: { it: "<code>journalctl -u fragile -n 30 --no-pager</code>. Cerca la riga con <code>status=203/EXEC</code>: vuol dire che systemd ha trovato il file ma non è riuscito a eseguirlo.",
                           en: "<code>journalctl -u fragile -n 30 --no-pager</code>. Look for the line with <code>status=203/EXEC</code>: it means systemd found the file but could not execute it." } },
            ],
            hints: [
                { it: "<code>systemctl status fragile</code> per prima cosa: guarda la riga <code>Active:</code> e quelle sotto.", en: "<code>systemctl status fragile</code> first: look at the <code>Active:</code> line and those below." },
                { it: "Nel journal cerca il codice di uscita. <code>203/EXEC</code> significa «trovato ma non eseguibile»; <code>200/CHDIR</code>, <code>1</code> e gli altri raccontano storie diverse.", en: "In the journal, look for the exit code. <code>203/EXEC</code> means \"found but not executable\"; <code>200/CHDIR</code>, <code>1</code> and the others tell different stories." },
                { it: "È il capitolo 6 che ritorna: <code>chmod 755 /usr/local/bin/fragile.sh</code>, poi <code>systemctl restart fragile</code>.", en: "Chapter 6 returning: <code>chmod 755 /usr/local/bin/fragile.sh</code>, then <code>systemctl restart fragile</code>." },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Sostituisci il cron del capitolo 14 con un <strong>timer systemd</strong>.
                     Crea <code>backup.service</code> (di tipo <code>oneshot</code>) e
                     <code>backup.timer</code> che lo esegue <strong>ogni giorno alle 3:30</strong>,
                     e abilita il timer. <em>La verifica guarda il valore di
                     <code>OnCalendar</code> come lo interpreta systemd, non come l'hai
                     scritto.</em>`,
                en: `Replace chapter 14's cron with a <strong>systemd timer</strong>. Create
                     <code>backup.service</code> (type <code>oneshot</code>) and
                     <code>backup.timer</code> running it <strong>every day at 3:30</strong>, and
                     enable the timer. <em>The check reads <code>OnCalendar</code> as systemd
                     interprets it, not as you typed it.</em>`,
            },
            checks: [
                { id: "servizio-oneshot",
                  why: { it: "Un timer punta a un servizio: se il servizio non c'è, il timer si abilita lo stesso e alle 3:30 non succede niente. <code>Type=oneshot</code> dice a systemd che quel servizio <em>deve</em> finire — non è un demone che resta acceso.",
                         en: "A timer points at a service: if the service is missing, the timer still enables and at 3:30 nothing happens. <code>Type=oneshot</code> tells systemd that this service <em>is meant</em> to finish — it is not a daemon that stays up." },
                  nudge: { it: "<code>systemctl show backup.service -p LoadState -p Type</code> dice se systemd lo vede e come lo considera.",
                           en: "<code>systemctl show backup.service -p LoadState -p Type</code> says whether systemd sees it and how it treats it." } },
                { id: "timer-attivo",
                  why: { it: "Un timer si abilita come un servizio, ma quello che si abilita è il <code>.timer</code>, non il <code>.service</code>. È l'errore più comune del capitolo.",
                         en: "A timer is enabled like a service, but what you enable is the <code>.timer</code>, not the <code>.service</code>. It is this chapter's most common mistake." },
                  nudge: { it: "<code>systemctl list-timers --all</code> ti mostra i timer e quando scattano. Se il tuo non c'è, non è abilitato.",
                           en: "<code>systemctl list-timers --all</code> shows timers and when they fire. If yours is missing, it is not enabled." } },
                { id: "orario-giusto",
                  why: { it: "<code>OnCalendar=*-*-* 03:30:00</code> e <code>OnCalendar=daily</code> non sono la stessa cosa: il secondo scatta a mezzanotte. La verifica chiede a systemd quando scatterà davvero.",
                         en: "<code>OnCalendar=*-*-* 03:30:00</code> and <code>OnCalendar=daily</code> are not the same: the latter fires at midnight. The check asks systemd when it will really fire." },
                  nudge: { it: "<code>systemd-analyze calendar '*-*-* 03:30:00'</code> ti dice come systemd interpreta quello che hai scritto, prima ancora di installarlo.",
                           en: "<code>systemd-analyze calendar '*-*-* 03:30:00'</code> tells you how systemd reads what you wrote, before you even install it." } },
            ],
            hints: [
                { it: "Servono due file: <code>backup.service</code> con <code>Type=oneshot</code>, e <code>backup.timer</code> con la sezione <code>[Timer]</code>.", en: "You need two files: <code>backup.service</code> with <code>Type=oneshot</code>, and <code>backup.timer</code> with a <code>[Timer]</code> section." },
                { it: "Nel timer: <code>OnCalendar=*-*-* 03:30:00</code> e <code>[Install] WantedBy=timers.target</code>.", en: "In the timer: <code>OnCalendar=*-*-* 03:30:00</code> and <code>[Install] WantedBy=timers.target</code>." },
                { it: "<code>systemctl daemon-reload &amp;&amp; systemctl enable --now backup.timer</code> — si abilita il <em>timer</em>, non il service.", en: "<code>systemctl daemon-reload &amp;&amp; systemctl enable --now backup.timer</code> — you enable the <em>timer</em>, not the service." },
            ],
        },
    ],
};
