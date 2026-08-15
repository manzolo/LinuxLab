export default {
    id: "ch10", num: 10, runtime: "browser", requires: ["ch09"], draft: false,
    title: { it: "Trasformare: sed, awk, sort", en: "Transforming: sed, awk, sort" },
    oneLiner: {
        it: "Un file di testo è una tabella, se sai guardarlo.",
        en: "A text file is a table, once you know how to look at it.",
    },
    commands: ["sort -n", "sort -k", "uniq -c", "cut", "tr", "sed s///", "sed -i", "awk", "column"],
    glossary: ["campo", "separatore", "in place", "espressione"],

    blocks: [
        { kind: "hook", html: {
            it: `Il dominio del sito è cambiato. Compare in undici file di configurazione, in
                 punti diversi, e in nessun altro posto. Aprirli uno per uno è mezz'ora e almeno
                 un errore. <strong>Sostituirli tutti è una riga</strong> — e la parte difficile
                 non è scriverla: è essere sicuri di non aver toccato altro.`,
            en: `The site's domain changed. It appears in eleven configuration files, in different
                 places, and nowhere else. Opening them one by one is half an hour and at least
                 one mistake. <strong>Replacing them all is one line</strong> — and the hard part
                 is not writing it: it is being sure you touched nothing else.` } },

        { kind: "lead", html: {
            it: `Tre strumenti, tre mestieri. <code>sort</code> mette in ordine.
                 <code>sed</code> sostituisce. <code>awk</code> ragiona per <strong>colonne</strong>,
                 e sa fare i conti. Non serve impararli tutti: serve sapere quale chiamare.`,
            en: `Three tools, three trades. <code>sort</code> orders. <code>sed</code> substitutes.
                 <code>awk</code> thinks in <strong>columns</strong>, and can do arithmetic. You
                 do not need to master all three: you need to know which one to call.` } },

        { kind: "analogy", html: {
            it: `Immagina un foglio di calcolo senza il foglio di calcolo. Ogni riga è una riga,
                 ogni pezzo separato da spazi è una colonna. <code>awk</code> le chiama
                 <code>$1</code>, <code>$2</code>, <code>$3</code>… e <code>$0</code> è la riga
                 intera. Da qui in poi tutto quello che sapevi fare in Excel puoi farlo su un file
                 da 40 GB, senza aprirlo.`,
            en: `Picture a spreadsheet without the spreadsheet. Every line is a row, every
                 space-separated piece is a column. <code>awk</code> calls them <code>$1</code>,
                 <code>$2</code>, <code>$3</code>… and <code>$0</code> is the whole line. From here
                 on, everything you knew how to do in Excel you can do on a 40 GB file, without
                 opening it.` } },

        { kind: "shown", lines: [
            { cmd: "awk '{print $3, $1}' vendite.txt | head -2", out: "Rossi 2026-01-04\nBianchi 2026-01-05",
              note: { it: "Terza colonna e prima, in quest'ordine. Nessun bisogno di dire come è fatto il file: awk lo spezza sugli spazi da solo.",
                      en: "Third column and first, in that order. No need to describe the file: awk splits it on whitespace by itself." } },
            { cmd: "awk '{somma += $4} END {print somma}' vendite.txt", out: "18420",
              note: { it: "<code>END</code> è il blocco che gira una volta sola, alla fine. È il modo in cui awk fa i totali senza tenere in memoria il file.",
                      en: "<code>END</code> is the block that runs once, at the end. It is how awk totals things without holding the file in memory." } },
            { cmd: "sort -t: -k3 -n /etc/passwd | tail -2", out: "web:x:1001:1001::/home/web:/sbin/nologin\ndeploy:x:1002:1002::/home/deploy:/bin/bash",
              note: { it: "<code>-t:</code> il separatore è il due punti, <code>-k3</code> ordina per la terza colonna, <code>-n</code> come numeri e non come testo (senza, 10 verrebbe prima di 9).",
                      en: "<code>-t:</code> the separator is a colon, <code>-k3</code> sorts by the third column, <code>-n</code> numerically rather than as text (without it, 10 would come before 9)." } },
            { cmd: "sed 's/vecchio.it/nuovo.it/g' sito.conf", out: "server_name nuovo.it;\nredirect https://nuovo.it/;",
              note: { it: "<code>s/qui/con questo/g</code>: la <code>g</code> finale significa <em>tutte le occorrenze della riga</em>, non solo la prima. Senza <code>-i</code> stampa e basta: <strong>guarda sempre prima di scrivere</strong>.",
                      en: "<code>s/this/with this/g</code>: the trailing <code>g</code> means <em>every occurrence on the line</em>, not just the first. Without <code>-i</code> it only prints: <strong>always look before writing</strong>." } },
            { cmd: "sed -i.bak 's/vecchio.it/nuovo.it/g' *.conf", out: "",
              note: { it: "<code>-i</code> modifica i file sul posto. Il suffisso dopo <code>-i</code> ti lascia una copia di sicurezza: costa nulla e ti salva la giornata.",
                      en: "<code>-i</code> edits files in place. The suffix after <code>-i</code> leaves you a safety copy: it costs nothing and saves your day." } },
        ] },

        { kind: "lab" },

        { kind: "pro", html: {
            it: `<p>In <code>sed 's/a.b/x/'</code> quel punto <strong>non è un punto</strong>: è
                 «un carattere qualunque». Cercando <code>vecchio.it</code> stai cercando anche
                 <code>vecchioXit</code>. Nella maggior parte dei casi non fa danni, finché un
                 giorno ne fa: per il letterale si scrive <code>vecchio\\.it</code>.</p>
                 <p>Il delimitatore di <code>s</code> non deve essere <code>/</code>: qualunque
                 carattere va bene. Per i percorsi si usa quasi sempre <code>s|/var/www|/srv/web|</code>,
                 che risparmia una fila di barre protette e rende la riga leggibile.</p>
                 <p>Su <code>awk</code>, il modello vero è <code>condizione { azione }</code>:
                 <code>awk '$9 == 500'</code> stampa le righe dove la nona colonna è 500, senza
                 scrivere <code>print</code>. E <code>-F</code> cambia il separatore, ma attenzione:
                 il separatore <em>di default</em> non è «uno spazio», è «una sequenza qualunque di
                 spazi e tabulazioni», che è la ragione per cui awk funziona su output allineati a
                 mano dove <code>cut -d' '</code> fallisce miseramente.</p>`,
            en: `<p>In <code>sed 's/a.b/x/'</code> that dot is <strong>not a dot</strong>: it is
                 "any character". Searching for <code>old.com</code> you are also searching for
                 <code>oldXcom</code>. Most of the time it does no harm, until one day it does: for
                 the literal you write <code>old\\.com</code>.</p>
                 <p>The <code>s</code> delimiter need not be <code>/</code>: any character works.
                 For paths people almost always use <code>s|/var/www|/srv/web|</code>, which saves
                 a row of escaped slashes and keeps the line readable.</p>
                 <p>In <code>awk</code> the real model is <code>condition { action }</code>:
                 <code>awk '$9 == 500'</code> prints lines whose ninth column is 500, with no
                 <code>print</code> written. And <code>-F</code> changes the separator, but mind
                 this: the <em>default</em> separator is not "a space", it is "any run of spaces
                 and tabs", which is why awk works on hand-aligned output where
                 <code>cut -d' '</code> fails miserably.</p>` } },

        { kind: "pitfalls", items: [
            { it: "<strong><code>sed -i</code> senza aver guardato prima è il modo più veloce di rovinare undici file insieme.</strong> Esegui sempre lo stesso comando senza <code>-i</code>, leggi l'uscita, e solo dopo aggiungilo.",
              en: "<strong><code>sed -i</code> without looking first is the quickest way to ruin eleven files at once.</strong> Always run the same command without <code>-i</code>, read the output, and only then add it." },
            { it: "<strong><code>sort</code> senza <code>-n</code> ordina come testo</strong>: 10 viene prima di 9, e 100 prima di 20. Se sono numeri, dillo.",
              en: "<strong><code>sort</code> without <code>-n</code> sorts as text</strong>: 10 comes before 9, and 100 before 20. If they are numbers, say so." },
            { it: "<strong><code>cut -d' '</code> si rompe con gli spazi multipli</strong>, perché considera ogni spazio un separatore. Su output allineati usa <code>awk</code>, che li tratta come uno solo.",
              en: "<strong><code>cut -d' '</code> breaks on multiple spaces</strong>, because it treats every space as a separator. On aligned output use <code>awk</code>, which collapses them." },
        ] },

        { kind: "recap", table: [
            { cmd: "awk '{print $2}'", what: { it: "estrai una colonna", en: "extract a column" }, flag: { it: "<code>-F:</code> per cambiare separatore", en: "<code>-F:</code> to change the separator" } },
            { cmd: "awk '{s+=$3} END{print s}'", what: { it: "somma una colonna", en: "sum a column" }, flag: { it: "<code>END</code> gira una volta, alla fine", en: "<code>END</code> runs once, at the end" } },
            { cmd: "sort", what: { it: "ordina", en: "sort" }, flag: { it: "<code>-n</code> numerico, <code>-r</code> inverso, <code>-k2</code> per colonna", en: "<code>-n</code> numeric, <code>-r</code> reverse, <code>-k2</code> by column" } },
            { cmd: "uniq -c", what: { it: "conta i doppioni adiacenti", en: "count adjacent duplicates" }, flag: { it: "vuole <code>sort</code> prima. Sempre.", en: "needs <code>sort</code> first. Always." } },
            { cmd: "sed 's/a/b/g'", what: { it: "sostituisci", en: "substitute" }, flag: { it: "<code>-i.bak</code> sul posto, con copia di sicurezza", en: "<code>-i.bak</code> in place, with a safety copy" } },
        ] },
    ],

    exercises: [
        {
            id: "e1", tipo: "risposta",
            brief: {
                it: `<code>~/lab/vendite.csv</code> ha quattro colonne separate da virgola:
                     data, prodotto, cliente, importo. Qual è la <strong>somma della colonna
                     importo</strong>? Consegna il numero intero.`,
                en: `<code>~/lab/vendite.csv</code> has four comma-separated columns: date,
                     product, customer, amount. What is the <strong>sum of the amount
                     column</strong>? Hand in the whole number.`,
            },
            checks: [
                { id: "somma",
                  why: { it: "Sommare una colonna di un file di testo, senza aprirlo e senza importarlo da nessuna parte, è il momento in cui awk smette di sembrare un geroglifico.",
                         en: "Summing a column of a text file, without opening it and without importing it anywhere, is the moment awk stops looking like hieroglyphics." },
                  nudge: { it: "Il separatore è la virgola, quindi serve <code>-F,</code>. Prova prima <code>awk -F, '{print $4}' file | head</code> per vedere se stai prendendo la colonna giusta.",
                           en: "The separator is a comma, so you need <code>-F,</code>. Try <code>awk -F, '{print $4}' file | head</code> first to see whether you are taking the right column." } },
            ],
            hints: [
                { it: "Serve dire ad awk che il separatore è la virgola: <code>-F,</code>.", en: "You must tell awk the separator is a comma: <code>-F,</code>." },
                { it: "Si accumula in una variabile e si stampa nel blocco <code>END</code>.", en: "You accumulate into a variable and print in the <code>END</code> block." },
                { it: "<code>awk -F, '{s+=$4} END{print s}' ~/lab/vendite.csv | lab answer</code>", en: "<code>awk -F, '{s+=$4} END{print s}' ~/lab/vendite.csv | lab answer</code>" },
            ],
        },
        {
            id: "e2", tipo: "stato",
            brief: {
                it: `In <code>~/lab/conf</code> ci sono file <code>.conf</code> che contengono il
                     vecchio dominio. Sostituiscilo <strong>ovunque</strong> con quello nuovo,
                     modificando i file sul posto. Il vecchio e il nuovo dominio sono scritti in
                     <code>~/lab/conf/CAMBIO.txt</code>. <strong>I file che non sono
                     <code>.conf</code> non vanno toccati</strong>: la verifica confronta le loro
                     impronte.`,
                en: `In <code>~/lab/conf</code> there are <code>.conf</code> files containing the
                     old domain. Replace it <strong>everywhere</strong> with the new one, editing
                     the files in place. The old and new domains are written in
                     <code>~/lab/conf/CAMBIO.txt</code>. <strong>Files that are not
                     <code>.conf</code> must not be touched</strong>: the check compares their
                     fingerprints.`,
            },
            checks: [
                { id: "vecchio-sparito",
                  why: { it: "Una sostituzione lasciata a metà è peggio di non averla fatta: il sistema funziona in parte, e il pezzo rotto lo scopri in produzione.",
                         en: "A half-done substitution is worse than none: the system half works, and you discover the broken part in production." },
                  nudge: { it: "<code>grep -rl VECCHIO ~/lab/conf</code> ti elenca i file in cui è ancora presente.",
                           en: "<code>grep -rl OLD ~/lab/conf</code> lists the files where it is still present." } },
                { id: "nuovo-presente",
                  why: { it: "Cancellare non è sostituire: se la riga è sparita invece di cambiare, la configurazione è rotta in un modo più difficile da vedere.",
                         en: "Deleting is not replacing: if the line vanished instead of changing, the configuration is broken in a way that is harder to spot." },
                  nudge: { it: "<code>grep -c NUOVO ~/lab/conf/*.conf</code> deve trovarne almeno quante ce n'erano prima.",
                           en: "<code>grep -c NEW ~/lab/conf/*.conf</code> must find at least as many as there were before." } },
                { id: "altri-intatti",
                  why: { it: "È la ragione per cui si guarda prima di usare <code>-i</code>: un modello troppo largo prende anche i file che non c'entrano, e non te ne accorgi.",
                         en: "This is why you look before using <code>-i</code>: too broad a pattern also catches files that have nothing to do with it, and you do not notice." },
                  nudge: { it: "Se hai usato <code>sed -i … *</code> hai preso tutto. Il modello giusto è <code>*.conf</code>.",
                           en: "If you used <code>sed -i … *</code> you took everything. The right pattern is <code>*.conf</code>." } },
            ],
            hints: [
                { it: "Leggi prima <code>cat ~/lab/conf/CAMBIO.txt</code>: i due domini cambiano a ogni mondo.", en: "First read <code>cat ~/lab/conf/CAMBIO.txt</code>: the two domains change with every world." },
                { it: "<code>sed 's/vecchio/nuovo/g'</code>, e <code>-i</code> per scrivere sul posto. Applicalo solo ai <code>*.conf</code>.", en: "<code>sed 's/old/new/g'</code>, and <code>-i</code> to write in place. Apply it to <code>*.conf</code> only." },
                { it: "<code>cd ~/lab/conf &amp;&amp; sed -i \"s/$(sed -n 1p CAMBIO.txt)/$(sed -n 2p CAMBIO.txt)/g\" *.conf</code>", en: "<code>cd ~/lab/conf &amp;&amp; sed -i \"s/$(sed -n 1p CAMBIO.txt)/$(sed -n 2p CAMBIO.txt)/g\" *.conf</code>" },
            ],
        },
        {
            id: "e3", tipo: "stato",
            brief: {
                it: `Da <code>~/lab/app.log</code> costruisci <code>~/lab/report.txt</code>: una
                     riga per ogni <strong>codice HTTP</strong> (ultima colonna), nel formato
                     <code>codice conteggio</code> separati da uno spazio, <strong>ordinate per
                     conteggio decrescente</strong>.`,
                en: `From <code>~/lab/app.log</code> build <code>~/lab/report.txt</code>: one line
                     per <strong>HTTP code</strong> (last column), in the format
                     <code>code count</code> separated by a space, <strong>sorted by count
                     descending</strong>.`,
            },
            checks: [
                { id: "report",
                  why: { it: "È il riassunto che si allega a un ticket: non «il sito dà errori», ma «142 volte 500 e 31 volte 502». La differenza fra una segnalazione e una diagnosi.",
                         en: "This is the summary you attach to a ticket: not \"the site is erroring\", but \"142 times 500 and 31 times 502\". The difference between a report and a diagnosis." },
                  nudge: { it: "Costruiscila un pezzo alla volta e guarda l'uscita: <code>awk '{print $NF}' app.log | sort | uniq -c | sort -rn</code>. Manca solo mettere le due colonne nell'ordine richiesto.",
                           en: "Build it piece by piece and look at the output: <code>awk '{print $NF}' app.log | sort | uniq -c | sort -rn</code>. All that is missing is putting the two columns in the required order." } },
            ],
            hints: [
                { it: "<code>$NF</code> in awk significa «l'ultima colonna», qualunque sia il loro numero.", en: "<code>$NF</code> in awk means \"the last column\", however many there are." },
                { it: "<code>uniq -c</code> mette il conteggio <em>prima</em>: per invertire le due colonne serve un altro <code>awk '{print $2, $1}'</code>.", en: "<code>uniq -c</code> puts the count <em>first</em>: to swap the two columns you need another <code>awk '{print $2, $1}'</code>." },
                { it: "<code>awk '{print $NF}' ~/lab/app.log | sort | uniq -c | sort -rn | awk '{print $2, $1}' &gt; ~/lab/report.txt</code>", en: "<code>awk '{print $NF}' ~/lab/app.log | sort | uniq -c | sort -rn | awk '{print $2, $1}' &gt; ~/lab/report.txt</code>" },
            ],
        },
    ],
};
