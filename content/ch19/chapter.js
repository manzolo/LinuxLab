export default {
    id: "ch19", num: 19, runtime: "local", requires: ["ch17"], draft: false,
    title: { it: "Servizi: nginx e ssh", en: "Services: nginx and ssh" },
    oneLiner: {
        it: "Mettere un programma in ascolto e farlo raggiungere davvero.",
        en: "Putting a program on a port and actually making it reachable.",
    },
    commands: ["nginx -t", "systemctl reload", "server block", "sshd -T", "ssh-keygen", "authorized_keys"],
    glossary: ["reverse proxy", "virtual host", "chiave pubblica", "reload"],

    blocks: [
        { kind: "hook", html: {
            it: `Hai cambiato una riga di configurazione e hai fatto <code>restart</code>. Per due
                 secondi il sito è stato giù, e la riga aveva un errore di sintassi: adesso non
                 riparte più. <strong>Entrambe le cose si potevano evitare con un comando ciascuna.</strong>`,
            en: `You changed one configuration line and hit <code>restart</code>. For two seconds
                 the site was down, and the line had a syntax error: now it will not come back.
                 <strong>Both could have been avoided with one command each.</strong>` } },

        { kind: "local", html: {
            it: `<p>Nel browser il capitolo 15 ti ha fatto avviare un server e interrogarlo: era
                 reale, ma minuscolo. Qui c'è <strong>nginx vero</strong>, gestito da systemd, con
                 la sua configurazione, e un <strong>sshd vero</strong> con le chiavi. Serve il
                 laboratorio locale perché entrambi vogliono essere servizi gestiti dall'init, e
                 perché ssh vuole poter aprire una sessione.</p>`,
            en: `<p>In the browser, chapter 15 had you start a server and query it: real, but tiny.
                 Here there is <strong>real nginx</strong>, managed by systemd, with its
                 configuration, and a <strong>real sshd</strong> with keys. The local lab is needed
                 because both want to be init-managed services, and because ssh wants to open a
                 session.</p>`,
            cmd: "./lab/local/run.sh 19 1\ndocker exec -it linuxlab bash",
        } },

        { kind: "lead", html: {
            it: `Due servizi, e le stesse tre domande per entrambi: <em>la configurazione è
                 valida?</em>, <em>il processo l'ha riletta?</em>, <em>qualcuno risponde
                 davvero?</em>. Chi si abitua a farsele in quest'ordine non manda mai giù un sito
                 per un punto e virgola.`,
            en: `Two services, and the same three questions for both: <em>is the configuration
                 valid?</em>, <em>has the process re-read it?</em>, <em>does anyone actually
                 answer?</em>. Anyone who asks them in that order never takes a site down over a
                 semicolon.` } },

        { kind: "analogy", html: {
            it: `<code>restart</code> è spegnere e riaccendere il negozio: per un momento la porta
                 è chiusa e chi era dentro esce. <code>reload</code> è
                 <strong>cambiare il cartello senza chiudere</strong>: il processo rilegge la
                 configurazione e le connessioni in corso non se ne accorgono. Su un sito con
                 traffico la differenza si misura in clienti persi.`,
            en: `<code>restart</code> is closing and reopening the shop: for a moment the door is
                 shut and whoever was inside gets pushed out. <code>reload</code> is
                 <strong>changing the sign without closing</strong>: the process re-reads its
                 configuration and ongoing connections never notice. On a site with traffic the
                 difference is measured in lost customers.` } },

        { kind: "transcript", src: "transcript.json" },

        { kind: "predict",
          domanda: { it: "Hai modificato <code>nginx.conf</code> e dato <code>systemctl reload nginx</code>. Il comando torna senza errori, ma il sito serve ancora la vecchia pagina. Cosa controlli per primo?",
                     en: "You edited <code>nginx.conf</code> and ran <code>systemctl reload nginx</code>. The command returns with no error, but the site still serves the old page. What do you check first?" },
          opzioni: [
              { testo: { it: "Che il server block che stai modificando sia davvero quello che risponde a quel nome.", en: "That the server block you edited is really the one answering that name." }, giusta: true },
              { testo: { it: "Che nginx sia partito: <code>systemctl start nginx</code>.", en: "That nginx started: <code>systemctl start nginx</code>." }, giusta: false },
              { testo: { it: "La cache del browser: <code>Ctrl-F5</code>.", en: "The browser cache: <code>Ctrl-F5</code>." }, giusta: false },
          ],
          spiegazione: {
              it: `Se il <code>reload</code> è andato a buon fine, nginx <em>ha</em> riletto la
                   configurazione: il problema non è che non ha visto la modifica, è che quella
                   modifica non è nel blocco che gestisce quella richiesta. Con più
                   <code>server</code> in gioco vince quello che corrisponde al
                   <code>server_name</code>, e in mancanza di corrispondenza vince il
                   <em>default_server</em> — che spesso non è quello che stavi modificando.
                   <code>nginx -T</code> (maiuscola) stampa la configurazione <em>effettiva</em>,
                   include compresi, e chiude la questione.`,
              en: `If the <code>reload</code> succeeded, nginx <em>did</em> re-read the
                   configuration: the problem is not that it missed your edit, it is that your edit
                   is not in the block handling that request. With several <code>server</code>
                   blocks, the one matching <code>server_name</code> wins, and with no match the
                   <em>default_server</em> wins — which is often not the one you were editing.
                   <code>nginx -T</code> (capital) prints the <em>effective</em> configuration,
                   includes and all, and settles it.` } },

        { kind: "pro", html: {
            it: `<p><code>nginx -t</code> prima di ogni <code>reload</code> non è pignoleria: è
                 l'unica cosa che separa «ho cambiato una riga» da «ho mandato giù il sito».
                 Il modo corretto è una riga sola: <code>nginx -t &amp;&amp; systemctl reload
                 nginx</code>. Se il test fallisce, il reload non parte nemmeno.</p>
                 <p>Sull'autenticazione a chiave: il concetto che sblocca tutto è che
                 <strong>la chiave privata non lascia mai il tuo computer</strong>. Sul server
                 metti solo quella pubblica, in <code>~/.ssh/authorized_keys</code>. Da cui il
                 vincolo sui permessi che fa impazzire tutti: sshd <strong>rifiuta</strong> di
                 usare quel file se la home o <code>.ssh</code> sono scrivibili dal gruppo o da
                 altri. Non è un bug, è una difesa: se un altro utente può scrivere nel tuo
                 <code>authorized_keys</code>, può entrare come te. Servono
                 <code>700</code> su <code>.ssh</code> e <code>600</code> sul file.</p>
                 <p>E per sapere cosa sshd sta <em>davvero</em> applicando, non si legge
                 <code>sshd_config</code>: si esegue <code>sshd -T</code>, che stampa la
                 configurazione effettiva con i valori di default già risolti. È la stessa
                 differenza fra leggere una legge e chiedere al giudice.</p>`,
            en: `<p><code>nginx -t</code> before every <code>reload</code> is not fussiness: it is
                 the only thing separating "I changed a line" from "I took the site down". The
                 correct form is one line: <code>nginx -t &amp;&amp; systemctl reload nginx</code>.
                 If the test fails, the reload never happens.</p>
                 <p>On key authentication: the idea that unlocks everything is that <strong>the
                 private key never leaves your computer</strong>. On the server you put only the
                 public one, in <code>~/.ssh/authorized_keys</code>. Hence the permission rule that
                 drives everyone mad: sshd <strong>refuses</strong> to use that file if the home or
                 <code>.ssh</code> are group- or world-writable. Not a bug, a defence: if another
                 user can write your <code>authorized_keys</code>, they can log in as you. You need
                 <code>700</code> on <code>.ssh</code> and <code>600</code> on the file.</p>
                 <p>And to know what sshd is <em>really</em> applying, you do not read
                 <code>sshd_config</code>: you run <code>sshd -T</code>, which prints the effective
                 configuration with defaults already resolved. Same difference as between reading a
                 law and asking the judge.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>restart</code> quando bastava <code>reload</code></strong> interrompe le connessioni in corso. Per un cambio di configurazione, <code>reload</code> quasi sempre basta.",
              en: "<strong><code>restart</code> where <code>reload</code> would do</strong> drops ongoing connections. For a configuration change, <code>reload</code> is almost always enough." },
            { it: "<strong>Permessi troppo aperti su <code>~/.ssh</code> e sshd ignora le tue chiavi</strong> senza dirti perché — nei log c'è, ma il messaggio lato client dice solo «Permission denied».",
              en: "<strong>Permissions too open on <code>~/.ssh</code> and sshd ignores your keys</strong> without telling you why — it is in the logs, but the client-side message just says \"Permission denied\"." },
            { it: "<strong>Non chiudere l'accesso a password prima di aver provato la chiave.</strong> L'ordine giusto è: metti la chiave, apri una <em>seconda</em> sessione per verificarla, e solo allora disabilita la password.",
              en: "<strong>Do not disable password login before testing the key.</strong> The right order is: install the key, open a <em>second</em> session to verify it, and only then disable passwords." },
        ] },

        { kind: "recap", table: [
            { cmd: "nginx -t", what: { it: "la configurazione è valida?", en: "is the configuration valid?" }, flag: { it: "sempre prima di ricaricare", en: "always before reloading" } },
            { cmd: "nginx -T", what: { it: "la configurazione <em>effettiva</em>", en: "the <em>effective</em> configuration" }, flag: { it: "include compresi: chiude ogni discussione", en: "includes and all: it settles every argument" } },
            { cmd: "systemctl reload", what: { it: "rileggi senza chiudere", en: "re-read without closing" }, flag: { it: "<code>restart</code> solo se serve davvero", en: "<code>restart</code> only when truly needed" } },
            { cmd: "sshd -T", what: { it: "cosa applica sshd davvero", en: "what sshd really applies" }, flag: { it: "<code>| grep password</code> per il dubbio più comune", en: "<code>| grep password</code> for the commonest doubt" } },
            { cmd: "ssh-keygen", what: { it: "crea la coppia di chiavi", en: "create the key pair" }, flag: { it: "<code>-t ed25519</code>; la privata non si copia mai", en: "<code>-t ed25519</code>; never copy the private one" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Pubblica un sito. Fa' in modo che nginx serva la pagina in
                     <code>/var/www/lab/index.html</code> con il testo che trovi in
                     <code>/root/lab/testo.txt</code>, sulla porta 80. La verifica fa
                     <code>curl</code> dall'interno e confronta il contenuto.`,
                en: `Publish a site. Make nginx serve the page at
                     <code>/var/www/lab/index.html</code> with the text found in
                     <code>/root/lab/testo.txt</code>, on port 80. The check runs <code>curl</code>
                     from inside and compares the content.`,
            },
            checks: [
                { id: "config-valida",
                  why: { it: "Una configurazione che non passa <code>nginx -t</code> non arriverà mai a servire nulla, e con <code>restart</code> ti lascia il servizio spento.",
                         en: "A configuration that fails <code>nginx -t</code> will never serve anything, and with <code>restart</code> it leaves the service down." },
                  nudge: { it: "<code>nginx -t</code> dice file e riga dell'errore.",
                           en: "<code>nginx -t</code> gives you the file and line of the error." } },
                { id: "risponde",
                  why: { it: "«Ho modificato la configurazione» non è «il sito funziona». Fra le due c'è il <code>reload</code>, e la prova con <code>curl</code>.",
                         en: "\"I edited the configuration\" is not \"the site works\". Between the two there is the <code>reload</code>, and the <code>curl</code> test." },
                  nudge: { it: "<code>curl -s localhost</code> dall'interno del container. Se non risponde, <code>systemctl status nginx</code>.",
                           en: "<code>curl -s localhost</code> from inside the container. If it does not answer, <code>systemctl status nginx</code>." } },
            ],
            hints: [
                { it: "Il file del sito va in <code>/var/www/lab/index.html</code>; il contenuto lo trovi in <code>/root/lab/testo.txt</code>.", en: "The site file goes in <code>/var/www/lab/index.html</code>; the content is in <code>/root/lab/testo.txt</code>." },
                { it: "Modifica la <code>root</code> del server block di default in <code>/etc/nginx/sites-enabled/default</code>, poi <code>nginx -t &amp;&amp; systemctl reload nginx</code>.", en: "Change the default server block's <code>root</code> in <code>/etc/nginx/sites-enabled/default</code>, then <code>nginx -t &amp;&amp; systemctl reload nginx</code>." },
                { it: "<code>mkdir -p /var/www/lab &amp;&amp; cp /root/lab/testo.txt /var/www/lab/index.html &amp;&amp; sed -i 's#root /var/www/html;#root /var/www/lab;#' /etc/nginx/sites-enabled/default &amp;&amp; nginx -t &amp;&amp; systemctl reload nginx</code>", en: "<code>mkdir -p /var/www/lab &amp;&amp; cp /root/lab/testo.txt /var/www/lab/index.html &amp;&amp; sed -i 's#root /var/www/html;#root /var/www/lab;#' /etc/nginx/sites-enabled/default &amp;&amp; nginx -t &amp;&amp; systemctl reload nginx</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Chiudi l'accesso a password su ssh: <code>PasswordAuthentication</code> deve
                     risultare <strong>no</strong> nella configurazione <em>effettiva</em>, e sshd
                     deve essere attivo. <em>La verifica chiede a sshd, non legge il file.</em>`,
                en: `Close password login on ssh: <code>PasswordAuthentication</code> must be
                     <strong>no</strong> in the <em>effective</em> configuration, and sshd must be
                     active. <em>The check asks sshd, it does not read the file.</em>`,
            },
            checks: [
                { id: "password-chiusa",
                  why: { it: "Le password su ssh esposto a internet si rompono a forza bruta, prima o poi. Le chiavi no. È la singola modifica che riduce di più la superficie d'attacco di un server.",
                         en: "Passwords on internet-facing ssh get brute-forced sooner or later. Keys do not. It is the single change that most reduces a server's attack surface." },
                  nudge: { it: "<code>sshd -T | grep -i passwordauth</code> ti dice cosa sshd applica davvero, non cosa hai scritto. Se non cambia, forse c'è una seconda direttiva più in basso, o un file in <code>sshd_config.d/</code>.",
                           en: "<code>sshd -T | grep -i passwordauth</code> tells you what sshd really applies, not what you wrote. If it does not change, there may be a second directive further down, or a file in <code>sshd_config.d/</code>." } },
                { id: "sshd-attivo",
                  why: { it: "Una configurazione perfetta su un servizio spento non protegge niente e non serve nessuno. Vale sempre la pena verificare che sia ancora vivo dopo la modifica.",
                         en: "A perfect configuration on a stopped service protects nothing and serves nobody. Always worth checking it is still alive after the change." },
                  nudge: { it: "<code>systemctl status ssh</code>. Se non riparte, <code>sshd -t</code> dice dov'è l'errore di sintassi.",
                           en: "<code>systemctl status ssh</code>. If it will not restart, <code>sshd -t</code> says where the syntax error is." } },
            ],
            hints: [
                { it: "La direttiva è <code>PasswordAuthentication</code>, in <code>/etc/ssh/sshd_config</code>.", en: "The directive is <code>PasswordAuthentication</code>, in <code>/etc/ssh/sshd_config</code>." },
                { it: "Attenzione ai file in <code>/etc/ssh/sshd_config.d/</code>: vengono inclusi e possono vincere sul file principale.", en: "Watch out for files in <code>/etc/ssh/sshd_config.d/</code>: they are included and can override the main file." },
                { it: "<code>printf 'PasswordAuthentication no\\n' &gt; /etc/ssh/sshd_config.d/99-lab.conf &amp;&amp; sshd -t &amp;&amp; systemctl restart ssh</code>", en: "<code>printf 'PasswordAuthentication no\\n' &gt; /etc/ssh/sshd_config.d/99-lab.conf &amp;&amp; sshd -t &amp;&amp; systemctl restart ssh</code>" },
            ],
        },
    ],
};
