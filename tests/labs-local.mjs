#!/usr/bin/env node
// Banco di prova dei capitoli locali (17-22), dentro il container Debian+systemd.
//
// Stesse cinque asserzioni del banco del browser: lo stato iniziale non passa, la
// soluzione di riferimento passa, il trucco fallisce. Solo che qui l'esecutore e'
// Docker invece di v86, e gli script di verifica sono ESATTAMENTE gli stessi file.
//
// Uso:  node tests/labs-local.mjs [ch17 ch20 ...]

import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const NOME = "linuxlab-test";
const IMG = "linuxlab-local";
const SEMI = [424242, 7];

const sh = (cmd, opts = {}) => execSync(cmd, { encoding: "utf8", stdio: "pipe", ...opts });
const dentro = (cmd) => {
    try {
        return { ok: true, out: execFileSync("docker", ["exec", NOME, "bash", "-lc", cmd],
            { encoding: "utf8", stdio: "pipe", timeout: 120000 }) };
    } catch (e) {
        return { ok: false, out: (e.stdout || "") + (e.stderr || ""), code: e.status };
    }
};

let passati = 0;
const guai = [];
const ok = m => { passati++; if (process.env.VERBOSE) console.log(`    ✓ ${m}`); };
const ko = m => { guai.push(m); console.log(`    ✗ ${m}`); };

function avvia() {
    try { sh(`docker image inspect ${IMG}`); }
    catch { console.log("costruisco l'immagine locale…"); sh(`docker build ${ROOT}/lab -f ${ROOT}/lab/Dockerfile.local -t ${IMG}`, { stdio: "inherit" }); }
    try { sh(`docker rm -f ${NOME}`); } catch {}
    sh(`docker run -d --name ${NOME} --cgroupns=private --privileged \
        --tmpfs /run --tmpfs /run/lock ${IMG}`);
    process.stdout.write("attendo systemd");
    for (let i = 0; i < 40; i++) {
        const r = dentro("systemctl is-system-running 2>/dev/null || true");
        if (/running|degraded/.test(r.out)) { console.log(" ok"); return; }
        process.stdout.write("."); execSync("sleep 1");
    }
    console.log(" (avviato comunque)");
}

/** Copia gli script dell'esercizio dentro il container, come farebbe il sito. */
function inietta(cap, es) {
    const src = path.join(ROOT, "content", cap, es);
    if (!fs.existsSync(src)) return false;
    sh(`docker exec ${NOME} mkdir -p /opt/lab/${cap}/${es}`);
    for (const f of fs.readdirSync(src)) {
        sh(`docker cp "${path.join(src, f)}" ${NOME}:/opt/lab/${cap}/${es}/${f}`);
    }
    sh(`docker exec ${NOME} chmod -R 755 /opt/lab/${cap}/${es}`);
    return true;
}

const esegui = (cap, es, script, seme) => dentro(
    `export EDU_SEED=${seme} LAB=/root/lab HOME=/root; . /opt/lab/lib/labcheck.sh; . /opt/lab/${cap}/${es}/${script}`);

