export default {
    id: "ch15", num: 15, runtime: "browser", requires: ["ch05"], draft: false,
    title: { it: "Rete di base", en: "Networking basics" },
    oneLiner: {
        it: "Un indirizzo, una porta, un nome — e chi traduce cosa.",
        en: "An address, a port, a name — and who translates what.",
    },
    commands: ["ip a", "ip link", "ping", "ss -tulpn", "curl", "/etc/hosts", "/etc/resolv.conf"],
    glossary: ["interfaccia", "loopback", "porta", "in ascolto", "risoluzione"],

    blocks: [
        { kind: "hook", html: {
            it: `«Il servizio non risponde.» Prima di toccare qualunque configurazione, tre domande
                 in ordine: <strong>c'è un indirizzo? qualcuno è in ascolto su quella porta? il
                 nome viene tradotto?</strong> Quasi sempre la risposta è in una di queste tre.`,
            en: `"The service is not responding." Before touching any configuration, three
                 questions in order: <strong>is there an address? is anyone listening on that
                 port? does the name resolve?</strong> Almost always the answer is in one of the
                 three.` } },

        { kind: "lead", html: {
            it: `La rete sembra complicata perché mescola tre cose diverse: <strong>indirizzi</strong>
                 (dove sei), <strong>porte</strong> (quale programma), <strong>nomi</strong>
                 (l'etichetta leggibile). Sono tre livelli indipendenti, e si diagnosticano uno
                 alla volta.`,
            en: `Networking looks complicated because it mixes three different things:
                 <strong>addresses</strong> (where you are), <strong>ports</strong> (which
                 program), <strong>names</strong> (the readable label). Three independent layers,
                 diagnosed one at a time.` } },

        { kind: "local", html: {
            it: `<p><strong>Questa macchina non ha una scheda di rete.</strong> v86 esegue un Linux
                 vero dentro il browser, ma non gli dà una via verso internet. Non è un limite
                 nascosto: è la ragione per cui questo capitolo si concentra su ciò che si può
                 <em>guardare</em> invece che su ciò che si può scaricare.</p>
                 <p>Funziona davvero, qui dentro: l'interfaccia di <strong>loopback</strong>
                 (<code>127.0.0.1</code>), <code>ping</code>, un <strong>server web vero</strong>
                 avviato in locale, <code>ss</code> che mostra chi è in ascolto, <code>curl</code>
                 che scarica, e <code>/etc/hosts</code> che traduce i nomi. È esattamente la parte
                 che si usa per diagnosticare, ed è tutta reale.</p>
                 <p>Non funziona, e non fingiamo che funzioni: risolvere un dominio pubblico e
                 raggiungere una macchina esterna. Il DNS vero e il routing sono il
                 <strong>capitolo 18</strong>, che si fa nel laboratorio locale.</p>`,
            en: `<p><strong>This machine has no network card.</strong> v86 runs a real Linux inside
                 the browser, but gives it no route to the internet. That is not a hidden
                 limitation: it is why this chapter focuses on what you can <em>look at</em>
                 rather than on what you can download.</p>
                 <p>What really works in here: the <strong>loopback</strong> interface
                 (<code>127.0.0.1</code>), <code>ping</code>, a <strong>real web server</strong>
                 started locally, <code>ss</code> showing who is listening, <code>curl</code>
                 fetching, and <code>/etc/hosts</code> translating names. That is exactly the part
                 you use to diagnose, and all of it is real.</p>
                 <p>What does not work, and we will not pretend otherwise: resolving a public
                 domain and reaching an external machine. Real DNS and routing are
                 <strong>chapter 18</strong>, done in the local lab.</p>` } },

        { kind: "analogy", html: {
            it: `Un palazzo. L'<strong>indirizzo IP</strong> è la via e il numero civico: individua
                 la macchina. La <strong>porta</strong> è il campanello: individua <em>chi</em>,
                 dentro quella macchina, deve rispondere. Il <strong>nome</strong> è il cognome
                 sulla targhetta, e serve qualcuno che sappia tradurlo in numero civico — il DNS,
                 oppure la rubrica scritta a mano che è <code>/etc/hosts</code>.`,
            en: `A building. The <strong>IP address</strong> is the street and number: it locates
                 the machine. The <strong>port</strong> is the doorbell: it locates <em>who</em>,
                 inside that machine, should answer. The <strong>name</strong> is the surname on
                 the nameplate, and someone must translate it into a street number — DNS, or the
                 handwritten address book that is <code>/etc/hosts</code>.` } },

        { kind: "shown", lines: [
            { cmd: "ip -o a", out: "1: lo    inet 127.0.0.1/8 scope host lo",
              note: { it: "<code>lo</code> è il <strong>loopback</strong>: la macchina che parla con sé stessa. C'è sempre, su qualunque Linux, e non passa da nessun cavo.",
                      en: "<code>lo</code> is the <strong>loopback</strong>: the machine talking to itself. It is always there, on any Linux, and touches no cable." } },
            { cmd: "ping -c 2 127.0.0.1", out: "2 packets transmitted, 2 packets received, 0% packet loss",
              note: { it: "Se il ping al loopback non funziona, il problema non è la rete: è il sistema. È il primo controllo della scaletta.",
                      en: "If pinging the loopback fails, the problem is not the network: it is the system. It is the first step of the checklist." } },
            { cmd: "ss -tulpn | head -3",
              out: "Netid State  Local Address:Port  Process\ntcp   LISTEN 0.0.0.0:8080       users:((\"httpd\",pid=142,fd=4))",
              note: { it: "<strong>Chi è in ascolto, e su quale porta.</strong> È il comando che risponde a «il servizio è partito davvero?» — e la colonna <em>Process</em> dice pure quale programma è.",
                      en: "<strong>Who is listening, and on which port.</strong> It is the command that answers \"did the service really start?\" — and the <em>Process</em> column even says which program." } },
            { cmd: "curl -s http://127.0.0.1:8080/", out: "<h1>ciao dal lab</h1>",
              note: { it: "Il server è locale ma la richiesta è vera: passa dallo stack TCP/IP del kernel esattamente come farebbe da fuori.",
                      en: "The server is local but the request is real: it goes through the kernel's TCP/IP stack exactly as it would from outside." } },
            { cmd: "echo '127.0.0.1 mio.sito' >> /etc/hosts && curl -s http://mio.sito:8080/",
              out: "<h1>ciao dal lab</h1>",
              note: { it: "<code>/etc/hosts</code> viene consultato <strong>prima</strong> del DNS. È il modo di provare un sito prima di spostare il dominio — e anche il primo posto dove guardare quando un nome si risolve «in modo strano».",
                      en: "<code>/etc/hosts</code> is consulted <strong>before</strong> DNS. It is how you test a site before moving the domain — and also the first place to look when a name resolves \"oddly\"." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>La differenza fra <code>127.0.0.1</code> e <code>0.0.0.0</code> in
                 <code>ss</code> è una delle cose più utili che si possano imparare in dieci
                 secondi. Un servizio in ascolto su <code>127.0.0.1:5432</code> è raggiungibile
                 <strong>solo dalla macchina stessa</strong>; su <code>0.0.0.0:5432</code> è
                 raggiungibile da chiunque arrivi. «Da locale funziona ma da fuori no» è quasi
                 sempre questo, e non un firewall.</p>
                 <p>Le porte sotto la 1024 sono <strong>privilegiate</strong>: solo root può
                 mettersi in ascolto. È il motivo per cui un'applicazione gira sulla 8080 e c'è un
                 reverse proxy sulla 80 — non è una moda, è un vincolo del kernel.</p>
                 <p>E l'ordine di risoluzione dei nomi non è «prima il DNS»: lo decide
                 <code>/etc/nsswitch.conf</code>, e in pratica è <code>/etc/hosts</code> prima,
                 DNS dopo. Per questo una riga dimenticata in <code>hosts</code> può far puntare
                 un nome a una macchina sbagliata per mesi, senza che nessun cambio di DNS abbia
                 effetto.</p>`,
            en: `<p>The difference between <code>127.0.0.1</code> and <code>0.0.0.0</code> in
                 <code>ss</code> is one of the most useful things you can learn in ten seconds. A
                 service listening on <code>127.0.0.1:5432</code> is reachable <strong>only from
                 the machine itself</strong>; on <code>0.0.0.0:5432</code> it is reachable by
                 anyone who gets there. "It works locally but not from outside" is almost always
                 this, not a firewall.</p>
                 <p>Ports below 1024 are <strong>privileged</strong>: only root may listen on them.
                 That is why an application runs on 8080 with a reverse proxy on 80 — not a
                 fashion, a kernel constraint.</p>
                 <p>And name resolution order is not "DNS first": it is decided by
                 <code>/etc/nsswitch.conf</code>, and in practice it is <code>/etc/hosts</code>
                 first, DNS after. Which is why a forgotten line in <code>hosts</code> can point a
                 name at the wrong machine for months, with no DNS change having any effect.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>«Non funziona la rete» quasi mai è la rete.</strong> La scaletta è: interfaccia su → indirizzo → il servizio è in ascolto → il nome si risolve. Salta un passo e ci perdi un'ora.",
              en: "<strong>\"The network is down\" is almost never the network.</strong> The checklist is: interface up → address → service listening → name resolves. Skip a step and you lose an hour." },
            { it: "<strong><code>ping</code> che non risponde non significa che la macchina è spenta.</strong> Moltissimi server bloccano l'ICMP di proposito. Usa <code>curl</code> sulla porta che ti interessa.",
              en: "<strong>A <code>ping</code> with no answer does not mean the machine is down.</strong> Plenty of servers block ICMP on purpose. Use <code>curl</code> against the port you care about." },
            { it: "<strong>Una riga in <code>/etc/hosts</code> vince sul DNS e non scade mai.</strong> Comodissima per provare, pericolosa da dimenticare.",
              en: "<strong>A line in <code>/etc/hosts</code> beats DNS and never expires.</strong> Extremely handy for testing, dangerous to forget." },
        ] },

        { kind: "recap", table: [
            { cmd: "ip a", what: { it: "che indirizzi ho", en: "what addresses do I have" }, flag: { it: "<code>ip -o a</code> per una riga per interfaccia", en: "<code>ip -o a</code> for one line per interface" } },
            { cmd: "ping", what: { it: "arriva un pacchetto?", en: "does a packet get there?" }, flag: { it: "<code>-c 2</code> per non restare bloccato", en: "<code>-c 2</code> so it does not hang" } },
            { cmd: "ss -tulpn", what: { it: "chi è in ascolto e dove", en: "who is listening and where" }, flag: { it: "guarda se è <code>127.0.0.1</code> o <code>0.0.0.0</code>", en: "check whether it is <code>127.0.0.1</code> or <code>0.0.0.0</code>" } },
            { cmd: "curl", what: { it: "prova davvero il servizio", en: "actually test the service" }, flag: { it: "<code>-s</code> silenzioso, <code>-I</code> solo intestazioni", en: "<code>-s</code> silent, <code>-I</code> headers only" } },
            { cmd: "/etc/hosts", what: { it: "rubrica locale dei nomi", en: "local name book" }, flag: { it: "viene prima del DNS, e non scade", en: "comes before DNS, and never expires" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `Che indirizzo IPv4 ha l'interfaccia <code>lo</code> su questa macchina?
                     Consegna il solo indirizzo, senza la maschera.`,
                en: `What IPv4 address does the <code>lo</code> interface have on this machine?
                     Hand in the address alone, without the mask.`,
            },
            checks: [
                { id: "loopback",
                  why: { it: "Il loopback c'è su ogni Linux del mondo e non passa da nessun cavo: è la prova che lo stack di rete funziona anche quando la rete non c'è. È il primo controllo di ogni diagnosi.",
                         en: "The loopback exists on every Linux in the world and touches no cable: it proves the network stack works even when the network does not. It is the first check of any diagnosis." },
                  nudge: { it: "<code>ip -o a show lo</code> te lo dà in una riga; l'indirizzo è quello dopo <code>inet</code>, prima della barra.",
                           en: "<code>ip -o a show lo</code> gives it in one line; the address is the one after <code>inet</code>, before the slash." } },
            ],
            hints: [
                { it: "<code>ip a</code> elenca le interfacce e i loro indirizzi.", en: "<code>ip a</code> lists interfaces and their addresses." },
                { it: "Cerca la riga <code>inet</code> dell'interfaccia <code>lo</code>. La maschera è il <code>/8</code> finale, che non serve.", en: "Look for the <code>inet</code> line of interface <code>lo</code>. The mask is the trailing <code>/8</code>, which you do not need." },
                { it: "<code>ip -4 -o a show lo | awk '{print $4}' | cut -d/ -f1 | lab answer</code>", en: "<code>ip -4 -o a show lo | awk '{print $4}' | cut -d/ -f1 | lab answer</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Un server web è già in ascolto su questa macchina, ma <strong>non ti diciamo su
                     quale porta</strong>. Trovala, scarica la pagina e salvala in
                     <code>~/lab/pagina.html</code>. <em>La porta cambia a ogni mondo: devi
                     chiederla alla macchina.</em>`,
                en: `A web server is already listening on this machine, but <strong>we are not
                     telling you the port</strong>. Find it, download the page and save it to
                     <code>~/lab/pagina.html</code>. <em>The port changes with every world: you
                     have to ask the machine.</em>`,
            },
            checks: [
                { id: "pagina-scaricata",
                  why: { it: "Questa è la diagnosi vera: non «riavvia il servizio», ma <em>guarda chi è in ascolto</em>. <code>ss</code> risponde in un secondo a una domanda su cui si perdono pomeriggi.",
                         en: "This is the real diagnosis: not \"restart the service\", but <em>look at who is listening</em>. <code>ss</code> answers in one second a question people lose afternoons on." },
                  nudge: { it: "<code>ss -tlnp</code> elenca le porte in ascolto e il programma. Poi <code>curl http://127.0.0.1:PORTA/</code>.",
                           en: "<code>ss -tlnp</code> lists listening ports and the program. Then <code>curl http://127.0.0.1:PORT/</code>." } },
            ],
            hints: [
                { it: "Per vedere le porte in ascolto: <code>ss -tlnp</code>.", en: "To see listening ports: <code>ss -tlnp</code>." },
                { it: "Trovata la porta, <code>curl</code> scarica; <code>-s</code> lo rende silenzioso e <code>&gt;</code> salva.", en: "Once you have the port, <code>curl</code> downloads; <code>-s</code> makes it quiet and <code>&gt;</code> saves." },
                { it: "<code>p=$(ss -tln | awk 'NR&gt;1 {split($4,a,\":\"); print a[length(a)]}' | head -1); curl -s http://127.0.0.1:$p/ &gt; ~/lab/pagina.html</code>", en: "<code>p=$(ss -tln | awk 'NR&gt;1 {split($4,a,\":\"); print a[length(a)]}' | head -1); curl -s http://127.0.0.1:$p/ &gt; ~/lab/pagina.html</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Fa' in modo che <code>curl http://mio.sito:PORTA/</code> funzioni,
                     <strong>senza DNS</strong> — qui non c'è. Poi salva la pagina ottenuta
                     <em>usando il nome</em> in <code>~/lab/pagina-per-nome.html</code>.`,
                en: `Make <code>curl http://mio.sito:PORT/</code> work, <strong>without DNS</strong>
                     — there is none here. Then save the page fetched <em>by name</em> into
                     <code>~/lab/pagina-per-nome.html</code>.`,
            },
            checks: [
                { id: "hosts-configurato",
                  why: { it: "È il trucco che si usa per collaudare un sito prima di spostare il dominio: si punta il nome alla macchina nuova solo sul proprio computer, e si prova sul serio.",
                         en: "This is the trick for testing a site before moving the domain: you point the name at the new machine on your own computer only, and test for real." },
                  nudge: { it: "La riga in <code>/etc/hosts</code> è <code>indirizzo nome</code>, in quest'ordine, separati da spazi.",
                           en: "The line in <code>/etc/hosts</code> is <code>address name</code>, in that order, separated by whitespace." } },
                { id: "scaricata-per-nome",
                  why: { it: "Non basta scrivere la riga: bisogna verificare che la risoluzione funzioni davvero. Configurare e non provare è metà lavoro.",
                         en: "Writing the line is not enough: you must verify resolution really works. Configuring without testing is half a job." },
                  nudge: { it: "Se <code>curl http://mio.sito:PORTA/</code> dà <em>Could not resolve host</em>, la riga non c'è o è scritta al contrario.",
                           en: "If <code>curl http://mio.sito:PORT/</code> says <em>Could not resolve host</em>, the line is missing or written backwards." } },
            ],
            hints: [
                { it: "Il file che traduce i nomi senza DNS è <code>/etc/hosts</code>.", en: "The file that translates names without DNS is <code>/etc/hosts</code>." },
                { it: "Aggiungi in fondo una riga <code>127.0.0.1 mio.sito</code>, poi riprova con <code>curl</code>.", en: "Append a line <code>127.0.0.1 mio.sito</code>, then try <code>curl</code> again." },
                { it: "<code>echo '127.0.0.1 mio.sito' &gt;&gt; /etc/hosts; p=$(ss -tln | awk 'NR&gt;1 {split($4,a,\":\"); print a[length(a)]}' | head -1); curl -s http://mio.sito:$p/ &gt; ~/lab/pagina-per-nome.html</code>", en: "<code>echo '127.0.0.1 mio.sito' &gt;&gt; /etc/hosts; p=$(ss -tln | awk 'NR&gt;1 {split($4,a,\":\"); print a[length(a)]}' | head -1); curl -s http://mio.sito:$p/ &gt; ~/lab/pagina-per-nome.html</code>" },
            ],
        },
    ],
};
