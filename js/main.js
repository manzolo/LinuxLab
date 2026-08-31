// main.js — cablaggio: lingua, profondità, navigazione, macchina, esercizi.

import { initLang, setLang, getLang, onLangChange, refreshStatic, t } from "./i18n.js";
import { get, set, progressiFatti } from "./storage.js";
import { CAPITOLI, capitolo, primoCapitolo } from "../content/index.js";
import { disegnaCapitolo } from "./ui/chapter.js";
import { inizializzaEsercizi, disegnaEsercizi, macchinaPronta, esercizioCorrente,
         azioniEsercizio, suAzioniEsercizio, accodaSemina } from "./ui/exercises.js";
import { apriSommario, apriIntro, apriBasi, apriQuaderno } from "./ui/overlays.js";
import { avvia, onProgresso, reimposta, mostraPrompt } from "./lab/machine.js";
import { attendiAgente, annullaRichiesteInSospeso } from "./lab/agent.js";
import { creaTerminale, adatta, pulisciTerminale, scriviNota, abilitaInputTerminale } from "./lab/terminal.js";

const $ = id => document.getElementById(id);
let idCorrente = null;
let navigando = false;

// ------------------------------------------------------------------ lingua e profondità

initLang();
refreshStatic();
aggiornaSwitch("#switchLang", "lang", getLang());

$("switchLang").onclick = e => {
    const l = e.target.dataset.lang;
    if (l) { setLang(l); aggiornaSwitch("#switchLang", "lang", l); }
};

const profondita = get("depth", "base");
document.body.classList.toggle("pro", profondita === "pro");
aggiornaSwitch("#switchDepth", "depth", profondita);

$("switchDepth").onclick = e => {
    const d = e.target.dataset.depth;
    if (!d) return;
    set("depth", d);
    document.body.classList.toggle("pro", d === "pro");
    aggiornaSwitch("#switchDepth", "depth", d);
};

function aggiornaSwitch(sel, chiave, valore) {
    document.querySelectorAll(`${sel} button`).forEach(b =>
        b.classList.toggle("on", b.dataset[chiave] === valore));
}

// ------------------------------------------------------------------ navigazione

// Un cambio di lingua arrivato MENTRE il capitolo si sta ridisegnando non va perso:
// `vaiA` lo scarterebbe (navigando), la chrome cambierebbe lingua e il capitolo no —
// e non recupererebbe piu'. (Segnalato da Andrea il 2026-08-30 su FsLab.)
let ridisegnoInCoda = false;

async function vaiA(id, spingiUrl = true, opzioni = {}) {
    if (navigando) return;
    navigando = true;
    let cap;
    try {
        try { cap = await capitolo(id); }
        catch { cap = await capitolo(primoCapitolo()); id = cap.id; }

        idCorrente = id;
        set("page", id);
        if (spingiUrl) {
            const u = new URL(location.href);
            u.searchParams.set("ch", cap.num);
            history.replaceState(null, "", u);
        }

        disegnaCapitolo(cap, $("capitolo"), vaiA);
        aggiornaPiede(cap);
        $("btnPrec").disabled = $("btnSucc").disabled = true;
        await disegnaEsercizi(cap, opzioni);
        aggiornaProgresso();
    } finally {
        navigando = false;
        if (cap) aggiornaPiede(cap);
        if (ridisegnoInCoda) { ridisegnoInCoda = false; vaiA(idCorrente, false, { soloTesto: true }); }
    }
}

function aggiornaPiede(cap) {
    const i = CAPITOLI.findIndex(c => c.id === cap.id);
    $("btnPrec").disabled = i <= 0;
    $("btnSucc").disabled = i >= CAPITOLI.length - 1;
    $("etichettaCap").textContent = t("capDi", cap.num, CAPITOLI.length);
}

function aggiornaProgresso() {
    const i = CAPITOLI.findIndex(c => c.id === idCorrente);
    $("barraProgresso").style.width = `${((i + 1) / CAPITOLI.length) * 100}%`;
}

const salta = d => {
    const i = CAPITOLI.findIndex(c => c.id === idCorrente) + d;
    if (i >= 0 && i < CAPITOLI.length) vaiA(CAPITOLI[i].id);
};
$("btnPrec").onclick = () => salta(-1);
$("btnSucc").onclick = () => salta(1);

