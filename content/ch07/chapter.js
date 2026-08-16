export default {
    id: "ch07", num: 7, runtime: "browser", requires: ["ch06"], draft: false,
    title: { it: "Utenti, gruppi, sudo", en: "Users, groups, sudo" },
    oneLiner: {
        it: "L'identità è un numero, e sudo è un file di testo.",
        en: "Identity is a number, and sudo is a text file.",
    },
    commands: ["id", "groups", "addgroup", "adduser", "getent", "su", "sudo", "sudo -l", "visudo"],
    glossary: ["UID", "GID", "nologin", "sudoers", "minimo privilegio"],

    blocks: [
        { kind: "hook", html: {
            it: `Un tirocinante deve poter riavviare <em>un</em> servizio. La soluzione veloce è
                 dargli <code>sudo</code> su tutto. La soluzione giusta è <strong>una riga di
                 testo</strong> che gli permette quel comando e nient'altro — e ci vuole lo
                 stesso tempo.`,
            en: `An intern needs to restart <em>one</em> service. The quick fix is to give them
                 <code>sudo</code> over everything. The right fix is <strong>one line of
                 text</strong> that allows that command and nothing else — and it takes just as
                 long.` } },

        { kind: "lead", html: {
            it: `Per il kernel non esistono nomi: esistono <strong>numeri</strong>. Il nome
                 <em>anna</em> è solo una comodità scritta in <code>/etc/passwd</code>. Capito
                 questo, diventa chiaro perché un file copiato da un'altra macchina può risultare
                 di proprietà di uno sconosciuto.`,
            en: `For the kernel there are no names: there are <strong>numbers</strong>. The name
                 <em>anna</em> is just a convenience written in <code>/etc/passwd</code>. Once you
                 get that, it becomes clear why a file copied from another machine can end up
                 owned by a stranger.` } },

        { kind: "analogy", html: {
            it: `Il tesserino aziendale ha un numero di matricola (l'<strong>UID</strong>) e dà
                 accesso a certi reparti (i <strong>gruppi</strong>). Il nome stampato sopra serve
                 solo agli umani. E <code>sudo</code> non è "diventare il capo": è
                 <strong>un elenco affisso</strong> che dice chi può fare cosa, controfirmato.`,
            en: `A company badge has a payroll number (the <strong>UID</strong>) and opens certain
                 departments (the <strong>groups</strong>). The name printed on it is only for
                 humans. And <code>sudo</code> is not "becoming the boss": it is <strong>a posted
                 list</strong> saying who may do what, countersigned.` } },

        { kind: "shown", lines: [
            { cmd: "id", out: "uid=0(root) gid=0(root) groups=0(root)",
              note: { it: "Chi sei <em>per il kernel</em>. L'UID 0 è root, ed è speciale non per il nome ma per il numero.",
                      en: "Who you are <em>to the kernel</em>. UID 0 is root, and it is special not because of the name but because of the number." } },
            { cmd: "getent passwd www-data", out: "www-data:x:82:82:Linux User,,,:/var/www:/sbin/nologin",
              note: { it: "Sette campi separati da <code>:</code>. L'ultimo è la shell: <code>/sbin/nologin</code> significa <strong>questo utente esiste ma non può entrare</strong>. È normale, e voluto: serve a far girare un servizio senza dargli un accesso.",
                      en: "Seven colon-separated fields. The last is the shell: <code>/sbin/nologin</code> means <strong>this user exists but cannot log in</strong>. That is normal and deliberate: it runs a service without granting it a login." } },
            { cmd: "addgroup web", out: "",
              note: { it: "Il gruppo va creato <strong>prima</strong> dell'utente: <code>adduser -G web</code> fallisce se <code>web</code> non esiste ancora. Nessun messaggio significa che è andata bene — nel terminale il silenzio è una buona notizia.",
                      en: "The group must exist <strong>before</strong> the user: <code>adduser -G web</code> fails if <code>web</code> is not there yet. No message means it worked — in a terminal, silence is good news." } },
            { cmd: "adduser -D -G web deploy", out: "",
              note: { it: "<code>-D</code> non chiede la password, <code>-G</code> mette nel gruppo. Su Debian e derivate lo stesso lavoro lo fa <code>useradd -m -G web deploy</code>.",
                      en: "<code>-D</code> asks no password, <code>-G</code> puts them in the group. On Debian and derivatives the same job is done by <code>useradd -m -G web deploy</code>." } },
            { cmd: "sudo -l -U deploy", out: "User deploy may run the following commands:\n    (root) NOPASSWD: /sbin/service nginx restart",
              note: { it: "Questa è la domanda giusta: non «cosa c'è scritto nel file», ma <strong>cosa può fare davvero questo utente</strong>. È anche il modo giusto di verificarlo.",
                      en: "This is the right question: not \"what does the file say\", but <strong>what can this user actually do</strong>. It is also the right way to verify it." } },
            { cmd: "visudo -c", out: "/etc/sudoers: parsed OK\n/etc/sudoers.d/deploy: parsed OK",
              note: { it: "Un <code>sudoers</code> con un errore di sintassi può bloccare <code>sudo</code> per <em>tutti</em>. Questo comando controlla prima che sia troppo tardi.",
                      en: "A <code>sudoers</code> with a syntax error can lock <code>sudo</code> for <em>everyone</em>. This command checks before it is too late." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>I permessi non guardano il nome: guardano l'UID. Se copi un disco da una
                 macchina dove <em>anna</em> è 1001 a una dove 1001 è <em>marco</em>, i file
                 diventano di marco. Non è un bug: è l'unica cosa coerente che il kernel possa
                 fare, perché sul disco è scritto <code>1001</code>, non <code>anna</code>.</p>
                 <p><code>su</code> e <code>sudo</code> non sono varianti dello stesso comando:
                 <code>su</code> chiede la password <em>di destinazione</em> e ti dà tutto,
                 <code>sudo</code> chiede la <em>tua</em> e ti dà solo ciò che l'elenco permette —
                 registrandolo. Per questo <code>sudo</code> è tracciabile e revocabile per singola
                 persona, e <code>su</code> no: la password di root, una volta condivisa, non si
                 può più togliere a uno solo.</p>
                 <p>E la regola operativa che conta: le regole personalizzate vanno in file dentro
                 <code>/etc/sudoers.d/</code>, non dentro <code>/etc/sudoers</code>. Così un
                 aggiornamento del pacchetto non le sovrascrive, e togliere un permesso è
                 cancellare un file invece di rieditare a mano un testo condiviso.</p>`,
            en: `<p>Permissions do not look at the name: they look at the UID. Copy a disk from a
                 machine where <em>anna</em> is 1001 to one where 1001 is <em>marco</em>, and the
                 files become marco's. That is not a bug: it is the only coherent thing the kernel
                 can do, because what is written on the disk is <code>1001</code>, not
                 <code>anna</code>.</p>
                 <p><code>su</code> and <code>sudo</code> are not variants of one command:
                 <code>su</code> asks for the <em>target's</em> password and gives you everything,
                 <code>sudo</code> asks for <em>yours</em> and gives you only what the list allows
                 — while logging it. That is why <code>sudo</code> is traceable and revocable per
                 person, and <code>su</code> is not: a root password, once shared, cannot be taken
                 back from one person only.</p>
                 <p>And the operational rule that matters: custom rules go into files under
                 <code>/etc/sudoers.d/</code>, not into <code>/etc/sudoers</code>. That way a
                 package upgrade does not overwrite them, and removing a permission means deleting
                 a file instead of hand-editing a shared text.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Modificare <code>/etc/sudoers</code> con un editor normale è un rischio reale.</strong> Un errore di sintassi e nessuno può più usare <code>sudo</code>, compreso te. <code>visudo</code> controlla prima di salvare.",
              en: "<strong>Editing <code>/etc/sudoers</code> with a plain editor is a real risk.</strong> One syntax error and nobody can use <code>sudo</code> any more, you included. <code>visudo</code> checks before saving." },
            { it: "<strong>Aggiungere un utente a un gruppo non ha effetto sulle sessioni già aperte.</strong> I gruppi si leggono al login: bisogna uscire e rientrare, non è un guasto.",
              en: "<strong>Adding a user to a group has no effect on already-open sessions.</strong> Groups are read at login: you must log out and back in, it is not a fault." },
            { it: "<strong><code>NOPASSWD: ALL</code> è <code>su</code> travestito.</strong> Se metti quello, hai buttato via tutto il vantaggio di sudo tenendone la complicazione.",
              en: "<strong><code>NOPASSWD: ALL</code> is <code>su</code> in disguise.</strong> Write that and you have thrown away all of sudo's benefit while keeping its complication." },
        ] },

        { kind: "recap", table: [
            { cmd: "id", what: { it: "chi sono per il kernel", en: "who I am to the kernel" }, flag: { it: "<code>id nome</code> per chiedere di un altro", en: "<code>id name</code> to ask about someone else" } },
            { cmd: "getent passwd", what: { it: "l'anagrafica degli utenti", en: "the user directory" }, flag: { it: "meglio di <code>cat /etc/passwd</code>: vede anche LDAP", en: "better than <code>cat /etc/passwd</code>: it also sees LDAP" } },
            { cmd: "addgroup", what: { it: "crea un gruppo", en: "create a group" }, flag: { it: "va fatto <strong>prima</strong> dell'utente che ci va dentro", en: "must come <strong>before</strong> the user who joins it" } },
            { cmd: "adduser", what: { it: "crea un utente", en: "create a user" }, flag: { it: "<code>-D</code> senza password, <code>-G</code> gruppo", en: "<code>-D</code> no password, <code>-G</code> group" } },
            { cmd: "sudo -l", what: { it: "cosa posso fare davvero", en: "what can I actually do" }, flag: { it: "<code>-U utente</code> per chiederlo di un altro", en: "<code>-U user</code> to ask about someone else" } },
            { cmd: "visudo", what: { it: "modifica sudoers in sicurezza", en: "edit sudoers safely" }, flag: { it: "<code>-c</code> controlla soltanto, <code>-f file</code> per sudoers.d", en: "<code>-c</code> check only, <code>-f file</code> for sudoers.d" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Crea l'utente <code>deploy</code>, membro del gruppo <code>web</code>, con
                     home <code>/home/deploy</code> e shell <code>/bin/bash</code>. Il gruppo
                     potrebbe non esistere ancora.`,
                en: `Create the user <code>deploy</code>, member of the group <code>web</code>,
                     with home <code>/home/deploy</code> and shell <code>/bin/bash</code>. The
                     group may not exist yet.`,
            },
            checks: [
                { id: "utente-esiste",
                  why: { it: "Ogni servizio che gira dovrebbe avere il suo utente. È la differenza fra «se lo bucano, prende quel servizio» e «se lo bucano, prende la macchina».",
                         en: "Every running service should have its own user. It is the difference between \"if they break it, they get that service\" and \"if they break it, they get the machine\"." },
                  nudge: { it: "<code>getent passwd deploy</code> ti dice se esiste e con che campi.",
                           en: "<code>getent passwd deploy</code> tells you whether it exists and with which fields." } },
                { id: "nel-gruppo",
                  why: { it: "I gruppi sono il modo di dare un permesso a più persone senza ripeterlo per ognuna.",
                         en: "Groups are how you give one permission to several people without repeating it for each." },
                  nudge: { it: "<code>id deploy</code> elenca i gruppi a cui appartiene.",
                           en: "<code>id deploy</code> lists the groups it belongs to." } },
                { id: "shell-e-home",
                  why: { it: "Home e shell non sono dettagli: senza home lo script di login fallisce, e con la shell sbagliata l'utente non entra (o entra quando non dovrebbe).",
                         en: "Home and shell are not details: with no home the login script fails, and with the wrong shell the user cannot log in (or logs in when they should not)." },
                  nudge: { it: "I campi 6 e 7 di <code>getent passwd deploy</code> sono home e shell.",
                           en: "Fields 6 and 7 of <code>getent passwd deploy</code> are home and shell." } },
            ],
            hints: [
                { it: "Il gruppo si crea con <code>addgroup web</code>.", en: "The group is created with <code>addgroup web</code>." },
                { it: "Su Alpine: <code>adduser -D -h /home/deploy -s /bin/bash -G web deploy</code>.", en: "On Alpine: <code>adduser -D -h /home/deploy -s /bin/bash -G web deploy</code>." },
                { it: "<code>addgroup web; adduser -D -h /home/deploy -s /bin/bash -G web deploy</code>", en: "<code>addgroup web; adduser -D -h /home/deploy -s /bin/bash -G web deploy</code>" },
            ],
        },
        {
            id: "e2", tipo: "risposta",
            brief: {
                it: `Fra gli utenti del sistema ce n'è uno che <strong>non può entrare</strong>
                     (shell <code>nologin</code>) ed è il proprietario di
                     <code>~/lab/servizio</code>. Come si chiama? <em>Il nome cambia a ogni
                     mondo.</em>`,
                en: `Among the system users there is one that <strong>cannot log in</strong>
                     (shell <code>nologin</code>) and owns <code>~/lab/servizio</code>.
                     What is its name? <em>The name changes with every world.</em>`,
            },
            checks: [
                { id: "utente-di-servizio",
                  why: { it: "Un utente senza shell è la firma di un servizio ben configurato. Riconoscerlo ti dice, guardando <code>/etc/passwd</code>, quali sono le persone e quali i programmi.",
                         en: "A user with no shell is the signature of a well-configured service. Recognising it tells you, from <code>/etc/passwd</code> alone, which entries are people and which are programs." },
                  nudge: { it: "<code>ls -ld ~/lab/servizio</code> ti dà il proprietario; <code>getent passwd</code> ti dice la sua shell.",
                           en: "<code>ls -ld ~/lab/servizio</code> gives you the owner; <code>getent passwd</code> tells you its shell." } },
            ],
            hints: [
                { it: "Chi è il proprietario di quella cartella? <code>ls -ld</code>.", en: "Who owns that folder? <code>ls -ld</code>." },
                { it: "Controlla che la sua shell sia davvero <code>nologin</code> con <code>getent passwd nome</code>.", en: "Check its shell really is <code>nologin</code> with <code>getent passwd name</code>." },
                { it: "<code>stat -c '%U' ~/lab/servizio | lab answer</code>", en: "<code>stat -c '%U' ~/lab/servizio | lab answer</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Permetti a <code>deploy</code> di eseguire <strong>solo</strong>
                     <code>/usr/local/bin/riavvia-sito</code> come root, <strong>senza
                     password</strong>. Metti la regola in un file dentro
                     <code>/etc/sudoers.d/</code>, non in <code>/etc/sudoers</code>. La sintassi
                     deve essere valida.`,
                en: `Allow <code>deploy</code> to run <strong>only</strong>
                     <code>/usr/local/bin/riavvia-sito</code> as root, <strong>without a
                     password</strong>. Put the rule in a file under
                     <code>/etc/sudoers.d/</code>, not in <code>/etc/sudoers</code>. The syntax
                     must be valid.`,
            },
            checks: [
                { id: "sintassi-valida",
                  why: { it: "Un <code>sudoers</code> rotto blocca <code>sudo</code> per tutti, te compreso. Si controlla <em>sempre</em>, e si controlla <em>prima</em>.",
                         en: "A broken <code>sudoers</code> locks <code>sudo</code> for everyone, you included. You <em>always</em> check, and you check <em>first</em>." },
                  nudge: { it: "<code>visudo -c</code> ti dice quale file non gli piace e a che riga.",
                           en: "<code>visudo -c</code> tells you which file it dislikes and on which line." } },
                { id: "puo-quel-comando",
                  why: { it: "La verifica non guarda cosa hai scritto nel file: chiede a <code>sudo</code> stesso cosa può fare l'utente. È l'unico modo che non si lascia ingannare da un file scritto bene ma nel posto sbagliato.",
                         en: "The check does not look at what you wrote in the file: it asks <code>sudo</code> itself what the user can do. It is the only way that cannot be fooled by a well-written file in the wrong place." },
                  nudge: { it: "<code>sudo -l -U deploy</code> è la fonte di verità. Se non elenca il comando, la regola non è attiva.",
                           en: "<code>sudo -l -U deploy</code> is the source of truth. If it does not list the command, the rule is not in effect." } },
                { id: "non-puo-tutto",
                  why: { it: "<code>ALL</code> è comodo e vanifica l'esercizio: minimo privilegio significa <em>quel comando</em>, non <em>tutti i comandi</em>.",
                         en: "<code>ALL</code> is convenient and defeats the exercise: least privilege means <em>that command</em>, not <em>all commands</em>." },
                  nudge: { it: "Se <code>sudo -l -U deploy</code> mostra <code>(ALL) ALL</code>, hai dato le chiavi di casa.",
                           en: "If <code>sudo -l -U deploy</code> shows <code>(ALL) ALL</code>, you handed over the house keys." } },
            ],
            hints: [
                { it: "La forma di una regola è: <code>utente MACCHINA=(COME_CHI) COMANDO</code>.", en: "A rule reads: <code>user HOST=(AS_WHOM) COMMAND</code>." },
                { it: "Per non chiedere la password si aggiunge <code>NOPASSWD:</code> prima del comando. E il file deve avere permessi <code>440</code>.", en: "To skip the password add <code>NOPASSWD:</code> before the command. And the file must be mode <code>440</code>." },
                { it: "<code>echo 'deploy ALL=(root) NOPASSWD: /usr/local/bin/riavvia-sito' &gt; /etc/sudoers.d/deploy &amp;&amp; chmod 440 /etc/sudoers.d/deploy &amp;&amp; visudo -c</code>", en: "<code>echo 'deploy ALL=(root) NOPASSWD: /usr/local/bin/riavvia-sito' &gt; /etc/sudoers.d/deploy &amp;&amp; chmod 440 /etc/sudoers.d/deploy &amp;&amp; visudo -c</code>" },
            ],
        },
    ],
};
