// vocabolario.mjs — chi ha insegnato cosa, e quando.
//
// Serve a tenere una promessa: **un esercizio non può chiedere una cosa che il lab
// non ha ancora spiegato.** Non "non può usare comandi nuovi" — quello renderebbe
// il primo capitolo inutile — ma: se ne usa uno, deve prestarlo esplicitamente,
// con una riga che dice cosa fa e in che capitolo lo studierà davvero.
// Quella riga è il campo `attrezzi` dell'esercizio, e si vede PRIMA di provare.
//
// (Nato il 2026-08-16, da una segnalazione di Andrea sull'esercizio 1.2: chiedeva
// di scrivere un file con `>` senza che `>` comparisse da nessuna parte.)

const OPERATORI = [
    { tok: ">>", re: />>/ },
    { tok: "2>", re: /2>/ },
    { tok: ">", re: /(^|[^0-9>&])>($|[^>])/ },
    { tok: "<", re: /(^|[^<])<($|[^<])/ },
    { tok: "|", re: /(^|[^|])\|($|[^|])/ },
    { tok: "$(", re: /\$\(/ },
    { tok: "&", re: /(^|\s)&(\s|$)/ },
];

// Comandi che compaiono nei testi ma che nessun capitolo mette nel proprio
// vocabolario: senza questo elenco passerebbero inosservati.
const EXTRA = ["touch", "sleep", "tar", "dd", "truncate", "modprobe", "addgroup",
               "seq", "basename", "dirname", "xargs", "tee", "nohup", "setsid"];

// Sintassi della shell e comandi del lab: disponibili da sempre, non si "insegnano".
const SEMPRE = ["lab", "cd", "ls", "pwd", "echo", "cat", "sh", "bash", "exit",
                "true", "false", "test", "printf", "sudo", "su", "man", "type", "help"];

const decodifica = s => String(s)
    .replace(/<[^>]+>/g, "")
    .replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&").replace(/&quot;/g, '"');

/** I `<code>…</code>` di un testo bilingue, decodificati. Si guarda l'italiano:
 *  le due lingue portano gli stessi comandi, e il test bilingue lo garantisce già. */
const spanCodice = o => {
    const s = typeof o === "string" ? o : (o?.it || "");
    return [...s.matchAll(/<code>([\s\S]*?)<\/code>/g)].map(m => decodifica(m[1]));
};

/** I token di comando e gli operatori contenuti in una riga di shell. */
export function tokenDi(riga) {
    const fuori = new Set();
    const s = decodifica(riga).trim();
    for (const { tok, re } of OPERATORI) if (re.test(s)) fuori.add(tok);
    if (OPERATORI.some(o => o.tok === s)) fuori.add(s);
    // Oltre ai separatori veri della shell si spezza anche su " / ", che nei
    // riepiloghi e negli attrezzi vuol dire "questo oppure quello".
    for (const seg of s.split(/\|\||&&|\||;|\$\(|\s\/\s/)) {
        let w = seg.trim().split(/\s+/)[0] || "";
        w = w.replace(/^\.\//, "").replace(/^['"]/, "");
        if (/^[a-z][a-z0-9._-]*$/i.test(w)) fuori.add(w);
    }
    return fuori;
}

/** Cosa un capitolo mette a disposizione: quello che dichiara, quello che mostra,
 *  quello che riepiloga — e gli attrezzi che i suoi esercizi prendono in prestito. */
export function insegnatiDa(cap) {
    const v = new Set();
    for (const x of cap.commands || []) for (const t of tokenDi(x)) v.add(t);
    for (const b of cap.blocks || []) {
        if (b.kind === "shown") for (const l of b.lines || []) for (const t of tokenDi(l.cmd || "")) v.add(t);
        if (b.kind === "recap") for (const r of b.table || []) for (const t of tokenDi(r.cmd || "")) v.add(t);
    }
    for (const es of cap.exercises || []) {
        for (const a of es.attrezzi || []) for (const t of tokenDi(a.cmd)) v.add(t);
    }
    return v;
}

/** Il lessico: cos'è un comando, in questo lab. Tutto il resto (nomi di file,
 *  argomenti, parole in maiuscolo) non conta come qualcosa da insegnare. */
export function lessico(capitoli) {
    const l = new Set([...SEMPRE, ...EXTRA, ...OPERATORI.map(o => o.tok)]);
    for (const c of capitoli) for (const t of insegnatiDa(c)) l.add(t);
    return l;
}

/** Cosa chiede un esercizio a chi lo legge: la consegna e i suggerimenti.
 *  NON la solution.sh — lì dentro c'è anche l'impalcatura (`mkdir -p "$LAB"`,
 *  attese, ripuliture) che non è materia da insegnare. */
export function richiestiDa(es) {
    const fuori = new Map();
    const raccogli = (o, dove) => {
        for (const span of spanCodice(o)) for (const t of tokenDi(span)) if (!fuori.has(t)) fuori.set(t, dove);
    };
    raccogli(es.brief, "consegna");
    (es.hints || []).forEach((h, i) => raccogli(h, `suggerimento ${i + 1}`));
    return fuori;
}

/** Il vocabolario disponibile a chi arriva al capitolo n-esimo, capitolo incluso.
 *  Restituisce un array parallelo a `capitoli`. */
export function vocabolarioCumulativo(capitoli) {
    const acc = new Set(SEMPRE);
    return capitoli.map(c => { for (const t of insegnatiDa(c)) acc.add(t); return new Set(acc); });
}

/** Il referto: per ogni esercizio, i token richiesti che nessuno ha ancora spiegato. */
export function scoperti(capitoli) {
    const L = lessico(capitoli);
    const cum = vocabolarioCumulativo(capitoli);
    const fuori = [];
    capitoli.forEach((cap, i) => {
        for (const es of cap.exercises || []) {
            const mancanti = [...richiestiDa(es)]
                .filter(([t]) => L.has(t) && !cum[i].has(t))
                .map(([t, dove]) => ({ tok: t, dove }));
            if (mancanti.length) fuori.push({ cap, es, mancanti });
        }
    });
    return fuori;
}

/** Il contrario: un attrezzo dichiarato per una cosa che il capitolo insegna già
 *  è una dichiarazione stantia, e va tolta prima che diventi rumore. */
export function attrezziInutili(capitoli) {
    const fuori = [];
    const prima = new Set(SEMPRE);
    for (const cap of capitoli) {
        const propri = new Set(insegnatiDa({ ...cap, exercises: [] }));
        for (const es of cap.exercises || []) {
            for (const a of es.attrezzi || []) {
                for (const t of tokenDi(a.cmd)) {
                    if (prima.has(t) || propri.has(t)) fuori.push({ cap, es, tok: t });
                }
            }
        }
        for (const t of insegnatiDa(cap)) prima.add(t);
    }
    return fuori;
}
