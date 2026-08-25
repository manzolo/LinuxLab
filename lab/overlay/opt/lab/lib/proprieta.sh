# proprieta.sh — la prova che una risorsa e' del laboratorio.
#
# UNA REGOLA SOLA, e vale ovunque: **la prova viene PRIMA dell'operazione
# distruttiva.** Non dopo, non "tanto si chiama lab-*".
#
# Perche' esiste questo file: la prima versione della pulizia controllava i volumi
# fisici del gruppo, ma lo faceva DOPO aver gia' eseguito `vgremove -f lab-vg`
# dentro il container — quindi il controllo non proteggeva niente, verificava un
# gruppo che non c'era piu'. Lo stesso valeva per il seed del capitolo 21 e per il
# banco di prova. (Terzo giro di revisione esterna, 2026-08-16.)
#
# E il silenzio non e' una prova: se `pvs` non c'e', se fallisce, o se restituisce
# zero righe, la risposta e' NO. Meglio lasciare qualcosa appeso e dirlo, che
# cancellare il gruppo di volumi di qualcun altro perche' si chiamava come il
# nostro.
#
# Si usa sia sull'host (con LAB_SUDO=sudo) sia dentro il container (LAB_SUDO="").
# Vive nell'overlay per essere UNO SOLO: l'immagine se lo porta in
# /opt/lab/lib/proprieta.sh, e `lab/local/run.sh` lo legge da qui nel repo.

# lab_vg_nostro [nome-vg] — 0 se e' dimostrabilmente nostro, 1 in ogni altro caso.
# Nostro = ogni suo volume fisico e' un loop device agganciato a un file
# /root/lab-disco-*.img. Un solo PV che non lo sia, e la risposta e' no.
lab_vg_nostro() {
    _vg="${1:-lab-vg}"
    command -v pvs >/dev/null 2>&1 || return 1
    _pv=$(${LAB_SUDO:-} pvs --noheadings -o pv_name -S "vg_name=$_vg" 2>/dev/null) || return 1
    # zero righe = nessuna prova, non "va bene"
    [ -n "$(printf '%s' "$_pv" | tr -d ' \t\n')" ] || return 1
    for _d in $_pv; do
        case "$_d" in
            /dev/loop*) lab_loop_nostro "$_d" || return 1 ;;
            *) return 1 ;;
        esac
    done
    return 0
}

