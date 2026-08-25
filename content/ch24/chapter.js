export default {
    id: "ch24", num: 24, runtime: "browser", requires: ["ch11"], draft: false,
    title: { it: "Un container è solo un processo", en: "A container is just a process" },
    oneLiner: {
        it: "Non è una piccola VM: è un processo che il kernel isola con i namespace.",
        en: "It is not a small VM: it is a process the kernel isolates with namespaces.",
    },
    commands: ["unshare", "unshare --pid", "unshare --uts", "unshare --mount", "nsenter", "hostname", "readlink"],
    glossary: ["namespace", "PID namespace", "UTS namespace", "mount namespace", "isolamento", "container"],

    blocks: [
        { kind: "hook", html: {
            it: `Tutti chiamano un container «una macchina leggera». È una bugia comoda. Non c'è
                 nessuna seconda macchina, nessun secondo kernel, nessun boot: c'è
                 <strong>un processo come tutti gli altri</strong>, che il kernel fa vivere in una
                 stanza con le pareti tirate su — i <strong>namespace</strong>. Qui le tiri su tu,
                 a mano, prima ancora di vedere Docker.`,
            en: `Everyone calls a container "a lightweight machine". It is a convenient lie. There
                 is no second machine, no second kernel, no boot: there is
                 <strong>a process like any other</strong>, which the kernel makes live in a room
                 with the walls raised — the <strong>namespaces</strong>. Here you raise them
                 yourself, by hand, before ever seeing Docker.` } },

        { kind: "lead", html: {
            it: `Un namespace è una <strong>vista privata</strong> di una risorsa del sistema. Il
                 PID namespace dà una numerazione dei processi tutta sua; l'UTS namespace un
                 hostname suo; il mount namespace dei montaggi suoi. Stesso kernel, stesse CPU,
                 stessa memoria — ma il processo <em>vede</em> un mondo più piccolo.`,
            en: `A namespace is a <strong>private view</strong> of a system resource. The PID
                 namespace gives its own process numbering; the UTS namespace its own hostname; the
                 mount namespace its own mounts. Same kernel, same CPUs, same memory — but the
                 process <em>sees</em> a smaller world.` } },

        { kind: "analogy", html: {
            it: `Non è una casa nuova: è una <strong>stanza</strong> nella tua. Il muratore è
                 <code>unshare</code> («smetti di condividere questa vista»); la porta per rientrare
                 in una stanza già chiusa è <code>nsenter</code>. La corrente, l'acqua e le
                 fondamenta — il kernel — restano quelle di casa. Ecco perché un container parte in
                 un lampo: non costruisce niente, alza solo un muro.`,
            en: `It is not a new house: it is a <strong>room</strong> inside yours. The mason is
                 <code>unshare</code> ("stop sharing this view"); the door back into a closed room
                 is <code>nsenter</code>. The power, the water and the foundations — the kernel —
                 stay the house's. That is why a container starts in a flash: it builds nothing,
                 it just raises a wall.` } },

        { kind: "shown", lines: [
            { cmd: "echo $$; unshare --pid --fork --mount-proc sh -c 'echo dentro: $$; ps -e | wc -l'", out: "807\ndentro: 1\n2",
              note: { it: "Fuori sei il processo <code>807</code>; <strong>dentro</strong> il PID namespace il tuo processo è <code>1</code>, e <code>ps</code> vede due processi in tutto, non quelli dell'host. <code>--fork</code> serve perché a diventare PID 1 sia il figlio, <code>--mount-proc</code> perché <code>/proc</code> rifletta la nuova vista.",
                      en: "Outside you are process <code>807</code>; <strong>inside</strong> the PID namespace your process is <code>1</code>, and <code>ps</code> sees two processes total, not the host's. <code>--fork</code> makes the child become PID 1, <code>--mount-proc</code> makes <code>/proc</code> reflect the new view." } },
            { cmd: "hostname; unshare --uts sh -c 'hostname contenitore; hostname'; hostname", out: "linux-lab\ncontenitore\nlinux-lab",
              note: { it: "Nel mezzo, dentro l'UTS namespace, l'hostname è <code>contenitore</code>. Ma la riga dopo — di nuovo sull'host — è ancora <code>linux-lab</code>: il cambiamento è vissuto <strong>solo dentro la stanza</strong>. Questo è l'isolamento, e nessuna VM è stata avviata.",
                      en: "In the middle, inside the UTS namespace, the hostname is <code>contenitore</code>. But the next line — back on the host — is still <code>linux-lab</code>: the change lived <strong>only inside the room</strong>. That is isolation, and no VM was started." } },
            { cmd: "readlink /proc/self/ns/pid; unshare --pid --fork sh -c 'readlink /proc/self/ns/pid'", out: "pid:[4026531836]\npid:[4026532461]",
              note: { it: "La prova numerica: ogni namespace ha un identificatore. Il primo è quello dell'host, il secondo è nuovo — <code>unshare</code> ha davvero creato una vista diversa. È così che il check di questi esercizi capisce se hai isolato per davvero.",
                      en: "The numeric proof: every namespace has an identifier. The first is the host's, the second is new — <code>unshare</code> really created a different view. That is how these exercises' checks know whether you truly isolated." } },
            { cmd: "unshare --mount sh -c 'mount -t tmpfs t /mnt && touch /mnt/segreto && ls /mnt'; ls /mnt", out: "segreto\n",
              note: { it: "Dentro il mount namespace monti una <code>tmpfs</code> su <code>/mnt</code> e ci metti un file. Fuori, l'ultima riga, <code>/mnt</code> è <strong>vuoto</strong>: quel montaggio e quel file esistono solo per il processo isolato. Il filesystem stratificato dei container nasce da qui.",
                      en: "Inside the mount namespace you mount a <code>tmpfs</code> on <code>/mnt</code> and put a file in it. Outside, the last line, <code>/mnt</code> is <strong>empty</strong>: that mount and that file exist only for the isolated process. Containers' layered filesystem is born here." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>I namespace non sono uno: sono sette (PID, mount, network, UTS, IPC, user,
                 cgroup, time). Docker li alza quasi tutti insieme con una sola chiamata, e ci
                 aggiunge i <strong>cgroup</strong> per i limiti (CPU, memoria) e le
                 <strong>capability</strong> per i permessi. Un container è esattamente questo
                 pacchetto: namespace per <em>cosa vede</em>, cgroup per <em>quanto consuma</em>,
                 capability per <em>cosa può fare</em>. Niente di più magico di quello che hai
                 appena fatto a mano.</p>
                 <p>La differenza con una VM è netta e vale ricordarla: la VM emula
                 <strong>hardware</strong> e ci fa girare sopra un secondo kernel; il container
                 <strong>condivide</strong> il tuo kernel e isola solo la vista. Più leggero, e per
                 questo con una superficie di sicurezza diversa — chi esce dalla stanza è già
                 dentro casa tua.</p>`,
            en: `<p>Namespaces are not one: they are seven (PID, mount, network, UTS, IPC, user,
                 cgroup, time). Docker raises almost all of them at once with a single call, and
                 adds <strong>cgroups</strong> for limits (CPU, memory) and
                 <strong>capabilities</strong> for permissions. A container is exactly that bundle:
                 namespaces for <em>what it sees</em>, cgroups for <em>how much it uses</em>,
                 capabilities for <em>what it may do</em>. Nothing more magical than what you just
                 did by hand.</p>
                 <p>The difference from a VM is sharp and worth remembering: a VM emulates
                 <strong>hardware</strong> and runs a second kernel on top; a container
                 <strong>shares</strong> your kernel and isolates only the view. Lighter, and so
                 with a different security surface — whoever leaves the room is already inside your
                 house.</p>` } },

        { kind: "pitfalls", items: [
            { it: `<strong>Credere che sia una VM</strong> — non c'è un secondo kernel: <code>uname -r</code> dentro e fuori è identico. Se ti aspetti l'isolamento di una macchina virtuale, la sicurezza ti sorprenderà.`,
              en: `<strong>Thinking it is a VM</strong> — there is no second kernel: <code>uname -r</code> inside and outside is identical. If you expect a virtual machine's isolation, security will surprise you.` },
            { it: `<strong>Dimenticare <code>--fork</code> e <code>--mount-proc</code></strong> nel PID namespace — senza, <code>ps</code> continua a mostrare i processi dell'host e sembra che l'isolamento non funzioni.`,
              en: `<strong>Forgetting <code>--fork</code> and <code>--mount-proc</code></strong> in a PID namespace — without them, <code>ps</code> keeps showing the host's processes and the isolation looks broken.` },
        ] },

        { kind: "recap", table: [
            { cmd: "unshare", what: { it: "alza un muro (nuovo namespace)", en: "raise a wall (new namespace)" }, flag: { it: "<code>--pid --fork --mount-proc</code>, <code>--uts</code>, <code>--mount</code>", en: "<code>--pid --fork --mount-proc</code>, <code>--uts</code>, <code>--mount</code>" } },
            { cmd: "nsenter", what: { it: "rientra in una stanza già chiusa", en: "re-enter a closed room" }, flag: { it: "<code>-t PID -u/-m/-p</code>", en: "<code>-t PID -u/-m/-p</code>" } },
            { cmd: "readlink /proc/PID/ns/pid", what: { it: "l'identità del namespace", en: "the namespace identity" }, flag: { it: "diverso = isolato", en: "different = isolated" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Fai partire <strong>in background</strong> un processo che viva in un
                     <strong>PID namespace tutto suo</strong> (un <code>sleep</code> lungo va
                     benissimo). La verifica lo cerca controllando i namespace: dev'esserci un
                     processo la cui vista dei PID è diversa da quella dell'host.`,
                en: `Start <strong>in the background</strong> a process living in its
                     <strong>own PID namespace</strong> (a long <code>sleep</code> is fine). The
                     check looks for it by inspecting namespaces: there must be a process whose PID
                     view differs from the host's.`,
            },
            checks: [
                { id: "pid-namespace",
                  why: { it: "Il PID namespace è il primo muro di un container: dentro, il tuo processo è l'<code>1</code>, e non vede quelli dell'host. Alzarlo a mano è capire cosa Docker fa in automatico.",
                         en: "The PID namespace is a container's first wall: inside, your process is <code>1</code>, and it does not see the host's. Raising it by hand is understanding what Docker does automatically." },
                  nudge: { it: "<code>unshare --pid --fork --mount-proc sh -c 'sleep 600' &amp;</code> — poi torni al prompt e verifichi.",
                           en: "<code>unshare --pid --fork --mount-proc sh -c 'sleep 600' &amp;</code> — then back to the prompt and verify." } },
            ],
            hints: [
                { it: "Il muratore dei namespace è <code>unshare</code>; per il PID serve <code>--pid</code>.", en: "The namespace mason is <code>unshare</code>; for PID you need <code>--pid</code>." },
                { it: "Servono anche <code>--fork</code> (il figlio diventa PID 1) e la coda <code>&amp;</code> per lasciarlo in background.", en: "You also need <code>--fork</code> (the child becomes PID 1) and a trailing <code>&amp;</code> to leave it in the background." },
                { it: "<code>unshare --pid --fork --mount-proc sh -c 'sleep 600' &amp;</code>", en: "<code>unshare --pid --fork --mount-proc sh -c 'sleep 600' &amp;</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `Fai partire <strong>in background</strong> un processo che dentro il suo
                     <strong>UTS namespace</strong> abbia hostname <code>contenitore</code>, mentre
                     l'host mantiene il suo. La verifica entra nel namespace del processo e controlla
                     che l'hostname là dentro sia <code>contenitore</code> — e che fuori NON lo sia.`,
                en: `Start <strong>in the background</strong> a process whose
                     <strong>UTS namespace</strong> has hostname <code>contenitore</code>, while the
                     host keeps its own. The check enters the process's namespace and verifies the
                     hostname in there is <code>contenitore</code> — and that outside it is NOT.`,
            },
            checks: [
                { id: "uts-namespace",
                  why: { it: "L'hostname è una risorsa di sistema condivisa: che un processo possa cambiarlo <em>solo per sé</em>, senza toccare l'host, è l'isolamento reso visibile in un colpo.",
                         en: "The hostname is a shared system resource: that a process can change it <em>only for itself</em>, without touching the host, is isolation made visible in one stroke." },
                  nudge: { it: "<code>unshare --uts sh -c 'hostname contenitore; sleep 600' &amp;</code> — imposta l'hostname DENTRO, poi dormi.",
                           en: "<code>unshare --uts sh -c 'hostname contenitore; sleep 600' &amp;</code> — set the hostname INSIDE, then sleep." } },
            ],
            hints: [
                { it: "Serve <code>unshare --uts</code>, e dentro il comando <code>hostname contenitore</code>.", en: "You need <code>unshare --uts</code>, and inside it <code>hostname contenitore</code>." },
                { it: "Metti tutto in un solo comando: <code>sh -c 'hostname contenitore; sleep 600'</code>, e lascialo in background.", en: "Put it all in one command: <code>sh -c 'hostname contenitore; sleep 600'</code>, and background it." },
                { it: "<code>unshare --uts sh -c 'hostname contenitore; sleep 600' &amp;</code>", en: "<code>unshare --uts sh -c 'hostname contenitore; sleep 600' &amp;</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Fai partire <strong>in background</strong> un processo in un
                     <strong>mount namespace</strong> suo, che monti una <code>tmpfs</code> su
                     <code>/mnt/box</code> e ci crei dentro un file <code>segreto</code>. Il file deve
                     esistere <strong>dentro</strong> il namespace del processo e <strong>non</strong>
                     sull'host. La verifica controlla entrambe le cose.`,
                en: `Start <strong>in the background</strong> a process in its own
                     <strong>mount namespace</strong>, mounting a <code>tmpfs</code> on
                     <code>/mnt/box</code> and creating a file <code>segreto</code> inside it. The
                     file must exist <strong>inside</strong> the process's namespace and
                     <strong>not</strong> on the host. The check verifies both.`,
            },
            checks: [
                { id: "mount-namespace",
                  why: { it: "Un montaggio in un mount namespace è invisibile all'host: è il seme del filesystem stratificato di un container, dove ogni istanza vede i suoi file senza sporcare gli altri.",
                         en: "A mount inside a mount namespace is invisible to the host: it is the seed of a container's layered filesystem, where each instance sees its own files without dirtying the others." },
                  nudge: { it: "<code>unshare --mount sh -c 'mkdir -p /mnt/box; mount -t tmpfs t /mnt/box; touch /mnt/box/segreto; sleep 600' &amp;</code>",
                           en: "<code>unshare --mount sh -c 'mkdir -p /mnt/box; mount -t tmpfs t /mnt/box; touch /mnt/box/segreto; sleep 600' &amp;</code>" } },
            ],
            hints: [
                { it: "Serve <code>unshare --mount</code>: dentro, il montaggio non esce.", en: "You need <code>unshare --mount</code>: inside, the mount does not leak out." },
                { it: "Dentro: <code>mount -t tmpfs t /mnt/box</code>, poi crea <code>/mnt/box/segreto</code>, poi <code>sleep</code>.", en: "Inside: <code>mount -t tmpfs t /mnt/box</code>, then create <code>/mnt/box/segreto</code>, then <code>sleep</code>." },
                { it: "<code>unshare --mount sh -c 'mkdir -p /mnt/box; mount -t tmpfs t /mnt/box; touch /mnt/box/segreto; sleep 600' &amp;</code>", en: "<code>unshare --mount sh -c 'mkdir -p /mnt/box; mount -t tmpfs t /mnt/box; touch /mnt/box/segreto; sleep 600' &amp;</code>" },
            ],
        },
    ],
};