function provaEsercizio(cap, es) {
    const et = `${cap}.${es}`;
    if (!inietta(cap, es)) { ko(`${et}: cartella assente`); return; }

    for (const seme of SEMI) {
        dentro(`rm -rf /root/lab; mkdir -p /root/lab /opt/lab/state; find /opt/lab/state -type f -delete; echo ${seme} > /opt/lab/state/seed`);
        const s = esegui(cap, es, "seed.sh", seme);
        if (!s.ok && s.code !== 0 && /assente|not found/.test(s.out)) { ko(`${et} seme ${seme}: seed fallito — ${s.out.slice(0, 150)}`); continue; }

        const prima = esegui(cap, es, "check.sh", seme);
        prima.ok ? ko(`${et} seme ${seme}: lo stato iniziale passa già`) : ok(`${et} seme ${seme}: parte non superato`);

        esegui(cap, es, "solution.sh", seme);
        const dopo = esegui(cap, es, "check.sh", seme);
        dopo.ok ? ok(`${et} seme ${seme}: la soluzione passa`)
                : ko(`${et} seme ${seme}: la soluzione NON passa — ${(dopo.out || "").replace(/\n/g, " | ").slice(0, 240)}`);
    }

    if (fs.existsSync(path.join(ROOT, "content", cap, es, "cheat.sh"))) {
        const seme = SEMI[1];
        dentro(`rm -rf /root/lab; mkdir -p /root/lab /opt/lab/state; find /opt/lab/state -type f -delete; echo ${seme} > /opt/lab/state/seed`);
        esegui(cap, es, "seed.sh", seme);
        esegui(cap, es, "cheat.sh", seme);
        const v = esegui(cap, es, "check.sh", seme);
        v.ok ? ko(`${et}: il trucco PASSA — l'anti-trucco non tiene`) : ok(`${et}: il trucco fallisce`);
    }
}

// --------------------------------------------------------------------------

const richiesti = process.argv.slice(2);
const capitoli = (richiesti.length ? richiesti : ["ch17", "ch18", "ch19", "ch20", "ch21", "ch22"]).sort();

avvia();
// la libreria condivisa e la CLI vengono dall'overlay, gia' nell'immagine
console.log(`provo ${capitoli.length} capitoli locali\n`);

for (const cap of capitoli) {
    const dir = path.join(ROOT, "content", cap);
    if (!fs.existsSync(dir)) { console.log(`${cap}: assente`); continue; }
    const esercizi = fs.readdirSync(dir).filter(d => /^e\d+$/.test(d)).sort();
    if (!esercizi.length) { console.log(`${cap}: nessun esercizio`); continue; }
    console.log(cap);
    for (const es of esercizi) provaEsercizio(cap, es);
}

// La pulizia NON e' `docker rm` e basta: i volumi LVM, gli array e i loop device
// che il capitolo 21 crea sono globali dell'host e sopravvivono al container.
// Prima si disfa da dentro, finche' gli strumenti ci sono; poi si toglie il resto
// dall'host e si DICE cosa e' rimasto, invece di dare per scontato che non resti
// niente. (Trovato in revisione il 2026-08-16: il test lasciava tutto appeso.)
console.log("\npulizia");
try {
    sh(`docker exec ${NOME} sh -c '
        umount /mnt/lab 2>/dev/null || umount -l /mnt/lab 2>/dev/null
        command -v vgchange >/dev/null && { vgchange -an lab-vg; vgremove -f lab-vg; } 2>/dev/null
        [ -e /dev/md/lab-raid ] && mdadm --stop /dev/md/lab-raid
        true'`);
} catch {}
try { sh(`docker rm -f ${NOME}`); } catch {}
for (const md of ["/dev/md/lab-raid"]) {
    try { sh(`test -e ${md} && sudo -n mdadm --stop $(readlink -f ${md})`); } catch {}
}
try {
    const appesi = execSync("losetup -a 2>/dev/null | grep '/lab-' | grep -o '^/dev/loop[0-9]*' || true",
        { encoding: "utf8" }).trim().split("\n").filter(Boolean);
    for (const l of appesi) { try { sh(`sudo -n losetup -d ${l}`); } catch {} }
    const restano = execSync("losetup -a 2>/dev/null | grep -c '/lab-' || true", { encoding: "utf8" }).trim();
    if (restano !== "0") console.log(`  ⚠ restano ${restano} loop device del laboratorio: ./lab/local/run.sh cleanup`);
    else console.log("  niente di nostro è rimasto sull'host");
} catch {}

console.log(`\n${passati} asserzioni superate, ${guai.length} problemi`);
if (guai.length) console.log("\n" + guai.map(g => "  - " + g).join("\n") + "\n");
process.exit(guai.length ? 1 : 0);