// «Segnala un problema»: porta a una issue GitHub gia' compilata con cio' che un
// visitatore non penserebbe mai a scrivere — capitolo, lingua, stato del
// laboratorio e browser. L'href si costruisce AL CLICK, quando quei dati sono
// veri; l'href statico (issue vuota) resta il fallback se il modulo non parte.
$("linkSegnala").addEventListener("click", e => {
    const a = e.currentTarget;
    const cap = CAPITOLI.find(c => c.id === idCorrente);
    const titolo = `[cap ${cap ? cap.num : "?"}] `;
    const corpo = t("segnalaCorpo",
        location.href,
        cap ? t("capDi", cap.num, CAPITOLI.length) : "—",
        getLang(),
        $("labStato")?.textContent || "—",
        navigator.userAgent);
    a.href = `${a.href.split("?")[0]}?title=${encodeURIComponent(titolo)}&body=${encodeURIComponent(corpo)}`;
});

document.addEventListener("keydown", e => {
    if (e.target.closest(".terminale") || !$("velo").hidden) return;
    if (e.key === "ArrowLeft") salta(-1);
    if (e.key === "ArrowRight") salta(1);
});

$("btnIndice").onclick = () => apriSommario(idCorrente, vaiA);
// "Basi" e' del CAPITOLO corrente: la teoria distillata di questa lezione,
// richiamabile mentre lavori. La guida globale resta linkata li' dentro
// (e si apre da sola alla prima visita, piu' sotto).
$("btnIntro").onclick = async () => apriBasi(await capitolo(idCorrente).catch(() => null));
$("btnQuaderno").onclick = apriQuaderno;

// Cambiare lingua ridisegna solo il TESTO: il mondo nella macchina e' gia' quello
// giusto e riseminarlo cancellerebbe il lavoro fatto nell'esercizio.
onLangChange(() => {
    refreshStatic();
    if (!idCorrente) return;
    if (navigando) { ridisegnoInCoda = true; return; }
    vaiA(idCorrente, false, { soloTesto: true });
});

// ------------------------------------------------------------------ macchina

const stato = $("labStato");
onProgresso((fase, frazione) => {
    let testo;
    if (fase === "scarico") testo = t("labScarico", Math.round(frazione * 100));
    if (fase === "avvio") testo = t("labAvvio");
    // `pronta` qui significa soltanto che v86 ha ripristinato lo snapshot. Il
    // mondo dell'esercizio deve ancora essere seminato: dichiarare gia' pronta
    // la macchina creava proprio il falso sblocco visibile al primo caricamento.
    if (fase === "pronta") testo = t("labPreparazione");
    if (!testo) return;
    stato.textContent = testo;
    stato.className = "lab-stato preparazione";
    if ($("pannelloLab").classList.contains("preparazione"))
        $("terminale").dataset.busyLabel = testo;
});

// Reimposta la macchina: il ripristino dello snapshot blocca la pagina per qualche
// secondo, e senza segni a schermo sembra che non sia successo niente — lo scrollback
// resta identico. Quindi: bottone occupato, terminale SVUOTATO, banner, e l'esercizio
// corrente riseminato (dopo il ripristino il suo mondo non c'e' piu').
$("btnReimposta").onclick = async () => {
    const btn = $("btnReimposta");
    const testo = btn.textContent;
    btn.disabled = true; btn.textContent = "…";
    impostaBancoInPreparazione(true);
    try {
        await reimposta();
        // Le richieste scritte sulla seriale PRIMA del ripristino sono orfane:
        // rifiutarle subito sblocca la fila delle semine, cosi' la risemina qui
        // sotto parte davvero invece di accodarsi a un fantasma per 60 secondi.
        annullaRichiesteInSospeso(t("labReimpostaAnnullo"));
        pulisciTerminale();
        scriviNota(t("labReimposta"), 79);
        await mostraPrompt();          // un a-capo: il banner resta, il prompt torna
        await riseminaEsercizioCorrente();
    } finally {
        btn.disabled = false; btn.textContent = testo;
        impostaBancoInPreparazione(false);
    }
};

