printf 'PasswordAuthentication no\n' > /etc/ssh/sshd_config.d/99-lab.conf
sshd -t && systemctl restart ssh
sleep 1
