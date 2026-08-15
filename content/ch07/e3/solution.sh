printf 'deploy ALL=(root) NOPASSWD: /usr/local/bin/riavvia-sito\n' > /etc/sudoers.d/deploy
chmod 440 /etc/sudoers.d/deploy
