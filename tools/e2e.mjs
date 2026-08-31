#!/usr/bin/env node
// e2e — smoke test su Chrome headless via DevTools Protocol. Zero dipendenze.
//
// Verifica la sola cosa che conta davvero: che la macchina parta e che il ciclo
// didattico (mondo seminato -> check che fallisce -> soluzione -> check che passa)
// funzioni su un Linux vero, dentro un browser vero.
//
// Uso:  node tools/e2e.mjs [url] [capitoli...]
//   es: node tools/e2e.mjs http://127.0.0.1:8801/ ch01 ch03

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_BASE = process.argv[2] || "http://127.0.0.1:8801/";
const CAPITOLI = process.argv.slice(3);
const PORTA = 9455;
const BIN = process.env.CHROME || "google-chrome";

const profilo = mkdtempSync(join(tmpdir(), "linuxlab-e2e-"));
const chrome = spawn(BIN, [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    `--user-data-dir=${profilo}`, `--remote-debugging-port=${PORTA}`,
    // v86 vive di setTimeout: senza questi, Chrome strozza i timer e la macchina non gira.
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--window-size=1400,900", "about:blank",
], { stdio: "ignore" });

const pulisci = () => { try { chrome.kill(); } catch {} try { rmSync(profilo, { recursive: true, force: true }); } catch {} };
process.on("exit", pulisci);

const dormi = ms => new Promise(r => setTimeout(r, ms));

async function attendiCdp() {
    for (let i = 0; i < 60; i++) {
        try { const r = await fetch(`http://127.0.0.1:${PORTA}/json/version`); if (r.ok) return r.json(); } catch {}
        await dormi(500);
    }
    throw new Error("Chrome non ha aperto il canale di debug");
}

let esitoFinale = 0;
const problemi = [];
const ok = (m) => console.log(`  ✓ ${m}`);
const ko = (m) => { console.log(`  ✗ ${m}`); problemi.push(m); esitoFinale = 1; };

