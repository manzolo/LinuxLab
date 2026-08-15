# La fonte di verita' e' sshd stesso, non il testo del file di configurazione.
v=$(sshd -T 2>/dev/null | grep -i '^passwordauthentication' | awk '{print $2}')
lab_fact sshd_T "passwordauthentication ${v:-?}"
lab_eq password-chiusa "no" "$v"
a=$(systemctl is-active ssh 2>/dev/null)
lab_fact ssh_active "${a:-?}"
lab_eq sshd-attivo "active" "$a"
lab_done
