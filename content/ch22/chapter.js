export default {
    id: "ch22", num: 22, runtime: "local", requires: ["ch16", "ch17", "ch19", "ch20"], draft: false,
    title: { it: "Capstone: metti in piedi un server", en: "Capstone: bring up a server" },
    oneLiner: {
        it: "Da un ambiente pulito e preparato a un server che funziona — in uno script, non a mano.",
        en: "From a clean, prepared environment to a working server — in a script, not by hand.",
    },
    // Niente comandi nuovi: il capstone usa quelli dei capitoli 17-21, e il quaderno
    // non deve riempirsi delle parole "tutto" e "everything" come se fossero comandi.
    commands: [],
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
                 <strong>quello che hai fatto a mano non conta</strong>. Consegni uno script, e
                 prima di eseguirlo il controllo <strong>disfa tutti e sei i risultati</strong> —
                 cancella l'utente, la cartella, la unit, la riga di cron, le regole del
                 firewall — e riporta la macchina allo stato in cui il tuo script deve trovarla.
                 Poi lo esegue, e guarda com'è finita.</p>
                 <p>Non è un container nuovo, ed è giusto dirlo: da dentro un container non se ne
                 crea un altro. È un <em>azzeramento</em>, che ai fini dell'esame fa lo stesso
                 lavoro — quello che avevi costruito a mano non c'è più.</p>
                 <p>Che significa una cosa sola: se hai fatto anche un solo passaggio a mano, non
                 passa. Non è una cattiveria — è esattamente quello che succede nella vita vera,
                 quando il server nuovo non è quello su cui hai provato.</p>`,
            en: `<p>This is the final exam, and it has one rule that changes everything:
                 <strong>what you did by hand does not count</strong>. You hand in a script, and
                 before running it the check <strong>undoes all six results</strong> — it deletes
                 the user, the folder, the unit, the cron line, the firewall rules — putting the
                 machine back into the state your script must find. Then it runs it, and looks at
                 how it ended up.</p>
                 <p>It is not a fresh container, and that is worth saying: from inside a container
                 you cannot create another one. It is a <em>reset</em>, which for the purposes of
                 the exam does the same job — whatever you had built by hand is gone.</p>`,
            cmd: "./lab/local/run.sh 22 1\ndocker exec -it linuxlab bash\n# scrivi /root/lab/provisiona.sh, poi:\nlab check 22 1",
        } },

        { kind: "lead", html: {
            it: `Devi consegnare <code>/root/lab/provisiona.sh</code>. Parti da un ambiente Debian
                 <strong>pulito ma già preparato</strong>: systemd e i pacchetti necessari sono
                 installati. Il tuo script deve configurare sito, identità del servizio, firewall
                 persistente e backup pianificato. Non è un'installazione del sistema operativo:
                 è provisioning dello strato applicativo, e tutti i pezzi li hai già usati.`,
            en: `You must hand in <code>/root/lab/provisiona.sh</code>. You start from a
                 <strong>clean but prepared</strong> Debian environment: systemd and the required
                 packages are installed. Your script must configure the site, service identity,
                 persistent firewall, and scheduled backup. This is not operating-system
                 installation: it is application-layer provisioning, and you have used every
                 piece already.` } },

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
                 fallisce (o duplica) tutte le altre, che sono quelle che contano. Due esecuzioni
                 uguali dimostrano la <em>ripetibilità sullo stato provato</em>, non che lo script
                 sappia correggere qualunque deriva possibile: per quella garanzia servono casi di
                 test ulteriori e operazioni che convergano davvero allo stato voluto.</p>
                 <p>L'altra metà è <strong>fallire presto e rumorosamente</strong>:
                 <code>set -euo pipefail</code> in cima, e il messaggio d'errore su stderr. Uno
                 script di provisioning che tira dritto dopo un errore ti lascia una macchina a
                 metà, che è lo stato peggiore possibile — peggio di una macchina vuota, perché
                 sembra pronta.</p>
                 <p>E se questa cosa ti è piaciuta, sappi che il passo successivo esiste e si chiama
                 Ansible, Terraform, o un Dockerfile. Non sono intercambiabili: Ansible configura
                 macchine, Terraform gestisce soprattutto infrastruttura e risorse, un Dockerfile
                 costruisce un'immagine a strati. Con modelli diversi rendono l'automazione più
                 dichiarata, verificabile e riproducibile. Chi ha scritto a mano lo script di
                 questo capitolo capisce al volo perché esistono.</p>`,
            en: `<p>The quality that separates a provisioning script from a list of commands is
                 called <strong>idempotence</strong>: running it twice must give the same result as
                 running it once. In practice: <code>mkdir -p</code> instead of <code>mkdir</code>,
                 <code>id user || useradd</code> instead of <code>useradd</code>,
                 <code>grep -q line file || echo line &gt;&gt; file</code> instead of blindly
                 appending. A non-idempotent script works the first time and fails (or duplicates)
                 every other time — and those are the ones that matter. Two equal runs demonstrate
                 <em>repeatability on the tested state</em>, not that the script repairs every
                 possible drift: that stronger claim needs more test cases and operations that
                 genuinely converge on the desired state.</p>
                 <p>The other half is <strong>failing early and loudly</strong>:
                 <code>set -euo pipefail</code> at the top, and errors on stderr. A provisioning
                 script that ploughs on after a failure leaves you a half-built machine, the worst
                 possible state — worse than an empty one, because it looks ready.</p>
                 <p>And if you enjoyed this, know that the next step exists and is called Ansible,
                 Terraform, or a Dockerfile. They are not interchangeable: Ansible configures
                 machines, Terraform primarily manages infrastructure and resources, and a
                 Dockerfile builds a layered image. Through different models they make automation
                 more declarative, testable, and reproducible. Anyone who hand-wrote this
                 chapter's script understands instantly why they exist.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Provarlo solo sulla macchina dove hai già fatto metà del lavoro a mano</strong> è il modo classico di consegnare uno script che non funziona: funziona perché il lavoro era già fatto. Provalo su un nuovo container costruito dall'immagine del laboratorio: è pulito, ma conserva onestamente i pacchetti dichiarati come prerequisiti.",
              en: "<strong>Testing it only on the machine where you already did half the work by hand</strong> is the classic way to hand in a script that does not work: it works because the work was already done. Test it in a new container built from the lab image: it is clean while honestly retaining the declared prerequisite packages." },
            { it: "<strong>Uno script che non è idempotente è una trappola a scoppio ritardato</strong>: la seconda esecuzione duplica righe di configurazione o fallisce su un utente che esiste già.",
              en: "<strong>A non-idempotent script is a delayed-action trap</strong>: the second run duplicates configuration lines or fails on a user that already exists." },
            { it: "<strong>Non mettere segreti nello script.</strong> Password e chiavi private non vanno in un file che finisce in git. Il capitolo non te lo chiede, e non è un caso.",
              en: "<strong>Do not put secrets in the script.</strong> Passwords and private keys do not belong in a file that ends up in git. This chapter does not ask for any, and that is not an accident." },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato", richiede: ["scrittura-multilinea"],
            brief: {
                it: `Scrivi <code>/root/lab/provisiona.sh</code>. Eseguito sull'ambiente Debian
                     pulito e già preparato del laboratorio, deve ottenere <strong>tutte</strong>
                     queste cose:
                     <ol>
                       <li>l'utente di servizio <code>appsrv</code>, senza shell di login;</li>
                       <li>la cartella <code>/srv/sito</code> con dentro <code>index.html</code>,
                           di proprietà <code>root:www-data</code>, file 644 e cartelle 755;</li>
                       <li>nginx che serve quella cartella sulla porta 80 e risponde;</li>
                       <li>una unit systemd <code>guardiano.service</code>, eseguita come
                           <code>appsrv</code>, abilitata e attiva;</li>
                       <li>un backup pianificato: crontab di root che alle 3:30 esegue
                           <code>/usr/local/bin/backup.sh</code>, e lo script esiste ed è eseguibile;</li>
                       <li>il firewall <code>inet lab</code> con policy drop e aperte solo 22 e 80,
                           salvato in <code>/etc/nftables.conf</code> e abilitato al riavvio.</li>
                     </ol>
                     <strong>La verifica azzera tutti e sei i risultati, poi esegue il tuo script
                     — due volte, per vedere se regge anche la seconda — e controlla.</strong>`,
                en: `Write <code>/root/lab/provisiona.sh</code>. Run in the lab's clean, prepared
                     Debian environment, it must achieve <strong>all</strong> of these:
                     <ol>
                       <li>a service user <code>appsrv</code>, with no login shell;</li>
                       <li>the folder <code>/srv/sito</code> containing <code>index.html</code>,
                           owned by <code>root:www-data</code>, files 644 and directories 755;</li>
                       <li>nginx serving that folder on port 80 and answering;</li>
                       <li>a systemd unit <code>guardiano.service</code>, running as
                           <code>appsrv</code>, enabled and active;</li>
                       <li>a scheduled backup: root's crontab running
                           <code>/usr/local/bin/backup.sh</code> at 3:30, and the script exists and
                           is executable;</li>
                       <li>the <code>inet lab</code> firewall with a drop policy, only 22 and 80
                           open, saved in <code>/etc/nftables.conf</code> and enabled at boot.</li>
                     </ol>
                     <strong>The check undoes all six results, then runs your script — twice, to
                     see whether it survives the second time — and verifies.</strong>`,
            },
            checks: [
                { id: "utente", why: { it: "Capitolo 7: ogni servizio il suo utente, e senza shell se non deve entrare nessuno.", en: "Chapter 7: every service its own user, and no shell if nobody needs to log in." },
                  nudge: { it: "<code>getent passwd appsrv</code>: il settimo campo deve essere una nologin.", en: "<code>getent passwd appsrv</code>: the seventh field must be a nologin." } },
                { id: "permessi", why: { it: "Capitolo 6: nginx deve leggere il sito, non riscriverlo. Proprietà <code>root:www-data</code> e bit 644/755 separano chi distribuisce i contenuti da chi li serve.", en: "Chapter 6: nginx must read the site, not rewrite it. <code>root:www-data</code> ownership and 644/755 modes separate who deploys content from who serves it." },
                  nudge: { it: "<code>find /srv/sito -type f ! -perm 644</code> non deve stampare niente; <code>find /srv/sito ! -user root</code> neppure.", en: "<code>find /srv/sito -type f ! -perm 644</code> must print nothing; neither should <code>find /srv/sito ! -user root</code>." } },
                { id: "sito", why: { it: "Capitolo 19: la configurazione valida non basta, il sito deve rispondere davvero.", en: "Chapter 19: a valid configuration is not enough, the site must actually answer." },
                  nudge: { it: "<code>nginx -t &amp;&amp; systemctl reload nginx</code>, poi <code>curl -s localhost</code>.", en: "<code>nginx -t &amp;&amp; systemctl reload nginx</code>, then <code>curl -s localhost</code>." } },
                { id: "servizio", why: { it: "Capitoli 7 e 17: attivo, abilitato e con privilegi ridotti. Creare <code>appsrv</code> senza usarlo sarebbe sicurezza solo sulla carta.", en: "Chapters 7 and 17: active, enabled, and least-privileged. Creating <code>appsrv</code> without using it would be security only on paper." },
                  nudge: { it: "<code>systemctl is-active guardiano &amp;&amp; systemctl is-enabled guardiano</code>, poi <code>systemctl show guardiano -p User</code>: deve dire <code>appsrv</code>.", en: "<code>systemctl is-active guardiano &amp;&amp; systemctl is-enabled guardiano</code>, then <code>systemctl show guardiano -p User</code>: it must say <code>appsrv</code>." } },
                { id: "backup", why: { it: "Capitolo 14: la riga di cron con i campi giusti, e lo script che esiste davvero ed è eseguibile.", en: "Chapter 14: the cron line with the right fields, and a script that really exists and is executable." },
                  nudge: { it: "<code>crontab -l</code> e <code>ls -l /usr/local/bin/backup.sh</code>.", en: "<code>crontab -l</code> and <code>ls -l /usr/local/bin/backup.sh</code>." } },
                { id: "firewall", why: { it: "Capitolo 20: il check bussa davvero alle porte e controlla anche la persistenza. Regole corrette solo in RAM spariscono al primo riavvio.", en: "Chapter 20: the check actually probes the ports and also verifies persistence. Correct rules held only in RAM vanish on the first reboot." },
                  nudge: { it: "Controlla <code>nft list ruleset</code>, poi <code>nft -c -f /etc/nftables.conf</code> e <code>systemctl is-enabled nftables</code>.", en: "Check <code>nft list ruleset</code>, then <code>nft -c -f /etc/nftables.conf</code> and <code>systemctl is-enabled nftables</code>." } },
                { id: "idempotente", pro: true,
                  why: { it: "La verifica esegue il tuo script <strong>due volte</strong>. Se la seconda rompe o duplica, hai perso la ripetibilità sullo stato del lab. È una prova utile di idempotenza, non una dimostrazione su ogni deriva immaginabile.",
                         en: "The check runs your script <strong>twice</strong>. If the second run breaks or duplicates things, you lost repeatability on the lab state. It is useful evidence of idempotence, not proof over every imaginable drift." },
                  nudge: { it: "Usa operazioni convergenti: <code>mkdir -p</code>, <code>id appsrv || useradd …</code>, riscrittura controllata dei file e <code>nft -f /etc/nftables.conf</code> invece di accumulare regole.",
                           en: "Use convergent operations: <code>mkdir -p</code>, <code>id appsrv || useradd …</code>, controlled file rewrites, and <code>nft -f /etc/nftables.conf</code> instead of accumulating rules." } },
            ],
            hints: [
                { it: "Non partire dal foglio bianco: apri i capitoli 6, 7, 14, 17, 19 e 20 e copia il comando che avevi già usato in ognuno.", en: "Do not start from a blank page: open chapters 6, 7, 14, 17, 19 and 20 and copy the command you already used in each." },
                { it: "Comincia con <code>#!/bin/bash</code> e <code>set -euo pipefail</code>. Poi un blocco per punto, in ordine, con un <code>echo</code> fra uno e l'altro per sapere dove si ferma.", en: "Start with <code>#!/bin/bash</code> and <code>set -euo pipefail</code>. Then one block per point, in order, with an <code>echo</code> between them so you know where it stops." },
                { it: "Provalo tu su un container pulito prima di consegnarlo: <code>./lab/local/run.sh cleanup &amp;&amp; ./lab/local/run.sh 22 1</code>. È una prova più severa dell'azzeramento che fa la verifica, e se passa quella passi di sicuro.", en: "Test it yourself on a clean container before handing it in: <code>./lab/local/run.sh cleanup &amp;&amp; ./lab/local/run.sh 22 1</code>. That is a harsher test than the check's reset, and if you pass it you pass for sure." },
            ],
        },
    ],
};
