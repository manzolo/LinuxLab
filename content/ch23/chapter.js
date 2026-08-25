export default {
    id: "ch23", num: 23, runtime: "browser", requires: ["ch11"], draft: false,
    title: { it: "Diagnostica: osserva, misura, cura", en: "Diagnostics: observe, measure, cure" },
    oneLiner: {
        it: "«È lenta» non è una diagnosi: CPU, memoria e disco si guardano separati.",
        en: "\"It's slow\" is not a diagnosis: CPU, memory and disk are read separately.",
    },
    commands: ["df -h", "df -P", "du -ah", "free -m", "uptime", "sort -n"],
    glossary: ["load average", "filesystem pieno", "punto di mount", "collo di bottiglia"],

    blocks: [
        { kind: "hook", html: {
            it: `«Il server è lento», ti dicono. Ma <em>lento</em> non è una causa: la CPU può
                 essere al 100%, la memoria esaurita, o un disco pieno che blocca ogni scrittura.
                 <strong>Sono tre guasti diversi, con tre cure diverse</strong>, e si distinguono
                 solo guardando le risorse una per una.`,
            en: `"The server is slow," they tell you. But <em>slow</em> is not a cause: the CPU
                 may be at 100%, memory exhausted, or a full disk blocking every write.
                 <strong>Those are three different faults with three different cures</strong>,
                 and you tell them apart only by reading the resources one at a time.` } },

        { kind: "lead", html: {
            it: `La regola è sempre la stessa: <strong>osserva → misura → cura → rimisura</strong>.
                 Non si riavvia sperando: si guarda quale risorsa è al limite, si interviene su
                 quella, e poi si ricontrolla che sia davvero rientrata.`,
            en: `The rule is always the same: <strong>observe → measure → cure → measure
                 again</strong>. You do not reboot and hope: you look at which resource is at its
                 limit, act on that one, then check it really came back.` } },

        { kind: "analogy", html: {
            it: `Un medico non dice «stai male» e prescrive: misura la febbre, la pressione, il
                 battito — <em>separati</em>. La macchina è uguale: <code>uptime</code> ti dà il
                 carico, <code>df</code> lo spazio, <code>free</code> la memoria. Tre strumenti,
                 tre numeri, tre risposte diverse.`,
            en: `A doctor does not say "you're ill" and prescribe: they measure temperature, blood
                 pressure, pulse — <em>separately</em>. A machine is the same: <code>uptime</code>
                 gives the load, <code>df</code> the space, <code>free</code> the memory. Three
                 tools, three numbers, three different answers.` } },

        { kind: "shown", lines: [
            { cmd: "uptime", out: " 14:22:05 up 3 days,  2:11,  load average: 3.90, 3.40, 2.10",
              note: { it: "Il <strong>load average</strong> a 1/5/15 minuti. Su una CPU sola, un carico stabile sopra <code>1.0</code> vuol dire che c'è sempre qualcuno in coda: qualcosa satura la CPU.",
                      en: "The <strong>load average</strong> over 1/5/15 minutes. On a single CPU, a steady load above <code>1.0</code> means someone is always queued: something is saturating the CPU." } },
            { cmd: "df -h", out: "Filesystem      Size  Used Avail Use% Mounted on\nhost9p          256G  121M  256G   1% /\n/dev/loop0       15M   15M     0 100% /mnt/dati",
              note: { it: "<code>df</code> = <em>disk free</em>. La colonna <code>Use%</code> è quella che conta: <code>100%</code> su una riga significa che <strong>quel</strong> filesystem è pieno — e il resto del sistema può stare benissimo. <code>-h</code> = misure umane (K, M, G).",
                      en: "<code>df</code> = <em>disk free</em>. The <code>Use%</code> column is what matters: <code>100%</code> on a line means <strong>that</strong> filesystem is full — and the rest of the system may be perfectly fine. <code>-h</code> = human sizes (K, M, G)." } },
            { cmd: "du -ah /mnt/dati | sort -n | tail -2", out: "13.0M  /mnt/dati/riempitivo.bin\n15.0M  /mnt/dati",
              note: { it: "<code>du</code> = <em>disk usage</em>: quanto occupa <em>cosa</em>. <code>-a</code> conta anche i file, <code>sort -n</code> li ordina, <code>tail</code> mostra i più grossi. Così un disco pieno si svuota mirando <strong>il file giusto</strong>, non a caso.",
                      en: "<code>du</code> = <em>disk usage</em>: how much <em>what</em> takes. <code>-a</code> counts files too, <code>sort -n</code> orders them, <code>tail</code> shows the biggest. That is how you empty a full disk by aiming at <strong>the right file</strong>, not at random." } },
            { cmd: "rm /mnt/dati/riempitivo.bin && df -h /mnt/dati", out: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/loop0       15M   46K   14M   1% /mnt/dati",
              note: { it: "La cura: tolto <strong>il file giusto</strong> (quello trovato con <code>du</code>), <code>df</code> lo conferma subito — dal <code>100%</code> all'<code>1%</code>. Prima misuri, poi cancelli, poi <strong>rimisuri</strong>: è il ciclo.",
                      en: "The cure: with <strong>the right file</strong> gone (the one found with <code>du</code>), <code>df</code> confirms it at once — from <code>100%</code> to <code>1%</code>. Measure first, then delete, then <strong>measure again</strong>: that is the loop." } },
            { cmd: "free -m", out: "               total        used        free\nMem:              89          61          12",
              note: { it: "La memoria in megabyte. <code>free</code> basso non è di per sé un allarme (Linux usa la RAM libera come cache); l'allarme è quando <em>available</em> crolla e il sistema inizia a uccidere processi. Qui non la tocchiamo, ma si legge così.",
                      en: "Memory in megabytes. Low <code>free</code> is not itself alarming (Linux uses spare RAM as cache); the alarm is when <em>available</em> collapses and the system starts killing processes. We won't touch it here, but this is how you read it." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>Perché un disco pieno è più insidioso di una CPU al 100%: una CPU satura
                 rallenta, ma un filesystem al 100% fa <strong>fallire le scritture</strong> —
                 log che non si scrivono, database che va in errore, servizi che si rifiutano di
                 partire. E il colpevole spesso non è dove guardi: è un file di log cresciuto per
                 mesi, non «i dati». Per questo si misura con <code>du</code> prima di cancellare.</p>
                 <p>Nota sui punti di mount: <code>df</code> ragiona per <em>filesystem</em>, non
                 per cartella. <code>/</code> può avere spazio mentre <code>/mnt/dati</code> è
                 pieno: sono due filesystem diversi montati in due punti diversi.</p>`,
            en: `<p>Why a full disk is nastier than a pegged CPU: a saturated CPU slows things
                 down, but a filesystem at 100% makes <strong>writes fail</strong> — logs that
                 don't get written, a database erroring out, services refusing to start. And the
                 culprit is often not where you look: it is a log file grown for months, not "the
                 data". That is why you measure with <code>du</code> before deleting.</p>
                 <p>A note on mount points: <code>df</code> reasons per <em>filesystem</em>, not
                 per folder. <code>/</code> can have room while <code>/mnt/dati</code> is full:
                 they are two different filesystems mounted at two different points.</p>` } },

        { kind: "pitfalls", items: [
            { it: `<strong>Cancellare «i dati» invece del file grosso</strong> — un disco pieno si libera guardando <code>du</code>, non a intuito. Il colpevole è quasi sempre un log dimenticato.`,
              en: `<strong>Deleting "the data" instead of the big file</strong> — a full disk is freed by reading <code>du</code>, not by hunch. The culprit is almost always a forgotten log.` },
            { it: `<strong>Confondere «poca memoria libera» con «poca memoria»</strong> — <code>free</code> basso è normale: Linux usa la RAM come cache. Conta la memoria <em>available</em>, non la <em>free</em>.`,
              en: `<strong>Confusing "little free memory" with "low memory"</strong> — low <code>free</code> is normal: Linux uses RAM as cache. What counts is <em>available</em> memory, not <em>free</em>.` },
        ] },

        { kind: "recap", table: [
            { cmd: "uptime", what: { it: "il carico (CPU in coda)", en: "the load (CPU queued)" }, flag: { it: "load average 1/5/15 min", en: "load average 1/5/15 min" } },
            { cmd: "df -h", what: { it: "spazio per filesystem", en: "space per filesystem" }, flag: { it: "la colonna Use%", en: "the Use% column" } },
            { cmd: "du -ah | sort -n | tail", what: { it: "chi occupa lo spazio", en: "what takes the space" }, flag: { it: "il file più grosso", en: "the biggest file" } },
            { cmd: "free -m", what: { it: "la memoria", en: "memory" }, flag: { it: "available, non free", en: "available, not free" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `Un filesystem è <strong>pieno al 100%</strong> e blocca le scritture. Trova
                     <strong>quale</strong> e consegna il suo <strong>punto di mount</strong> (la
                     colonna «Mounted on»). <em>Cambia a ogni mondo, non si può indovinare.</em>`,
                en: `A filesystem is <strong>100% full</strong> and blocking writes. Find
                     <strong>which one</strong> and hand in its <strong>mount point</strong> (the
                     "Mounted on" column). <em>It changes with every world; no guessing.</em>`,
            },
            checks: [
                { id: "mount-pieno",
                  why: { it: "Davanti a un disco pieno, la prima cosa non è cancellare: è sapere <em>quale</em> filesystem, perché la cura è diversa e il rischio di toccare la cosa sbagliata è alto.",
                         en: "Faced with a full disk, the first move is not to delete: it is to know <em>which</em> filesystem, because the cure differs and the risk of touching the wrong thing is high." },
                  nudge: { it: "<code>df -h</code> e guarda la colonna <code>Use%</code>: quella a <code>100%</code> ti dà il punto di mount accanto.",
                           en: "<code>df -h</code> and look at the <code>Use%</code> column: the one at <code>100%</code> gives you the mount point next to it." } },
            ],
            hints: [
                { it: "<code>df -h</code> elenca ogni filesystem con la sua percentuale d'uso.", en: "<code>df -h</code> lists every filesystem with its usage percentage." },
                { it: "Cerca la riga a <code>100%</code>: l'ultima colonna è il punto di mount.", en: "Find the <code>100%</code> row: the last column is the mount point." },
                { it: "<code>df -P | awk '$5==\"100%\"{print $6}' | lab answer</code>", en: "<code>df -P | awk '$5==\"100%\"{print $6}' | lab answer</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Lo stesso filesystem pieno va <strong>liberato</strong>. Trova il file più
                     grosso, toglilo, e porta l'uso <strong>sotto il 100%</strong>. L'esercizio è
                     superato quando quel mount non è più pieno. <em>Misura prima di cancellare.</em>`,
                en: `That same full filesystem must be <strong>freed</strong>. Find the biggest
                     file, remove it, and bring usage <strong>below 100%</strong>. The exercise
                     passes when that mount is no longer full. <em>Measure before you delete.</em>`,
            },
            checks: [
                { id: "spazio-liberato",
                  why: { it: "Liberare spazio significa colpire il file giusto, non «fare pulizia» a caso: su un server, cancellare la cosa sbagliata è peggio del disco pieno.",
                         en: "Freeing space means hitting the right file, not tidying up at random: on a server, deleting the wrong thing is worse than the full disk." },
                  nudge: { it: "<code>du -ah PUNTO_DI_MOUNT | sort -n | tail -3</code> ti mostra i file più grossi lì dentro.",
                           en: "<code>du -ah MOUNT_POINT | sort -n | tail -3</code> shows the biggest files in there." } },
            ],
            hints: [
                { it: "Prima trova <em>dove</em> è pieno con <code>df -h</code> (come nell'esercizio 1).", en: "First find <em>where</em> it is full with <code>df -h</code> (as in exercise 1)." },
                { it: "Dentro quel mount, il file più grosso: <code>du -ah MOUNT | sort -n | tail</code>.", en: "Inside that mount, the biggest file: <code>du -ah MOUNT | sort -n | tail</code>." },
                { it: "<code>rm</code> quel file, poi ricontrolla con <code>df -h</code> che sia sceso.", en: "<code>rm</code> that file, then re-check with <code>df -h</code> that it dropped." },
            ],
        },
        {
            id: "e3", tipo: "risposta",
            brief: {
                it: `Cambio di risorsa: qui la macchina è <strong>lentissima</strong> e un processo
                     mangia la CPU. Consegna il <strong>nome del programma</strong> che consuma di
                     più. <em>Il nome cambia a ogni mondo.</em>`,
                en: `A change of resource: here the machine is <strong>very slow</strong> and a
                     process is eating the CPU. Hand in the <strong>name of the program</strong>
                     using the most. <em>The name changes with every world.</em>`,
            },
            checks: [
                { id: "colpevole-cpu",
                  why: { it: "È l'altra metà della diagnosi: quando <code>df</code> è a posto ma il carico è alto, il collo di bottiglia è la CPU, e si trova col nome del processo — non riavviando.",
                         en: "It is the other half of diagnosis: when <code>df</code> is fine but the load is high, the bottleneck is CPU, and you find it by the process name — not by rebooting." },
                  nudge: { it: "<code>ps aux --sort=-%cpu | head -5</code>. Attenzione: in cima spesso c'è <code>ps</code> stesso (media sulla sua breve vita): salta la sua riga.",
                           en: "<code>ps aux --sort=-%cpu | head -5</code>. Watch out: at the top is often <code>ps</code> itself (an average over its short life): skip its line." } },
            ],
            hints: [
                { it: "Il carico alto lo vedi con <code>uptime</code>; il colpevole con <code>ps</code> (capitolo 11).", en: "You see the high load with <code>uptime</code>; the culprit with <code>ps</code> (chapter 11)." },
                { it: "<code>ps aux --sort=-%cpu</code> ordina per consumo. Salta la riga di <code>ps</code>.", en: "<code>ps aux --sort=-%cpu</code> sorts by usage. Skip the <code>ps</code> line." },
                { it: "<code>ps -eo comm,pcpu --sort=-pcpu | awk 'NR&gt;1 &amp;&amp; $1!=\"ps\" &amp;&amp; $1!=\"awk\" {print $1; exit}' | lab answer</code>", en: "<code>ps -eo comm,pcpu --sort=-pcpu | awk 'NR&gt;1 &amp;&amp; $1!=\"ps\" &amp;&amp; $1!=\"awk\" {print $1; exit}' | lab answer</code>" },
            ],
        },
    ],
};
