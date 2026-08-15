# La scorciatoia: sudo su tutto. Comoda e sbagliata.
printf 'deploy ALL=(ALL) NOPASSWD: ALL\n' > /etc/sudoers.d/deploy
chmod 440 /etc/sudoers.d/deploy
