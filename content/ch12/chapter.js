export default {
    id: "ch12", num: 12, runtime: "browser", requires: ["ch07"], draft: false,
    title: { it: "I pacchetti", en: "Packages" },
    oneLiner: {
        it: "Il software non si scarica: si chiede a un gestore che sa già cosa hai.",
        en: "You do not download software: you ask a manager that already knows what you have.",
    },
    commands: ["apk add", "apk del", "apk search", "apk info", "apk info --who-owns", "apt", "dnf"],
    glossary: ["repository", "dipendenza", "firma", "indice"],

    blocks: [
        { kind: "hook", html: {
            it: `Ti serve <code>jq</code>. La tentazione è cercarlo, scaricare un binario e
                 metterlo in <code>/usr/local/bin</code>. Funziona — finché non arriva
                 l'aggiornamento di sicurezza, che non arriverà mai, perché
                 <strong>nessuno sa che quel file è lì</strong>.`,
            en: `You need <code>jq</code>. The temptation is to search for it, download a binary
                 and drop it in <code>/usr/local/bin</code>. It works — until the security update
                 comes, which never will, because <strong>nobody knows that file is there</strong>.` } },

        { kind: "lead", html: {
            it: `Un gestore di pacchetti tiene un registro di <em>cosa</em> è installato,
                 <em>da dove</em> viene, <em>quali file</em> ha messo e <em>chi dipende da chi</em>.
                 È la differenza fra un sistema che si può aggiornare e un sistema che si può solo
                 rifare.`,
            en: `A package manager keeps a register of <em>what</em> is installed, <em>where</em>
                 it came from, <em>which files</em> it put down and <em>who depends on whom</em>.
                 It is the difference between a system you can update and a system you can only
                 rebuild.` } },

        { kind: "local", html: {
            it: `<p><strong>Qui non c'è rete</strong>: v86 esegue un Linux vero dentro una scheda
                 del browser, ma senza scheda di rete. Il magazzino dei pacchetti, che di solito
                 sta in internet, in questa macchina è <strong>una cartella sul disco</strong>
                 (<code>/opt/repo</code>) con dentro qualche pacchetto vero e il suo indice.</p>
                 <p>Il che significa che <code>apk add htop</code> qui installa
                 <strong>davvero</strong>, offline: stesso comando, stesso registro, stesse
                 dipendenze. Cambia solo dove sta il magazzino. Su una macchina vera è in rete, e
                 il resto è identico.</p>
                 <p>C'è però una differenza che vale la pena notare, ed è una lezione: il nostro
                 magazzino non è <strong>firmato</strong>, quindi apk vuole
                 <code>--allow-untrusted</code>. Su un sistema vero i pacchetti sono firmati e
                 quell'opzione non serve mai — e se un giorno ti trovi a doverla scrivere, fermati
                 e chiediti perché.</p>`,
            en: `<p><strong>There is no network here</strong>: v86 runs a real Linux inside a
                 browser tab, but with no network card. The package store, normally on the
                 internet, on this machine is <strong>a folder on disk</strong>
                 (<code>/opt/repo</code>) holding a few real packages and their index.</p>
                 <p>Which means <code>apk add htop</code> here installs <strong>for real</strong>,
                 offline: same command, same register, same dependencies. Only the store's
                 location differs. On a real machine it is on the network, and the rest is
                 identical.</p>
                 <p>There is one difference worth noting, and it is a lesson: our store is not
                 <strong>signed</strong>, so apk wants <code>--allow-untrusted</code>. On a real
                 system packages are signed and that option is never needed — and if one day you
                 find yourself typing it, stop and ask why.</p>` } },

        { kind: "analogy", html: {
            it: `Un pacchetto non è un file: è <strong>una promessa</strong>. Dice «io porto questi
                 file, ho bisogno di questi altri pacchetti, e vengo da questo magazzino che ha
                 firmato di essere lui». Se togli la firma resta uno zip scaricato da internet,
                 con tutto quello che comporta.`,
            en: `A package is not a file: it is <strong>a promise</strong>. It says "I bring these
                 files, I need these other packages, and I come from this store which has signed
                 that it is really itself". Take away the signature and what is left is a zip
                 downloaded from the internet, with everything that implies.` } },

        { kind: "shown", lines: [
            { cmd: "apk search htop", out: "htop-3.3.0",
              note: { it: "Cerca nell'<em>indice</em> del magazzino, non su internet. È istantaneo perché l'indice è già scaricato.",
                      en: "Searches the store's <em>index</em>, not the internet. Instant, because the index is already downloaded." } },
            { cmd: "apk add --allow-untrusted htop", out: "(1/1) Installing htop (3.3.0-r0)\nOK: 111 MiB in 146 packages",
              note: { it: "Installa il pacchetto <strong>e tutte le sue dipendenze</strong>, e lo registra. Il conteggio finale è il registro che si aggiorna.",
                      en: "Installs the package <strong>and all its dependencies</strong>, and registers it. The final count is the register updating." } },
            { cmd: "apk info --who-owns /usr/bin/awk", out: "/usr/bin/awk is owned by gawk-5.3.1-r0",
              note: { it: "La domanda inversa, e la più utile di tutte: «questo file da dove viene?». Se non risponde, quel file <strong>non ce l'ha messo nessun pacchetto</strong> — e nessuno lo aggiornerà.",
                      en: "The reverse question, and the most useful of all: \"where does this file come from?\". If it has no answer, <strong>no package put that file there</strong> — and nobody will update it." } },
            { cmd: "apk del htop && command -v htop", out: "(1/1) Purging htop (3.3.0-r0)\nOK: 111 MiB in 145 packages",
              note: { it: "Toglie il pacchetto e i suoi file. Senza registro, disinstallare significherebbe indovinare quali file cancellare.",
                      en: "Removes the package and its files. Without a register, uninstalling would mean guessing which files to delete." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>La traduzione fra famiglie è meccanica, e conoscerla vale più di conoscerne una
                 a fondo:</p>
                 <table class="recap-mini">
                 <tr><td>installa</td><td><code>apk add</code></td><td><code>apt install</code></td><td><code>dnf install</code></td></tr>
                 <tr><td>rimuovi</td><td><code>apk del</code></td><td><code>apt remove</code></td><td><code>dnf remove</code></td></tr>
                 <tr><td>aggiorna indice</td><td><code>apk update</code></td><td><code>apt update</code></td><td>(automatico)</td></tr>
                 <tr><td>aggiorna tutto</td><td><code>apk upgrade</code></td><td><code>apt upgrade</code></td><td><code>dnf upgrade</code></td></tr>
                 <tr><td>chi possiede</td><td><code>apk info --who-owns</code></td><td><code>dpkg -S</code></td><td><code>rpm -qf</code></td></tr>
                 </table>
                 <p>Il tranello che prende tutti almeno una volta: su Debian, <code>apt update</code>
                 <strong>non aggiorna niente</strong> — scarica solo l'elenco di cosa è disponibile.
                 Ad aggiornare è <code>apt upgrade</code>. Sono due comandi con nomi quasi identici
                 e mestieri completamente diversi.</p>
                 <p>E i pacchetti <code>-doc</code>, <code>-dev</code>, <code>-dbg</code> non sono
                 un capriccio di Alpine: sono il modo di non mettere i manuali e gli header su un
                 server che non ne ha bisogno. È anche il motivo per cui su un container minimale
                 <code>man ls</code> non esiste, e non è rotto.</p>`,
            en: `<p>Translating between families is mechanical, and knowing that is worth more than
                 knowing one of them deeply:</p>
                 <table class="recap-mini">
                 <tr><td>install</td><td><code>apk add</code></td><td><code>apt install</code></td><td><code>dnf install</code></td></tr>
                 <tr><td>remove</td><td><code>apk del</code></td><td><code>apt remove</code></td><td><code>dnf remove</code></td></tr>
                 <tr><td>refresh index</td><td><code>apk update</code></td><td><code>apt update</code></td><td>(automatic)</td></tr>
                 <tr><td>upgrade all</td><td><code>apk upgrade</code></td><td><code>apt upgrade</code></td><td><code>dnf upgrade</code></td></tr>
                 <tr><td>who owns</td><td><code>apk info --who-owns</code></td><td><code>dpkg -S</code></td><td><code>rpm -qf</code></td></tr>
                 </table>
                 <p>The trap that catches everyone at least once: on Debian, <code>apt update</code>
                 <strong>updates nothing</strong> — it only downloads the list of what is
                 available. The one that upgrades is <code>apt upgrade</code>. Two commands with
                 near-identical names and completely different jobs.</p>
                 <p>And the <code>-doc</code>, <code>-dev</code>, <code>-dbg</code> packages are not
                 an Alpine quirk: they are how you avoid putting manuals and headers on a server
                 that does not need them. It is also why on a minimal container <code>man ls</code>
                 does not exist, and is not broken.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Un binario messo a mano in <code>/usr/local/bin</code> è invisibile agli aggiornamenti.</strong> Funziona oggi, e fra due anni è la vulnerabilità che nessuno ha notato.",
              en: "<strong>A binary dropped by hand into <code>/usr/local/bin</code> is invisible to updates.</strong> It works today, and in two years it is the vulnerability nobody noticed." },
            { it: "<strong><code>apt update</code> non aggiorna il sistema.</strong> Aggiorna l'elenco. Serve <code>apt upgrade</code> dopo.",
              en: "<strong><code>apt update</code> does not update the system.</strong> It updates the list. You need <code>apt upgrade</code> after." },
            { it: "<strong><code>--allow-untrusted</code> (o <code>--force</code>, o <code>--nogpgcheck</code>) non è un'opzione tecnica: è una decisione di sicurezza.</strong> Qui serve perché il magazzino locale non è firmato. Su un server, chiediti sempre perché.",
              en: "<strong><code>--allow-untrusted</code> (or <code>--force</code>, or <code>--nogpgcheck</code>) is not a technical option: it is a security decision.</strong> Here it is needed because the local store is unsigned. On a server, always ask why." },
        ] },

        { kind: "recap", table: [
            { cmd: "apk add", what: { it: "installa, con le dipendenze", en: "install, with dependencies" }, flag: { it: "<code>apt install</code> · <code>dnf install</code>", en: "<code>apt install</code> · <code>dnf install</code>" } },
            { cmd: "apk del", what: { it: "disinstalla", en: "uninstall" }, flag: { it: "<code>apt remove</code> · <code>dnf remove</code>", en: "<code>apt remove</code> · <code>dnf remove</code>" } },
            { cmd: "apk search", what: { it: "cerca nell'indice", en: "search the index" }, flag: { it: "<code>apt search</code> · <code>dnf search</code>", en: "<code>apt search</code> · <code>dnf search</code>" } },
            { cmd: "apk info --who-owns", what: { it: "da che pacchetto viene questo file", en: "which package this file came from" }, flag: { it: "<code>dpkg -S</code> · <code>rpm -qf</code>", en: "<code>dpkg -S</code> · <code>rpm -qf</code>" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Installa <code>jq</code>… no, aspetta: <code>jq</code> c'è già. Installa
                     <code>htop</code> dal magazzino locale, poi <strong>usa <code>jq</code></strong>
                     per estrarre il campo <code>versione</code> da <code>~/lab/dati.json</code> e
                     scriverlo in <code>~/lab/versione.txt</code>. Servono entrambe le cose.`,
                en: `Install <code>jq</code>… wait, <code>jq</code> is already there. Install
                     <code>htop</code> from the local store, then <strong>use <code>jq</code></strong>
                     to extract the <code>versione</code> field from <code>~/lab/dati.json</code>
                     into <code>~/lab/versione.txt</code>. Both are required.`,
            },
            checks: [
                { id: "htop-installato",
                  why: { it: "Installare non è copiare un file: il pacchetto entra in un registro, e da quel momento il sistema sa che esiste e lo aggiornerà.",
                         en: "Installing is not copying a file: the package enters a register, and from then on the system knows it exists and will update it." },
                  nudge: { it: "<code>apk info -e htop</code> dice se è installato. Se <code>apk add</code> si lamenta della firma, rileggi il riquadro giallo sopra.",
                           en: "<code>apk info -e htop</code> says whether it is installed. If <code>apk add</code> complains about the signature, re-read the yellow box above." } },
                { id: "campo-estratto",
                  why: { it: "<code>jq</code> è a JSON quello che <code>awk</code> è al testo a colonne. Su qualunque API moderna, è lo strumento che ti evita di scrivere uno script.",
                         en: "<code>jq</code> is to JSON what <code>awk</code> is to columnar text. On any modern API it is the tool that saves you writing a script." },
                  nudge: { it: "<code>jq .versione ~/lab/dati.json</code> stampa il valore <em>con le virgolette</em>; <code>jq -r</code> le toglie.",
                           en: "<code>jq .versione ~/lab/dati.json</code> prints the value <em>with quotes</em>; <code>jq -r</code> strips them." } },
            ],
            hints: [
                { it: "Il magazzino non è firmato, quindi <code>apk add</code> vuole un'opzione in più.", en: "The store is unsigned, so <code>apk add</code> wants one extra option." },
                { it: "<code>apk add --allow-untrusted htop</code>. Poi <code>jq</code> con l'opzione che toglie le virgolette.", en: "<code>apk add --allow-untrusted htop</code>. Then <code>jq</code> with the option that strips quotes." },
                { it: "<code>apk add --allow-untrusted htop &amp;&amp; jq -r .versione ~/lab/dati.json &gt; ~/lab/versione.txt</code>", en: "<code>apk add --allow-untrusted htop &amp;&amp; jq -r .versione ~/lab/dati.json &gt; ~/lab/versione.txt</code>" },
            ],
        },
        {
            id: "e2", tipo: "risposta",
            brief: {
                it: `A quale pacchetto appartiene il file <code>/usr/bin/awk</code>? Consegna il
                     <strong>solo nome del pacchetto</strong>, senza la versione.`,
                en: `Which package owns the file <code>/usr/bin/awk</code>? Hand in the
                     <strong>package name only</strong>, without the version.`,
            },
            checks: [
                { id: "proprietario-file",
                  why: { it: "È la domanda che si fa davanti a un file sospetto su un server: «chi ti ha messo qui?». Se non c'è risposta, quel file non l'ha messo un pacchetto.",
                         en: "It is the question you ask about a suspicious file on a server: \"who put you here?\". If there is no answer, no package put it there." },
                  nudge: { it: "<code>apk info --who-owns /usr/bin/awk</code> risponde in una frase; ti serve solo il nome, senza il <code>-5.3.1-r0</code> finale.",
                           en: "<code>apk info --who-owns /usr/bin/awk</code> answers in one sentence; you only need the name, without the trailing <code>-5.3.1-r0</code>." } },
            ],
            hints: [
                { it: "L'opzione di <code>apk info</code> che risponde a questa domanda contiene la parola <em>owns</em>.", en: "The <code>apk info</code> option that answers this contains the word <em>owns</em>." },
                { it: "La risposta esce come <code>… is owned by gawk-5.3.1-r0</code>: a te serve solo <code>gawk</code>.", en: "The answer reads <code>… is owned by gawk-5.3.1-r0</code>: you only need <code>gawk</code>." },
                { it: "<code>apk info --who-owns /usr/bin/awk | awk '{print $NF}' | sed 's/-[0-9].*//' | lab answer</code>", en: "<code>apk info --who-owns /usr/bin/awk | awk '{print $NF}' | sed 's/-[0-9].*//' | lab answer</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Il magazzino locale contiene anche <code>figlet</code> (scrive a lettere
                     giganti). Installalo, usalo per scrivere la parola contenuta in
                     <code>~/lab/parola.txt</code> dentro <code>~/lab/insegna.txt</code>, e poi
                     <strong>disinstallalo</strong>. Alla fine il file deve esserci e il comando no.`,
                en: `The local store also has <code>figlet</code> (it writes in giant letters).
                     Install it, use it to write the word in <code>~/lab/parola.txt</code> into
                     <code>~/lab/insegna.txt</code>, then <strong>uninstall it</strong>. In the end
                     the file must exist and the command must not.`,
            },
            checks: [
                { id: "insegna-creata",
                  why: { it: "Il risultato di un programma sopravvive al programma. È ovvio detto così, ed è quello che permette di installare uno strumento, usarlo e ripulire — su un server di produzione è la buona educazione.",
                         en: "A program's output outlives the program. Obvious when said aloud, and it is what lets you install a tool, use it, and clean up — on a production server that is good manners." },
                  nudge: { it: "<code>figlet \"$(cat ~/lab/parola.txt)\" &gt; ~/lab/insegna.txt</code> — le virgolette servono se la parola avesse spazi.",
                           en: "<code>figlet \"$(cat ~/lab/parola.txt)\" &gt; ~/lab/insegna.txt</code> — the quotes matter in case the word has spaces." } },
                { id: "figlet-rimosso",
                  why: { it: "Il registro rende la disinstallazione esatta: sa quali file aveva messo e toglie quelli. Senza registro dovresti indovinare.",
                         en: "The register makes uninstalling exact: it knows which files it put down and removes those. Without a register you would have to guess." },
                  nudge: { it: "<code>apk del figlet</code>, poi <code>command -v figlet</code> non deve stampare più niente.",
                           en: "<code>apk del figlet</code>, then <code>command -v figlet</code> must print nothing." } },
            ],
            hints: [
                { it: "Tre passaggi in ordine: installa, usa, disinstalla.", en: "Three steps in order: install, use, uninstall." },
                { it: "Ricorda <code>--allow-untrusted</code> per l'installazione.", en: "Remember <code>--allow-untrusted</code> for the install." },
                { it: "<code>apk add --allow-untrusted figlet &amp;&amp; figlet \"$(cat ~/lab/parola.txt)\" &gt; ~/lab/insegna.txt &amp;&amp; apk del figlet</code>", en: "<code>apk add --allow-untrusted figlet &amp;&amp; figlet \"$(cat ~/lab/parola.txt)\" &gt; ~/lab/insegna.txt &amp;&amp; apk del figlet</code>" },
            ],
        },
    ],
};
