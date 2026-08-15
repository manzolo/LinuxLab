export default {
    id: "ch22", num: 22, runtime: "local", requires: ["ch16", "ch17", "ch19", "ch20"], draft: false,
    title: { it: "Capstone: metti in piedi un server", en: "Capstone: bring up a server" },
    oneLiner: {
        it: "Da una macchina vuota a un server che funziona — in uno script, non a mano.",
        en: "From an empty machine to a working server — in a script, not by hand.",
    },
    commands: ["tutto", "everything"],
    glossary: ["provisioning", "idempotente", "riproducibile"],

    blocks: [
        { kind: "hook", html: {
            it: `Fra sei mesi quel server andrà rifatto: cambia il fornitore, si aggiorna la
                 distribuzione, oppure semplicemente si rompe. La domanda che conta non è «lo so
                 fare?», ma <strong>«lo so <em>rifare</em>, uguale, senza ricordarmi niente?»</strong>`,
            en: `In six months that server will need rebuilding: the provider changes, the
                 distribution is upgraded, or it simply breaks. The question that matters is not
                 "can I do it?", but <strong>"can I <em>redo</em> it, identically, remembering
                 nothing?"</strong>` } },

        { kind: "local", html: {
            it: `<p>Questo è l'esame finale, e ha una regola che cambia tutto:
                 <strong>la verifica non gira sulla tua macchina</strong>. Consegni uno script,
                 e il controllo lo esegue su un <strong>container pulito, appena creato</strong>,
                 e poi guarda com'è finito.</p>
                 <p>Che significa una cosa sola: se hai fatto anche un solo passaggio a mano, non
                 passa. Non è una cattiveria — è esattamente quello che succede nella vita vera,
                 quando il server nuovo non è quello su cui hai provato.</p>`,
            en: `<p>This is the final exam, and it has one rule that changes everything:
                 <strong>the check does not run on your machine</strong>. You hand in a script, and
                 the check runs it on a <strong>clean, freshly created container</strong>, then
                 looks at how it ended up.</p>
                 <p>Which means exactly one thing: if you did even one step by hand, it will not
                 pass. That is not cruelty — it is precisely what happens in real life, when the
                 new server is not the one you practised on.</p>`,
            cmd: "./lab/local/run.sh 22 1\ndocker exec -it linuxlab bash\n# scrivi /root/lab/provisiona.sh, poi:\nlab check 22 1",
        } },

        { kind: "lead", html: {
            it: `Devi consegnare <code>/root/lab/provisiona.sh</code>. Partendo da una Debian nuda
                 con systemd, deve arrivare a un server che serve un sito, ha un utente di servizio,
                 un firewall chiuso, un backup pianificato e i log che girano. Tutti i pezzi li hai
                 già usati: qui li metti in fila.`,
            en: `You must hand in <code>/root/lab/provisiona.sh</code>. Starting from a bare Debian
                 with systemd, it must arrive at a server that serves a site, has a service user,
                 a closed firewall, a scheduled backup and rotating logs. You have used every piece
                 already: here you line them up.` } },

        { kind: "analogy", html: {
            it: `La differenza fra <strong>cucinare</strong> e <strong>scrivere la ricetta</strong>.
                 Cucinare una volta lo sanno fare in tanti. Scrivere la ricetta in modo che un
                 altro — o tu, fra sei mesi, che sarai un altro — ottenga lo stesso piatto:
                 quello è il mestiere.`,
            en: `The difference between <strong>cooking</strong> and <strong>writing the
                 recipe</strong>. Plenty of people can cook it once. Writing the recipe so that
                 somebody else — or you in six months, who will be somebody else — gets the same
                 dish: that is the trade.` } },

        { kind: "pro", html: {
            it: `<p>La qualità che distingue uno script di provisioning da una lista di comandi si
                 chiama <strong>idempotenza</strong>: eseguirlo due volte deve dare lo stesso
                 risultato di eseguirlo una volta. In pratica: <code>mkdir -p</code> invece di
                 <code>mkdir</code>, <code>id utente || useradd</code> invece di
                 <code>useradd</code>, <code>grep -q riga file || echo riga &gt;&gt; file</code>
                 invece di appendere e basta. Uno script non idempotente funziona la prima volta e
                 fallisce (o duplica) tutte le altre, che sono quelle che contano.</p>
                 <p>L'altra metà è <strong>fallire presto e rumorosamente</strong>:
                 <code>set -euo pipefail</code> in cima, e il messaggio d'errore su stderr. Uno
                 script di provisioning che tira dritto dopo un errore ti lascia una macchina a
                 metà, che è lo stato peggiore possibile — peggio di una macchina vuota, perché
                 sembra pronta.</p>
                 <p>E se questa cosa ti è piaciuta, sappi che il passo successivo esiste e si chiama
                 Ansible, Terraform, o un Dockerfile. Fanno tutti la stessa cosa che stai facendo
                 adesso, con più struttura: <strong>descrivere lo stato voluto invece di eseguire
                 passi</strong>. Chi ha scritto a mano lo script di questo capitolo capisce al volo
                 perché esistono.</p>`,
            en: `<p>The quality that separates a provisioning script from a list of commands is
                 called <strong>idempotence</strong>: running it twice must give the same result as
                 running it once. In practice: <code>mkdir -p</code> instead of <code>mkdir</code>,
                 <code>id user || useradd</code> instead of <code>useradd</code>,
                 <code>grep -q line file || echo line &gt;&gt; file</code> instead of blindly
                 appending. A non-idempotent script works the first time and fails (or duplicates)
                 every other time — and those are the ones that matter.</p>
                 <p>The other half is <strong>failing early and loudly</strong>:
                 <code>set -euo pipefail</code> at the top, and errors on stderr. A provisioning
                 script that ploughs on after a failure leaves you a half-built machine, the worst
                 possible state — worse than an empty one, because it looks ready.</p>
                 <p>And if you enjoyed this, know that the next step exists and is called Ansible,
                 Terraform, or a Dockerfile. They all do what you are doing now, with more
                 structure: <strong>describing the wanted state instead of executing steps</strong>.
                 Anyone who hand-wrote this chapter's script understands instantly why they
                 exist.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Provarlo solo sulla macchina dove hai già fatto metà del lavoro a mano</strong> è il modo classico di consegnare uno script che non funziona. Provalo su un container nuovo — che è esattamente quello che fa la verifica.",
              en: "<strong>Testing it only on the machine where you already did half the work by hand</strong> is the classic way to hand in a script that does not work. Test it on a fresh container — which is exactly what the check does." },
            { it: "<strong>Uno script che non è idempotente è una trappola a scoppio ritardato</strong>: la seconda esecuzione duplica righe di configurazione o fallisce su un utente che esiste già.",
              en: "<strong>A non-idempotent script is a delayed-action trap</strong>: the second run duplicates configuration lines or fails on a user that already exists." },
            { it: "<strong>Non mettere segreti nello script.</strong> Password e chiavi private non vanno in un file che finisce in git. Il capitolo non te lo chiede, e non è un caso.",
              en: "<strong>Do not put secrets in the script.</strong> Passwords and private keys do not belong in a file that ends up in git. This chapter does not ask for any, and that is not an accident." },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Scrivi <code>/root/lab/provisiona.sh</code>. Eseguito su una macchina pulita,
                     deve ottenere <strong>tutte</strong> queste cose:
                     <ol>
                       <li>l'utente di servizio <code>appsrv</code>, senza shell di login;</li>
                       <li>la cartella <code>/srv/sito</code> con dentro <code>index.html</code>,
                           di proprietà <code>appsrv</code>, file 644 e cartelle 755;</li>
                       <li>nginx che serve quella cartella sulla porta 80 e risponde;</li>
                       <li>una unit systemd <code>guardiano.service</code> abilitata e attiva;</li>
                       <li>un backup pianificato: crontab di root che alle 3:30 esegue
                           <code>/usr/local/bin/backup.sh</code>, e lo script esiste ed è eseguibile;</li>
                       <li>il firewall <code>inet lab</code> con policy drop e aperte solo 22 e 80.</li>
                     </ol>
                     <strong>La verifica esegue il tuo script su un container nuovo e poi controlla
                     tutti e sei i punti.</strong>`,
                en: `Write <code>/root/lab/provisiona.sh</code>. Run on a clean machine, it must
                     achieve <strong>all</strong> of these:
                     <ol>
                       <li>a service user <code>appsrv</code>, with no login shell;</li>
                       <li>the folder <code>/srv/sito</code> containing <code>index.html</code>,
                           owned by <code>appsrv</code>, files 644 and directories 755;</li>
                       <li>nginx serving that folder on port 80 and answering;</li>
                       <li>a systemd unit <code>guardiano.service</code>, enabled and active;</li>
                       <li>a scheduled backup: root's crontab running
                           <code>/usr/local/bin/backup.sh</code> at 3:30, and the script exists and
                           is executable;</li>
                       <li>the <code>inet lab</code> firewall with a drop policy, only 22 and 80 open.</li>
                     </ol>
                     <strong>The check runs your script on a fresh container and then verifies all
                     six points.</strong>`,
            },
            checks: [
                { id: "utente", why: { it: "Capitolo 7: ogni servizio il suo utente, e senza shell se non deve entrare nessuno.", en: "Chapter 7: every service its own user, and no shell if nobody needs to log in." },
                  nudge: { it: "<code>getent passwd appsrv</code>: il settimo campo deve essere una nologin.", en: "<code>getent passwd appsrv</code>: the seventh field must be a nologin." } },
                { id: "permessi", why: { it: "Capitolo 6: file 644, cartelle 755, e il proprietario giusto. Un solo 777 e il resto non conta.", en: "Chapter 6: files 644, directories 755, and the right owner. One 777 and the rest does not count." },
                  nudge: { it: "<code>find /srv/sito -type f ! -perm 644</code> non deve stampare niente.", en: "<code>find /srv/sito -type f ! -perm 644</code> must print nothing." } },
                { id: "sito", why: { it: "Capitolo 19: la configurazione valida non basta, il sito deve rispondere davvero.", en: "Chapter 19: a valid configuration is not enough, the site must actually answer." },
                  nudge: { it: "<code>nginx -t &amp;&amp; systemctl reload nginx</code>, poi <code>curl -s localhost</code>.", en: "<code>nginx -t &amp;&amp; systemctl reload nginx</code>, then <code>curl -s localhost</code>." } },
                { id: "servizio", why: { it: "Capitolo 17: attivo E abilitato. Uno solo dei due non basta, e il secondo si scopre al riavvio.", en: "Chapter 17: active AND enabled. One without the other is not enough, and the missing one shows up at reboot." },
                  nudge: { it: "<code>systemctl is-active guardiano &amp;&amp; systemctl is-enabled guardiano</code>.", en: "<code>systemctl is-active guardiano &amp;&amp; systemctl is-enabled guardiano</code>." } },
                { id: "backup", why: { it: "Capitolo 14: la riga di cron con i campi giusti, e lo script che esiste davvero ed è eseguibile.", en: "Chapter 14: the cron line with the right fields, and a script that really exists and is executable." },
                  nudge: { it: "<code>crontab -l</code> e <code>ls -l /usr/local/bin/backup.sh</code>.", en: "<code>crontab -l</code> and <code>ls -l /usr/local/bin/backup.sh</code>." } },
                { id: "firewall", why: { it: "Capitolo 20: policy drop e solo due porte. È l'ultimo pezzo, ed è quello che rende il resto difendibile.", en: "Chapter 20: drop policy and two ports only. It is the last piece, and it is what makes the rest defensible." },
                  nudge: { it: "<code>nft list ruleset</code>: cerca <code>policy drop</code> e le due porte.", en: "<code>nft list ruleset</code>: look for <code>policy drop</code> and the two ports." } },
                { id: "idempotente", pro: true,
                  why: { it: "La verifica esegue il tuo script <strong>due volte</strong>. Se la seconda rompe qualcosa o duplica righe, non è uno script di provisioning: è un elenco di comandi.",
                         en: "The check runs your script <strong>twice</strong>. If the second run breaks something or duplicates lines, it is not a provisioning script: it is a list of commands." },
                  nudge: { it: "<code>mkdir -p</code>, <code>id appsrv || useradd …</code>, <code>grep -q … || echo … &gt;&gt; …</code>, e <code>nft delete table inet lab 2&gt;/dev/null || true</code> prima di ricrearla.",
                           en: "<code>mkdir -p</code>, <code>id appsrv || useradd …</code>, <code>grep -q … || echo … &gt;&gt; …</code>, and <code>nft delete table inet lab 2&gt;/dev/null || true</code> before recreating it." } },
            ],
            hints: [
                { it: "Non partire dal foglio bianco: apri i capitoli 6, 7, 14, 17, 19 e 20 e copia il comando che avevi già usato in ognuno.", en: "Do not start from a blank page: open chapters 6, 7, 14, 17, 19 and 20 and copy the command you already used in each." },
                { it: "Comincia con <code>#!/bin/bash</code> e <code>set -euo pipefail</code>. Poi un blocco per punto, in ordine, con un <code>echo</code> fra uno e l'altro per sapere dove si ferma.", en: "Start with <code>#!/bin/bash</code> and <code>set -euo pipefail</code>. Then one block per point, in order, with an <code>echo</code> between them so you know where it stops." },
                { it: "Provalo tu su un container pulito prima di consegnarlo: <code>./lab/local/run.sh cleanup &amp;&amp; ./lab/local/run.sh 22 1</code>. È esattamente quello che farà la verifica.", en: "Test it yourself on a clean container before handing it in: <code>./lab/local/run.sh cleanup &amp;&amp; ./lab/local/run.sh 22 1</code>. That is exactly what the check will do." },
            ],
        },
    ],
};
