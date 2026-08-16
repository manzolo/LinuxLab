#!/usr/bin/env node
// Genera le immagini del README pilotando Chrome headless via DevTools Protocol.
// Zero dipendenze, come tutto il resto qui dentro.
//
// Le scene non sono decorative: raccontano le tre cose che rendono questo lab
// diverso da una pagina di appunti — il terminale vero accanto al testo, il
// verdetto che insegna invece di dire "sbagliato", e l'aiuto che si legge prima
// di provare.
//
// Uso:  npm run serve            (in un'altra shell)
//       node tools/screenshot.mjs [url]

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.argv[2] || "http://127.0.0.1:8801/";
const PORTA = 9477;
const DEST = join(ROOT, "img");
const L = 1400, A = 900;

const profilo = mkdtempSync(join(tmpdir(), "linuxlab-shot-"));
const chrome = spawn(process.env.CHROME || "google-chrome", [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    `--user-data-dir=${profilo}`, `--remote-debugging-port=${PORTA}`,
    // v86 vive di setTimeout: senza questi Chrome strozza i timer e la macchina non parte
    "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding", `--window-size=${L},${A}`, "about:blank",
], { stdio: "ignore" });
process.on("exit", () => {
    try { chrome.kill(); } catch {}
    try { rmSync(profilo, { recursive: true, force: true }); } catch {}
});

const dormi = ms => new Promise(r => setTimeout(r, ms));

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
await cmd("Page.enable"); await cmd("Runtime.enable"); await cmd("Network.enable");
await cmd("Network.setCacheDisabled", { cacheDisabled: true });
await cmd("Emulation.setDeviceMetricsOverride", { width: L, height: A, deviceScaleFactor: 1, mobile: false });

const val = async e => (await cmd("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }))?.result?.value;

async function apri(query, profondita = "base") {
    await cmd("Page.navigate", { url: BASE + query });
    await cmd("Page.bringToFront");
    await dormi(1800);
    await val(`localStorage.setItem('linuxlab.introSeen','true');
               localStorage.setItem('linuxlab.depth','"${profondita}"');
               localStorage.removeItem('linuxlab.progress');`);
    await cmd("Page.reload", { ignoreCache: true });
    for (let i = 0; i < 90; i++) {
        await dormi(1000);
        if (await val("!!document.getElementById('labStato')?.classList.contains('pronta')")) break;
    }
    // i pulsanti si accendono solo quando il mondo dell'esercizio e' pronto
    for (let i = 0; i < 40; i++) {
        await dormi(500);
        const pronti = await val(`(() => { const b = [...document.querySelectorAll('.es.aperto .es-barra button')];
            return b.length > 0 && b.every(x => !x.disabled); })()`);
        if (pronti) break;
    }
    await dormi(1200);
}

async function scatta(nome) {
    const s = await cmd("Page.captureScreenshot", { format: "png" });
    mkdirSync(DEST, { recursive: true });
    const f = join(DEST, nome);
    writeFileSync(f, Buffer.from(s.data, "base64"));
    console.log("  " + nome);
}

console.log(`immagini in img/  (da ${BASE})`);

// 1 — il capitolo e il terminale, fianco a fianco
await apri("?lang=it&ch=2");
await scatta("capitolo.png");

// 2 — il verdetto che insegna: si preme Verifica SENZA aver risolto, cosi' si vede
//     il fatto misurato, il perche', e il comando per guardare il problema.
await apri("?lang=it&ch=6");
await val(`(() => { const b = [...document.querySelectorAll('.es.aperto .es-barra .btn.primario')][0];
    if (b && !b.disabled) b.click(); })()`);
for (let i = 0; i < 30; i++) { await dormi(700); if (await val(`!!document.querySelector('.verdetto')`)) break; }
await dormi(900);
await scatta("verdetto.png");

// 3 — l'aiuto dell'esercizio, che si legge PRIMA di provare
await apri("?lang=it&ch=9");
await val(`(() => { const b = [...document.querySelectorAll('.es.aperto .es-corpo button')]
    .find(x => /Aiuto|Help/.test(x.textContent)); if (b) b.click(); })()`);
await dormi(900);
await scatta("aiuto.png");

ws.close();
console.log("fatto");
process.exit(0);
