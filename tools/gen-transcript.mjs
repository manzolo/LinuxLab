#!/usr/bin/env node
// Genera i trascritti dei capitoli locali ESEGUENDO davvero i comandi nel container.
//
// Il punto non è il risparmio di lavoro: è che l'output mostrato a chi studia
// non sia inventato. Se l'immagine cambia, si rigenera e la differenza si vede
// nel diff. È la stessa garanzia dei fratelli della collana, dove l'atteso si
// calcola eseguendo la soluzione nel motore vero.
//
// Ingresso:  content/chNN/transcript.cmds   (un comando per riga, # per i commenti)
// Uscita:    content/chNN/transcript.json   (comando + output reale)
//
// Uso:  node tools/gen-transcript.mjs [ch17 ch20 ...]

import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const NOME = "linuxlab-transcript";
const IMG = "linuxlab-local";
const MAX_RIGHE = 14;   // un trascritto lungo non si legge: si taglia e si dichiara

const sh = (c, o = {}) => execSync(c, { encoding: "utf8", stdio: "pipe", ...o });

function avvia() {
    try { sh(`docker image inspect ${IMG}`); }
    catch { sh(`docker build ${ROOT}/lab -f ${ROOT}/lab/Dockerfile.local -t ${IMG}`, { stdio: "inherit" }); }
    try { sh(`docker rm -f ${NOME}`); } catch {}
    sh(`docker run -d --name ${NOME} --cgroupns=private --privileged \
        --tmpfs /run --tmpfs /run/lock ${IMG}`);
    process.stdout.write("attendo systemd");
    for (let i = 0; i < 40; i++) {
        try {
            const r = execFileSync("docker", ["exec", NOME, "systemctl", "is-system-running"], { encoding: "utf8", stdio: "pipe" });
            if (/running|degraded/.test(r)) break;
        } catch {}
        process.stdout.write("."); execSync("sleep 1");
    }
    console.log(" ok");
}

function esegui(cmd) {
    let out;
    try {
        out = execFileSync("docker", ["exec", NOME, "bash", "-lc", cmd],
            { encoding: "utf8", stdio: "pipe", timeout: 60000 });
    } catch (e) {
        // Un comando che fallisce è output legittimo: spesso è proprio la lezione.
        out = (e.stdout || "") + (e.stderr || "");
    }
    // Ma un container morto NON è output: è un trascritto da buttare. Meglio fermarsi
    // che pubblicare un errore di Docker spacciandolo per l'uscita di systemctl.
    if (/Error response from daemon|is not running|No such container/.test(out)) {
        console.error(`\nil container è morto durante:  ${cmd}`);
        console.error("nessun trascritto scritto. Controlla con:  docker logs " + NOME);
        process.exit(1);
    }
    return out;
}

const taglia = (t) => {
    const righe = t.replace(/\s+$/, "").split("\n");
    return righe.length > MAX_RIGHE
        ? righe.slice(0, MAX_RIGHE).join("\n") + `\n… (${righe.length - MAX_RIGHE} righe in meno)`
        : righe.join("\n");
};

const capitoli = process.argv.slice(2).length ? process.argv.slice(2)
    : fs.readdirSync(path.join(ROOT, "content")).filter(d => /^ch\d\d$/.test(d));

const daFare = capitoli.filter(c => fs.existsSync(path.join(ROOT, "content", c, "transcript.cmds")));
if (!daFare.length) { console.log("nessun transcript.cmds da generare"); process.exit(0); }

avvia();

for (const cap of daFare) {
    const srcFile = path.join(ROOT, "content", cap, "transcript.cmds");
    const passi = [];
    let nota = null;
    for (const riga of fs.readFileSync(srcFile, "utf8").split("\n")) {
        const r = riga.trim();
        if (!r) continue;
        // "#nota IT | EN" attacca una nota bilingue al passo successivo
        if (r.startsWith("#nota ")) {
            const [it, en] = r.slice(6).split("|").map(s => s.trim());
            nota = { it, en: en || it };
            continue;
        }
        // "#mark testo" evidenzia una riga dell'output
        if (r.startsWith("#mark ")) { passi.mark = r.slice(6).trim(); continue; }
        // "#silenzio cmd" esegue senza mostrarlo (preparazione della scena)
        if (r.startsWith("#silenzio ")) { esegui(r.slice(10)); continue; }
        if (r.startsWith("#")) continue;

        process.stdout.write(`  ${cap}: ${r.slice(0, 60)}\n`);
        const out = taglia(esegui(r));
        const passo = { cmd: r, out };
        if (nota) { passo.note = nota; nota = null; }
        if (passi.mark) { passo.mark = passi.mark; delete passi.mark; }
        passi.push(passo);
    }
    const dest = path.join(ROOT, "content", cap, "transcript.json");
    fs.writeFileSync(dest, JSON.stringify({ generato: "da tools/gen-transcript.mjs — non modificare a mano", steps: passi }, null, 2) + "\n");
    console.log(`${cap}: ${passi.length} passi -> ${path.relative(ROOT, dest)}`);
}

try { sh(`docker rm -f ${NOME}`); } catch {}
