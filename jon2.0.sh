#!/bin/bash

# Récupération du chemin vers le dossier contenant le script
DIR="$(cd "$(dirname "$0")" && pwd)"

# Utiliser la version locale de Node.js
NODE_BIN="$DIR/node/22/node"

# Vérifier la présence du binaire Node.js
if [ ! -x "$NODE_BIN" ]; then
  echo "Erreur : Node.js n'est pas trouvé dans le package. Veuillez vérifier l'installation."
  exit 1
fi

# Exécuter la CLI avec Node.js embarqué
LEVEL=info NODE_ENV=production "$NODE_BIN" "$DIR/dist/cli.js" "$@"
