#!/usr/bin/env node
// Regressione: due esercizi aperti in fretta non devono lasciare nella macchina
// il mondo di quello sbagliato.
//
// IL BUG. Ogni apertura di esercizio lancia una semina asincrona. La prima
// correzione mise un numero di generazione, ma proteggeva solo la PAGINA: quando
// la semina vecchia torna, la macchina l'ha gia' modificata. Aprendo A e subito
// B, l'ordine di arrivo poteva essere B poi A — a schermo l'esercizio B, e dentro
// la macchina il mondo di A. Nessuno se ne accorge finche' la verifica non
// fallisce per una ragione inventata, ed e' il tipo di guasto che fa dubitare di
// se' invece che del programma.
//
// La cura e' una FILA: le semine si accodano, quindi l'ultima richiesta e' anche
// l'ultima a scrivere.
//
// PERCHE' QUESTO TEST ESISTE. Gli e2e navigano piano e non ci passano mai vicino:
// aspettano che una cosa finisca prima di fare la successiva, che e' esattamente
// la condizione in cui il bug non si vede. Qui si clicca APPOSTA senza aspettare.
// (Chiesto dalla revisione esterna, 2026-08-16.)
//
// Uso:  npm run serve   (in un'altra shell)
//       node tests/regressione-semina.mjs [url]

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_BASE = process.argv[2] || "http://127.0.0.1:8801/";
const PORTA = 9488;
const profilo = mkdtempSync(join(tmpdir(), "linuxlab-semina-"));

const chrome = spawn(process.env.CHROME || "google-chrome", [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    `--user-data-dir=${profilo}`, `--remote-debugging-port=${PORTA}`,
    "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding", "--window-size=1500,950", "about:blank",
], { stdio: "ignore" });
process.on("exit", () => {
    try { chrome.kill(); } catch {}
    try { rmSync(profilo, { recursive: true, force: true }); } catch {}
});

const dormi = ms => new Promise(r => setTimeout(r, ms));
let guai = 0;
const ok = m => console.log(`  ✓ ${m}`);
const ko = m => { console.log(`  ✗ ${m}`); guai++; };

for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORTA}/json/version`)).ok) break; } catch {}
    await dormi(500);
}
const t = await (await fetch(`http://127.0.0.1:${PORTA}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0; const att = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m.result); att.delete(m.id); } };
const cmd = (metodo, params = {}) => new Promise(r => { const i = ++id; att.set(i, r); ws.send(JSON.stringify({ id: i, method: metodo, params })); });
await new Promise(r => ws.onopen = r);
await cmd("Runtime.enable"); await cmd("Page.enable");
await cmd("Network.enable"); await cmd("Network.setCacheDisabled", { cacheDisabled: true });
const val = async e => (await cmd("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }))?.result?.value;

console.log(`\nsemina in fila — ${URL_BASE}\n`);

await cmd("Page.navigate", { url: `${URL_BASE}?lang=it&ch=3` });
await cmd("Page.bringToFront");
await dormi(1500);
await val(`localStorage.setItem('linuxlab.introSeen','true'); localStorage.removeItem('linuxlab.progress');`);
await cmd("Page.reload", { ignoreCache: true });

for (let i = 0; i < 90; i++) {
    await dormi(1000);
    if (await val("!!document.getElementById('labStato')?.classList.contains('pronta')")) break;
}
(await val("!!document.getElementById('labStato')?.classList.contains('pronta')"))
    ? ok("macchina pronta") : ko("la macchina non e' partita");

// Si aspetta che il primo esercizio finisca di seminare, cosi' si parte da fermi.
for (let i = 0; i < 40; i++) {
    await dormi(500);
    const pronti = await val(`(() => { const b = [...document.querySelectorAll('.es.aperto .es-barra button')];
        return b.length > 0 && b.every(x => !x.disabled); })()`);
    if (pronti) break;
}

// Si rallenta APPOSTA la preparazione di e2, cosi' l'ordine sbagliato non e' un
// caso fortunato ma una certezza: senza la fila, e3 (veloce) semina subito e e2
// (lento) semina DOPO, lasciando nella macchina il mondo di e2 mentre a schermo
// c'e' e3. Con la fila, e3 aspetta il suo turno e scrive per ultimo.
// Senza questo ritardo il test passerebbe anche con il codice vecchio, per caso.
const truccato = await val(`(() => {
    const orig = window.fetch;
    window.fetch = (u, o) => String(u).includes('ch03/e2/')
        ? new Promise(r => setTimeout(() => r(orig(u, o)), 3000))
        : orig(u, o);
    return "ok";
})()`);
truccato === "ok" ? ok("preparazione di e2 rallentata di 3 s, apposta") : ko("non ho potuto rallentare e2");

// IL PUNTO: due clic di fila, SENZA aspettare in mezzo. Prima e2 (lento), subito
// dopo e3 (veloce). e1 e' quello aperto all'avvio, quindi cliccarlo lo chiuderebbe
// e basta: non produrrebbe due semine, e il test non proverebbe niente.
const cliccati = await val(`(() => {
    const t2 = document.querySelector('.es[data-es="e2"] .es-testa');
    const t3 = document.querySelector('.es[data-es="e3"] .es-testa');
    if (!t2 || !t3) return "mancano gli esercizi";
    t2.click(); t3.click();
    return "ok";
})()`);
cliccati === "ok" ? ok("aperti e2 e e3 senza pausa in mezzo") : ko(`non ho potuto cliccare: ${cliccati}`);

// Si lascia sfogare tutta la fila.
// il ritardo finto dura 3 s: si aspetta che la fila si sia sfogata tutta.
await dormi(4000);
for (let i = 0; i < 60; i++) {
    await dormi(500);
    const pronti = await val(`(() => { const b = [...document.querySelectorAll('.es.aperto .es-barra button')];
        return b.length > 0 && b.every(x => !x.disabled); })()`);
    if (pronti) break;
}
await dormi(1500);

// A schermo: quale esercizio e' aperto?
const aperto = await val(`document.querySelector('.es.aperto')?.dataset.es || "(nessuno)"`);
aperto === "e3" ? ok("a schermo resta aperto e3") : ko(`a schermo e' aperto ${aperto}, non e3`);

// Nella macchina: chi e' stato seminato per ultimo? Lo scrive l'agente in
// /opt/lab/state/current a ogni seed. È la prova che riguarda lo STATO, non la UI.
const dentro = (await val(`(async () => {
    const r = await window.__linuxlab.agente.shell('cat /opt/lab/state/current 2>/dev/null');
    return (r.out || "").trim();
})()`)) || "(vuoto)";

dentro === "ch03/e3"
    ? ok(`nella macchina c'e' il mondo di e3 (${dentro})`)
    : ko(`nella macchina c'e' ${dentro}: la semina vecchia ha scritto per ultima`);

console.log(guai ? `\n${guai} problemi\n` : "\ntutto verde\n");
ws.close();
process.exit(guai ? 1 : 0);
