#!/usr/bin/env node
// Referto: quali esercizi chiedono qualcosa che il lab non ha ancora spiegato.
//
//   node tools/prerequisiti.mjs
//
// Lo stesso controllo gira dentro `npm test` e fa fallire la build: questo serve
// a leggerlo tutto insieme mentre si scrive un capitolo.

import path from "node:path";
import url from "node:url";
import { scoperti, attrezziInutili, lessico, dichiaratiMaMaiMostrati } from "./vocabolario.mjs";

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const { CAPITOLI, capitolo } = await import(path.join(ROOT, "content/index.js"));
const capitoli = [];
for (const v of CAPITOLI) capitoli.push(await capitolo(v.id));

const buchi = scoperti(capitoli);
const stantii = attrezziInutili(capitoli);

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

// Avviso, non errore: elencare un comando nel riepilogo non è averlo fatto vedere.
const solo = dichiaratiMaMaiMostrati(capitoli);
if (solo.length) {
    console.log("Chiesto da un esercizio, ma mai fatto vedere in un blocco `shown`:\n");
    for (const s of solo) console.log(`  ${s.cap.id}.${s.es.id}: ${s.mai.join(", ")}`);
    console.log("\n  (avviso, non errore: il comando è elencato, ma chi studia non l'ha mai visto in azione)\n");
}

const nAttrezzi = capitoli.flatMap(c => c.exercises || []).flatMap(e => e.attrezzi || []).length;
console.log(`${capitoli.length} capitoli · ${lessico(capitoli).size} voci di lessico · ` +
            `${nAttrezzi} attrezzi in prestito · ${buchi.length} buchi · ${stantii.length} dichiarazioni stantie`);
process.exit(buchi.length || stantii.length ? 1 : 0);
