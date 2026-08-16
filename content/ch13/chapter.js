export default {
    id: "ch13", num: 13, runtime: "browser", requires: ["ch05"], draft: false,
    title: { it: "Dischi, mount, spazio", en: "Disks, mounts, space" },
    oneLiner: {
        it: "Lo spazio finisce, e «dov'è finito» è una domanda con una risposta precisa.",
        en: "Space runs out, and \"where did it go\" is a question with a precise answer.",
    },
    commands: ["df -h", "du -sh", "lsblk", "mount", "umount", "losetup", "mkfs.ext4", "/etc/fstab"],
    glossary: ["mount", "filesystem", "loop device", "inode", "fstab"],

    blocks: [
        { kind: "hook", html: {
            it: `<code>df</code> dice 100%. Cancelli due gigabyte di log e <code>df</code> dice
                 ancora 100%. Non stai impazzendo: <strong>c'è una spiegazione precisa</strong>, e
                 la scoprirai fra tre paragrafi.`,
            en: `<code>df</code> says 100%. You delete two gigabytes of logs and <code>df</code>
                 still says 100%. You are not going mad: <strong>there is a precise
                 explanation</strong>, and you will find it three paragraphs from now.` } },

        { kind: "lead", html: {
            it: `Due comandi che sembrano fare la stessa cosa e non la fanno: <code>df</code>
                 chiede <em>al filesystem</em> quanto spazio resta, <code>du</code> somma
                 <em>i file</em> che trova. Quando le due risposte non tornano, c'è sempre un
                 motivo interessante.`,
            en: `Two commands that look alike and are not: <code>df</code> asks <em>the
                 filesystem</em> how much space is left, <code>du</code> adds up <em>the files</em>
                 it finds. When the two answers disagree, there is always an interesting reason.` } },

        { kind: "analogy", html: {
            it: `Montare un disco è <strong>appendere un ramo all'albero</strong>. Su Linux non ci
                 sono lettere di unità: c'è un albero solo, che parte da <code>/</code>, e un disco
                 nuovo diventa una cartella come le altre — per esempio <code>/mnt/dati</code>.
                 Chi ci scrive dentro non sa, e non gli serve sapere, che sotto c'è un altro disco.`,
            en: `Mounting a disk is <strong>hanging a branch on the tree</strong>. On Linux there
                 are no drive letters: there is one tree starting at <code>/</code>, and a new disk
                 becomes a folder like any other — say <code>/mnt/data</code>. Whoever writes into
                 it does not know, and does not need to know, that another disk sits underneath.` } },

        { kind: "shown", lines: [
            { cmd: "du -sh * | sort -h | tail -3", out: "12M     immagini\n148M    dump\n1.9G    video",
              note: { it: "<code>sort -h</code> ordina capendo le unità: <em>1.9G</em> dopo <em>148M</em>. Con <code>-n</code> semplice andrebbe a finire che 1.9 viene prima di 148.",
                      en: "<code>sort -h</code> sorts understanding the units: <em>1.9G</em> after <em>148M</em>. With plain <code>-n</code>, 1.9 would end up before 148." } },
            { cmd: "losetup -f --show /tmp/disco.img", out: "/dev/loop0",
              note: { it: "Un <strong>loop device</strong> fa sembrare un file un disco. È come si provano i filesystem senza avere hardware — ed è quello che stiamo facendo qui dentro.",
                      en: "A <strong>loop device</strong> makes a file look like a disk. It is how you experiment with filesystems without hardware — and it is what we are doing right here." } },
            { cmd: "mkfs.ext4 -q /dev/loop0", out: "",
              note: { it: "«Formattare» significa scrivere le strutture di un filesystem dentro un contenitore vuoto. Da qui in poi quel file ha un indice, dei blocchi liberi, degli inode.",
                      en: "\"Formatting\" means writing a filesystem's structures into an empty container. From now on that file has an index, free blocks, inodes." } },
            { cmd: "mount /dev/loop0 /mnt/dati && df -h /mnt/dati",
              out: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/loop0      7.6M   24K  7.0M   1% /mnt/dati",
              note: { it: "Da questo istante <code>/mnt/dati</code> non è più una cartella del disco di prima: è la radice di un filesystem diverso.",
                      en: "From this moment <code>/mnt/dati</code> is no longer a folder on the previous disk: it is the root of a different filesystem." } },
            { cmd: "umount /mnt/dati && ls /mnt/dati", out: "",
              note: { it: "Smontato, la cartella torna vuota. Quello che ci avevi scritto non è sparito: è dentro il filesystem, che adesso è staccato dall'albero.",
                      en: "Unmounted, the folder is empty again. What you wrote is not gone: it is inside the filesystem, which is now detached from the tree." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>Ecco la spiegazione del mistero iniziale. <code>rm</code> toglie un
                 <em>nome</em>, non i dati: se un processo tiene ancora aperto quel file, i blocchi
                 restano occupati. <code>df</code> li vede (chiede al filesystem),
                 <code>du</code> no (cerca i file, e quel nome non c'è più). Lo scarto fra i due è
                 <strong>esattamente</strong> lo spazio bloccato dai file cancellati ma aperti. Si
                 trovano con <code>lsof +L1</code>, e si liberano riavviando il processo — oppure,
                 senza riavviare nulla, svuotando il file con <code>&gt; /var/log/enorme.log</code>
                 invece di cancellarlo.</p>
                 <p>C'è un secondo modo di finire lo spazio senza finirlo: gli <strong>inode</strong>.
                 Ogni file ne consuma uno, e sono un numero fisso deciso alla formattazione. Un
                 milione di file da zero byte riempie gli inode lasciando il disco vuoto:
                 <code>df -h</code> dice 2% e ogni scrittura fallisce con <em>No space left on
                 device</em>. La verifica è <code>df -i</code>, e chi non la conosce può passarci
                 un pomeriggio.</p>
                 <p>Infine <code>/etc/fstab</code>, che descrive cosa montare all'avvio. Una riga
                 sbagliata lì <strong>impedisce alla macchina di avviarsi</strong>, e ti ritrovi in
                 emergenza. Per questo si usano gli UUID invece di <code>/dev/sdb1</code> (i nomi
                 dei dischi possono cambiare fra un riavvio e l'altro), si aggiunge l'opzione
                 <code>nofail</code>, e si prova sempre con <code>mount -a</code> <em>prima</em> di
                 riavviare.</p>`,
            en: `<p>Here is the explanation of the opening mystery. <code>rm</code> removes a
                 <em>name</em>, not the data: if a process still holds that file open, the blocks
                 stay occupied. <code>df</code> sees them (it asks the filesystem), <code>du</code>
                 does not (it looks for files, and that name is gone). The gap between the two is
                 <strong>exactly</strong> the space held by deleted-but-open files. You find them
                 with <code>lsof +L1</code>, and free them by restarting the process — or, without
                 restarting anything, by truncating the file with <code>&gt;
                 /var/log/huge.log</code> instead of deleting it.</p>
                 <p>There is a second way to run out of space without running out: <strong>inodes</strong>.
                 Every file consumes one, and their number is fixed at format time. A million
                 zero-byte files fills the inodes leaving the disk empty: <code>df -h</code> says
                 2% and every write fails with <em>No space left on device</em>. The check is
                 <code>df -i</code>, and someone who does not know it can lose an afternoon.</p>
                 <p>Finally <code>/etc/fstab</code>, which describes what to mount at boot. One
                 wrong line there <strong>stops the machine from booting</strong>, and you end up
                 in emergency mode. That is why people use UUIDs instead of <code>/dev/sdb1</code>
                 (disk names can change between reboots), add the <code>nofail</code> option, and
                 always test with <code>mount -a</code> <em>before</em> rebooting.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>du</code> senza <code>-s</code> stampa una riga per ogni sottocartella</strong> e ti seppellisce. La forma utile è <code>du -sh *</code>, che dà un totale per voce.",
              en: "<strong><code>du</code> without <code>-s</code> prints a line per subdirectory</strong> and buries you. The useful form is <code>du -sh *</code>, one total per entry." },
            { it: "<strong>Montare su una cartella non vuota nasconde quello che c'era.</strong> Non lo cancella: lo copre. Smonta e ricompare — e nel frattempo lo spazio risultava occupato senza che si vedesse nulla.",
              en: "<strong>Mounting onto a non-empty folder hides what was there.</strong> It does not delete it: it covers it. Unmount and it reappears — and meanwhile the space looked used with nothing visible." },
            { it: "<strong><code>umount</code> fallisce con «device is busy» se qualcuno è dentro</strong> — spesso sei tu, con la shell. Basta un <code>cd</code> fuori. Per scoprire chi altro, <code>fuser -m /punto</code>.",
              en: "<strong><code>umount</code> fails with \"device is busy\" if someone is inside</strong> — often you, with your shell. A <code>cd</code> out is enough. To find who else, <code>fuser -m /mountpoint</code>." },
        ] },

        { kind: "recap", table: [
            { cmd: "df -h", what: { it: "quanto spazio resta", en: "how much space is left" }, flag: { it: "<code>-i</code> per gli inode: l'altro modo di finire lo spazio", en: "<code>-i</code> for inodes: the other way to run out" } },
            { cmd: "du -sh *", what: { it: "chi lo sta occupando", en: "who is using it" }, flag: { it: "con <code>| sort -h</code> per la classifica", en: "with <code>| sort -h</code> for the ranking" } },
            { cmd: "losetup", what: { it: "un file diventa un disco", en: "a file becomes a disk" }, flag: { it: "<code>-f --show</code> sceglie il primo libero e te lo dice", en: "<code>-f --show</code> picks the first free one and tells you" } },
            { cmd: "mkfs.ext4", what: { it: "formatta", en: "format" }, flag: { it: "cancella tutto. Controlla il dispositivo due volte.", en: "erases everything. Check the device twice." } },
            { cmd: "mount / umount", what: { it: "appendi / stacca dall'albero", en: "attach / detach from the tree" }, flag: { it: "<code>mount</code> senza argomenti elenca tutto il montato", en: "<code>mount</code> with no arguments lists everything mounted" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `Sotto <code>~/lab/deposito</code> quale sottocartella occupa <strong>più
                     spazio</strong>? Consegna solo il nome della cartella.`,
                en: `Under <code>~/lab/deposito</code>, which subfolder takes up <strong>the most
                     space</strong>? Hand in the folder name only.`,
            },
            checks: [
                { id: "piu-grande",
                  why: { it: "È il primo passo davanti a un disco pieno: non cancellare a caso, ma scendere di livello in livello seguendo il totale più grande.",
                         en: "It is the first step in front of a full disk: do not delete at random, descend level by level following the biggest total." },
                  nudge: { it: "<code>du -sh ~/lab/deposito/* | sort -h</code> — l'ultima riga è la più grande. <code>-h</code> in <code>sort</code> capisce le unità.",
                           en: "<code>du -sh ~/lab/deposito/* | sort -h</code> — the last line is the biggest. <code>-h</code> in <code>sort</code> understands units." } },
            ],
            hints: [
                { it: "<code>du</code> somma lo spazio; <code>-s</code> dà un totale per voce e <code>-h</code> lo rende leggibile.", en: "<code>du</code> sums space; <code>-s</code> gives one total per entry and <code>-h</code> makes it readable." },
                { it: "Ordinare misure come <code>1.9G</code> e <code>148M</code> richiede <code>sort -h</code>, non <code>sort -n</code>.", en: "Sorting sizes like <code>1.9G</code> and <code>148M</code> needs <code>sort -h</code>, not <code>sort -n</code>." },
                { it: "<code>du -s ~/lab/deposito/* | sort -n | tail -1 | xargs basename | lab answer</code>", en: "<code>du -s ~/lab/deposito/* | sort -n | tail -1 | xargs basename | lab answer</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `«Il disco è pieno.» Sotto <code>~/lab/deposito</code> c'è <strong>un solo file
                     enorme</strong>, nascosto in mezzo agli altri. Cancella <strong>quello e solo
                     quello</strong>: tutti gli altri file devono restare.`,
                en: `"The disk is full." Under <code>~/lab/deposito</code> there is <strong>exactly
                     one huge file</strong>, hidden among the others. Delete <strong>that one and
                     only that one</strong>: every other file must remain.`,
            },
            checks: [
                { id: "gigante-sparito",
                  why: { it: "Trovare il file grande è metà del lavoro. L'altra metà è non toccare nient'altro, perché su un server quei file sono i dati di qualcuno.",
                         en: "Finding the big file is half the job. The other half is touching nothing else, because on a server those files are somebody's data." },
                  nudge: { it: "<code>find ~/lab/deposito -type f -size +2M</code> te lo trova senza doverlo cercare a occhio.",
                           en: "<code>find ~/lab/deposito -type f -size +2M</code> finds it without hunting by eye." } },
                { id: "altri-salvi",
                  why: { it: "«Ha funzionato» non basta mai: bisogna poter dimostrare di non aver rotto altro. La verifica conta i file rimasti.",
                         en: "\"It worked\" is never enough: you must be able to show you broke nothing else. The check counts the remaining files." },
                  nudge: { it: "Se ne hai cancellati troppi, il criterio era troppo largo. Guarda l'elenco <em>prima</em> di cancellare.",
                           en: "If you deleted too many, the criterion was too broad. Look at the list <em>before</em> deleting." } },
            ],
            hints: [
                { it: "<code>find</code> con <code>-size</code> te lo trova; il gigante supera i 2 megabyte.", en: "<code>find</code> with <code>-size</code> locates it; the giant is over 2 megabytes." },
                { it: "Guarda prima l'elenco, poi aggiungi <code>-delete</code>.", en: "Look at the list first, then add <code>-delete</code>." },
                { it: "<code>find ~/lab/deposito -type f -size +2M -delete</code>", en: "<code>find ~/lab/deposito -type f -size +2M -delete</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Costruisci un disco dal nulla: crea un file da <strong>8 MB</strong> in
                     <code>~/lab/disco.img</code>, formattalo come <strong>ext4</strong>, montalo su
                     <code>~/lab/mnt</code> e lasciaci dentro un file <code>prova.txt</code> che
                     contenga <code>funziona</code>. Alla fine deve risultare montato.`,
                en: `Build a disk from nothing: create an <strong>8 MB</strong> file at
                     <code>~/lab/disco.img</code>, format it as <strong>ext4</strong>, mount it on
                     <code>~/lab/mnt</code> and leave a file <code>prova.txt</code> inside
                     containing <code>funziona</code>. It must end up mounted.`,
            },
            attrezzi: [
                { cmd: "truncate -s 8M file", cosa: {
                    it: "crea (o ridimensiona) un file di esattamente quella dimensione, in un istante e senza scrivere davvero i byte.",
                    en: "creates (or resizes) a file of exactly that size, instantly and without really writing the bytes." } },
                { cmd: "dd if=… of=… bs=1M count=8", cosa: {
                    it: "copia a blocchi da una sorgente a una destinazione: qui prende 8 blocchi da 1 MB di zeri e li scrive nel file. È la strada lunga, ma è quella che troverai scritta ovunque.",
                    en: "copies block by block from a source to a destination: here it takes 8 blocks of 1 MB of zeros and writes them into the file. It is the long road, but the one you will find written everywhere." } },
                { cmd: "modprobe loop", cosa: {
                    it: "chiede al kernel di caricare un modulo — qui quello che fa funzionare i dischi finti dentro un file. Sui sistemi veri di solito succede da sé.",
                    en: "asks the kernel to load a module — here the one that makes file-backed fake disks work. On real systems it usually happens by itself." } },
            ],
            checks: [
                { id: "immagine-formattata",
                  why: { it: "Un file da 8 MB pieno di zeri non è un disco: lo diventa quando ci scrivi dentro le strutture di un filesystem. È quello che fa <code>mkfs</code>.",
                         en: "An 8 MB file full of zeros is not a disk: it becomes one when you write filesystem structures into it. That is what <code>mkfs</code> does." },
                  nudge: { it: "<code>file ~/lab/disco.img</code> te lo dice: se risponde <em>data</em> non è ancora formattato, se dice <em>ext4 filesystem</em> ci siamo.",
                           en: "<code>file ~/lab/disco.img</code> tells you: if it says <em>data</em> it is not formatted yet, if it says <em>ext4 filesystem</em> you are there." } },
                { id: "montato",
                  why: { it: "Montare è il gesto che rende un filesystem raggiungibile. Prima del mount i dati esistono ma non hanno un percorso.",
                         en: "Mounting is what makes a filesystem reachable. Before the mount the data exists but has no path." },
                  nudge: { it: "<code>mountpoint ~/lab/mnt</code> risponde sì o no. Serve <code>modprobe loop</code> se il dispositivo loop non c'è ancora.",
                           en: "<code>mountpoint ~/lab/mnt</code> answers yes or no. You may need <code>modprobe loop</code> if the loop device is not there yet." } },
                { id: "file-dentro",
                  why: { it: "La prova che il filesystem è vivo: ci si scrive. E quel file adesso vive nell'immagine, non nella cartella che lo ospita.",
                         en: "Proof the filesystem is alive: you write to it. And that file now lives inside the image, not in the folder hosting it." },
                  nudge: { it: "Il file va creato <em>dopo</em> il mount, altrimenti finisce nella cartella sottostante e il mount lo nasconde.",
                           en: "Create the file <em>after</em> mounting, otherwise it lands in the underlying folder and the mount hides it." } },
            ],
            hints: [
                { it: "Per creare un file di una dimensione data: <code>dd if=/dev/zero of=… bs=1M count=8</code> (oppure <code>truncate -s 8M</code>).", en: "To create a file of a given size: <code>dd if=/dev/zero of=… bs=1M count=8</code> (or <code>truncate -s 8M</code>)." },
                { it: "<code>mkfs.ext4 -F ~/lab/disco.img</code> formatta direttamente il file. Poi <code>mount -o loop</code>.", en: "<code>mkfs.ext4 -F ~/lab/disco.img</code> formats the file directly. Then <code>mount -o loop</code>." },
                { it: "<code>modprobe loop; dd if=/dev/zero of=~/lab/disco.img bs=1M count=8; mkfs.ext4 -qF ~/lab/disco.img; mkdir -p ~/lab/mnt; mount -o loop ~/lab/disco.img ~/lab/mnt; echo funziona &gt; ~/lab/mnt/prova.txt</code>", en: "<code>modprobe loop; dd if=/dev/zero of=~/lab/disco.img bs=1M count=8; mkfs.ext4 -qF ~/lab/disco.img; mkdir -p ~/lab/mnt; mount -o loop ~/lab/disco.img ~/lab/mnt; echo funziona &gt; ~/lab/mnt/prova.txt</code>" },
            ],
        },
    ],
};
