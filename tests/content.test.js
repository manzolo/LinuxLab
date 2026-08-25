// Test strutturali dei contenuti. Puro node:test, zero dipendenze, secondi.
//
// Non provano che gli esercizi funzionino (quello è tests/labs.mjs, che avvia la
// macchina vera): provano che un capitolo sia BEN FORMATO. Servono a fare in modo
// che un capitolo mal scritto non arrivi mai in produzione, e soprattutto a non
// doverlo rileggere a mano ogni volta.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const { CAPITOLI, capitolo } = await import(path.join(ROOT, "content/index.js"));

const LINGUE = ["it", "en"];
const BLOCCHI_NOTI = ["hook", "lead", "analogy", "shown", "lab", "pro", "pitfalls",
                      "recap", "local", "transcript", "predict"];

/** Cammina un oggetto e restituisce ogni coppia {it,en} che incontra, col suo percorso. */
function coppieBilingui(o, dove = "", trovate = []) {
    if (o == null || typeof o !== "object") return trovate;
    if (Array.isArray(o)) { o.forEach((v, i) => coppieBilingui(v, `${dove}[${i}]`, trovate)); return trovate; }
    const chiavi = Object.keys(o);
    if (chiavi.some(k => LINGUE.includes(k)) && chiavi.every(k => LINGUE.includes(k))) {
        trovate.push({ dove, obj: o });
        return trovate;
    }
    for (const k of chiavi) coppieBilingui(o[k], dove ? `${dove}.${k}` : k, trovate);
    return trovate;
}

const capitoliCaricati = [];
for (const voce of CAPITOLI) {
    try { capitoliCaricati.push(await capitolo(voce.id)); }
    catch (e) { capitoliCaricati.push({ id: voce.id, __errore: e.message }); }
}

test("ogni capitolo dell'indice esiste e si carica", () => {
    const rotti = capitoliCaricati.filter(c => c.__errore);
    assert.deepEqual(rotti.map(c => `${c.id}: ${c.__errore}`), []);
});

for (const cap of capitoliCaricati.filter(c => !c.__errore)) {
    test(`${cap.id} — struttura`, () => {
        assert.ok(cap.title && cap.oneLiner, "servono title e oneLiner");
        assert.ok(Array.isArray(cap.blocks) && cap.blocks.length, "servono dei blocchi");
        assert.ok(["browser", "local", "hybrid"].includes(cap.runtime), `runtime sconosciuto: ${cap.runtime}`);
        for (const b of cap.blocks) {
            assert.ok(BLOCCHI_NOTI.includes(b.kind), `${cap.id}: blocco sconosciuto "${b.kind}"`);
        }
        // Un capitolo del browser senza il blocco lab non mostrerebbe il terminale.
        if (cap.runtime !== "local") {
            assert.ok(cap.blocks.some(b => b.kind === "lab"), `${cap.id}: manca il blocco lab`);
        }
    });

    test(`${cap.id} — bilingue completo`, () => {
        for (const { dove, obj } of coppieBilingui(cap)) {
            for (const l of LINGUE) {
                assert.ok(obj[l] && String(obj[l]).trim(), `${cap.id}.${dove}: manca "${l}"`);
            }
        }
    });

    test(`${cap.id} — prerequisiti esistenti e senza cicli`, () => {
        for (const r of cap.requires || []) {
            assert.ok(CAPITOLI.some(c => c.id === r), `${cap.id}: prerequisito inesistente "${r}"`);
            const suo = capitoliCaricati.find(c => c.id === r);
            assert.ok(!(suo?.requires || []).includes(cap.id), `${cap.id} e ${r} si richiedono a vicenda`);
            assert.ok(CAPITOLI.find(c => c.id === r).num < cap.num, `${cap.id}: il prerequisito ${r} viene dopo`);
        }
    });

    test(`${cap.id} — esercizi: file presenti e id coerenti`, () => {
        for (const es of cap.exercises || []) {
            const dir = path.join(ROOT, "content", cap.id, es.id);
            assert.ok(fs.existsSync(dir), `${cap.id}.${es.id}: cartella assente`);
            for (const f of ["seed.sh", "check.sh", "solution.sh"]) {
                assert.ok(fs.existsSync(path.join(dir, f)), `${cap.id}.${es.id}: manca ${f}`);
            }
            assert.ok(es.brief, `${cap.id}.${es.id}: manca la consegna`);
            assert.ok((es.checks || []).length, `${cap.id}.${es.id}: nessun check dichiarato`);
            assert.ok((es.hints || []).length >= 2, `${cap.id}.${es.id}: servono almeno due suggerimenti`);

            // Gli id dei check dichiarati nel chapter.js devono combaciare con quelli
            // emessi da check.sh: altrimenti il verdetto mostra un id senza spiegazione.
            const check = fs.readFileSync(path.join(dir, "check.sh"), "utf8");
            const emessi = new Set([...check.matchAll(/lab_(?:check|eq|answer_eq)\s+([A-Za-z0-9_-]+)/g)].map(m => m[1]));
            // Alcuni check.sh chiamano lab_check attraverso una funzione locale, passando
            // l'id come variabile: in quel caso il nome non e' letterale nella chiamata,
            // ma deve comunque comparire nel file. Si allarga la ricerca solo in quel caso.
            const indiretto = /lab_check\s+"?\$/.test(check);
            if (indiretto) {
                for (const m of check.matchAll(/\b([a-z0-9]+(?:-[a-z0-9]+)+)\b/g)) emessi.add(m[1]);
            }
            for (const c of es.checks) {
                assert.ok(emessi.has(c.id),
                    `${cap.id}.${es.id}: il check "${c.id}" è dichiarato ma check.sh non lo emette (emette: ${[...emessi].join(", ")})`);
                assert.ok(c.why && c.nudge, `${cap.id}.${es.id}.${c.id}: servono "why" e "nudge"`);
            }
            const dichiarati = new Set(es.checks.map(c => c.id));
            for (const e of indiretto ? [] : emessi) {
                assert.ok(dichiarati.has(e),
                    `${cap.id}.${es.id}: check.sh emette "${e}" ma il chapter.js non lo spiega`);
            }

            // Ogni check.sh deve chiudere con lab_done, o l'esito non viene mai calcolato.
            assert.match(check, /lab_done/, `${cap.id}.${es.id}: check.sh non chiama lab_done`);
        }
    });
}

