# Commento invece di direttiva: sshd continua ad accettare le password.
printf '# PasswordAuthentication no\n' > /etc/ssh/sshd_config.d/99-lab.conf
systemctl restart ssh 2>/dev/null || true