# lab_md_nostro <dispositivo> — 0 se l'array porta un nome lab-* **e** se e'
# fatto dei nostri dischi. Il nome da solo non basta: e' una stringa, e chiunque
# puo' averla scelta. (Terzo giro di revisione, 2026-08-16.)
lab_md_nostro() {
    [ -e "$1" ] || return 1
    command -v mdadm >/dev/null 2>&1 || return 1
    _reale=$(readlink -f "$1") || return 1
    _det=$(${LAB_SUDO:-} mdadm --detail "$_reale" 2>/dev/null) || return 1
    _nome=$(printf '%s\n' "$_det" | sed -n 's/.*Name : .*:\([^ ]*\).*/\1/p')
    case "$_nome" in lab-*) ;; *) return 1 ;; esac
    # I componenti: si leggono dalla coda del --detail, dove ogni riga finisce col
    # dispositivo. Devono essere tutti loop device dei nostri file, e almeno uno.
    _n=0
    for _d in $(printf '%s\n' "$_det" | awk '/active sync|spare|faulty/ {print $NF}'); do
        case "$_d" in
            /dev/loop*) lab_loop_nostro "$_d" || return 1; _n=$((_n+1)) ;;
            /dev/*) return 1 ;;
        esac
    done
    [ "$_n" -gt 0 ] || return 1
    return 0
}

# lab_loop_nostro <dispositivo> — 0 se dietro c'e' un nostro file, e per "nostro"
# si intende **il modello dichiarato**, non una sottostringa qualsiasi: un file
# che si chiama /home/tizio/foto-lab-2019.img conteneva `/lab-` e passava.
LAB_MODELLO_DISCO=${LAB_MODELLO_DISCO:-/root/lab-disco-}
lab_loop_nostro() {
    _f=$(${LAB_SUDO:-} losetup -nO BACK-FILE "$1" 2>/dev/null) || return 1
    [ -n "$_f" ] || return 1
    case "$_f" in
        "$LAB_MODELLO_DISCO"*.img) return 0 ;;
        *) return 1 ;;
    esac
}

# lab_loop_nostri — elenca i loop device che sono dimostrabilmente nostri.
lab_loop_nostri() {
    for _l in $(${LAB_SUDO:-} losetup -nO NAME 2>/dev/null); do
        lab_loop_nostro "$_l" && printf '%s\n' "$_l"
    done
}

# lab_smonta_nostro <punto> <vg> — smonta SOLO se quel punto e' servito proprio
# dal gruppo che abbiamo dimostrato nostro. Prima si faceva `umount /mnt/lab` e
# basta, anche sull'host: se qualcuno ci teneva montato dell'altro, glielo
# smontavamo. (Quarto giro di revisione, 2026-08-16.)
lab_smonta_nostro() {
    _punto="$1"; _vg="${2:-lab-vg}"
    command -v findmnt >/dev/null 2>&1 || return 0
    _src=$(${LAB_SUDO:-} findmnt -n -o SOURCE --target "$_punto" 2>/dev/null) || return 0
    [ -n "$_src" ] || return 0
    ${LAB_SUDO:-} findmnt -n -o TARGET --target "$_punto" 2>/dev/null | grep -qx "$_punto" || return 0
    # il device mapper scrive lab--vg-lab--dati; il percorso lungo e' /dev/lab-vg/...
    _a=$(printf '%s' "$_vg" | sed 's/-/--/g')
    case "$_src" in
        /dev/mapper/"$_a"-*|/dev/"$_vg"/*) ;;
        *) echo "ATTENZIONE: $_punto e' servito da $_src, che non e' del gruppo $_vg: non lo smonto." >&2
           return 1 ;;
    esac
    ${LAB_SUDO:-} umount "$_punto" 2>/dev/null || ${LAB_SUDO:-} umount -l "$_punto" 2>/dev/null || return 1
    return 0
}

# lab_disfa_vg [nome-vg] — smonta e disfa, ma SOLO dopo la prova, e RISPONDE.
#
# Il valore di ritorno conta: chi chiama deve poter sapere se puo' eliminare il
# container. Prima ogni passo finiva con `|| true`, quindi la funzione diceva
# sempre "fatto" — e il chiamante distruggeva l'ambiente convinto di aver pulito.
# Adesso si controlla la POST-CONDIZIONE: il gruppo non deve piu' esserci.
# (Quarto giro di revisione, 2026-08-16.)
lab_disfa_vg() {
    _vg="${1:-lab-vg}"
    command -v vgs >/dev/null 2>&1 || return 0
    ${LAB_SUDO:-} vgs "$_vg" >/dev/null 2>&1 || return 0     # non c'e': niente da fare
    if ! lab_vg_nostro "$_vg"; then
        echo "ATTENZIONE: esiste un gruppo di volumi '$_vg' che NON poggia sui dischi del laboratorio." >&2
        echo "            non lo tocco. Guardalo con:  sudo pvs -S vg_name=$_vg" >&2
        return 1
    fi
    lab_smonta_nostro /mnt/lab "$_vg" || return 1
    ${LAB_SUDO:-} vgchange -an "$_vg" >/dev/null 2>&1 || true
    ${LAB_SUDO:-} vgremove -f "$_vg" >/dev/null 2>&1 || true
    if ${LAB_SUDO:-} vgs "$_vg" >/dev/null 2>&1; then
        echo "ATTENZIONE: '$_vg' e' ancora li' dopo vgremove: qualcosa lo tiene aperto." >&2
        return 1
    fi
    return 0
}

# lab_disfa_md <dispositivo> — ferma l'array, SOLO dopo la prova, e controlla che
# si sia davvero fermato prima di dire di si'.
lab_disfa_md() {
    [ -e "$1" ] || return 0
    _reale=$(readlink -f "$1") || return 0
    # Senza udev il nodo /dev/mdN può restare dopo lo stop. L'esistenza del file
    # speciale non prova che nel kernel esista ancora un array: `mdadm --detail`
    # sì. In quel caso non c'è più nulla da fermare.
    ${LAB_SUDO:-} mdadm --detail "$_reale" >/dev/null 2>&1 || return 0
    if ! lab_md_nostro "$1"; then
        echo "ATTENZIONE: $1 non e' dimostrabilmente del laboratorio: non lo fermo." >&2
        return 1
    fi
    # L'esercizio RAID monta l'array qui. Prima di smontare si confrontano i
    # dispositivi reali: un mount estraneo sullo stesso percorso non va toccato.
    if command -v findmnt >/dev/null 2>&1 \
       && [ "$(${LAB_SUDO:-} findmnt -n -o TARGET --target /mnt/raid 2>/dev/null)" = /mnt/raid ]; then
        _src=$(${LAB_SUDO:-} findmnt -n -o SOURCE --target /mnt/raid 2>/dev/null) || return 1
        _src_reale=$(${LAB_SUDO:-} readlink -f "$_src" 2>/dev/null) || return 1
        if [ "$_src_reale" != "$_reale" ]; then
            echo "ATTENZIONE: /mnt/raid e' servito da $_src, non da $1: non lo smonto." >&2
            return 1
        fi
        ${LAB_SUDO:-} umount /mnt/raid 2>/dev/null || return 1
    fi
    ${LAB_SUDO:-} mdadm --stop "$_reale" >/dev/null 2>&1 || true
    if ${LAB_SUDO:-} mdadm --detail "$_reale" >/dev/null 2>&1; then
        echo "ATTENZIONE: $1 e' ancora attivo dopo mdadm --stop." >&2
        return 1
    fi
    return 0
}