// La promessa che questo test difende: **nessun esercizio chiede una cosa che il
// lab non ha ancora spiegato.** Puo' usarne una nuova — spesso deve — ma allora la
// dichiara in `attrezzi`, e chi studia se la trova scritta sotto la consegna,
// prima di provare e senza spendere un suggerimento.
test("nessun esercizio chiede quello che il lab non ha ancora spiegato", async () => {
    const { scoperti } = await import(path.join(ROOT, "tools/vocabolario.mjs"));
    const buchi = scoperti(capitoliCaricati.filter(c => !c.__errore));
    const righe = buchi.map(b =>
        `${b.cap.id}.${b.es.id}: ${b.mancanti.map(m => `${m.tok} (${m.dove})`).join(", ")}`);
    assert.deepEqual(righe, [],
        "va aggiunto un `attrezzi: [{cmd, cap, cosa:{it,en}}]` all'esercizio, oppure il comando va insegnato nel capitolo");
});

test("l'audit riconosce la grammatica della shell, non solo i nomi dei comandi", async () => {
    const { tokenDi } = await import(path.join(ROOT, "tools/vocabolario.mjs"));
    const casi = [
        ["cd dir && pwd", ["&&"]],
        ["false || echo errore", ["||"]],
        ["pwd; ls", [";"]],
        ['OGGI=$(date); echo "$OGGI"', ["VAR=", "$(", "$VAR", ";"]],
        ["sleep 1 & echo $!; wait $!", ["&", "$!", ";", "wait"]],
        ["comando; echo $?", [";", "$?"]],
    ];
    for (const [riga, attesi] of casi) {
        const visti = tokenDi(riga);
        for (const tok of attesi) assert.ok(visti.has(tok), `${riga}: non riconosce ${tok}`);
    }
    assert.ok(!tokenDi("false || true").has("|"), "|| non deve essere scambiato per una pipe");
    assert.ok(!tokenDi("cd x && pwd").has("&"), "&& non deve essere scambiato per background");
    assert.ok(!tokenDi("dd if=/dev/zero of=disco.img").has("VAR="),
        "gli argomenti nome=valore di un comando non sono assegnazioni della shell");
});

