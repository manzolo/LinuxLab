export default {
    id: "ch20", num: 20, runtime: "local", requires: ["ch19"], draft: false,
    title: { it: "Firewall e sicurezza", en: "Firewall and hardening" },
    oneLiner: {
        it: "Chiudere tutto e riaprire solo il necessario.",
        en: "Close everything, then reopen only what is needed.",
    },
    commands: ["nft list ruleset", "nft add rule", "ss -tulpn", "find -perm", "chmod", "fail2ban"],
    glossary: ["default deny", "chain", "policy", "setuid", "world-writable"],

    blocks: [
        { kind: "hook", html: {
            it: `Un database che nessuno doveva raggiungere da fuori era in ascolto su
                 <code>0.0.0.0</code>. Non c'era nessun attacco sofisticato:
                 <strong>c'era una porta aperta che nessuno aveva chiuso</strong>, perché nessuno
                 aveva mai guardato l'elenco.`,
            en: `A database nobody was supposed to reach from outside was listening on
                 <code>0.0.0.0</code>. There was no sophisticated attack: <strong>there was an open
                 port nobody had closed</strong>, because nobody had ever looked at the list.` } },

        { kind: "local", html: {
            it: `<p>Il firewall di Linux vive nel kernel (<em>netfilter</em>), e per programmarlo
                 servono privilegi di rete che nel browser non esistono: v86 non ha né schede né
                 tabelle da riempire. Qui il container ha il suo network namespace, quindi le
                 regole che scrivi valgono solo per lui: <strong>puoi chiudere tutto senza
                 tagliarti fuori dal tuo computer</strong>.</p>
                 <p>Nota onesta: <code>run.sh</code> controlla che i moduli <code>nf_tables</code>
                 siano già caricati sull'host. Caricarli dal container richiederebbe
                 <code>SYS_MODULE</code>, un privilegio che non vale la pena concedere per un
                 laboratorio.</p>`,
            en: `<p>Linux's firewall lives in the kernel (<em>netfilter</em>), and programming it
                 needs networking privileges the browser does not have: v86 has neither cards nor
                 tables to fill. Here the container has its own network namespace, so the rules you
                 write apply only to it: <strong>you can close everything without locking yourself
                 out of your own computer</strong>.</p>
                 <p>Honest note: <code>run.sh</code> checks the <code>nf_tables</code> modules are
                 already loaded on the host. Loading them from inside would need
                 <code>SYS_MODULE</code>, a privilege not worth granting for a lab.</p>`,
            cmd: "./lab/local/run.sh 20 1\ndocker exec -it linuxlab bash",
        } },

        { kind: "lead", html: {
            it: `Un firewall è una lista di regole lette in ordine, con una decisione finale
                 (<em>policy</em>) per chi non corrisponde a nessuna. Il modello che funziona è uno
                 solo: <strong>policy «scarta», e poi apri caso per caso</strong>. L'opposto —
                 chiudere le cose brutte — richiede di conoscerle tutte in anticipo.`,
            en: `A firewall is a list of rules read in order, with a final decision
                 (<em>policy</em>) for whatever matches none. Only one model works:
                 <strong>policy "drop", then open case by case</strong>. The opposite — blocking
                 the bad things — requires knowing all of them in advance.` } },

        { kind: "analogy", html: {
            it: `Il portone di un palazzo. Puoi tenerlo aperto e mettere un cartello con l'elenco
                 di chi <em>non</em> può entrare — e sperare di averli previsti tutti. Oppure lo
                 tieni chiuso e apri a chi suona ed è nella lista. <strong>La seconda è l'unica che
                 regge, perché non ti chiede di conoscere il futuro.</strong>`,
            en: `A building's front door. You can leave it open with a sign listing who may
                 <em>not</em> come in — and hope you predicted them all. Or you keep it shut and
                 open for whoever rings and is on the list. <strong>The second is the only one that
                 holds, because it does not ask you to know the future.</strong>` } },

        { kind: "transcript", src: "transcript.json" },

        { kind: "predict",
          domanda: { it: "Hai una regola <code>accept</code> per la porta 22 <em>dopo</em> una regola <code>drop</code> generica. Cosa succede a chi si collega in ssh?",
                     en: "You have an <code>accept</code> rule for port 22 <em>after</em> a generic <code>drop</code> rule. What happens to an incoming ssh connection?" },
          opzioni: [
              { testo: { it: "Viene scartato: vince la prima regola che corrisponde, e la drop viene prima.", en: "It gets dropped: the first matching rule wins, and the drop comes first." }, giusta: true },
              { testo: { it: "Passa: le regole di accept hanno priorità su quelle di drop.", en: "It passes: accept rules take priority over drop rules." }, giusta: false },
              { testo: { it: "Dipende dalla policy della catena.", en: "It depends on the chain policy." }, giusta: false },
          ],
          spiegazione: {
              it: `Le regole si leggono <strong>dall'alto in basso</strong> e la prima che
                   corrisponde decide: non c'è nessuna priorità per tipo. La policy interviene solo
                   se <em>nessuna</em> regola corrisponde. È la ragione per cui l'ordine è tutto, e
                   per cui la regola generica di scarto va sempre <strong>in fondo</strong>.`,
              en: `Rules are read <strong>top to bottom</strong> and the first match decides: there
                   is no priority by type. The policy only applies if <em>no</em> rule matches.
                   That is why order is everything, and why the generic drop always goes
                   <strong>last</strong>.` } },

        { kind: "pro", html: {
            it: `<p>Una regola <em>stateful</em> cambia tutto:
                 <code>ct state established,related accept</code> in cima alla catena lascia
                 rientrare le risposte al traffico che hai iniziato tu. Senza, chiudi la porta e ti
                 accorgi che non funziona più nemmeno la navigazione: hai bloccato le
                 <em>risposte</em> alle tue richieste. È il primo errore di chiunque scriva un
                 firewall a mano.</p>
                 <p>Il firewall non è la sola difesa, e spesso non è nemmeno la prima: un servizio
                 che ascolta su <code>127.0.0.1</code> non ha bisogno di nessuna regola per essere
                 irraggiungibile da fuori. <strong>Chiudere il socket è più solido che filtrare il
                 pacchetto</strong>, perché non dipende da una configurazione che qualcuno può
                 azzerare.</p>
                 <p>E il capitolo 6 torna qui in veste di sicurezza: i file
                 <strong>world-writable</strong> (<code>find / -perm -002 -type f</code>) permettono
                 a chiunque di modificarli, e i binari <strong>setuid</strong>
                 (<code>find / -perm -4000</code>) girano con i privilegi del proprietario invece
                 che di chi li lancia. Un setuid root scritto male è una scala verso root, e la
                 lista di quelli legittimi su un sistema è più corta di quanto si creda.</p>`,
            en: `<p>A <em>stateful</em> rule changes everything:
                 <code>ct state established,related accept</code> at the top of the chain lets
                 replies to traffic you started come back in. Without it, you close the door and
                 find that even browsing stops working: you blocked the <em>answers</em> to your
                 own requests. It is the first mistake of anyone hand-writing a firewall.</p>
                 <p>The firewall is not the only defence, and often not even the first: a service
                 listening on <code>127.0.0.1</code> needs no rule at all to be unreachable from
                 outside. <strong>Closing the socket is sturdier than filtering the packet</strong>,
                 because it does not depend on a configuration someone can flush.</p>
                 <p>And chapter 6 returns here wearing a security hat:
                 <strong>world-writable</strong> files (<code>find / -perm -002 -type f</code>) let
                 anyone modify them, and <strong>setuid</strong> binaries
                 (<code>find / -perm -4000</code>) run with the owner's privileges instead of the
                 caller's. A badly written setuid-root binary is a ladder to root, and the list of
                 legitimate ones on a system is shorter than people think.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Non chiudere mai la porta da cui sei entrato.</strong> Su una macchina remota, una regola sbagliata sulla 22 significa perdere l'accesso. Si prova sempre con un timer che ripristina, o da una seconda sessione già aperta.",
              en: "<strong>Never close the door you came in through.</strong> On a remote machine, a wrong rule on port 22 means losing access. Always test with a timer that reverts, or from a second session already open." },
            { it: "<strong>Le regole di <code>nft</code> non sopravvivono al riavvio</strong> se non le salvi (<code>/etc/nftables.conf</code> più il servizio abilitato). Un firewall che sparisce al primo riavvio è peggio che non averlo, perché credi di essere protetto.",
              en: "<strong><code>nft</code> rules do not survive a reboot</strong> unless you save them (<code>/etc/nftables.conf</code> plus the service enabled). A firewall that vanishes on reboot is worse than none, because you believe you are protected." },
            { it: "<strong>Un firewall non protegge da un servizio bucato che hai aperto apposta.</strong> È un filtro sulle porte, non un controllo su cosa passa dentro quelle porte.",
              en: "<strong>A firewall does not protect against a compromised service you deliberately exposed.</strong> It filters ports, it does not inspect what flows through them." },
        ] },

        { kind: "recap", table: [
            { cmd: "nft list ruleset", what: { it: "cosa c'è adesso", en: "what is there now" }, flag: { it: "sempre il primo comando", en: "always the first command" } },
            { cmd: "policy drop", what: { it: "tutto chiuso, poi apri", en: "everything closed, then open" }, flag: { it: "l'unico modello che regge", en: "the only model that holds" } },
            { cmd: "ct state established", what: { it: "lascia rientrare le risposte", en: "let replies back in" }, flag: { it: "va in cima, o non naviga più niente", en: "goes first, or nothing browses any more" } },
            { cmd: "ss -tulpn", what: { it: "cosa è esposto davvero", en: "what is actually exposed" }, flag: { it: "<code>127.0.0.1</code> è già chiuso al mondo", en: "<code>127.0.0.1</code> is already closed to the world" } },
            { cmd: "find / -perm -4000", what: { it: "i binari setuid", en: "setuid binaries" }, flag: { it: "l'elenco legittimo è corto: guardalo", en: "the legitimate list is short: look at it" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Chiudi la macchina e riapri il minimo: nella tabella <code>inet lab</code>,
                     catena <code>input</code> con <strong>policy drop</strong>, devono essere
                     accettati <strong>solo</strong> il traffico già stabilito, il loopback, e le
                     porte <strong>22</strong> e <strong>80</strong>. La verifica prova anche la
                     3306, che deve essere respinta.`,
                en: `Close the machine and reopen the minimum: in table <code>inet lab</code>,
                     chain <code>input</code> with <strong>policy drop</strong>, accept
                     <strong>only</strong> established traffic, loopback, and ports
                     <strong>22</strong> and <strong>80</strong>. The check also tries 3306, which
                     must be refused.`,
            },
            checks: [
                { id: "policy-drop",
                  why: { it: "Con policy <code>accept</code> le tue regole diventano decorazione: tutto quello che non hai previsto passa comunque.",
                         en: "With an <code>accept</code> policy your rules become decoration: everything you did not foresee gets through anyway." },
                  nudge: { it: "<code>nft list chain inet lab input</code>: nella prima riga deve comparire <code>policy drop</code>.",
                           en: "<code>nft list chain inet lab input</code>: the first line must say <code>policy drop</code>." } },
                { id: "22-e-80-aperte",
                  why: { it: "Aprire dopo aver chiuso è l'ordine giusto. E le regole vanno prima della fine: la prima che corrisponde decide.",
                         en: "Opening after closing is the right order. And rules go before the end: the first match decides." },
                  nudge: { it: "<code>nft list ruleset</code> e cerca <code>dport 22</code> e <code>dport 80</code> con <code>accept</code>.",
                           en: "<code>nft list ruleset</code> and look for <code>dport 22</code> and <code>dport 80</code> with <code>accept</code>." } },
                { id: "3306-chiusa",
                  why: { it: "È la porta di MySQL, e il caso reale del riquadro qui sopra: doveva essere raggiungibile solo da dentro, ed era aperta al mondo.",
                         en: "That is MySQL's port, and the real case in the box above: it was supposed to be internal only, and it was open to the world." },
                  nudge: { it: "Se anche la 3306 passa, probabilmente hai lasciato una regola generica di accept o la policy è ancora <code>accept</code>.",
                           en: "If 3306 also gets through, you probably left a generic accept rule, or the policy is still <code>accept</code>." } },
            ],
            hints: [
                { it: "Prima la tabella e la catena: <code>nft add table inet lab</code> e <code>nft add chain inet lab input '{ type filter hook input priority 0; policy drop; }'</code>.", en: "First the table and chain: <code>nft add table inet lab</code> and <code>nft add chain inet lab input '{ type filter hook input priority 0; policy drop; }'</code>." },
                { it: "Poi le eccezioni, in ordine: stato stabilito, loopback, e infine le due porte.", en: "Then the exceptions, in order: established state, loopback, and finally the two ports." },
                { it: "<code>nft add rule inet lab input ct state established,related accept</code> · <code>… iif lo accept</code> · <code>… tcp dport { 22, 80 } accept</code>", en: "<code>nft add rule inet lab input ct state established,related accept</code> · <code>… iif lo accept</code> · <code>… tcp dport { 22, 80 } accept</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Fai l'audit del sistema. In <code>/root/lab/audit.txt</code> scrivi i percorsi
                     di <strong>tutti i file world-writable</strong> sotto <code>/srv</code>, uno
                     per riga, ordinati. Il seed ne ha piantati alcuni: la verifica sa quali.`,
                en: `Audit the system. In <code>/root/lab/audit.txt</code> write the paths of
                     <strong>every world-writable file</strong> under <code>/srv</code>, one per
                     line, sorted. The seed planted some: the check knows which.`,
            },
            checks: [
                { id: "audit-completo",
                  why: { it: "Un file scrivibile da tutti dentro un'area servita da un sito è il modo più semplice di far caricare a un estraneo il codice che vuole. È il capitolo 6 che diventa sicurezza.",
                         en: "A world-writable file inside an area served by a site is the simplest way to let a stranger upload whatever code they like. It is chapter 6 becoming security." },
                  nudge: { it: "<code>find /srv -type f -perm -002</code> — il <code>-002</code> significa «ha almeno il bit di scrittura per gli altri».",
                           en: "<code>find /srv -type f -perm -002</code> — <code>-002</code> means \"has at least the write bit for others\"." } },
            ],
            hints: [
                { it: "<code>find</code> sa cercare per permessi: l'opzione è <code>-perm</code>.", en: "<code>find</code> can search by permissions: the option is <code>-perm</code>." },
                { it: "Il trattino davanti (<code>-002</code>) significa «almeno questi bit», non «esattamente».", en: "The leading dash (<code>-002</code>) means \"at least these bits\", not \"exactly\"." },
                { it: "<code>find /srv -type f -perm -002 | sort &gt; /root/lab/audit.txt</code>", en: "<code>find /srv -type f -perm -002 | sort &gt; /root/lab/audit.txt</code>" },
            ],
        },
    ],
};
