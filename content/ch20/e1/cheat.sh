# Regole giuste ma policy accept: tutto il resto passa lo stesso.
nft delete table inet lab 2>/dev/null || true
nft add table inet lab
nft add chain inet lab input '{ type filter hook input priority 0; policy accept; }'
nft add rule inet lab input tcp dport '{ 22, 80 }' accept