test("regressione: togliere un gradino di grammatica scopre chi lo usa", async () => {
    const { scoperti, tokenDi } = await import(path.join(ROOT, "tools/vocabolario.mjs"));
    const sani = capitoliCaricati.filter(c => !c.__errore);
    const casi = [
        ["ch02", "&&"], ["ch02", ";"],
        ["ch08", "VAR="], ["ch08", "$VAR"],
        ["ch11", "$!"], ["ch11", "wait"],
        ["ch16", "||"], ["ch16", "$?"],
    ];
    const contiene = (testo, tok) => tokenDi(testo || "").has(tok);
    for (const [capId, tok] of casi) {
        // Uno stesso costrutto può essere rimostrato più avanti. Per provare che il
        // controllo morde davvero lo si rimuove da tutte le superfici didattiche,
        // lasciandolo però nelle consegne e nei suggerimenti che lo richiedono.
        const rotti = sani.map(cap => ({
            ...cap,
            commands: (cap.commands || []).filter(c => !contiene(c, tok)),
            blocks: (cap.blocks || []).map(b => b.kind === "shown" ? {
                ...b, lines: (b.lines || []).filter(l => !contiene(l.cmd, tok)),
            } : b.kind === "recap" ? {
                ...b, table: (b.table || []).filter(r => !contiene(r.cmd, tok)),
            } : b),
        }));
        const buchi = scoperti(rotti).flatMap(b => b.mancanti.map(m => m.tok));
        assert.ok(buchi.includes(tok),
            `togliendo ${tok} da ${capId}, l'audit deve trovare almeno un consumatore scoperto`);
    }
});

test("nessun attrezzo dichiarato per cose gia' insegnate", async () => {
    const { attrezziInutili } = await import(path.join(ROOT, "tools/vocabolario.mjs"));
    const stantii = attrezziInutili(capitoliCaricati.filter(c => !c.__errore));
    assert.deepEqual(stantii.map(s => `${s.cap.id}.${s.es.id}: ${s.tok}`), [],
        "l'attrezzo è già a disposizione a questo punto del percorso: la dichiarazione va tolta");
});

// I comandi non bastano a descrivere una competenza. Questo controllo deduce dai
// file e dalle consegne chi deve saper scrivere file multilinea, poi verifica che
// una lezione precedente (o i blocchi prima degli esercizi dello stesso capitolo)
// l'abbia insegnata davvero. `richiede` da solo non può far passare il test.
test("nessun esercizio pretende una competenza non ancora insegnata", async () => {
    const { competenzeScoperte } = await import(path.join(ROOT, "tools/vocabolario.mjs"));
    const scoperte = competenzeScoperte(capitoliCaricati.filter(c => !c.__errore));
    const righe = scoperte.flatMap(s => s.mancanti.map(m =>
        `${s.cap.id}.${s.es.id}: ${m.competenza} (${m.dove})`));
    assert.deepEqual(righe, [],
        "la solution.sh o la consegna richiedono questa competenza: va insegnata e dichiarata con `competenze` nei blocchi precedenti o in un capitolo precedente");
});

test("regressione: togliere qualunque pezzo della lezione multilinea scopre i consumatori", async () => {
    const { competenzeScoperte } = await import(path.join(ROOT, "tools/vocabolario.mjs"));
    const sani = capitoliCaricati.filter(c => !c.__errore);
    const attesi = ["ch08.e4", "ch08.e5", "ch14.e3", "ch16.e1", "ch16.e2",
                    "ch16.e3", "ch17.e1", "ch17.e3", "ch22.e1"];
    const mutazioni = [
        cap => ({ ...cap, competenze: [] }),
        cap => ({ ...cap, blocks: cap.blocks.map(b => b.kind !== "shown" ? b :
            { ...b, lines: b.lines.filter(l => !/^vi\s/.test((l.cmd || "").trim())) }) }),
        cap => ({ ...cap, blocks: cap.blocks.map(b => b.kind !== "shown" ? b :
            { ...b, lines: b.lines.filter(l => !(l.cmd || "").includes("<<")) }) }),
    ];
    for (const muta of mutazioni) {
        const rotti = sani.map(cap => cap.id === "ch08" ? muta(cap) : cap);
        const visti = competenzeScoperte(rotti).map(s => `${s.cap.id}.${s.es.id}`);
        assert.deepEqual(visti, attesi,
            "l'audit deve mordere se manca il campo, vi oppure l'heredoc della lezione");
    }
});