(async () => {
    await attendiCdp();
    const t = await (await fetch(`http://127.0.0.1:${PORTA}/json/new?about:blank`, { method: "PUT" })).json();
    const ws = new WebSocket(t.webSocketDebuggerUrl);
    let id = 0; const attesa = new Map();
    const erroriJs = [];

    ws.onmessage = e => {
        const m = JSON.parse(e.data);
        if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m.result); attesa.delete(m.id); return; }
        if (m.method === "Runtime.exceptionThrown") erroriJs.push(m.params.exceptionDetails.text + " " + (m.params.exceptionDetails.exception?.description || ""));
        if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
            erroriJs.push(m.params.args.map(a => a.value ?? a.description).join(" "));
    };
    const cmd = (metodo, params = {}) => new Promise(res => { const i = ++id; attesa.set(i, res); ws.send(JSON.stringify({ id: i, method: metodo, params })); });
    await new Promise(r => ws.onopen = r);
    await cmd("Runtime.enable"); await cmd("Page.enable");

    const val = async expr => (await cmd("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }))?.result?.value;

    console.log(`\nE2E — ${URL_BASE}`);
    const t0 = Date.now();
    // Osserva l'avvio dentro la pagina, a intervalli abbastanza stretti da vedere
    // anche un falso sblocco di pochi millisecondi. Campionare da CDP una volta al
    // secondo non basta: era proprio cosi' che la vecchia regressione lo perdeva.
    await cmd("Page.addScriptToEvaluateOnNewDocument", { source: `
        window.__labAvvio = { sbloccato: false, ribloccato: false };
        window.__labAvvio.timer = setInterval(() => {
            const L = window.__linuxlab;
            if (!L) return;
            const input = L.term.inputTerminaleAbilitato();
            const pausa = document.getElementById('pannelloLab')?.classList.contains('preparazione');
            if (input) window.__labAvvio.sbloccato = true;
            if (window.__labAvvio.sbloccato && pausa)
                window.__labAvvio.ribloccato = true;
        }, 10);
    ` });
    await cmd("Page.navigate", { url: URL_BASE });
    await cmd("Page.bringToFront");

    // 1) la macchina parte E il primo mondo e' pronto. `labStato.pronta` da solo
    // in passato intercettava il breve istante fra lo snapshot e il seed: il test
    // dichiarava pronta la pagina mentre subito dopo il terminale si bloccava.
    let pronta = false;
    let inputPrematuro = false;
    for (let i = 0; i < 90; i++) {
        await dormi(1000);
        const fase = JSON.parse(await val(`JSON.stringify((() => {
            if (!window.__linuxlab) return { caricata: false };
            const inPreparazione = document.getElementById('pannelloLab').classList.contains('preparazione');
            const input = window.__linuxlab.term.inputTerminaleAbilitato();
            const statoPronto = document.getElementById('labStato').classList.contains('pronta');
            return { caricata: true, inPreparazione, input,
                pronta: statoPronto && !inPreparazione && input };
        })())`) || "{}");
        if (fase.caricata && fase.input && !fase.pronta) inputPrematuro = true;
        pronta = !!fase.pronta;
        if (pronta) break;
        const errore = await val("document.getElementById('labStato').classList.contains('errore')");
        if (errore) break;
    }
    pronta ? ok(`macchina ed esercizio pronti in ${((Date.now() - t0) / 1000).toFixed(1)} s`) : ko("la macchina non è diventata pronta");
    const avvio = JSON.parse(await val(`JSON.stringify((() => {
        clearInterval(window.__labAvvio?.timer);
        return window.__labAvvio || {};
    })())`) || "{}");
    (inputPrematuro || avvio.ribloccato) ? ko("il terminale è diventato scrivibile prima della fine del seed")
        : ok("terminale bloccato fino alla fine del primo seed");
    if (!pronta) { console.log(`\n${problemi.length} problemi`); process.exit(1); }

    // 2) il terminale ha scritto qualcosa
    const righeTerm = await val("document.querySelectorAll('.terminale .xterm-rows > div').length");
    righeTerm > 0 ? ok(`terminale attivo (${righeTerm} righe)`) : ko("il terminale non ha righe");

    // Il seed dell'esercizio successivo puo' durare diversi secondi. Il terminale
    // non deve accettare comandi destinati a un mondo che sta per sparire.
    const cambioGrezz = await val(`(async () => {
        document.querySelector('[data-es="e2"] .es-testa').click();
        let visto = false, inputFermo = false;
        const limite = Date.now() + 30000;
        while (Date.now() < limite) {
            const occupato = document.getElementById('pannelloLab').classList.contains('preparazione');
            if (occupato) {
                visto = true;
                if (!window.__linuxlab.term.inputTerminaleAbilitato()) inputFermo = true;
            }
            if (visto && !occupato) break;
            await new Promise(r => setTimeout(r, 20));
        }
        return JSON.stringify({ visto, inputFermo,
            riattivato: window.__linuxlab.term.inputTerminaleAbilitato() });
    })()`);
    const cambio = JSON.parse(cambioGrezz || "{}");
    (cambio.visto && cambio.inputFermo && cambio.riattivato)
        ? ok("cambio esercizio: terminale in pausa durante il seed e riattivato dopo")
        : ko(`cambio esercizio non atomico: ${cambioGrezz}`);

    // 3) il ciclo didattico, su ogni capitolo richiesto
    const daProvare = CAPITOLI.length ? CAPITOLI : await val("JSON.stringify(window.__linuxlab ? [] : [])").then(() => ["ch01"]);
    for (const capId of daProvare) {
        const esito = await val(`(async () => {
            const L = window.__linuxlab;
            const cap = await L.capitolo(${JSON.stringify(capId)});
            const risultati = [];
            for (const es of cap.exercises || []) {
                const seme = 424242;
                await L.runner.preparaEsercizio(cap.id, es.id, seme);
                const prima = await L.runner.verificaEsercizio(cap.id, es.id);
                // la soluzione di riferimento e il barare passano dal canale di verifica,
                // mai dal terminale: qui simuliamo l'utente che risolve
                await L.agente.scrivi('/opt/lab/' + cap.id + '/' + es.id + '/solution.sh',
                    await (await fetch('./content/' + cap.id + '/' + es.id + '/solution.sh')).text(), '755');
                await L.agente.risolvi(cap.id + '/' + es.id);
                const dopo = await L.runner.verificaEsercizio(cap.id, es.id);
                risultati.push({ es: es.id, prima: prima.superato, dopo: dopo.superato, out: dopo.grezzo });
            }
            return JSON.stringify(risultati);
        })()`);
        for (const r of JSON.parse(esito || "[]")) {
            if (r.prima) ko(`${capId}.${r.es}: lo stato iniziale passa già (l'esercizio è vuoto)`);
            else ok(`${capId}.${r.es}: parte non superato`);
            if (r.dopo) ok(`${capId}.${r.es}: la soluzione di riferimento passa`);
            else ko(`${capId}.${r.es}: la soluzione NON passa — ${(r.out || "").replace(/\n/g, " | ").slice(0, 200)}`);
        }
    }

    // 4) nessun errore JS
    erroriJs.length ? ko(`${erroriJs.length} errori JS: ${erroriJs.slice(0, 3).join(" / ")}`) : ok("nessun errore JS");

    console.log(problemi.length ? `\n${problemi.length} problemi\n` : "\ntutto verde\n");
    ws.close();
    process.exit(esitoFinale);
})().catch(e => { console.error("e2e fallito:", e.message); process.exit(1); });
