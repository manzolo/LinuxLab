export default {
    id: "ch18", num: 18, runtime: "local", requires: ["ch15"], draft: false,
    title: { it: "Rete avanzata", en: "Networking, deeper" },
    oneLiner: {
        it: "Dove passa un pacchetto, e come si guarda mentre passa.",
        en: "Where a packet goes, and how to watch it going.",
    },
    commands: ["ip route", "ip route get", "ip addr add", "tcpdump", "dig", "ss -s", "mtu"],
    glossary: ["gateway", "rotta", "netns", "MTU", "risolutore"],

    blocks: [
        { kind: "hook", html: {
            it: `«Non naviga.» Quattro parole che possono voler dire sei cose diverse.
                 <strong>C'è una scaletta</strong> che le distingue in due minuti, e non comincia
                 mai da «riavvia il router».`,
            en: `"No internet." Three words that can mean six different things. <strong>There is a
                 checklist</strong> that tells them apart in two minutes, and it never starts with
                 "reboot the router".` } },

        { kind: "local", html: {
            it: `<p>Nel browser hai visto la rete <em>ferma</em>: interfacce, porte, nomi. Qui la
                 vedi <em>in movimento</em>. Serve il laboratorio locale per una ragione precisa:
                 v86 non dà alla macchina nessuna scheda di rete, quindi non c'è un gateway, non
                 c'è una rotta e non c'è un pacchetto da catturare.</p>
                 <p>Il container ha il suo <strong>network namespace</strong>: indirizzi, rotte e
                 regole sono suoi e non toccano il tuo computer. Puoi rompere quello che vuoi.</p>`,
            en: `<p>In the browser you saw the network <em>standing still</em>: interfaces, ports,
                 names. Here you see it <em>moving</em>. The local lab is needed for a precise
                 reason: v86 gives the machine no network card, so there is no gateway, no route
                 and no packet to capture.</p>
                 <p>The container has its own <strong>network namespace</strong>: addresses, routes
                 and rules are its own and do not touch your computer. You can break whatever you
                 like.</p>`,
            cmd: "./lab/local/run.sh 18 1\ndocker exec -it linuxlab bash",
        } },

        { kind: "lead", html: {
            it: `Un pacchetto che esce fa sempre le stesse domande, in ordine: <em>a chi devo
                 mandarlo?</em> (la tabella di routing), <em>da quale interfaccia?</em>,
                 <em>qual è l'indirizzo fisico del prossimo salto?</em>. Sapere leggere la tabella
                 di routing risolve metà dei problemi di rete.`,
            en: `An outgoing packet always asks the same questions, in order: <em>who do I send
                 this to?</em> (the routing table), <em>out of which interface?</em>, <em>what is
                 the next hop's hardware address?</em>. Being able to read the routing table solves
                 half of all network problems.` } },

        { kind: "analogy", html: {
            it: `La tabella di routing è <strong>il cartello agli incroci</strong>. Ogni riga dice
                 «per questa destinazione, prendi quella strada». L'ultima riga —
                 <code>default</code> — è il cartello che dice «per tutto il resto, di là»: è il
                 gateway. Senza quella riga, la macchina sa parlare solo con i vicini di casa.`,
            en: `The routing table is <strong>the signpost at the crossroads</strong>. Each line
                 says "for this destination, take that road". The last line — <code>default</code>
                 — is the sign saying "for everything else, that way": the gateway. Without that
                 line, the machine can only talk to its immediate neighbours.` } },

        { kind: "transcript", src: "transcript.json" },

        { kind: "predict",
          domanda: { it: "<code>ping 8.8.8.8</code> funziona, ma <code>ping www.esempio.it</code> dice <em>Name or service not known</em>. Dov'è il problema?",
                     en: "<code>ping 8.8.8.8</code> works, but <code>ping www.example.com</code> says <em>Name or service not known</em>. Where is the problem?" },
          opzioni: [
              { testo: { it: "Nella risoluzione dei nomi: il DNS. La connettività IP funziona già.", en: "In name resolution: DNS. IP connectivity already works." }, giusta: true },
              { testo: { it: "Nel gateway: manca la rotta di default.", en: "In the gateway: the default route is missing." }, giusta: false },
              { testo: { it: "Nel firewall, che blocca il traffico in uscita.", en: "In the firewall, blocking outbound traffic." }, giusta: false },
          ],
          spiegazione: {
              it: `Se il ping <em>numerico</em> arriva a destinazione, allora interfaccia, indirizzo,
                   rotta e gateway funzionano tutti: il pacchetto è uscito ed è tornato. L'unica
                   cosa rimasta è tradurre il nome in numero, e quella è la riga
                   <code>nameserver</code> in <code>/etc/resolv.conf</code>.
                   <strong>Questa è la scaletta:</strong> ogni prova che riesce esclude tutti i
                   livelli sotto di sé.`,
              en: `If the <em>numeric</em> ping reaches its destination, then interface, address,
                   route and gateway all work: the packet went out and came back. The only thing
                   left is turning a name into a number, and that is the <code>nameserver</code>
                   line in <code>/etc/resolv.conf</code>.
                   <strong>That is the checklist:</strong> every test that succeeds rules out every
                   layer below it.` } },

        { kind: "pro", html: {
            it: `<p><code>ip route get 8.8.8.8</code> è il comando più sottovalutato della rete
                 Linux: invece di farti <em>leggere</em> la tabella e ragionare, chiede al kernel
                 <strong>quale decisione prenderebbe adesso</strong> per quella destinazione, con
                 interfaccia e indirizzo sorgente. Su una macchina con più schede o con VPN è la
                 differenza fra capire in dieci secondi e ipotizzare per un'ora.</p>
                 <p>La <strong>MTU</strong> è la causa dei guasti più assurdi che vedrai: la
                 connessione si apre, i pacchetti piccoli passano, e i trasferimenti grandi si
                 bloccano a metà per sempre. Succede quando qualcuno lungo il percorso scarta l'ICMP
                 "fragmentation needed" e la scoperta automatica della MTU non funziona. Sintomo:
                 <code>ping</code> ok, <code>ssh</code> che si connette e poi si pianta appena
                 stampa qualcosa di lungo.</p>
                 <p>E <code>tcpdump</code>: la regola pratica è <code>-n</code> (non risolvere i
                 nomi, o aspetti il DNS mentre catturi), un filtro sempre
                 (<code>port 80</code>, <code>host 10.0.0.5</code>), e <code>-c</code> per fermarsi
                 da solo. <code>tcpdump</code> senza filtro su un server carico produce più output
                 di quanto tu possa leggere in una vita.</p>`,
            en: `<p><code>ip route get 8.8.8.8</code> is the most underrated command in Linux
                 networking: instead of making you <em>read</em> the table and reason, it asks the
                 kernel <strong>what decision it would make right now</strong> for that
                 destination, with interface and source address. On a machine with several NICs or
                 a VPN it is the difference between understanding in ten seconds and guessing for
                 an hour.</p>
                 <p><strong>MTU</strong> causes the most absurd failures you will ever see: the
                 connection opens, small packets pass, and large transfers hang forever halfway.
                 It happens when someone along the path drops the "fragmentation needed" ICMP and
                 path MTU discovery breaks. Symptom: <code>ping</code> fine, <code>ssh</code>
                 connecting and then freezing the moment it prints something long.</p>
                 <p>And <code>tcpdump</code>: the practical rule is <code>-n</code> (do not resolve
                 names, or you wait on DNS while capturing), always a filter
                 (<code>port 80</code>, <code>host 10.0.0.5</code>), and <code>-c</code> so it
                 stops itself. <code>tcpdump</code> with no filter on a busy server produces more
                 output than you could read in a lifetime.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Un ping che non risponde non significa «spento».</strong> Moltissimi host bloccano l'ICMP di proposito. Prova la porta che ti interessa con <code>curl</code> o <code>nc -vz</code>.",
              en: "<strong>A ping with no answer does not mean \"down\".</strong> Plenty of hosts block ICMP on purpose. Test the port you care about with <code>curl</code> or <code>nc -vz</code>." },
            { it: "<strong>Le modifiche con <code>ip</code> non sopravvivono al riavvio.</strong> Servono per provare; per renderle permanenti c'è la configurazione della distribuzione (<code>netplan</code>, <code>NetworkManager</code>, <code>/etc/network/interfaces</code>).",
              en: "<strong>Changes made with <code>ip</code> do not survive a reboot.</strong> They are for testing; to make them permanent you use the distribution's configuration (<code>netplan</code>, <code>NetworkManager</code>, <code>/etc/network/interfaces</code>)." },
            { it: "<strong><code>/etc/resolv.conf</code> spesso è generato</strong> da NetworkManager o systemd-resolved: modificarlo a mano funziona fino al prossimo rinnovo DHCP, e poi il problema «torna da solo».",
              en: "<strong><code>/etc/resolv.conf</code> is often generated</strong> by NetworkManager or systemd-resolved: editing it by hand works until the next DHCP renewal, and then the problem \"comes back by itself\"." },
        ] },

        { kind: "recap", table: [
            { cmd: "ip route", what: { it: "la tabella dei cartelli", en: "the signpost table" }, flag: { it: "la riga <code>default</code> è il gateway", en: "the <code>default</code> line is the gateway" } },
            { cmd: "ip route get X", what: { it: "cosa farebbe il kernel per X", en: "what the kernel would do for X" }, flag: { it: "il comando che risparmia un'ora", en: "the command that saves an hour" } },
            { cmd: "tcpdump -n -c 20", what: { it: "guarda i pacchetti veri", en: "look at the actual packets" }, flag: { it: "sempre con un filtro, sempre con <code>-c</code>", en: "always with a filter, always with <code>-c</code>" } },
            { cmd: "dig +short nome", what: { it: "risolvi un nome", en: "resolve a name" }, flag: { it: "<code>@8.8.8.8</code> per provare un altro risolutore", en: "<code>@8.8.8.8</code> to test another resolver" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Aggiungi un indirizzo secondario <code>10.99.0.1/24</code> all'interfaccia
                     <code>lo</code> e verifica che il kernel lo usi: <code>ip route get
                     10.99.0.7</code> deve rispondere passando da <code>lo</code>.`,
                en: `Add a secondary address <code>10.99.0.1/24</code> to the <code>lo</code>
                     interface and verify the kernel uses it: <code>ip route get 10.99.0.7</code>
                     must answer via <code>lo</code>.`,
            },
            checks: [
                { id: "indirizzo-aggiunto",
                  why: { it: "Un'interfaccia può avere più indirizzi: è così che una macchina serve più siti o vive su più reti. Non serve una scheda in più.",
                         en: "An interface can hold several addresses: that is how one machine serves several sites or lives on several networks. No extra card needed." },
                  nudge: { it: "<code>ip -o a show lo</code> elenca tutti gli indirizzi dell'interfaccia, non solo il primo.",
                           en: "<code>ip -o a show lo</code> lists all the interface's addresses, not just the first." } },
                { id: "rotta-attiva",
                  why: { it: "Aggiungere un indirizzo crea automaticamente una rotta per quella rete. <code>ip route get</code> lo dimostra chiedendo al kernel invece di fidarsi.",
                         en: "Adding an address automatically creates a route for that network. <code>ip route get</code> proves it by asking the kernel instead of trusting." },
                  nudge: { it: "<code>ip route get 10.99.0.7</code>: nella risposta deve comparire <code>dev lo</code>.",
                           en: "<code>ip route get 10.99.0.7</code>: the answer must contain <code>dev lo</code>." } },
            ],
            hints: [
                { it: "Il comando per aggiungere un indirizzo è <code>ip addr add</code>.", en: "The command to add an address is <code>ip addr add</code>." },
                { it: "Va indicata anche l'interfaccia: <code>… dev lo</code>.", en: "You must also name the interface: <code>… dev lo</code>." },
                { it: "<code>ip addr add 10.99.0.1/24 dev lo</code>", en: "<code>ip addr add 10.99.0.1/24 dev lo</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Cattura il traffico verso il server web locale. Avvia
                     <code>tcpdump</code> sulla porta 80, fai una richiesta con
                     <code>curl</code>, e salva la cattura in
                     <code>/root/lab/cattura.txt</code>: deve contenere almeno una riga con il
                     <strong>SYN</strong> iniziale.`,
                en: `Capture the traffic to the local web server. Start <code>tcpdump</code> on
                     port 80, make a request with <code>curl</code>, and save the capture into
                     <code>/root/lab/cattura.txt</code>: it must contain at least one line with
                     the initial <strong>SYN</strong>.`,
            },
            checks: [
                { id: "cattura-con-syn",
                  why: { it: "Vedere l'handshake con i propri occhi è quello che trasforma «TCP» da parola in cosa: SYN, SYN-ACK, ACK, e solo dopo i dati.",
                         en: "Seeing the handshake with your own eyes is what turns \"TCP\" from a word into a thing: SYN, SYN-ACK, ACK, and only then the data." },
                  nudge: { it: "<code>tcpdump -n -i lo -c 10 port 80 &gt; /root/lab/cattura.txt &amp;</code>, poi <code>curl -s localhost &gt;/dev/null</code>, poi <code>wait</code>.",
                           en: "<code>tcpdump -n -i lo -c 10 port 80 &gt; /root/lab/cattura.txt &amp;</code>, then <code>curl -s localhost &gt;/dev/null</code>, then <code>wait</code>." } },
                { id: "risposta-del-server",
                  why: { it: "Una cattura non è una frase: è una <strong>conversazione</strong>. Al SYN del client corrisponde il SYN-ACK del server <em>verso la stessa porta effimera</em>, quella che il kernel ha scelto sul momento. È il modo in cui si legge davvero un <code>tcpdump</code>: si seguono le due parti, non le singole righe. <em>Detto onestamente: un file di testo si scrive a mano, e questa verifica non lo può impedire — ma per falsificarla devi aver capito com'è fatta una stretta di mano TCP, che è poi la cosa da imparare.</em>",
                         en: "A capture is not a sentence: it is a <strong>conversation</strong>. The client's SYN is answered by the server's SYN-ACK <em>to the same ephemeral port</em>, the one the kernel picked on the spot. This is how you actually read a <code>tcpdump</code>: you follow both sides, not single lines. <em>Said plainly: a text file can be written by hand, and this check cannot prevent that — but to fake it you must have understood how a TCP handshake works, which is the thing to learn.</em>" },
                  nudge: { it: "Nella cattura cerca le due righe consecutive: <code>… .PORTA &gt; ….80: Flags [S]</code> e <code>… .80 &gt; ….PORTA: Flags [S.]</code>. Se manca la seconda, hai catturato solo un verso: togli il filtro sull'interfaccia o usa <code>-i lo</code>.",
                           en: "In the capture look for the two consecutive lines: <code>… .PORT &gt; ….80: Flags [S]</code> and <code>… .80 &gt; ….PORT: Flags [S.]</code>. If the second is missing you captured one direction only: drop the interface filter or use <code>-i lo</code>." } },
            ],
            hints: [
                { it: "<code>tcpdump</code> vuole l'interfaccia (<code>-i lo</code>) e un filtro (<code>port 80</code>).", en: "<code>tcpdump</code> wants an interface (<code>-i lo</code>) and a filter (<code>port 80</code>)." },
                { it: "Va lanciato in background <em>prima</em> del <code>curl</code>, e con <code>-c</code> per fermarsi da solo.", en: "Start it in the background <em>before</em> the <code>curl</code>, and with <code>-c</code> so it stops on its own." },
                { it: "<code>tcpdump -n -i lo -c 10 port 80 &gt; /root/lab/cattura.txt 2&gt;/dev/null &amp; sleep 1; curl -s localhost &gt;/dev/null; wait</code>", en: "<code>tcpdump -n -i lo -c 10 port 80 &gt; /root/lab/cattura.txt 2&gt;/dev/null &amp; sleep 1; curl -s localhost &gt;/dev/null; wait</code>" },
            ],
        },
    ],
};
