export default {
    id: "ch02", num: 2, runtime: "browser", requires: ["ch01"], draft: false,
    title: { it: "Muoversi", en: "Getting around" },
    oneLiner: {
        it: "Ogni processo sta in una cartella, e ogni percorso è assoluto o relativo a quella.",
        en: "Every process sits in a directory, and every path is absolute or relative to it.",
    },
    commands: ["pwd", "cd", "ls", "ls -l", "ls -a", "ls -lh", "ls -t"],
    glossary: ["percorso", "assoluto", "relativo", "radice", "home", "nascosto"],

    blocks: [
        { kind: "hook", html: {
            it: `Un collega ti dice «il file è in <code>config/</code>». Tu scrivi
                 <code>cd config</code> e ottieni <em>No such file or directory</em>.
                 Non ha mentito: <strong>siete in due posti diversi</strong>, e nessuno dei due
                 lo aveva detto.`,
            en: `A colleague tells you "the file is in <code>config/</code>". You type
                 <code>cd config</code> and get <em>No such file or directory</em>.
                 They did not lie: <strong>you are in two different places</strong>, and neither
                 of you said so.` } },

        { kind: "lead", html: {
            it: `La shell è sempre <em>dentro</em> una cartella, e quasi tutto quello che scrivi
                 viene interpretato a partire da lì. Capito questo, metà dei messaggi di errore
                 smettono di essere misteriosi.`,
            en: `The shell is always <em>inside</em> a directory, and almost everything you type is
                 interpreted starting from there. Once you get this, half the error messages stop
                 being mysterious.` } },

        { kind: "analogy", html: {
            it: `Un indirizzo può essere <strong>assoluto</strong> — «via Roma 5, Firenze»,
                 funziona ovunque tu sia — oppure <strong>relativo</strong> — «la seconda porta a
                 destra», che funziona solo se sappiamo da dove parti. Sulla shell è identico:
                 i percorsi che cominciano con <code>/</code> sono assoluti, tutti gli altri
                 partono da dove ti trovi adesso.`,
            en: `An address can be <strong>absolute</strong> — "5 Rome Street, Florence", it works
                 wherever you are — or <strong>relative</strong> — "second door on the right",
                 which only works if we know where you start from. On the shell it is identical:
                 paths starting with <code>/</code> are absolute, all the others start from where
                 you are right now.` } },

        { kind: "shown", lines: [
            { cmd: "pwd", out: "/root/lab",
              note: { it: "<em>print working directory</em>: dove sei adesso. È la prima cosa da chiedersi quando un comando «non trova» qualcosa.",
                      en: "<em>print working directory</em>: where you are now. It is the first thing to ask when a command \"cannot find\" something." } },
            { cmd: "ls -l", out: "drwxr-xr-x 2 root root 4096 Mar  4 10:12 progetti\n-rw-r--r-- 1 root root  318 Mar  4 10:12 note.txt",
              note: { it: "La prima lettera dice il tipo: <code>d</code> è una cartella, <code>-</code> un file normale. Il resto lo vediamo al capitolo 6.",
                      en: "The first letter is the type: <code>d</code> is a directory, <code>-</code> a regular file. The rest comes in chapter 6." } },
            { cmd: "ls -a", out: ".  ..  .config  note.txt  progetti",
              note: { it: "I file che cominciano con un punto sono <strong>nascosti</strong>: non è sicurezza, è solo una convenzione per non intasare la vista. <code>-a</code> li mostra.",
                      en: "Files starting with a dot are <strong>hidden</strong>: it is not security, just a convention to avoid clutter. <code>-a</code> shows them." } },
            { cmd: "cd progetti && pwd", out: "/root/lab/progetti",
              note: { it: "Percorso relativo: <code>progetti</code> viene cercato dentro la cartella corrente.",
                      en: "Relative path: <code>progetti</code> is looked up inside the current directory." } },
            { cmd: "cd .. && pwd", out: "/root/lab",
              note: { it: "<code>..</code> è la cartella superiore, <code>.</code> è quella corrente. Esistono in ogni cartella del sistema.",
                      en: "<code>..</code> is the parent directory, <code>.</code> is the current one. They exist in every directory on the system." } },
            { cmd: "cd -", out: "/root/lab/progetti",
              note: { it: "Il trattino da solo significa «torna dov'ero prima». Si usa più di quanto sembri.",
                      en: "A lone dash means \"go back where I was\". You will use it more than you expect." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>La directory corrente non è una variabile della shell: è uno
                 <strong>stato del processo</strong>, tenuto dal kernel. Lo puoi leggere da fuori:
                 <code>ls -l /proc/$$/cwd</code> è un link simbolico che punta esattamente lì
                 (<code>$$</code> è il PID della tua shell).</p>
                 <p>Da qui segue una cosa che sembra magia e non lo è: se cancelli la cartella in
                 cui ti trovi, la shell <em>resta</em> lì. <code>pwd</code> continua a rispondere,
                 ma nessun percorso relativo funziona più, perché quella directory non ha più un
                 nome nell'albero. Su Linux una directory esiste finché qualcuno la tiene aperta —
                 e tu la stai tenendo aperta. Basta <code>cd</code> per uscirne.</p>
                 <p>E <code>~</code> non lo espande <code>cd</code>: lo espande la <em>shell</em>,
                 prima ancora di eseguire il comando. Per questo <code>echo ~</code> stampa il
                 percorso della home, e per questo dentro le virgolette non funziona.</p>`,
            en: `<p>The current directory is not a shell variable: it is <strong>process
                 state</strong>, held by the kernel. You can read it from outside:
                 <code>ls -l /proc/$$/cwd</code> is a symlink pointing exactly there
                 (<code>$$</code> is your shell's PID).</p>
                 <p>From which follows something that looks like magic and is not: if you delete
                 the directory you are standing in, the shell <em>stays</em> there.
                 <code>pwd</code> keeps answering, but no relative path works any more, because
                 that directory no longer has a name in the tree. On Linux a directory exists as
                 long as someone holds it open — and you are holding it open. A <code>cd</code>
                 is enough to get out.</p>
                 <p>And <code>~</code> is not expanded by <code>cd</code>: it is expanded by the
                 <em>shell</em>, before the command even runs. That is why <code>echo ~</code>
                 prints the home path, and why it does not work inside quotes.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong>«No such file or directory» quasi sempre vuol dire che sei nel posto sbagliato</strong>, non che il file non esista. Il primo comando da battere è <code>pwd</code>.",
              en: "<strong>\"No such file or directory\" almost always means you are in the wrong place</strong>, not that the file does not exist. The first command to type is <code>pwd</code>." },
            { it: "<strong><code>cd</code> da solo</strong> non dà errore: ti riporta nella tua home. Comodo, ma spiazzante se non te lo aspetti.",
              en: "<strong><code>cd</code> on its own</strong> gives no error: it takes you home. Handy, but disorienting if you do not expect it." },
            { it: "<strong>Gli spazi nei nomi vanno protetti.</strong> <code>cd Documenti Vecchi</code> sono due argomenti; serve <code>cd \"Documenti Vecchi\"</code>.",
              en: "<strong>Spaces in names must be protected.</strong> <code>cd Old Documents</code> is two arguments; you need <code>cd \"Old Documents\"</code>." },
        ] },

        { kind: "recap", table: [
            { cmd: "pwd", what: { it: "dove sono", en: "where am I" }, flag: { it: "—", en: "—" } },
            { cmd: "cd", what: { it: "spostati", en: "move" }, flag: { it: "<code>cd -</code> torna dov'eri", en: "<code>cd -</code> go back" } },
            { cmd: "ls", what: { it: "cosa c'è qui", en: "what is here" }, flag: { it: "<code>-lah</code>: dettagli + nascosti + misure leggibili", en: "<code>-lah</code>: details + hidden + human sizes" } },
            { cmd: "ls -t", what: { it: "ordina per data", en: "sort by date" }, flag: { it: "il più recente per primo — utilissimo nei log", en: "newest first — invaluable in logs" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "stato",
            brief: {
                it: `Da qualche parte sotto la tua cartella c'è una directory nascosta, in fondo a
                     un percorso che <strong>solo tu puoi scoprire guardando</strong>. Trovala e
                     lasciaci dentro un file vuoto chiamato <code>sono-qui</code>.
                     <em>Il nome della cartella lo genera il mondo: navigare è obbligatorio.</em>`,
                en: `Somewhere under your folder there is a hidden directory, at the end of a path
                     that <strong>only you can discover by looking</strong>. Find it and leave an
                     empty file called <code>sono-qui</code> inside it.
                     <em>The folder name is generated by the world: navigating is mandatory.</em>`,
            },
            checks: [
                { id: "file-nel-posto-giusto",
                  why: { it: "Per arrivarci hai dovuto guardare, non indovinare. È esattamente quello che si fa su una macchina che non conosci.",
                         en: "To get there you had to look, not guess. That is exactly what you do on a machine you do not know." },
                  nudge: { it: "<code>ls -a</code> mostra anche le cartelle nascoste. Scendi un livello alla volta, e usa <kbd>Tab</kbd> per completare i nomi.",
                           en: "<code>ls -a</code> also shows hidden folders. Go down one level at a time, and use <kbd>Tab</kbd> to complete names." } },
            ],
            hints: [
                { it: "Comincia da <code>ls -a</code>: c'è qualcosa che comincia con un punto.", en: "Start with <code>ls -a</code>: something begins with a dot." },
                { it: "Dentro c'è un'altra cartella, e dentro ancora un'altra. Scendi con <code>cd</code> e guarda con <code>ls -a</code> a ogni passo.", en: "Inside there is another folder, and another inside that. Go down with <code>cd</code> and look with <code>ls -a</code> at each step." },
                { it: "Quando <code>pwd</code> ti mostra il fondo del percorso, basta <code>touch sono-qui</code>.", en: "When <code>pwd</code> shows you the bottom of the path, just <code>touch sono-qui</code>." },
            ],
        },
        {
            id: "e2", tipo: "risposta",
            brief: {
                it: `Quanti file <strong>nascosti</strong> ci sono direttamente dentro
                     <code>~/lab/scarico</code>? Conta solo quelli, non le sottocartelle e non i
                     file normali. Consegna il numero con <code>lab answer</code>.`,
                en: `How many <strong>hidden</strong> files are there directly inside
                     <code>~/lab/scarico</code>? Count only those, not subfolders and not regular
                     files. Hand in the number with <code>lab answer</code>.`,
            },
            checks: [
                { id: "conteggio",
                  why: { it: "I file nascosti sono dove vivono le configurazioni. Saperli vedere è la differenza fra «la cartella è vuota» e «la cartella sembra vuota».",
                         en: "Hidden files are where configuration lives. Being able to see them is the difference between \"the folder is empty\" and \"the folder looks empty\"." },
                  nudge: { it: "<code>ls -a</code> include anche <code>.</code> e <code>..</code>, che non sono file tuoi. Prova <code>ls -A</code>, che li esclude, e poi conta con <code>wc -l</code>.",
                           en: "<code>ls -a</code> also includes <code>.</code> and <code>..</code>, which are not your files. Try <code>ls -A</code>, which leaves them out, then count with <code>wc -l</code>." } },
            ],
            hints: [
                { it: "<code>ls -A ~/lab/scarico</code> elenca i nascosti senza <code>.</code> e <code>..</code>.", en: "<code>ls -A ~/lab/scarico</code> lists hidden entries without <code>.</code> and <code>..</code>." },
                { it: "Per contare le righe si usa <code>wc -l</code>. E servono solo i <em>file</em>, non le cartelle.", en: "To count lines use <code>wc -l</code>. And you only need <em>files</em>, not directories." },
                { it: "<code>ls -A ~/lab/scarico | grep '^\\.' | wc -l</code> — oppure guardali con <code>ls -lA</code> e conta a occhio quelli che iniziano con <code>-</code>.", en: "<code>ls -A ~/lab/scarico | grep '^\\.' | wc -l</code> — or look at them with <code>ls -lA</code> and count by eye the ones starting with <code>-</code>." },
            ],
        },
        {
            id: "e3", tipo: "risposta",
            brief: {
                it: `In <code>~/lab/scarico</code> qual è il nome del file <strong>modificato più di
                     recente</strong>? Consegna solo il nome, senza percorso.`,
                en: `In <code>~/lab/scarico</code>, what is the name of the <strong>most recently
                     modified</strong> file? Hand in the name only, without the path.`,
            },
            checks: [
                { id: "piu-recente",
                  why: { it: "«Cos'è cambiato per ultimo?» è la domanda che si fa ogni volta che qualcosa si rompe. Qui la impari su una cartella; poi la userai su <code>/var/log</code>.",
                         en: "\"What changed last?\" is the question you ask every time something breaks. Here you learn it on a folder; later you use it on <code>/var/log</code>." },
                  nudge: { it: "<code>ls -lt</code> ordina per data di modifica, dal più recente. Il primo della lista è quello che cerchi.",
                           en: "<code>ls -lt</code> sorts by modification time, newest first. The first in the list is the one you want." } },
            ],
            hints: [
                { it: "<code>ls</code> ha un'opzione per ordinare per data: cercala con <code>ls --help</code>.", en: "<code>ls</code> has an option to sort by time: look for it with <code>ls --help</code>." },
                { it: "È <code>-t</code>. Con <code>-l</code> vedi anche le date, così controlli.", en: "It is <code>-t</code>. With <code>-l</code> you also see the dates, so you can check." },
                { it: "<code>ls -t ~/lab/scarico | head -1 | lab answer</code>", en: "<code>ls -t ~/lab/scarico | head -1 | lab answer</code>" },
            ],
        },
    ],
};