// I due gemelli di "Nuovo mondo" e "Ricomincia l'esercizio" che stanno qui, accanto
// a "Reimposta la macchina". Erano in pagina dal primo giorno SENZA GESTORE: si
// premevano e non succedeva niente. Adesso premono gli stessi bottoni della barra
// dell'esercizio (una sola logica) e restano spenti quando non c'e' un esercizio
// aperto, invece di sembrare disponibili e non esserlo.
suAzioniEsercizio(a => {
    $("btnNuovoMondo").disabled = !a;
    $("btnRicomincia").disabled = !a;
});
$("btnNuovoMondo").onclick = () => azioniEsercizio()?.nuovoMondo();
$("btnRicomincia").onclick = () => azioniEsercizio()?.ricomincia();

// Su telefono il terminale c'e' ma non e' praticabile: meglio dirlo che fingere.
const soloTocco = matchMedia("(pointer: coarse)").matches && innerWidth < 900;
if (soloTocco) {
    const a = document.createElement("div");
    a.className = "avviso-mobile";
    a.textContent = t("mobileAvviso");
    $("esercizi").before(a);
}

let blocchiPreparazione = 0;
function impostaBancoInPreparazione(attiva) {
    blocchiPreparazione = Math.max(0, blocchiPreparazione + (attiva ? 1 : -1));
    const occupato = blocchiPreparazione > 0;
    abilitaInputTerminale(!occupato);
    $("pannelloLab").classList.toggle("preparazione", occupato);
    $("terminale").setAttribute("aria-busy", String(occupato));
    if (occupato) $("terminale").dataset.busyLabel = t("labPreparazione");
    else delete $("terminale").dataset.busyLabel;
    stato.textContent = t(occupato ? "labPreparazione" : "labPronta");
    stato.className = occupato ? "lab-stato preparazione" : "lab-stato pronta";
}

inizializzaEsercizi($("esercizi"), aggiornaProgresso, impostaBancoInPreparazione);

// Il banco nasce occupato, non soltanto quando parte il seed. Lo snapshot mostra
// il prompt prima che il mondo del primo esercizio sia pronto: senza questo blocco
// continuo il terminale sembra utilizzabile per un istante e poi si riblocca.
impostaBancoInPreparazione(true);

// Dopo un ripristino della macchina, il mondo dell'esercizio aperto e' sparito
// insieme al resto: va riseminato, o il primo `Verifica` fallirebbe senza motivo.
async function riseminaEsercizioCorrente() {
    const cap = await capitolo(idCorrente).catch(() => null);
    const es = esercizioCorrente();
    if (!cap || !es || cap.runtime === "local") return;
    const { preparaEsercizio } = await import("./lab/runner.js");
    const { semePer } = await import("./storage.js");
    // In fila con le altre semine: se l'utente sta gia' cambiando esercizio mentre
    // la macchina si ripristina, l'ultima richiesta deve restare l'ultima a scrivere.
    await accodaSemina(() => preparaEsercizio(cap.id, es.id, semePer(`${cap.id}.${es.id}`)).catch(() => {}));
}

(async () => {
    const daUrl = new URLSearchParams(location.search).get("ch");
    const id = (daUrl && CAPITOLI.find(c => c.num === +daUrl)?.id) || get("page") || primoCapitolo();
    await vaiA(id, false);

    if (!get("introSeen")) { set("introSeen", true); apriIntro(); }

    try {
        await avvia();
        creaTerminale($("terminale"));
        await attendiAgente();
        macchinaPronta(true);
        await vaiA(idCorrente, false);   // ridisegna gli esercizi ora che la macchina c'e'
        // Scioglie il blocco dato alla nascita del banco. Il conteggio e'
        // bilanciato: le semine dentro `vaiA` incrementano e decrementano il
        // loro, e senza questo `false` il banco resterebbe occupato per sempre.
        impostaBancoInPreparazione(false);
    } catch (e) {
        stato.className = "lab-stato errore";
        stato.innerHTML = t("labErrore");
        console.error(e);
    }
})();

addEventListener("resize", () => adatta($("terminale")));

// Gancio per i test end-to-end (tools/e2e.mjs). Non e' un'API pubblica.
import * as agente from "./lab/agent.js";
import * as runner from "./lab/runner.js";
import * as termmod from "./lab/terminal.js";
window.__linuxlab = { agente, runner, term: termmod, vaiA, capitolo, get stato() { return stato.textContent; } };
