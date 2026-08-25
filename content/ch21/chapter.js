export default {
    id: "ch21", num: 21, runtime: "local", requires: ["ch13"], draft: false,
    title: { it: "LVM e RAID", en: "LVM and RAID" },
    oneLiner: {
        it: "Il disco smette di essere una cosa sola.",
        en: "The disk stops being one single thing.",
    },
    commands: ["pvcreate", "vgcreate", "lvcreate", "lvextend", "resize2fs", "mdadm", "sync", "lsblk"],
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
                 RAID <strong>sono globali al kernel Linux che esegue Docker</strong>. Su Linux
                 nativo un <code>lsblk</code> dell'host li mostra. Per questo tutto quello che creiamo si chiama
                 <code>lab-</code> qualcosa, e <code>./lab/local/run.sh cleanup</code> smonta,
                 disattiva e stacca ogni cosa.</p>
                 <p>Lavoriamo su <strong>file trasformati in dischi</strong> con
                 <code>losetup</code> — la stessa tecnica del capitolo 13, ma con più dischi
                 insieme. Non tocchiamo nessun disco vero, e non partizioniamo niente.</p>`,
            en: `<p>This chapter touches <strong>block devices</strong>, and it must be said
                 plainly: the container runs <code>--privileged</code>, and LVM volumes and RAID
                 arrays <strong>are global to the Linux kernel running Docker</strong>. On native
                 Linux, host <code>lsblk</code> will show them. That is why everything we create is called
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
                 volumi che puoi allargare finché il gruppo ha spazio e il filesystem lo supporta.
                 <strong>RAID</strong> combina più dischi per prestazioni e/o ridondanza; nel RAID1
                 di questo lab gli stessi blocchi vivono su due membri, così un guasto non ferma i
                 dati. Si usano spesso insieme, ma risolvono problemi diversi.`,
            en: `Two separate ideas that often get confused. <strong>LVM</strong> is about
                 <em>resizing</em>: it pools disks into a common store and carves out volumes you
                 can grow while the group has free space and the filesystem supports it.
                 <strong>RAID</strong> combines disks for performance and/or redundancy; in this
                 lab's RAID1 the same blocks live on two members, so one failure does not stop the
                 data. They are often used together, but they solve different problems.` } },

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
            it: `<p><strong>Allargare è in genere più semplice; ridurre è più rischioso.</strong>
                 Un LV si può estendere a caldo e ext4 può crescere mentre è montato; altri
                 filesystem hanno capacità diverse. Ridurre richiede l'ordine inverso (prima il
                 filesystem, poi il volume), spesso a freddo, e un errore di ordine può
                 <em>troncare i dati</em>; alcuni filesystem, come XFS, non supportano affatto la
                 riduzione. La regola pratica: backup, verifica del filesystem e procedura
                 specifica prima di toccare le dimensioni.</p>
                 <p><strong>RAID non è un backup</strong>, ed è la cosa più importante di questo
                 capitolo. RAID1 protegge da un disco che si rompe. Non protegge da un
                 <code>rm -rf</code>, da un ransomware o da un errore di configurazione: quelli
                 vengono scritti fedelmente su <em>tutti</em> i dischi, all'istante. Servono
                 entrambi, e servono per cose diverse.</p>
                 <p>Il pezzo che quasi tutti dimenticano: un array degradato non ti avvisa da solo
                 se nessuno ha configurato il monitoraggio — <code>mdadm --monitor</code>, o un controllo su
                 <code>/proc/mdstat</code> — altrimenti scopri che un disco è morto il giorno in
                 cui muore anche il secondo. Un RAID senza monitoraggio è un RAID che ti farà
                 credere di essere protetto proprio mentre non lo sei più.</p>`,
            en: `<p><strong>Growing is generally simpler; shrinking is riskier.</strong> An LV can
                 be extended live and ext4 can grow while mounted; other filesystems have different
                 capabilities. Shrinking requires the reverse order (filesystem first, then
                 volume), often cold, and getting the order wrong can <em>truncate your data</em>;
                 some filesystems, such as XFS, cannot shrink at all. The practical rule is to
                 back up, identify the filesystem, and follow its specific procedure before
                 changing sizes.</p>
                 <p><strong>RAID is not a backup</strong>, and that is the most important thing in
                 this chapter. RAID1 protects against a disk breaking. It does not protect against
                 an <code>rm -rf</code>, ransomware or a misconfiguration: those get written
                 faithfully to <em>every</em> disk, instantly. You need both, and they are for
                 different things.</p>
                 <p>The piece almost everyone forgets: a degraded array will not alert you by itself
                 unless monitoring is configured — <code>mdadm --monitor</code>, or a check on <code>/proc/mdstat</code>
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
            { cmd: "mdadm --fail / --remove", what: { it: "simula il guasto e sfila un membro", en: "simulate failure and remove a member" }, flag: { it: "prima controlla sempre <code>--detail</code>", en: "always inspect <code>--detail</code> first" } },
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
                { id: "lv-giusto",
                  why: { it: "Il gruppo è lo spazio, il volume è la fetta che ne ritagli: sono due cose diverse, e un gruppo può esistere benissimo vuoto. La dimensione conta perché è il punto: la prendi adesso e la cambi dopo, a caldo.",
                         en: "The group is the space, the volume is the slice you cut out of it: two different things, and a group can perfectly well sit empty. The size matters because that is the point: you take it now and change it later, live." },
                  nudge: { it: "<code>lvs</code> mostra nome, gruppo e dimensione di ogni volume. Si ritaglia con <code>lvcreate -L 60M -n lab-dati lab-vg</code>.",
                           en: "<code>lvs</code> shows name, group and size of every volume. You cut it with <code>lvcreate -L 60M -n lab-dati lab-vg</code>." } },
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
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Costruisci e rompi in modo controllato un <strong>RAID1</strong>. Il seed ha
                     preparato due file-disco: crea <code>/dev/md/lab-raid</code> con entrambi,
                     formattalo ext4, montalo su <code>/mnt/raid</code> e scrivi
                     <code>ridondante</code> in <code>/mnt/raid/prova.txt</code>. Poi marca uno dei
                     due membri come guasto e rimuovilo dall'array. Alla fine l'array deve essere
                     degradato ma montato, e il file ancora leggibile. Sono dischi finti del lab:
                     non usare altri dispositivi.`,
                en: `Build and safely break a <strong>RAID1</strong>. The seed prepared two
                     disk-files: create <code>/dev/md/lab-raid</code> from both, format it as ext4,
                     mount it on <code>/mnt/raid</code>, and write <code>ridondante</code> to
                     <code>/mnt/raid/prova.txt</code>. Then mark one member faulty and remove it
                     from the array. At the end the array must be degraded but mounted, with the
                     file still readable. These are the lab's fake disks: use no other devices.`,
            },
            checks: [
                { id: "raid1-creato",
                  why: { it: "RAID1 replica gli stessi blocchi su due membri. Il check legge i metadati dell'array: due file separati o RAID0 non sono equivalenti.", en: "RAID1 mirrors the same blocks across two members. The check reads the array metadata: two separate files or RAID0 are not equivalent." },
                  nudge: { it: "<code>mdadm --detail /dev/md/lab-raid</code>: cerca <code>Raid Level : raid1</code> e <code>Raid Devices : 2</code>.", en: "<code>mdadm --detail /dev/md/lab-raid</code>: look for <code>Raid Level : raid1</code> and <code>Raid Devices : 2</code>." } },
                { id: "degradato",
                  why: { it: "Il guasto controllato rende visibile la promessa del mirror: con un solo membro attivo lo stato è degradato, non distrutto. Adesso servirebbero allarme e sostituzione.", en: "The controlled failure makes the mirror's promise visible: with one active member the state is degraded, not destroyed. In reality, alerting and replacement must follow." },
                  nudge: { it: "Dopo aver identificato un loop del lab: <code>mdadm /dev/md/lab-raid --fail /dev/loopX --remove /dev/loopX</code>, poi rileggi <code>--detail</code>.", en: "After identifying one lab loop: <code>mdadm /dev/md/lab-raid --fail /dev/loopX --remove /dev/loopX</code>, then inspect <code>--detail</code> again." } },
                { id: "dati-letti",
                  why: { it: "La ridondanza conta solo se il filesystem resta montato e i dati sono leggibili dopo il guasto. È una prova di disponibilità, non un backup contro cancellazioni.", en: "Redundancy only matters if the filesystem stays mounted and data remains readable after failure. This proves availability, not backup against deletion." },
                  nudge: { it: "<code>findmnt /mnt/raid</code> deve indicare l'array; <code>cat /mnt/raid/prova.txt</code> deve ancora stampare <code>ridondante</code>.", en: "<code>findmnt /mnt/raid</code> must name the array; <code>cat /mnt/raid/prova.txt</code> must still print <code>ridondante</code>." } },
            ],
            hints: [
                { it: "I due membri sono elencati in <code>/opt/lab/state/loop-raid</code>. Guardali con <code>cat</code>; non scegliere mai un disco a intuito.", en: "The two members are listed in <code>/opt/lab/state/loop-raid</code>. Inspect them with <code>cat</code>; never pick a disk by guesswork." },
                { it: "Crea il mirror con <code>mdadm --create /dev/md/lab-raid --level=1 --raid-devices=2 DISCO1 DISCO2</code>, poi usa gli stessi <code>mkfs.ext4</code> e <code>mount</code> del capitolo 13.", en: "Create the mirror with <code>mdadm --create /dev/md/lab-raid --level=1 --raid-devices=2 DISK1 DISK2</code>, then use the same <code>mkfs.ext4</code> and <code>mount</code> from chapter 13." },
                { it: "Solo dopo aver scritto il file: <code>sync</code> chiede al kernel di scaricare sui dispositivi le scritture in attesa; quindi usa <code>mdadm /dev/md/lab-raid --fail DISCO2 --remove DISCO2</code>. Non fermare l'array: deve restare montato.", en: "Only after writing the file: <code>sync</code> asks the kernel to flush pending writes to the devices; then use <code>mdadm /dev/md/lab-raid --fail DISK2 --remove DISK2</code>. Do not stop the array: it must stay mounted." },
            ],
        },
    ],
};
