export default {
    id: "ch21", num: 21, runtime: "local", requires: ["ch13"], draft: false,
    title: { it: "LVM e RAID", en: "LVM and RAID" },
    oneLiner: {
        it: "Il disco smette di essere una cosa sola.",
        en: "The disk stops being one single thing.",
    },
    commands: ["pvcreate", "vgcreate", "lvcreate", "lvextend", "resize2fs", "mdadm", "lsblk"],
    glossary: ["PV", "VG", "LV", "RAID1", "degradato", "a caldo"],

    blocks: [
        { kind: "hook", html: {
            it: `La partizione dei dati è piena. Con le partizioni classiche significa smontare,
                 spostare, ripartizionare e pregare. Con LVM significa <strong>due comandi, senza
                 smontare niente</strong>, mentre il servizio continua a scrivere.`,
            en: `The data partition is full. With classic partitions that means unmounting, moving,
                 repartitioning and praying. With LVM it means <strong>two commands, without
                 unmounting anything</strong>, while the service keeps writing.` } },

        { kind: "local", html: {
            it: `<p>Questo capitolo tocca <strong>dispositivi a blocchi</strong>, e va detto con
                 chiarezza: il container gira <code>--privileged</code>, e i volumi LVM e gli array
                 RAID <strong>sono globali del tuo computer</strong>. Un <code>lsblk</code>
                 sull'host li mostra. Per questo tutto quello che creiamo si chiama
                 <code>lab-</code> qualcosa, e <code>./lab/local/run.sh cleanup</code> smonta,
                 disattiva e stacca ogni cosa.</p>
                 <p>Lavoriamo su <strong>file trasformati in dischi</strong> con
                 <code>losetup</code> — la stessa tecnica del capitolo 13, ma con più dischi
                 insieme. Non tocchiamo nessun disco vero, e non partizioniamo niente.</p>`,
            en: `<p>This chapter touches <strong>block devices</strong>, and it must be said
                 plainly: the container runs <code>--privileged</code>, and LVM volumes and RAID
                 arrays <strong>are global to your computer</strong>. An <code>lsblk</code> on the
                 host will show them. That is why everything we create is called
                 <code>lab-</code>something, and <code>./lab/local/run.sh cleanup</code> unmounts,
                 deactivates and detaches all of it.</p>
                 <p>We work on <strong>files turned into disks</strong> with <code>losetup</code> —
                 the same technique as chapter 13, but with several disks at once. We touch no real
                 disk, and we partition nothing.</p>`,
            cmd: "./lab/local/run.sh 21 1\ndocker exec -it linuxlab bash",
        } },

        { kind: "lead", html: {
            it: `Due idee separate che spesso si confondono. <strong>LVM</strong> serve a
                 <em>ridimensionare</em>: mette i dischi in un magazzino comune e ne ritaglia
                 volumi che puoi allargare quando vuoi. <strong>RAID</strong> serve a
                 <em>sopravvivere</em>: scrive gli stessi dati su più dischi, così se uno muore i
                 dati restano. Si usano spesso insieme, ma risolvono problemi diversi.`,
            en: `Two separate ideas that often get confused. <strong>LVM</strong> is about
                 <em>resizing</em>: it pools disks into a common store and carves out volumes you
                 can grow whenever you like. <strong>RAID</strong> is about <em>surviving</em>: it
                 writes the same data to several disks, so if one dies the data remains. They are
                 often used together, but they solve different problems.` } },

        { kind: "analogy", html: {
            it: `LVM è un <strong>magazzino con scaffali mobili</strong>. I dischi fisici (PV) sono
                 le pareti, il magazzino è il gruppo (VG), e i tuoi volumi (LV) sono spazi
                 delimitati dentro. Ti serve più spazio per uno? Sposti il divisorio, senza
                 svuotare niente. Aggiungi una parete nuova? Il magazzino cresce e tutti i volumi
                 possono attingerci.`,
            en: `LVM is a <strong>warehouse with movable shelving</strong>. The physical disks (PV)
                 are the walls, the warehouse is the group (VG), and your volumes (LV) are marked
                 areas inside. Need more room for one? You move the divider, without emptying
                 anything. Add a new wall? The warehouse grows and every volume can draw on it.` } },

        { kind: "transcript", src: "transcript.json" },

        { kind: "predict",
          domanda: { it: "Hai fatto <code>lvextend -L +200M</code> sul volume montato. <code>lvs</code> mostra la nuova dimensione, ma <code>df -h</code> mostra ancora quella vecchia. Perché?",
                     en: "You ran <code>lvextend -L +200M</code> on the mounted volume. <code>lvs</code> shows the new size, but <code>df -h</code> still shows the old one. Why?" },
          opzioni: [
              { testo: { it: "Il volume è cresciuto, ma il filesystem dentro non lo sa ancora: manca <code>resize2fs</code>.", en: "The volume grew, but the filesystem inside does not know yet: <code>resize2fs</code> is missing." }, giusta: true },
              { testo: { it: "Serve smontare e rimontare perché df si aggiorni.", en: "You must unmount and remount for df to update." }, giusta: false },
              { testo: { it: "<code>lvextend</code> è fallito a metà: va rifatto.", en: "<code>lvextend</code> half-failed: run it again." }, giusta: false },
          ],
          spiegazione: {
              it: `Sono <strong>due strati indipendenti</strong>: LVM gestisce il contenitore, il
                   filesystem gestisce l'organizzazione dentro il contenitore. Allargare la scatola
                   non allarga da solo lo scaffale che c'è dentro. Per questo esiste
                   <code>lvextend -r</code>, che fa le due cose insieme — ed è la forma che
                   conviene imparare subito.`,
              en: `They are <strong>two independent layers</strong>: LVM manages the container, the
                   filesystem manages the organisation inside the container. Growing the box does
                   not by itself grow the shelf inside it. That is why <code>lvextend -r</code>
                   exists, doing both at once — and it is the form worth learning right away.` } },

        { kind: "pro", html: {
            it: `<p><strong>Allargare è sicuro, rimpicciolire no.</strong> Estendere un LV e poi il
                 filesystem si fa a caldo, con il volume montato e in uso. Ridurre richiede
                 l'ordine inverso (prima il filesystem, poi il volume), spesso a freddo, e un
                 errore di ordine <em>tronca i dati</em>. La regola pratica: si creano volumi
                 piccoli e si allargano quando servono, mai il contrario.</p>
                 <p><strong>RAID non è un backup</strong>, ed è la cosa più importante di questo
                 capitolo. RAID1 protegge da un disco che si rompe. Non protegge da un
                 <code>rm -rf</code>, da un ransomware o da un errore di configurazione: quelli
                 vengono scritti fedelmente su <em>tutti</em> i dischi, all'istante. Servono
                 entrambi, e servono per cose diverse.</p>
                 <p>Il pezzo che quasi tutti dimenticano: un array degradato non lo dice nessuno.
                 Va monitorato — <code>mdadm --monitor</code>, o un controllo su
                 <code>/proc/mdstat</code> — altrimenti scopri che un disco è morto il giorno in
                 cui muore anche il secondo. Un RAID senza monitoraggio è un RAID che ti farà
                 credere di essere protetto proprio mentre non lo sei più.</p>`,
            en: `<p><strong>Growing is safe, shrinking is not.</strong> Extending an LV and then the
                 filesystem happens hot, with the volume mounted and in use. Shrinking requires the
                 reverse order (filesystem first, then volume), often cold, and getting the order
                 wrong <em>truncates your data</em>. The practical rule: create small volumes and
                 grow them when needed, never the other way round.</p>
                 <p><strong>RAID is not a backup</strong>, and that is the most important thing in
                 this chapter. RAID1 protects against a disk breaking. It does not protect against
                 an <code>rm -rf</code>, ransomware or a misconfiguration: those get written
                 faithfully to <em>every</em> disk, instantly. You need both, and they are for
                 different things.</p>
                 <p>The piece almost everyone forgets: nobody announces a degraded array. It must be
                 monitored — <code>mdadm --monitor</code>, or a check on <code>/proc/mdstat</code>
                 — otherwise you discover one disk died on the day the second one does too. An
                 unmonitored RAID is a RAID that will make you feel protected exactly while you are
                 not.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>Rimpicciolire un filesystem nell'ordine sbagliato distrugge i dati.</strong> Se devi farlo, fai il backup prima. Se puoi evitarlo, evitalo.",
              en: "<strong>Shrinking a filesystem in the wrong order destroys data.</strong> If you must, back up first. If you can avoid it, avoid it." },
            { it: "<strong>RAID non è un backup.</strong> Va ripetuto perché è la convinzione sbagliata più diffusa e più costosa dell'intero mestiere.",
              en: "<strong>RAID is not a backup.</strong> Worth repeating because it is the most widespread and most expensive wrong belief in the whole trade." },
            { it: "<strong>Un array degradato è silenzioso.</strong> Senza monitoraggio, il primo segnale che ricevi è la perdita totale dei dati quando cede il secondo disco.",
              en: "<strong>A degraded array is silent.</strong> Without monitoring, the first signal you get is total data loss when the second disk goes." },
        ] },

        { kind: "recap", table: [
            { cmd: "pvcreate / vgcreate", what: { it: "i dischi diventano un magazzino", en: "disks become a warehouse" }, flag: { it: "il VG è l'unità che cresce", en: "the VG is the unit that grows" } },
            { cmd: "lvcreate -L", what: { it: "ritaglia un volume", en: "carve out a volume" }, flag: { it: "creali piccoli: allargare è facile", en: "make them small: growing is easy" } },
            { cmd: "lvextend -r -L +N", what: { it: "allarga volume e filesystem", en: "grow volume and filesystem" }, flag: { it: "la <code>-r</code> è quella che ti evita il bug", en: "<code>-r</code> is what saves you the bug" } },
            { cmd: "mdadm --create", what: { it: "crea un array", en: "create an array" }, flag: { it: "<code>--detail</code> per lo stato, e va monitorato", en: "<code>--detail</code> for status, and it must be monitored" } },
            { cmd: "cat /proc/mdstat", what: { it: "lo stato degli array, in una riga", en: "array status, in one line" }, flag: { it: "è quello che deve guardare il tuo monitoraggio", en: "this is what your monitoring should watch" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Costruisci un volume logico. Il seed ti ha lasciato due file-disco già agganciati
                     a dei loop device. Creane un gruppo <code>lab-vg</code>, ritaglia un volume
                     <code>lab-dati</code> da <strong>60M</strong>, formattalo ext4 e montalo su
                     <code>/mnt/lab</code>.`,
                en: `Build a logical volume. The seed left you two disk-files already attached to
                     loop devices. Make them a group <code>lab-vg</code>, carve a volume
                     <code>lab-dati</code> of <strong>60M</strong>, format it ext4 and mount it on
                     <code>/mnt/lab</code>.`,
            },
            checks: [
                { id: "vg-creato",
                  why: { it: "Il gruppo è il magazzino: da quel momento i due dischi non contano più singolarmente, contano come spazio disponibile.",
                         en: "The group is the warehouse: from that point the two disks no longer count individually, they count as available space." },
                  nudge: { it: "<code>vgs</code> elenca i gruppi. Serve prima <code>pvcreate</code> sui due loop device.",
                           en: "<code>vgs</code> lists the groups. You need <code>pvcreate</code> on the two loop devices first." } },
                { id: "lv-montato",
                  why: { it: "Un volume logico si usa come un disco qualunque: formattare e montare sono gli stessi comandi del capitolo 13.",
                         en: "A logical volume is used like any disk: formatting and mounting are the same commands as chapter 13." },
                  nudge: { it: "Il percorso del volume è <code>/dev/lab-vg/lab-dati</code>. Se non compare, <code>vgchange -ay lab-vg</code>.",
                           en: "The volume path is <code>/dev/lab-vg/lab-dati</code>. If it does not appear, <code>vgchange -ay lab-vg</code>." } },
            ],
            hints: [
                { it: "I loop device li trovi con <code>losetup -a</code>.", en: "Find the loop devices with <code>losetup -a</code>." },
                { it: "La sequenza è: <code>pvcreate</code> → <code>vgcreate</code> → <code>lvcreate</code> → <code>mkfs.ext4</code> → <code>mount</code>.", en: "The sequence is: <code>pvcreate</code> → <code>vgcreate</code> → <code>lvcreate</code> → <code>mkfs.ext4</code> → <code>mount</code>." },
                { it: "<code>pvcreate /dev/loopX /dev/loopY; vgcreate lab-vg /dev/loopX /dev/loopY; lvcreate -L 60M -n lab-dati lab-vg; mkfs.ext4 -q /dev/lab-vg/lab-dati; mkdir -p /mnt/lab; mount /dev/lab-vg/lab-dati /mnt/lab</code>", en: "<code>pvcreate /dev/loopX /dev/loopY; vgcreate lab-vg /dev/loopX /dev/loopY; lvcreate -L 60M -n lab-dati lab-vg; mkfs.ext4 -q /dev/lab-vg/lab-dati; mkdir -p /mnt/lab; mount /dev/lab-vg/lab-dati /mnt/lab</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Allarga <strong>a caldo</strong>. Nel volume montato c'è un file con dei dati:
                     porta il volume a almeno <strong>100M</strong> e fa' in modo che anche
                     <code>df</code> lo veda, <strong>senza smontare</strong>. La verifica confronta
                     l'impronta del file prima e dopo.`,
                en: `Grow it <strong>hot</strong>. There is a data file on the mounted volume: bring
                     the volume to at least <strong>100M</strong> and make <code>df</code> see it
                     too, <strong>without unmounting</strong>. The check compares the file's
                     fingerprint before and after.`,
            },
            checks: [
                { id: "volume-cresciuto",
                  why: { it: "Questo è il motivo per cui LVM esiste: aggiungere spazio a un servizio in produzione senza fermarlo.",
                         en: "This is why LVM exists: adding space to a production service without stopping it." },
                  nudge: { it: "<code>lvs</code> mostra la dimensione del volume; <code>df -h /mnt/lab</code> quella vista dal filesystem. Devono coincidere.",
                           en: "<code>lvs</code> shows the volume size; <code>df -h /mnt/lab</code> the one the filesystem sees. They must match." } },
                { id: "filesystem-cresciuto",
                  why: { it: "Sono due strati: allargare la scatola non allarga lo scaffale dentro. È il tranello su cui inciampano tutti la prima volta.",
                         en: "Two layers: growing the box does not grow the shelf inside. It is the trap everyone falls into the first time." },
                  nudge: { it: "<code>resize2fs /dev/lab-vg/lab-dati</code> — oppure, meglio, <code>lvextend -r</code> che fa entrambe le cose.",
                           en: "<code>resize2fs /dev/lab-vg/lab-dati</code> — or better, <code>lvextend -r</code> which does both." } },
                { id: "dati-intatti",
                  why: { it: "L'operazione «a caldo» vale solo se i dati sopravvivono. Il confronto dell'impronta prima/dopo è la dimostrazione, non la promessa.",
                         en: "The \"hot\" operation only counts if the data survives. Comparing the fingerprint before and after is the proof, not the promise." },
                  nudge: { it: "Se l'impronta è cambiata, hai riformattato invece di allargare.",
                           en: "If the fingerprint changed, you reformatted instead of growing." } },
            ],
            hints: [
                { it: "Il comando per allargare un volume logico è <code>lvextend</code>.", en: "The command to grow a logical volume is <code>lvextend</code>." },
                { it: "L'opzione <code>-r</code> ridimensiona anche il filesystem, in un colpo solo.", en: "The <code>-r</code> option resizes the filesystem too, in one go." },
                { it: "<code>lvextend -r -L 120M /dev/lab-vg/lab-dati</code>", en: "<code>lvextend -r -L 120M /dev/lab-vg/lab-dati</code>" },
            ],
        },
    ],
};
