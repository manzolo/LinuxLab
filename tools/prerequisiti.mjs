#!/usr/bin/env node
// Referto: quali esercizi chiedono qualcosa che il lab non ha ancora spiegato.
//
//   node tools/prerequisiti.mjs
//
// Lo stesso controllo gira dentro `npm test` e fa fallire la build: questo serve
// a leggerlo tutto insieme mentre si scrive un capitolo.

import path from "node:path";
import url from "node:url";
import {
    scoperti, attrezziInutili, lessico, dichiaratiMaMaiMostrati,
    competenzeScoperte, dichiarazioniCompetenzeMancanti, dichiarazioniCompetenzeStantie,
} from "./vocabolario.mjs";

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const { CAPITOLI, capitolo } = await import(path.join(ROOT, "content/index.js"));
const capitoli = [];
for (const v of CAPITOLI) capitoli.push(await capitolo(v.id));

const buchi = scoperti(capitoli);
const stantii = attrezziInutili(capitoli);
const competenzeMancanti = competenzeScoperte(capitoli);
const dichiarazioniMancanti = dichiarazioniCompetenzeMancanti(capitoli);
const competenzeStantie = dichiarazioniCompetenzeStantie(capitoli);

if (buchi.length) {
    console.log("Chiesto ma mai spiegato:\n");
    for (const { cap, es, mancanti } of buchi) {
        console.log(`  ${cap.id}.${es.id}`);
        for (const m of mancanti) {
            const dove = capitoli.find(c => (c.commands || []).some(x => x.split(/\s+/)[0] === m.tok));
            console.log(`     ${m.tok.padEnd(10)} (${m.dove})${dove ? `  — è materia del capitolo ${String(dove.num).padStart(2, "0")}` : ""}`);
        }
    }
    console.log();
}
if (stantii.length) {
    console.log("Attrezzi dichiarati ma già insegnati (da togliere):\n");
    for (const s of stantii) console.log(`  ${s.cap.id}.${s.es.id}: ${s.tok}`);
    console.log();
}
if (competenzeMancanti.length) {
    console.log("Competenze pretese ma non ancora insegnate:\n");
    for (const { cap, es, mancanti } of competenzeMancanti) {
        for (const m of mancanti) {
            console.log(`  ${cap.id}.${es.id}: ${m.competenza} (${m.dove})`);
            console.log(`     rimedio: insegnarla e dichiararla con competenze: ["${m.competenza}"] nei blocchi precedenti o in un capitolo precedente`);
        }
    }
    console.log();
}
if (dichiarazioniMancanti.length) {
    console.log("Competenze dedotte dai file ma assenti da `richiede`:\n");
    for (const m of dichiarazioniMancanti) {
        console.log(`  ${m.cap.id}.${m.es.id}: ${m.competenza} (${m.dove})`);
    }
    console.log("\n  rimedio: dichiarare la competenza nell'esercizio; la deduzione resta la fonte del controllo\n");
}
if (competenzeStantie.length) {
    console.log("Competenze dichiarate in `richiede` ma non dedotte dai file (da togliere):\n");
    for (const s of competenzeStantie) console.log(`  ${s.cap.id}.${s.es.id}: ${s.competenza}`);
    console.log();
}

// Avviso, non errore: elencare un comando nel riepilogo non è averlo fatto vedere.
const solo = dichiaratiMaMaiMostrati(capitoli);
if (solo.length) {
    console.log("Chiesto da un esercizio, ma mai fatto vedere in un blocco `shown`:\n");
    for (const s of solo) console.log(`  ${s.cap.id}.${s.es.id}: ${s.mai.join(", ")}`);
    console.log("\n  (avviso, non errore: il comando è elencato, ma chi studia non l'ha mai visto in azione)\n");
}

const nAttrezzi = capitoli.flatMap(c => c.exercises || []).flatMap(e => e.attrezzi || []).length;
console.log(`${capitoli.length} capitoli · ${lessico(capitoli).size} voci di lessico · ` +
            `${nAttrezzi} attrezzi in prestito · ${buchi.length} buchi · ${stantii.length + competenzeStantie.length} dichiarazioni stantie · ` +
            `${competenzeMancanti.length} competenze scoperte · ${dichiarazioniMancanti.length} dichiarazioni di competenza mancanti`);
process.exit(buchi.length || stantii.length || competenzeStantie.length || competenzeMancanti.length || dichiarazioniMancanti.length ? 1 : 0);
