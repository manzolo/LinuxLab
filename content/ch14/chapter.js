export default {
    id: "ch14", num: 14, runtime: "browser", requires: ["ch10"], draft: false,
    title: { it: "Log e cose pianificate", en: "Logs and scheduled work" },
    oneLiner: {
        it: "La macchina scrive quello che le succede, e sa svegliarsi da sola.",
        en: "The machine writes down what happens to it, and knows how to wake itself up.",
    },
    commands: ["/var/log", "logger", "tail -f", "logrotate", "crontab -e", "crontab -l", "crond"],
    glossary: ["log", "rotazione", "cron", "crontab", "campo"],

    blocks: [
        { kind: "hook", html: {
            it: `«Stanotte alle tre è successo qualcosa.» Nessuno era davanti allo schermo, eppure
                 la risposta c'è: <strong>la macchina ha scritto</strong>. E se il backup di
                 stanotte non è partito, anche quello ha un motivo scritto da qualche parte.`,
            en: `"Something happened at three last night." Nobody was at the screen, and yet the
                 answer is there: <strong>the machine wrote it down</strong>. And if last night's
                 backup did not run, that too has a reason written somewhere.` } },

        { kind: "lead", html: {
            it: `Due facce della stessa cosa: la macchina che <em>racconta</em> (i log) e la
                 macchina che <em>agisce da sola</em> (cron). Insieme sono quello che rende un
                 server una cosa che funziona anche mentre dormi.`,
            en: `Two faces of one thing: the machine that <em>tells</em> (logs) and the machine
                 that <em>acts on its own</em> (cron). Together they are what makes a server
                 something that works while you sleep.` } },

        { kind: "analogy", html: {
            it: `Il crontab è una <strong>sveglia con cinque quadranti</strong>: minuto, ora,
                 giorno del mese, mese, giorno della settimana. L'asterisco significa «ogni». Si
                 legge da sinistra, e l'ordine è sempre lo stesso, ovunque nel mondo.`,
            en: `A crontab is an <strong>alarm clock with five dials</strong>: minute, hour, day of
                 month, month, day of week. An asterisk means "every". You read it from the left,
                 and the order is always the same, everywhere in the world.` } },

        { kind: "shown", lines: [
            { cmd: "logger -t miapp 'avvio completato' && tail -1 /var/log/messages",
              out: "Mar 14 09:12:03 linuxlab miapp: avvio completato",
              note: { it: "<code>logger</code> scrive nel log di sistema come farebbe un servizio vero. È il modo giusto di far parlare i tuoi script: la data e il nome li mette il sistema.",
                      en: "<code>logger</code> writes into the system log the way a real service would. It is the right way to make your scripts speak: the system adds the date and the name." } },
            { cmd: "crontab -l", out: "30 3 * * * /usr/local/bin/backup.sh",
              note: { it: "«Al minuto 30 dell'ora 3, ogni giorno del mese, ogni mese, ogni giorno della settimana.» Cioè: tutte le notti alle 3:30.",
                      en: "\"At minute 30 of hour 3, every day of the month, every month, every day of the week.\" That is: every night at 3:30." } },
            { cmd: "echo '*/15 * * * * /usr/local/bin/controlla.sh' | crontab -", out: "",
              note: { it: "<code>*/15</code> significa «ogni quindici minuti». La barra è un passo, non una divisione.",
                      en: "<code>*/15</code> means \"every fifteen minutes\". The slash is a step, not a division." } },
            { cmd: "ls -l /var/log/messages*", out: "-rw-r----- 1 root root  12043 Mar 14 09:12 /var/log/messages\n-rw-r----- 1 root root 204811 Mar 13 23:59 /var/log/messages.1.gz",
              note: { it: "La <strong>rotazione</strong>: il log corrente resta piccolo, i vecchi vengono compressi e alla fine cancellati. Senza, un log riempie il disco — è il modo più comune di far cadere un server.",
                      en: "<strong>Rotation</strong>: the current log stays small, older ones get compressed and eventually deleted. Without it a log fills the disk — the most common way to take a server down." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>Il tranello di cron che colpisce tutti almeno una volta: <strong>cron non ha il
                 tuo ambiente</strong>. Niente <code>.bashrc</code>, un <code>PATH</code> ridotto
                 all'osso, spesso nemmeno <code>HOME</code>. Uno script che gira benissimo a mano
                 fallisce alle tre di notte perché chiamava <code>docker</code> senza percorso
                 completo. La regola pratica: nei job di cron si usano <strong>sempre percorsi
                 assoluti</strong>, o si mette un <code>PATH=</code> in cima al crontab.</p>
                 <p>Secondo tranello: il quinto campo. <code>0 3 5 * 1</code> non vuol dire «il 5
                 del mese, se è lunedì»: vuol dire <strong>«il 5 del mese <em>oppure</em> ogni
                 lunedì»</strong>. Giorno-del-mese e giorno-della-settimana sono in OR, non in AND.
                 È scritto nel manuale, e sorprende comunque.</p>
                 <p>E se un job non parte: cron manda l'output per posta a un utente che sulla
                 maggior parte dei server non legge nessuno. Per questo si scrive
                 <code>… &gt;&gt; /var/log/miojob.log 2&gt;&amp;1</code> in fondo alla riga, e si
                 aggiunge quel log alla rotazione. Un job silenzioso che fallisce è peggio di un
                 job che non c'è.</p>`,
            en: `<p>The cron trap that catches everyone at least once: <strong>cron does not have
                 your environment</strong>. No <code>.bashrc</code>, a bare-bones <code>PATH</code>,
                 often not even <code>HOME</code>. A script that runs beautifully by hand fails at
                 three in the morning because it called <code>docker</code> without a full path.
                 The practical rule: in cron jobs, <strong>always use absolute paths</strong>, or
                 put a <code>PATH=</code> at the top of the crontab.</p>
                 <p>Second trap: the fifth field. <code>0 3 5 * 1</code> does not mean "the 5th, if
                 it is a Monday": it means <strong>"the 5th of the month <em>or</em> every
                 Monday"</strong>. Day-of-month and day-of-week are OR'd, not AND'd. It is in the
                 manual, and it surprises people anyway.</p>
                 <p>And if a job does not run: cron mails its output to a user nobody reads on most
                 servers. That is why you append <code>… &gt;&gt; /var/log/myjob.log
                 2&gt;&amp;1</code> to the line, and add that log to the rotation. A silent job
                 that fails is worse than no job at all.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Il crontab non si modifica aprendo il file a mano</strong>: si usa <code>crontab -e</code>, che controlla la sintassi e avvisa cron. Scrivere direttamente nel file di sistema può far ignorare tutto in silenzio.",
              en: "<strong>Do not edit a crontab by opening the file</strong>: use <code>crontab -e</code>, which checks the syntax and notifies cron. Writing into the system file directly can make everything silently ignored." },
            { it: "<strong>Un log senza rotazione riempie il disco</strong>, e succede sempre di sabato. Se crei un log, decidi subito chi lo ruota.",
              en: "<strong>A log with no rotation fills the disk</strong>, and it always happens on a Saturday. If you create a log, decide right away who rotates it." },
            { it: "<strong><code>crontab -r</code> cancella tutto senza chiedere</strong>, ed è a un tasto di distanza da <code>-e</code>. Molti ci sono passati.",
              en: "<strong><code>crontab -r</code> deletes everything without asking</strong>, and it is one key away from <code>-e</code>. Many people have been there." },
        ] },

        { kind: "recap", table: [
            { cmd: "logger -t nome", what: { it: "scrivi nel log di sistema", en: "write to the system log" }, flag: { it: "il modo giusto di far parlare uno script", en: "the right way to make a script speak" } },
            { cmd: "tail -F /var/log/…", what: { it: "guarda il log in diretta", en: "watch the log live" }, flag: { it: "la <code>F</code> maiuscola sopravvive alla rotazione", en: "capital <code>F</code> survives rotation" } },
            { cmd: "crontab -l / -e", what: { it: "elenca / modifica", en: "list / edit" }, flag: { it: "mai <code>-r</code> per sbaglio: cancella tutto", en: "never <code>-r</code> by mistake: it wipes everything" } },
            { cmd: "m h dom mon dow", what: { it: "i cinque quadranti", en: "the five dials" }, flag: { it: "<code>30 3 * * *</code> = ogni notte alle 3:30", en: "<code>30 3 * * *</code> = every night at 3:30" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `In <code>~/lab/app.log</code>, a che ora compare il <strong>primo</strong>
                     messaggio di livello <code>ERROR</code>? Consegna l'orario nel formato
                     <code>HH:MM:SS</code> come appare nel file.`,
                en: `In <code>~/lab/app.log</code>, at what time does the <strong>first</strong>
                     <code>ERROR</code> message appear? Hand in the time as <code>HH:MM:SS</code>,
                     exactly as it appears in the file.`,
            },
            checks: [
                { id: "primo-errore",
                  why: { it: "Quando qualcosa si rompe, l'ora del <em>primo</em> errore è il punto da cui si guarda indietro: è lì che è cominciato, e quello che c'è appena prima spesso è la causa.",
                         en: "When something breaks, the time of the <em>first</em> error is where you start looking back: that is when it began, and what comes just before is often the cause." },
                  nudge: { it: "Il file è già in ordine cronologico: <code>grep ERROR file | head -1</code> ti dà la riga. Poi serve solo la seconda colonna.",
                           en: "The file is already in chronological order: <code>grep ERROR file | head -1</code> gives you the line. Then you just need the second column." } },
            ],
            hints: [
                { it: "Filtra le righe con <code>grep</code>, poi prendi la prima.", en: "Filter the lines with <code>grep</code>, then take the first." },
                { it: "L'orario è la seconda colonna: <code>awk '{print $2}'</code>.", en: "The time is the second column: <code>awk '{print $2}'</code>." },
                { it: "<code>grep ERROR ~/lab/app.log | head -1 | awk '{print $2}' | lab answer</code>", en: "<code>grep ERROR ~/lab/app.log | head -1 | awk '{print $2}' | lab answer</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Programma il backup: <code>/usr/local/bin/backup.sh</code> deve girare
                     <strong>ogni notte alle 3:30</strong>. Metti la riga nel crontab di root.
                     <em>La verifica guarda i campi minuto e ora, non come hai scritto la riga.</em>`,
                en: `Schedule the backup: <code>/usr/local/bin/backup.sh</code> must run
                     <strong>every night at 3:30</strong>. Put the line in root's crontab.
                     <em>The check looks at the minute and hour fields, not at how you wrote the
                     line.</em>`,
            },
            checks: [
                { id: "orario-giusto",
                  why: { it: "L'ordine dei cinque campi è minuto-ora, non ora-minuto. Invertirli significa far girare il backup alle 30 e 3 minuti, che non esiste — oppure, peggio, ogni ora al minuto 3.",
                         en: "The order of the five fields is minute-hour, not hour-minute. Swapping them means running the backup at half past three… in the morning of a different reading — or worse, every hour at minute 3." },
                  nudge: { it: "<code>crontab -l</code> ti mostra cosa è registrato davvero. I primi due campi devono essere <code>30</code> e <code>3</code>, in quest'ordine.",
                           en: "<code>crontab -l</code> shows what is really registered. The first two fields must be <code>30</code> and <code>3</code>, in that order." } },
                { id: "ogni-giorno",
                  why: { it: "Gli ultimi tre campi devono essere asterischi: se ne fissi uno, il backup gira solo in quel giorno o in quel mese, e te ne accorgi fra un anno.",
                         en: "The last three fields must be asterisks: pin one down and the backup only runs on that day or in that month, and you find out a year later." },
                  nudge: { it: "«Ogni giorno del mese, ogni mese, ogni giorno della settimana» si scrive <code>* * *</code>.",
                           en: "\"Every day of the month, every month, every day of the week\" is written <code>* * *</code>." } },
                { id: "comando-giusto",
                  why: { it: "Nel crontab i percorsi vanno scritti per intero: cron non ha il tuo <code>PATH</code>, e uno script chiamato senza percorso completo non parte.",
                         en: "In a crontab, paths must be written in full: cron does not have your <code>PATH</code>, and a script called without a full path will not run." },
                  nudge: { it: "Il comando deve essere <code>/usr/local/bin/backup.sh</code>, non <code>backup.sh</code>.",
                           en: "The command must be <code>/usr/local/bin/backup.sh</code>, not <code>backup.sh</code>." } },
            ],
            hints: [
                { it: "I cinque campi sono: minuto, ora, giorno del mese, mese, giorno della settimana.", en: "The five fields are: minute, hour, day of month, month, day of week." },
                { it: "Per registrarlo senza aprire un editor: <code>echo '…' | crontab -</code>.", en: "To register it without an editor: <code>echo '…' | crontab -</code>." },
                { it: "<code>echo '30 3 * * * /usr/local/bin/backup.sh' | crontab -</code>", en: "<code>echo '30 3 * * * /usr/local/bin/backup.sh' | crontab -</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Adesso scrivi lo script che cron chiamerà. <code>/usr/local/bin/backup.sh</code>
                     deve essere <strong>eseguibile</strong>, creare un archivio
                     <code>~/lab/backup-AAAA-MM-GG.tar.gz</code> con dentro la cartella
                     <code>~/lab/dati</code>, e <strong>scrivere una riga nel log di sistema</strong>
                     con <code>logger</code>. Poi eseguilo a mano una volta.`,
                en: `Now write the script cron will call. <code>/usr/local/bin/backup.sh</code> must
                     be <strong>executable</strong>, create an archive
                     <code>~/lab/backup-YYYY-MM-DD.tar.gz</code> containing the folder
                     <code>~/lab/dati</code>, and <strong>write a line to the system log</strong>
                     with <code>logger</code>. Then run it by hand once.`,
            },
            checks: [
                { id: "script-eseguibile",
                  why: { it: "Cron non ti dirà mai «manca il permesso di esecuzione»: semplicemente il job non partirà, in silenzio, ogni notte.",
                         en: "Cron will never tell you \"the execute bit is missing\": the job simply will not run, silently, every night." },
                  nudge: { it: "<code>ls -l /usr/local/bin/backup.sh</code>: serve la <code>x</code> per il proprietario.",
                           en: "<code>ls -l /usr/local/bin/backup.sh</code>: it needs the <code>x</code> for the owner." } },
                { id: "archivio-con-data",
                  why: { it: "La data nel nome è quello che distingue un backup da un file sovrascritto ogni notte. Va calcolata dallo script, non scritta a mano.",
                         en: "The date in the name is what makes it a backup rather than a file overwritten every night. The script must compute it, not you." },
                  nudge: { it: "<code>date +%F</code> stampa già <code>2026-08-15</code>. Dentro lo script si usa come <code>$(date +%F)</code>.",
                           en: "<code>date +%F</code> already prints <code>2026-08-15</code>. Inside the script you use it as <code>$(date +%F)</code>." } },
                { id: "archivio-valido",
                  why: { it: "Un file <code>.tar.gz</code> che non si apre è peggio di nessun backup: dà una sicurezza che non c'è. Si controlla sempre subito.",
                         en: "A <code>.tar.gz</code> that will not open is worse than no backup: it gives confidence that is not there. Always check it right away." },
                  nudge: { it: "<code>tar tzf ~/lab/backup-*.tar.gz</code> elenca il contenuto senza estrarlo. Se dà errore, l'archivio è rotto.",
                           en: "<code>tar tzf ~/lab/backup-*.tar.gz</code> lists the content without extracting. If it errors, the archive is broken." } },
                { id: "scrive-nel-log",
                  why: { it: "Un job silenzioso che fallisce è peggio di un job che non c'è. Il log è l'unico modo di sapere, domani, che stanotte è andato tutto bene.",
                         en: "A silent job that fails is worse than no job. The log is the only way to know, tomorrow, that everything went fine last night." },
                  nudge: { it: "<code>logger -t backup 'fatto'</code> dentro lo script, e poi <code>tail /var/log/messages</code> per vedere se è arrivato.",
                           en: "<code>logger -t backup 'done'</code> inside the script, then <code>tail /var/log/messages</code> to see whether it arrived." } },
            ],
            hints: [
                { it: "Un file diventa uno script con la prima riga <code>#!/bin/sh</code> e il permesso <code>x</code>.", en: "A file becomes a script with a first line <code>#!/bin/sh</code> and the <code>x</code> permission." },
                { it: "L'archivio si crea con <code>tar czf destinazione.tar.gz -C cartella-padre nome</code>.", en: "The archive is made with <code>tar czf destination.tar.gz -C parent-folder name</code>." },
                { it: "<code>printf '#!/bin/sh\\ntar czf $HOME/lab/backup-$(date +%%F).tar.gz -C $HOME/lab dati\\nlogger -t backup \"backup completato\"\\n' &gt; /usr/local/bin/backup.sh &amp;&amp; chmod 755 /usr/local/bin/backup.sh &amp;&amp; /usr/local/bin/backup.sh</code>", en: "<code>printf '#!/bin/sh\\ntar czf $HOME/lab/backup-$(date +%%F).tar.gz -C $HOME/lab dati\\nlogger -t backup \"backup done\"\\n' &gt; /usr/local/bin/backup.sh &amp;&amp; chmod 755 /usr/local/bin/backup.sh &amp;&amp; /usr/local/bin/backup.sh</code>" },
            ],
        },
    ],
};
