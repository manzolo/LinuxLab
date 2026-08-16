// runner.js — porta un esercizio dentro la macchina e ne raccoglie il verdetto.
//
// Il pezzo di architettura che conta: gli script dell'esercizio NON stanno
// nell'immagine. Vivono in content/chNN/eN/*.sh e ci entrano a runtime.
// Conseguenza pratica: cambiare un esercizio e' un commit di testo, non una
// ricostruzione dell'immagine da due minuti.

import { CONTENT_BASE } from "../config.js";
import { scrivi, semina, verifica, ricomincia, leggiVerdetto } from "./agent.js";

const cache = new Map();

async function prendiScript(cap, es, nome) {
    const chiave = `${cap}/${es}/${nome}`;
    if (cache.has(chiave)) return cache.get(chiave);
    const r = await fetch(`${CONTENT_BASE}${cap}/${es}/${nome}`);
    if (!r.ok) throw new Error(`script mancante: ${chiave}`);
    const testo = await r.text();
    cache.set(chiave, testo);
    return testo;
}

const dirGuest = (cap, es) => `${cap}/${es}`;

/** Inietta gli script e prepara il mondo. Idempotente: si puo' richiamare. */
export async function preparaEsercizio(cap, es, seme) {
    const d = dirGuest(cap, es);
    const [seed, check] = await Promise.all([
        prendiScript(cap, es, "seed.sh"),
        prendiScript(cap, es, "check.sh"),
    ]);
    await scrivi(`/opt/lab/${d}/seed.sh`, seed, "755");
    await scrivi(`/opt/lab/${d}/check.sh`, check, "755");
    const r = await semina(d, seme);
    if (!r.ok) throw new Error(`il seed e' fallito: ${r.out}`);
    // Del recupero della cartella si occupa la shell da sola (trap DEBUG in
    // /etc/profile.d/lab.sh): qui NON si manda nessun colpetto, perche' ogni
    // sollecito lascia a schermo un prompt che sembra un Invio dato da un fantasma.
    return r;
}

/** Verifica e restituisce il verdetto gia' interpretato. */
export async function verificaEsercizio(cap, es) {
    const r = await verifica(dirGuest(cap, es));
    return { superato: r.ok, grezzo: r.out, ...leggiVerdetto(r.out) };
}

/** Ricomincia da capo mantenendo lo stesso mondo. */
export async function ricominciaEsercizio(cap, es) {
    return ricomincia(dirGuest(cap, es));
}
