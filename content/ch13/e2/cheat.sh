# Criterio troppo largo: si porta via anche i file legittimi.
find "$LAB/deposito" -type f -size +20k -delete
