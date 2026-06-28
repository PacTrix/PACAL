#!/usr/bin/env bash
# Build et déploie PACAL en injectant la version (tag/commit git) et la date
# de build dans l'image Docker — affichées sous le titre PACAL dans la nav.
#
# Usage (depuis ce dossier, sur le NAS, après un `git pull`) :
#   ./deploy.sh

set -euo pipefail

cd "$(dirname "$0")"

# Version lisible : tag git le plus proche (ex. "v1.1.0"), suffixé du
# nombre de commits et du hash court si on n'est pas exactement sur un tag
# (ex. "v1.1.0-2-gA1b2c3d"). Retombe sur le hash court si aucun tag n'existe.
APP_VERSION=$(git describe --tags --always 2>/dev/null || echo "dev")
BUILD_DATE=$(date -u +"%Y-%m-%d %H:%M UTC")

echo "Déploiement PACAL"
echo "  Version : $APP_VERSION"
echo "  Build   : $BUILD_DATE"
echo

# Le dossier data/photos est un volume monté depuis le NAS — ses permissions
# ne dépendent donc pas de ce qui est défini dans le Dockerfile (qui ne
# s'applique qu'au système de fichiers interne à l'image, écrasé par le
# montage). Sur Synology, ce dossier est créé en lecture seule pour le
# process applicatif (uid du conteneur ≠ uid du dossier), ce qui fait
# échouer silencieusement l'écriture des photos (EACCES, visible uniquement
# dans les logs du conteneur, jamais à l'écran côté utilisateur). On corrige
# ici à chaque déploiement plutôt qu'une fois manuellement, pour que le
# problème ne revienne pas si ce dossier est un jour recréé.
mkdir -p ./data/photos
chmod 777 ./data/photos

docker compose build --build-arg APP_VERSION="$APP_VERSION" --build-arg BUILD_DATE="$BUILD_DATE"
docker compose up -d

echo
echo "Déployé. Voir les logs : docker compose logs -f"
