export default {
    id: "ch11", num: 11, runtime: "browser", requires: ["ch05"], draft: false,
    title: { it: "Processi e segnali", en: "Processes and signals" },
    oneLiner: {
        it: "Un processo è un numero, e tu gli parli a segnali.",
        en: "A process is a number, and you talk to it with signals.",
    },
    commands: ["ps aux", "top", "pgrep", "pkill", "kill", "kill -9", "jobs", "bg", "fg", "&", "$!", "wait", "nohup"],
    glossary: ["PID", "segnale", "SIGTERM", "SIGKILL", "zombie", "background"],

    blocks: [
        { kind: "hook", html: {
            it: `Il server è lentissimo. <code>top</code> mostra un processo al 100% di CPU con un
                 nome che non ti dice niente. Lo fermi con garbo e non muore.
                 <strong>A quel punto devi sapere perché <code>kill -9</code> esiste</strong> — e
                 perché non è la prima cosa da provare.`,
            en: `The server is crawling. <code>top</code> shows one process at 100% CPU with a name
                 that means nothing to you. You stop it politely and it does not die.
                 <strong>At that point you need to know why <code>kill -9</code> exists</strong> —
                 and why it is not the first thing to try.` } },

        { kind: "lead", html: {
            it: `Ogni programma in esecuzione ha un numero, il <strong>PID</strong>. Non si
                 "chiudono" i programmi: si mandano loro dei <strong>segnali</strong>, e poi si
                 guarda cosa decidono di fare.`,
            en: `Every running program has a number, the <strong>PID</strong>. You do not "close"
                 programs: you send them <strong>signals</strong>, and then you watch what they
                 decide to do.` } },

        { kind: "analogy", html: {
            it: `<code>kill</code> è un nome pessimo: non uccide, <strong>bussa</strong>.
                 <code>SIGTERM</code> (il segnale normale) è bussare alla porta e dire «per
                 favore, chiudi». Il programma può rispondere, salvare, chiudere le connessioni, e
                 poi uscire con calma. <code>SIGKILL</code> (il <code>-9</code>) non bussa: è il
                 kernel che stacca la corrente. Nessuno può ignorarlo, e nessuno può salvare
                 niente.`,
            en: `<code>kill</code> is a terrible name: it does not kill, it <strong>knocks</strong>.
                 <code>SIGTERM</code> (the normal signal) is knocking on the door saying "please,
                 shut down". The program can answer, save, close connections, then exit calmly.
                 <code>SIGKILL</code> (the <code>-9</code>) does not knock: it is the kernel
                 pulling the plug. Nobody can ignore it, and nobody can save anything.` } },

        { kind: "shown", lines: [
            { cmd: "ps aux | head -3", out: "USER  PID %CPU %MEM   VSZ  RSS STAT COMMAND\nroot    1  0.0  0.1  1620  548 S    /sbin/init\nroot  412 98.3  0.2  2104  892 R    /usr/local/bin/tritatutto",
              note: { it: "<code>%CPU</code> e <code>STAT</code> sono le colonne che contano. <code>R</code> = sta girando, <code>S</code> = dorme in attesa, <code>Z</code> = zombie, <code>D</code> = attesa kernel non interrompibile, spesso I/O.",
                      en: "<code>%CPU</code> and <code>STAT</code> are the columns that matter. <code>R</code> = running, <code>S</code> = sleeping, <code>Z</code> = zombie, <code>D</code> = uninterruptible kernel wait, often I/O." } },
            { cmd: "pgrep -a tritatutto", out: "412 /usr/local/bin/tritatutto",
              note: { it: "Trova il PID dal nome, senza dover leggere l'elenco a occhio. <code>-a</code> mostra anche la riga di comando intera.",
                      en: "Finds the PID from the name, without reading the list by eye. <code>-a</code> also shows the full command line." } },
            { cmd: "kill 412", out: "",
              note: { it: "Senza numero di segnale manda <code>SIGTERM</code>: la richiesta educata. Nella stragrande maggioranza dei casi basta questa.",
                      en: "With no signal number it sends <code>SIGTERM</code>: the polite request. In the vast majority of cases this is enough." } },
            { cmd: "ps -p 412 -o pid,stat,comm", out: "  PID STAT COMMAND\n  412 R    tritatutto",
              note: { it: "Ancora vivo: questa demo <strong>intercetta</strong> SIGTERM e sceglie di ignorarlo. I demoni reali normalmente lo gestiscono per chiudere con ordine; se un processo resta vivo può stare completando il lavoro, essere bloccato oppure avere un gestore difettoso: prima si osserva, poi si forza.",
                      en: "Still alive: this demo <strong>traps</strong> SIGTERM and chooses to ignore it. Real daemons normally handle it to shut down cleanly; a process that stays alive may be finishing work, blocked, or have a faulty handler: observe first, then force it." } },
            { cmd: "kill -9 412 && ps -p 412", out: "  PID TTY   TIME CMD",
              note: { it: "<code>-9</code> non lo esegue il processo: lo esegue il kernel. Per questo non si può ignorare — e per questo il programma non ha salvato niente.",
                      en: "<code>-9</code> is not executed by the process: it is executed by the kernel. That is why it cannot be ignored — and why the program saved nothing." } },
            { cmd: "pkill -f tritatutto", out: "",
              note: { it: "<code>kill</code> vuole un numero, <code>pkill</code> vuole un nome. <code>-f</code> confronta <strong>l'intera riga di comando</strong>, non solo il nome del programma: comodo, e pericoloso. Guarda sempre prima chi colpiresti, con <code>pgrep -af</code>.",
                      en: "<code>kill</code> wants a number, <code>pkill</code> wants a name. <code>-f</code> matches <strong>the whole command line</strong>, not just the program name: handy, and dangerous. Always look first at who you would hit, with <code>pgrep -af</code>." } },
            { cmd: "sleep 300 & echo \"PID: $!\"", out: "[1] 1043\nPID: 1043",
              note: { it: "La <code>&amp;</code> non aspetta: il comando parte e la shell prosegue <em>subito</em>. Fra parentesi quadre vedi il numero del job e poi il PID; <code>$!</code> conserva il PID dell'ultimo processo avviato in background.",
                      en: "<code>&amp;</code> does not wait: the command starts and the shell carries on <em>immediately</em>. In square brackets you see the job number and then the PID; <code>$!</code> holds the PID of the last background process." } },
            { cmd: "sleep 1 & wait $!; echo finito", out: "[2] 1051\nfinito",
              note: { it: "<code>wait PID</code> fa il contrario: ferma lo script finché quel processo termina e ne restituisce il codice di uscita. È così che sincronizzi un lavoro parallelo prima di usare il suo risultato.",
                      en: "<code>wait PID</code> does the opposite: it pauses the script until that process ends and returns its exit status. This is how you synchronize parallel work before using its result." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>Se <code>kill -9</code> non funziona, il processo non sta resistendo: è nello
                 stato <strong>D</strong>, <em>uninterruptible sleep</em>. Sta aspettando una
                 chiamata al kernel che non ritorna — un NFS caduto, un disco che sta morendo. Non
                 c'è segnale che tenga: i segnali si consegnano quando il processo torna dallo
                 spazio kernel, e lui non ci torna. L'unica cura è risolvere il problema di I/O,
                 o riavviare.</p>
                 <p>Lo <strong>zombie</strong> (<code>Z</code>) è il caso opposto e viene sempre
                 frainteso: è già morto. Resta in tabella solo perché suo padre non ha ancora
                 chiamato <code>wait()</code> per raccoglierne il codice di uscita. Non consuma
                 CPU né conserva il proprio spazio di memoria, ma occupa ancora una voce nella
                 tabella dei processi; <strong>non si può uccidere</strong> — è già morto. Se se ne
                 accumulano a migliaia, il colpevole è il padre, ed è lui che va riavviato.</p>
                 <p>Infine il motivo per cui <code>&amp;</code> spesso non basta: un processo in
                 background resta figlio del tuo terminale, e quando chiudi la sessione riceve
                 <code>SIGHUP</code> e muore. <code>nohup</code> lo protegge da quel segnale;
                 <code>disown</code> lo stacca dalla lista dei job. Per qualcosa che deve davvero
                 restare in piedi, però, la risposta giusta non è nessuna delle due: è un servizio
                 gestito dall'init — che è il capitolo 17.</p>`,
            en: `<p>If <code>kill -9</code> does not work, the process is not resisting: it is in
                 state <strong>D</strong>, <em>uninterruptible sleep</em>. It is waiting on a
                 kernel call that never returns — a dead NFS mount, a dying disk. No signal will
                 help: signals are delivered when the process returns from kernel space, and it
                 never returns. The only cure is fixing the I/O problem, or rebooting.</p>
                 <p>The <strong>zombie</strong> (<code>Z</code>) is the opposite case and is always
                 misunderstood: it is already dead. It stays in the table only because its parent
                 has not yet called <code>wait()</code> to collect its exit code. It uses no CPU
                 and retains no process address space, but still occupies a process-table entry;
                 it <strong>cannot be killed</strong> — it is already dead. If
                 thousands pile up, the culprit is the parent, and the parent is what needs
                 restarting.</p>
                 <p>Finally, why <code>&amp;</code> is often not enough: a background process stays
                 a child of your terminal, and when you close the session it receives
                 <code>SIGHUP</code> and dies. <code>nohup</code> shields it from that signal;
                 <code>disown</code> detaches it from the job list. For something that must really
                 stay up, though, the right answer is neither: it is a service managed by init —
                 which is chapter 17.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>kill -9</code> come prima mossa è una cattiva abitudine.</strong> Un database ucciso a metà scrittura può lasciare dati incoerenti. Prima <code>kill</code>, aspetti qualche secondo, e solo se serve il martello.",
              en: "<strong><code>kill -9</code> as a first move is a bad habit.</strong> A database killed mid-write can leave inconsistent data. First <code>kill</code>, wait a few seconds, and only then the hammer." },
            { it: "<strong><code>pkill nome</code> è pericoloso quanto è comodo</strong>: fa una ricerca parziale e può prendere più processi di quelli che intendevi. Controlla prima con <code>pgrep -a nome</code>.",
              en: "<strong><code>pkill name</code> is as dangerous as it is convenient</strong>: it matches partially and can take more processes than you meant. Check first with <code>pgrep -a name</code>." },
            { it: "<strong>Il PID si riusa.</strong> Se aspetti troppo fra il momento in cui lo leggi e quello in cui lo uccidi, potresti uccidere un processo diverso che nel frattempo ha ereditato quel numero.",
              en: "<strong>PIDs get reused.</strong> Wait too long between reading one and killing it, and you may kill a different process that inherited the number in the meantime." },
        ] },

        { kind: "recap", table: [
            { cmd: "ps aux", what: { it: "tutto quello che gira", en: "everything that is running" }, flag: { it: "le colonne che contano: <code>%CPU</code> e <code>STAT</code>", en: "the columns that matter: <code>%CPU</code> and <code>STAT</code>" } },
            { cmd: "pgrep -a", what: { it: "il PID a partire dal nome", en: "the PID from the name" }, flag: { it: "guarda sempre prima di usare <code>pkill</code>", en: "always look before using <code>pkill</code>" } },
            { cmd: "kill", what: { it: "chiedi di chiudere (SIGTERM)", en: "ask to shut down (SIGTERM)" }, flag: { it: "la prima cosa da provare", en: "the first thing to try" } },
            { cmd: "kill -9", what: { it: "stacca la corrente (SIGKILL)", en: "pull the plug (SIGKILL)" }, flag: { it: "l'ultima spiaggia, e non salva niente", en: "last resort, and it saves nothing" } },
            { cmd: "cmd & / $! / wait", what: { it: "avvia, ricorda il PID, attendi", en: "start, retain the PID, wait" }, flag: { it: "<code>jobs</code>/<code>fg</code> sono per la sessione; per un servizio usa systemd", en: "<code>jobs</code>/<code>fg</code> are session tools; use systemd for a service" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `Qualcosa si sta mangiando la CPU. Trova il <strong>nome del programma</strong>
                     che consuma di più e consegnalo. <em>Il nome cambia a ogni mondo.</em>`,
                en: `Something is eating the CPU. Find the <strong>name of the program</strong>
                     using the most and hand it in. <em>The name changes with every world.</em>`,
            },
            checks: [
                { id: "colpevole",
                  why: { it: "È il primo gesto davanti a una macchina lenta: non riavviare, <em>guardare</em>. In dieci secondi sai se è un tuo servizio, un backup dimenticato o qualcosa che non dovrebbe esserci.",
                         en: "It is the first move in front of a slow machine: do not reboot, <em>look</em>. In ten seconds you know whether it is your service, a forgotten backup, or something that should not be there." },
                  nudge: { it: "<code>ps aux --sort=-%cpu | head -5</code> te li ordina dal più affamato. Attenzione a una cosa che sorprende sempre: in cima ci trovi spesso <code>ps</code> stesso, perché <code>%CPU</code> è una media sulla vita del processo e <code>ps</code> è appena partito. Salta la sua riga.",
                           en: "<code>ps aux --sort=-%cpu | head -5</code> sorts them by hunger. Watch out for something that always surprises: at the top you often find <code>ps</code> itself, because <code>%CPU</code> is an average over the process's lifetime and <code>ps</code> has just started. Skip its line." } },
            ],
            hints: [
                { it: "<code>ps aux</code> elenca tutto; una delle colonne è <code>%CPU</code>.", en: "<code>ps aux</code> lists everything; one of the columns is <code>%CPU</code>." },
                { it: "Si può ordinare: <code>ps aux --sort=-%cpu</code>. Il primo dopo l'intestazione è quasi sempre <code>ps</code> stesso: il colpevole è quello dopo.", en: "You can sort: <code>ps aux --sort=-%cpu</code>. The first after the header is almost always <code>ps</code> itself: the culprit is the next one." },
                { it: "<code>ps -eo comm,pcpu --sort=-pcpu | awk 'NR&gt;1 &amp;&amp; $1!=\"ps\" {print $1; exit}' | lab answer</code>", en: "<code>ps -eo comm,pcpu --sort=-pcpu | awk 'NR&gt;1 &amp;&amp; $1!=\"ps\" {print $1; exit}' | lab answer</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Lo stesso processo va fermato. <strong>Provaci con garbo</strong>. Se dopo
                     qualche secondo è ancora vivo, allora — e solo allora — usa il martello.
                     L'esercizio è superato quando non c'è più.
                     <em>Nessuno ti ha detto che quel programma si difende.</em>`,
                en: `That same process must be stopped. <strong>Try politely first</strong>. If it
                     is still alive after a few seconds, then — and only then — use the hammer.
                     The exercise passes when it is gone.
                     <em>Nobody told you that program defends itself.</em>`,
            },
            checks: [
                { id: "processo-fermo",
                  why: { it: "Questa demo è deliberatamente ostinata: intercetta <code>SIGTERM</code> e lo ignora. I servizi reali dovrebbero usarlo per chiudere con ordine, ma possono bloccarsi o avere bug: per questo <code>kill -9</code> esiste come ultima risorsa.",
                         en: "This demo is deliberately stubborn: it traps <code>SIGTERM</code> and ignores it. Real services should use it for a clean shutdown, but they can hang or contain bugs: that is why <code>kill -9</code> exists as a last resort." },
                  nudge: { it: "<code>ps -p PID -o pid,stat,comm</code> dopo il primo <code>kill</code>: se è ancora lì, il segnale è stato ricevuto e scartato.",
                           en: "<code>ps -p PID -o pid,stat,comm</code> after the first <code>kill</code>: if it is still there, the signal was received and discarded." } },
            ],
            hints: [
                { it: "Prima ti serve il PID: <code>pgrep -a nome</code>.", en: "First you need the PID: <code>pgrep -a name</code>." },
                { it: "<code>kill PID</code> manda SIGTERM. Aspetta, ricontrolla con <code>ps -p PID</code>.", en: "<code>kill PID</code> sends SIGTERM. Wait, check again with <code>ps -p PID</code>." },
                { it: "<code>pkill -9 -f nome</code> — oppure <code>kill -9 $(pgrep nome)</code>.", en: "<code>pkill -9 -f name</code> — or <code>kill -9 $(pgrep name)</code>." },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Lancia <code>sleep 300</code> <strong>in background</strong> e scrivi il suo
                     PID in <code>~/lab/pid.txt</code>. La verifica controlla che quel PID sia
                     vivo davvero e che sia proprio uno <code>sleep</code>.`,
                en: `Run <code>sleep 300</code> <strong>in the background</strong> and write its
                     PID into <code>~/lab/pid.txt</code>. The check verifies that PID is really
                     alive and really is a <code>sleep</code>.`,
            },
            checks: [
                { id: "pid-vivo",
                  why: { it: "Mandare qualcosa in background e tenerne il PID è il gesto base di ogni script che avvia un servizio e poi deve saperlo fermare.",
                         en: "Backgrounding something and keeping its PID is the basic move of every script that starts a service and later has to stop it." },
                  nudge: { it: "Dopo <code>comando &amp;</code>, la shell mette il PID nella variabile <code>$!</code>.",
                           en: "After <code>command &amp;</code>, the shell puts the PID into the <code>$!</code> variable." } },
                { id: "e-uno-sleep",
                  why: { it: "Un numero qualunque in un file non è il PID di niente. La verifica guarda <em>quale processo</em> ha quel numero, non che il file contenga una cifra.",
                         en: "Any number in a file is not the PID of anything. The check looks at <em>which process</em> holds that number, not that the file contains a digit." },
                  nudge: { it: "<code>ps -p $(cat ~/lab/pid.txt) -o comm=</code> deve stampare <code>sleep</code>.",
                           en: "<code>ps -p $(cat ~/lab/pid.txt) -o comm=</code> must print <code>sleep</code>." } },
            ],
            hints: [
                { it: "La <code>&amp;</code> alla fine di un comando lo manda in background.", en: "A trailing <code>&amp;</code> puts a command in the background." },
                { it: "<code>$!</code> contiene il PID dell'ultimo comando lanciato in background.", en: "<code>$!</code> holds the PID of the last backgrounded command." },
                { it: "<code>sleep 300 &amp; echo $! &gt; ~/lab/pid.txt</code>", en: "<code>sleep 300 &amp; echo $! &gt; ~/lab/pid.txt</code>" },
            ],
        },
    ],
};