test("le competenze dedotte dai file sono dichiarate negli esercizi", async () => {
    const { dichiarazioniCompetenzeMancanti } = await import(path.join(ROOT, "tools/vocabolario.mjs"));
    const mancanti = dichiarazioniCompetenzeMancanti(capitoliCaricati.filter(c => !c.__errore));
    assert.deepEqual(mancanti.map(m =>
        `${m.cap.id}.${m.es.id}: ${m.competenza} (${m.dove})`), [],
        "aggiungere `richiede: [\"competenza\"]`; il requisito è stato dedotto dai file, non dal campo manuale");
});

test("nessuna competenza dichiarata senza riscontro nei file", async () => {
    const { dichiarazioniCompetenzeStantie } = await import(path.join(ROOT, "tools/vocabolario.mjs"));
    const stantie = dichiarazioniCompetenzeStantie(capitoliCaricati.filter(c => !c.__errore));
    assert.deepEqual(stantie.map(s => `${s.cap.id}.${s.es.id}: ${s.competenza}`), [],
        "il campo `richiede` non è giustificato da solution.sh o consegna: va tolto, oppure va estesa la deduzione");
});

// Elencare non è mostrare. Un comando può stare in `commands` e nel riepilogo senza
// comparire mai in un blocco `shown`: finché nessun esercizio lo chiede va bene (il
// riepilogo cita anche i cugini, `apt` e `dnf`). Se invece un esercizio lo pretende,
// chi studia deve inventarsi come si fa — ed è il caso da cui è nata questa regola:
// il capitolo 1 chiedeva di scoprire un comando DAL MANUALE senza aver mai fatto
// vedere che faccia ha un manuale.
test("nessun esercizio pretende un comando mai fatto vedere in azione", async () => {
    const { dichiaratiMaMaiMostrati } = await import(path.join(ROOT, "tools/vocabolario.mjs"));
    const solo = dichiaratiMaMaiMostrati(capitoliCaricati.filter(c => !c.__errore));
    assert.deepEqual(solo.map(s => `${s.cap.id}.${s.es.id}: ${s.mai.join(", ")}`), [],
        "serve una riga nel blocco `shown` che faccia vedere il comando in azione");
});

test("gli attrezzi rimandano a un capitolo che esiste e viene dopo", () => {
    for (const cap of capitoliCaricati.filter(c => !c.__errore)) {
        for (const es of cap.exercises || []) {
            for (const a of es.attrezzi || []) {
                assert.ok(a.cmd && a.cosa, `${cap.id}.${es.id}: un attrezzo senza "cmd" o "cosa"`);
                if (a.cap == null) continue;
                assert.ok(CAPITOLI.some(c => c.num === a.cap),
                    `${cap.id}.${es.id}: l'attrezzo ${a.cmd} rimanda al capitolo ${a.cap}, che non esiste`);
                assert.ok(a.cap > cap.num,
                    `${cap.id}.${es.id}: l'attrezzo ${a.cmd} rimanda al capitolo ${a.cap}, che non viene dopo questo`);
            }
        }
    }
});

test("i trascritti dichiarati sono stati generati", () => {
    for (const cap of capitoliCaricati.filter(c => !c.__errore)) {
        for (const b of cap.blocks.filter(b => b.kind === "transcript" && b.src)) {
            const f = path.join(ROOT, "content", cap.id, b.src);
            assert.ok(fs.existsSync(f),
                `${cap.id}: manca ${b.src} — esegui  node tools/gen-transcript.mjs ${cap.id}`);
            const d = JSON.parse(fs.readFileSync(f, "utf8"));
            assert.ok(d.steps?.length, `${cap.id}: ${b.src} è vuoto`);
        }
    }
});

test("le stringhe della chrome esistono in entrambe le lingue", async () => {
    const it = (await import(path.join(ROOT, "js/strings/it.js"))).default;
    const en = (await import(path.join(ROOT, "js/strings/en.js"))).default;
    const soloIt = Object.keys(it).filter(k => !(k in en));
    const soloEn = Object.keys(en).filter(k => !(k in it));
    assert.deepEqual(soloIt, [], "chiavi presenti solo in italiano");
    assert.deepEqual(soloEn, [], "chiavi presenti solo in inglese");
});
