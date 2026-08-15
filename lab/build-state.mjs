#!/usr/bin/env node
// Genera lo snapshot da cui il browser riparte in mezzo secondo.
//
// Perche' uno snapshot e non il boot normale: a freddo, da 9p, il kernel ci mette ~46 s.
// Con lo snapshot il prompt c'e' in 0,6 s. Non e' un'ottimizzazione, e' la differenza fra
// un lab che si usa e uno che si chiude.
//
// Perche' UNO snapshot per tutti i capitoli e non uno per capitolo: una sola URL, scaricata
// al primo capitolo e cache hit per tutti gli altri; e la macchina resta la STESSA passando
// di capitolo in capitolo, cosi' i file creati al capitolo 3 esistono ancora al capitolo 5.
//
// NB: niente warm-up. Misurato: non riduce le letture 9p e senza drop_caches gonfia
// lo stato del 40%. Resta solo `sync; drop_caches`.

import path from "node:path";
import fs from "node:fs";
import url from "node:url";
import child_process from "node:child_process";

const HERE = url.fileURLToPath(new URL(".", import.meta.url));
const ROOT = path.join(HERE, "..");
const IMAGES = path.join(ROOT, "images");
const STATE = path.join(IMAGES, "state.bin");

const { V86 } = await import(path.join(ROOT, "vendor/v86/libv86.mjs"));

// ATTENZIONE: queste opzioni devono coincidere ESATTAMENTE con quelle di js/lab/machine.js.
// v86 ripristina uno stato solo se il costruttore ha le stesse opzioni dell'originale:
// se `uart1` manca qui, nello stato ripristinato il canale di verifica non esiste.
export const OPZIONI_MACCHINA = {
    memory_size: 128 * 1024 * 1024,
    vga_memory_size: 2 * 1024 * 1024,
    uart1: true,
    bzimage_initrd_from_filesystem: true,
    cmdline: "rw root=host9p rootfstype=9p rootflags=trans=virtio,cache=loose " +
             "modules=virtio_pci tsc=reliable init_on_free=on console=ttyS0",
};

const emulator = new V86({
    ...OPZIONI_MACCHINA,
    bios: { url: path.join(ROOT, "vendor/v86/seabios.bin") },
    vga_bios: { url: path.join(ROOT, "vendor/v86/vgabios.bin") },
    wasm_path: path.join(ROOT, "vendor/v86/v86.wasm"),
    autostart: true,
    filesystem: {
        baseurl: path.join(IMAGES, "rootfs"),
        basefs: path.join(IMAGES, "fs.json"),
    },
});

const t0 = Date.now();
let testo = "", fase = "boot";
const PROMPT = "$ ";

process.stdout.write("boot a freddo dal 9p, ci vuole un minuto");
const punti = setInterval(() => process.stdout.write("."), 3000);

emulator.add_listener("serial0-output-byte", (b) => {
    testo += String.fromCharCode(b);
    if (!testo.endsWith(PROMPT)) return;

    if (fase === "boot") {
        clearInterval(punti);
        console.log(`\nprompt raggiunto in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
        fase = "drop";
        testo = "";
        emulator.serial0_send("sync; echo 3 >/proc/sys/vm/drop_caches\n");
        return;
    }
    if (fase === "drop") {
        fase = "save";
        setTimeout(async () => {
            const s = await emulator.save_state();
            fs.writeFileSync(STATE, new Uint8Array(s));
            child_process.execSync(`zstd -19 -q -f "${STATE}" -o "${STATE}.zst"`);
            fs.unlinkSync(STATE);
            const mb = fs.statSync(STATE + ".zst").size / 1048576;
            console.log(`snapshot: ${mb.toFixed(1)} MB compressi -> images/state.bin.zst`);
            if (mb > 25) {
                console.error("ATTENZIONE: snapshot oltre i 25 MB. Prima di toccare altro, prova memory_size a 64 MB.");
                process.exit(1);
            }
            emulator.destroy();
            process.exit(0);
        }, 6000);
    }
});

setTimeout(() => { console.error("\nTIMEOUT: la macchina non ha raggiunto il prompt in 300 s"); process.exit(1); }, 300000);
