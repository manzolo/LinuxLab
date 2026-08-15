mkdir -p "$LAB" /etc/ssh/sshd_config.d
rm -f /etc/ssh/sshd_config.d/99-lab.conf
sed -i 's/^PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config 2>/dev/null || true
grep -q '^PasswordAuthentication' /etc/ssh/sshd_config 2>/dev/null || echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config
systemctl restart ssh 2>/dev/null || true
:
