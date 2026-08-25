export default {
    id: "ch06", num: 6, runtime: "browser", requires: ["ch05"], draft: false,
    title: { it: "Permessi e proprietà", en: "Permissions and ownership" },
    oneLiner: {
        it: "Chi legge, chi scrive, chi entra — e come si ripara quando è sbagliato.",
        en: "Who reads, who writes, who enters — and how to fix it when it is wrong.",
    },
    commands: ["ls -l", "chmod", "chown", "chgrp", "umask", "stat"],
    glossary: ["permessi", "ottale", "umask", "proprietario", "gruppo"],

    blocks: [
        { kind: "hook", html: {
            it: `Hai copiato un sito da un backup. I file ci sono tutti, il server è acceso, e il
                 browser dice <strong>403 Forbidden</strong>. Non manca niente:
                 <em>manca il permesso di guardarlo</em>.`,
            en: `You restored a site from a backup. Every file is there, the server is up, and the
                 browser says <strong>403 Forbidden</strong>. Nothing is missing:
                 <em>what is missing is permission to look at it</em>.` } },

        { kind: "lead", html: {
            it: `Ogni file ha un proprietario, un gruppo, e tre terzetti di permessi. Sono nove
                 bit in tutto. Quando li avrai letti una volta con calma, quella colonna
                 incomprensibile di <code>ls -l</code> diventerà la cosa più chiara dello schermo.`,
            en: `Every file has an owner, a group, and three triplets of permissions. Nine bits in
                 total. Once you have read them through calmly, that incomprehensible column in
                 <code>ls -l</code> becomes the clearest thing on screen.` } },

        { kind: "analogy", html: {
            it: `Immagina un edificio con tre categorie di persone: <strong>il proprietario</strong>,
                 <strong>chi ha il badge del suo gruppo</strong>, e <strong>tutti gli altri</strong>.
                 Per ognuna decidi tre cose: può <em>leggere</em> quello che c'è dentro
                 (<code>r</code>), può <em>modificarlo</em> (<code>w</code>), può <em>entrare</em>
                 (<code>x</code>). Nove decisioni, e la stringa <code>rwxr-xr--</code> le elenca
                 tutte in quest'ordine.`,
            en: `Picture a building with three categories of people: <strong>the owner</strong>,
                 <strong>those with the group badge</strong>, and <strong>everyone else</strong>.
                 For each you decide three things: they can <em>read</em> what is inside
                 (<code>r</code>), <em>change</em> it (<code>w</code>), <em>enter</em>
                 (<code>x</code>). Nine decisions, and the string <code>rwxr-xr--</code> lists them
                 all in that order.` } },

        { kind: "shown", lines: [
            { cmd: "ls -l relazione.pdf", out: "-rw-r--r-- 1 anna redazione 84213 Mar  4 11:02 relazione.pdf",
              note: { it: "<code>-</code> tipo (file normale) · <code>rw-</code> il proprietario legge e scrive · <code>r--</code> il gruppo solo legge · <code>r--</code> tutti gli altri solo leggono. Poi: proprietario <em>anna</em>, gruppo <em>redazione</em>.",
                      en: "<code>-</code> type (regular file) · <code>rw-</code> owner reads and writes · <code>r--</code> group reads only · <code>r--</code> everyone else reads only. Then: owner <em>anna</em>, group <em>redazione</em>." } },
            { cmd: "stat -c '%a %U:%G %n' relazione.pdf", out: "644 anna:redazione relazione.pdf",
              note: { it: "Gli stessi permessi in <strong>ottale</strong>: <code>r</code>=4, <code>w</code>=2, <code>x</code>=1, sommati per terzetto. <code>rw-</code> = 4+2 = 6.",
                      en: "The same permissions in <strong>octal</strong>: <code>r</code>=4, <code>w</code>=2, <code>x</code>=1, summed per triplet. <code>rw-</code> = 4+2 = 6." } },
            { cmd: "chmod 644 relazione.pdf", out: "",
              note: { it: "Forma numerica: dice esattamente com'è alla fine. <code>644</code> = proprietario scrive, tutti leggono.",
                      en: "Numeric form: it states exactly the final state. <code>644</code> = owner writes, everyone reads." } },
            { cmd: "chmod u=rw,go=r relazione.pdf", out: "",
              note: { it: "Forma simbolica: <strong>lo stesso identico risultato</strong>. La verifica guarda i bit, non come li hai scritti.",
                      en: "Symbolic form: <strong>the exact same result</strong>. The check looks at the bits, not at how you wrote them." } },
            { cmd: "chown root:redazione relazione.pdf && ls -l relazione.pdf",
              out: "-rw-r--r-- 1 root redazione 84213 Mar  4 11:02 relazione.pdf",
              note: { it: "<code>chmod</code> cambia <em>cosa si può fare</em>, <code>chown</code> cambia <em>di chi è</em>: due cose diverse che si confondono di continuo. La forma è <code>utente:gruppo</code>, e si può dare anche solo l'una o solo l'altra. Su un albero intero si aggiunge <code>-R</code>.",
                      en: "<code>chmod</code> changes <em>what can be done</em>, <code>chown</code> changes <em>who owns it</em>: two different things that get mixed up all the time. The form is <code>user:group</code>, and you can give just one of the two. On a whole tree you add <code>-R</code>." } },
            { cmd: "ls -ld immagini/", out: "drwxr-xr-x 2 anna redazione 4096 Mar  4 11:02 immagini/",
              note: { it: "Su una <em>cartella</em> la <code>x</code> non significa «eseguire»: significa <strong>attraversare</strong>. Senza, non ci entri nemmeno se hai la <code>r</code>.",
                      en: "On a <em>directory</em> the <code>x</code> does not mean \"execute\": it means <strong>traverse</strong>. Without it you cannot enter, even with <code>r</code>." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>La <code>r</code> su una cartella e la <code>x</code> su una cartella fanno due
                 cose diverse, e confonderle spiega metà dei permessi rotti del mondo:
                 <code>r</code> ti lascia <em>elencare i nomi</em>, <code>x</code> ti lascia
                 <em>usare quei nomi</em>. Una cartella con <code>r</code> ma senza <code>x</code>
                 ti fa vedere l'elenco e poi ti nega ogni file: <code>ls</code> funziona,
                 <code>cat</code> no. Il contrario (<code>x</code> senza <code>r</code>) è una
                 cartella "cieca": non puoi elencare, ma se conosci il nome esatto entri. È così
                 che si costruiscono le cartelle di scambio.</p>
                 <p>E i permessi che vedi su un file nuovo non li hai scelti tu: li ha decisi la
                 <strong>umask</strong>, che <em>toglie</em> bit dal massimo consentito (666 per i
                 file, 777 per le cartelle — l'eseguibilità non si regala mai). Con
                 <code>umask 022</code> un file nasce 644 e una cartella 755. La regola esatta è
                 una maschera sui bit (<code>modo &amp; ~umask</code>), non una normale sottrazione:
                 con valori diversi, sottrarre dà risultati sbagliati.</p>
                 <p>Ci sono poi tre bit oltre i nove: <em>setuid</em>, <em>setgid</em> e lo
                 <em>sticky bit</em>. Quest'ultimo è il motivo per cui in <code>/tmp</code>
                 (permessi <code>1777</code>) chiunque può scrivere, ma solo il proprietario del
                 file, il proprietario della directory o root può rimuovere o rinominare una
                 voce.</p>`,
            en: `<p><code>r</code> on a directory and <code>x</code> on a directory do two
                 different things, and confusing them explains half the broken permissions in the
                 world: <code>r</code> lets you <em>list the names</em>, <code>x</code> lets you
                 <em>use those names</em>. A directory with <code>r</code> but no <code>x</code>
                 shows you the listing and then denies every file: <code>ls</code> works,
                 <code>cat</code> does not. The opposite (<code>x</code> without <code>r</code>)
                 is a "blind" directory: you cannot list it, but if you know the exact name you
                 get in. That is how drop folders are built.</p>
                 <p>And the permissions on a new file were not chosen by you: they were decided by
                 the <strong>umask</strong>, which <em>removes</em> bits from the allowed maximum
                 (666 for files, 777 for directories — executability is never given away). With
                 <code>umask 022</code> a file is born 644 and a directory 755. The exact rule is
                 a bit mask (<code>mode &amp; ~umask</code>), not ordinary subtraction: with other
                 values, subtracting gives the wrong answer.</p>
                 <p>There are also three bits beyond the nine: <em>setuid</em>, <em>setgid</em>
                 and the <em>sticky bit</em>. The last is why in <code>/tmp</code> (mode
                 <code>1777</code>) anyone can write, but only the file owner, the directory owner,
                 or root may remove or rename an entry.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>chmod 777</code> non è «risolvere», è «arrendersi».</strong> Funziona sempre, e apre la porta a chiunque. Se ti viene la tentazione, il problema quasi sempre è il <em>proprietario</em>, non i permessi.",
              en: "<strong><code>chmod 777</code> is not \"fixing it\", it is giving up.</strong> It always works, and it opens the door to everyone. When you feel the urge, the problem is almost always the <em>owner</em>, not the permissions." },
            { it: "<strong><code>chmod -R 755</code> su una cartella rende eseguibili anche i file di testo.</strong> Cartelle e file vogliono permessi diversi: vanno trattati separatamente, con <code>find -type d</code> e <code>find -type f</code>.",
              en: "<strong><code>chmod -R 755</code> on a folder makes text files executable too.</strong> Directories and files want different permissions: treat them separately, with <code>find -type d</code> and <code>find -type f</code>." },
            { it: "<strong>Per entrare in <code>/a/b/c</code> serve la <code>x</code> su <em>tutte e tre</em>.</strong> Un permesso mancante tre livelli sopra blocca tutto quello che sta sotto.",
              en: "<strong>To enter <code>/a/b/c</code> you need <code>x</code> on <em>all three</em>.</strong> One missing permission three levels up blocks everything below." },
        ] },

        { kind: "recap", table: [
            { cmd: "ls -l", what: { it: "vedi permessi e proprietario", en: "see permissions and owner" }, flag: { it: "<code>-d</code> per la cartella stessa, non il contenuto", en: "<code>-d</code> for the folder itself, not its content" } },
            { cmd: "stat", what: { it: "gli stessi dati, in ottale", en: "same data, in octal" }, flag: { it: "<code>-c '%a %U:%G %n'</code>", en: "<code>-c '%a %U:%G %n'</code>" } },
            { cmd: "chmod", what: { it: "cambia i permessi", en: "change permissions" }, flag: { it: "<code>644</code> file, <code>755</code> cartelle ed eseguibili", en: "<code>644</code> files, <code>755</code> folders and executables" } },
            { cmd: "chown", what: { it: "cambia proprietario e gruppo", en: "change owner and group" }, flag: { it: "<code>chown -R utente:gruppo cartella</code>", en: "<code>chown -R user:group folder</code>" } },
            { cmd: "umask", what: { it: "che permessi avranno i file nuovi", en: "what new files will get" }, flag: { it: "<code>022</code> è il valore normale", en: "<code>022</code> is the usual value" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `Il file <code>~/lab/misterioso</code> ha dei permessi che cambiano a ogni
                     mondo. <strong>Traducili in ottale</strong> (tre cifre) e consegnali.
                     <em>Guardali, non indovinarli.</em>`,
                en: `The file <code>~/lab/misterioso</code> has permissions that change with every
                     world. <strong>Translate them into octal</strong> (three digits) and hand
                     them in. <em>Look at them, do not guess.</em>`,
            },
            checks: [
                { id: "ottale",
                  why: { it: "Leggere <code>rwxr-x---</code> e dire «750» senza contare sulle dita è il momento in cui i permessi smettono di farti paura.",
                         en: "Reading <code>rwxr-x---</code> and saying \"750\" without counting on your fingers is the moment permissions stop scaring you." },
                  nudge: { it: "<code>ls -l</code> te li mostra in lettere; <code>stat -c '%a' file</code> te li dà già in ottale, così controlli il tuo conto.",
                           en: "<code>ls -l</code> shows them as letters; <code>stat -c '%a' file</code> gives them in octal already, so you can check your arithmetic." } },
            ],
            hints: [
                { it: "<code>r</code>=4, <code>w</code>=2, <code>x</code>=1. Somma dentro ogni terzetto.", en: "<code>r</code>=4, <code>w</code>=2, <code>x</code>=1. Sum within each triplet." },
                { it: "Tre terzetti: proprietario, gruppo, altri. <code>rw-</code> fa 6, <code>r-x</code> fa 5, <code>---</code> fa 0.", en: "Three triplets: owner, group, others. <code>rw-</code> is 6, <code>r-x</code> is 5, <code>---</code> is 0." },
                { it: "<code>stat -c '%a' ~/lab/misterioso | lab answer</code>", en: "<code>stat -c '%a' ~/lab/misterioso | lab answer</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Il sito in <code>~/lab/srv/sito</code> è stato copiato da un backup ed è tutto
                     <code>777</code>, di proprietà di <code>root</code>. Rimettilo a posto:
                     <strong>file 644</strong>, <strong>cartelle 755</strong>, tutto di proprietà
                     di <code>root:web</code>. Il processo web deve poter leggere, non riscrivere
                     i contenuti che serve.`,
                en: `The site in <code>~/lab/srv/sito</code> came from a backup and is all
                     <code>777</code>, owned by <code>root</code>. Fix it:
                     <strong>files 644</strong>, <strong>directories 755</strong>, everything owned
                     by <code>root:web</code>. The web process must be able to read, not rewrite,
                     the content it serves.`,
            },
            attrezzi: [
                { cmd: "find … -type f -exec … {} +", cap: 9, cosa: {
                    it: "<code>find</code> cerca per proprietà — <code>-type f</code> dà i soli file, <code>-type d</code> le sole cartelle — e <code>-exec … {} +</code> esegue un comando su quello che ha trovato. È il modo di trattare file e cartelle in modo diverso, che <code>chmod -R</code> da solo non sa fare.",
                    en: "<code>find</code> searches by property — <code>-type f</code> gives files only, <code>-type d</code> directories only — and <code>-exec … {} +</code> runs a command on what it found. It is how you treat files and folders differently, which <code>chmod -R</code> alone cannot do." } },
            ],
            checks: [
                { id: "proprietario",
                  why: { it: "Un file che il server web deve leggere ma non modificare non deve appartenergli. Sbagliare qui è il modo più comune di trasformare un bug in una compromissione.",
                         en: "A file the web server must read but not modify should not belong to it. Getting this wrong is the most common way a bug becomes a compromise." },
                  nudge: { it: "Guarda la terza e la quarta colonna di <code>ls -l ~/lab/srv/sito</code>.",
                           en: "Look at the third and fourth columns of <code>ls -l ~/lab/srv/sito</code>." } },
                { id: "permessi-file",
                  why: { it: "<code>644</code> = il proprietario scrive, tutti leggono. <code>664</code> lascia scrivere anche al gruppo: è la porta da cui entrano i guai.",
                         en: "<code>644</code> = owner writes, everyone reads. <code>664</code> lets the group write too: that is the door trouble comes through." },
                  nudge: { it: "<code>find ~/lab/srv/sito -type f -exec stat -c '%a %n' {} +</code> te li elenca tutti in ottale.",
                           en: "<code>find ~/lab/srv/sito -type f -exec stat -c '%a %n' {} +</code> lists them all in octal." } },
                { id: "permessi-cartelle",
                  why: { it: "Su una cartella la <code>x</code> non significa «eseguire»: significa <strong>attraversare</strong>. Senza, non entri nemmeno se hai la <code>r</code> — ed è per questo che le cartelle vogliono 755 e i file 644.",
                         en: "On a directory the <code>x</code> does not mean \"execute\": it means <strong>traverse</strong>. Without it you cannot enter even with <code>r</code> — which is why directories want 755 and files 644." },
                  nudge: { it: "<code>find ~/lab/srv/sito -type d -exec stat -c '%a %n' {} +</code>",
                           en: "<code>find ~/lab/srv/sito -type d -exec stat -c '%a %n' {} +</code>" },
                },
                { id: "niente-777", pro: true,
                  why: { it: "Un solo file rimasto a 777 vanifica tutto il resto: chi attacca cerca esattamente quello.",
                         en: "A single file left at 777 undoes all the rest: an attacker looks for exactly that one." },
                  nudge: { it: "<code>find ~/lab/srv/sito -perm 777</code> non deve stampare niente.",
                           en: "<code>find ~/lab/srv/sito -perm 777</code> must print nothing." } },
            ],
            hints: [
                { it: "Servono due passaggi diversi: uno per i file, uno per le cartelle. Un <code>chmod -R</code> solo non può farli entrambi.", en: "You need two separate passes: one for files, one for directories. A single <code>chmod -R</code> cannot do both." },
                { it: "<code>find … -type f</code> e <code>find … -type d</code> ti danno i due insiemi separati.", en: "<code>find … -type f</code> and <code>find … -type d</code> give you the two sets separately." },
                { it: "<code>chown -R root:web ~/lab/srv/sito</code>, poi <code>find ~/lab/srv/sito -type f -exec chmod 644 {} +</code> e lo stesso con <code>-type d</code> e <code>755</code>.", en: "<code>chown -R root:web ~/lab/srv/sito</code>, then <code>find ~/lab/srv/sito -type f -exec chmod 644 {} +</code> and the same with <code>-type d</code> and <code>755</code>." },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Lo script <code>~/lab/deploy.sh</code> «non parte»: <em>Permission denied</em>.
                     Rendilo eseguibile <strong>per il proprietario e solo per lui</strong>:
                     nessun altro deve poterlo lanciare.`,
                en: `The script <code>~/lab/deploy.sh</code> "does not run": <em>Permission
                     denied</em>. Make it executable <strong>for the owner and only the
                     owner</strong>: nobody else may run it.`,
            },
            checks: [
                { id: "eseguibile-owner",
                  why: { it: "Su Linux un file non è eseguibile perché finisce in <code>.sh</code>: lo è perché ha il bit <code>x</code>. L'estensione è solo un suggerimento per gli umani.",
                         en: "On Linux a file is not executable because it ends in <code>.sh</code>: it is because it has the <code>x</code> bit. The extension is only a hint for humans." },
                  nudge: { it: "<code>chmod u+x file</code> aggiunge il permesso al solo proprietario, senza toccare gli altri.",
                           en: "<code>chmod u+x file</code> adds the permission to the owner only, leaving the others alone." } },
                { id: "non-per-gli-altri",
                  why: { it: "Con la classe omessa, <code>chmod +x</code> parte da <code>a</code> ma rispetta la <code>umask</code>: il risultato dipende dall'ambiente. <code>u+x</code> esprime invece esattamente l'intenzione.",
                         en: "With the class omitted, <code>chmod +x</code> starts from <code>a</code> but honours the <code>umask</code>: the result depends on the environment. <code>u+x</code> states the intent exactly." },
                  nudge: { it: "<code>stat -c '%a' ~/lab/deploy.sh</code>: la cifra giusta finisce per 4 e 4. Cerchiamo <code>744</code>.",
                           en: "<code>stat -c '%a' ~/lab/deploy.sh</code>: the right number ends in 4 and 4. We want <code>744</code>." } },
            ],
            hints: [
                { it: "Il permesso di esecuzione si chiama <code>x</code>.", en: "The execute permission is called <code>x</code>." },
                { it: "In forma simbolica <code>u</code> è il proprietario, <code>g</code> il gruppo, <code>o</code> gli altri.", en: "In symbolic form <code>u</code> is the owner, <code>g</code> the group, <code>o</code> others." },
                { it: "<code>chmod 744 ~/lab/deploy.sh</code> — oppure <code>chmod u+x ~/lab/deploy.sh</code> se parte da 644.", en: "<code>chmod 744 ~/lab/deploy.sh</code> — or <code>chmod u+x ~/lab/deploy.sh</code> if it starts at 644." },
            ],
        },
    ],
};
