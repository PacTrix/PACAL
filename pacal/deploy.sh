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

docker compose build --build-arg APP_VERSION="$APP_VERSION" --build-arg BUILD_DATE="$BUILD_DATE"
docker compose up -d

echo
echo "Déployé. Voir les logs : docker compose logs -f"
