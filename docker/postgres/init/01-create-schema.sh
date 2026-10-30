#!/bin/sh
# Crea el esquema de la app (app_health) en la base local la primera vez que se inicializa el volumen.
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -c "CREATE SCHEMA IF NOT EXISTS app_health AUTHORIZATION \"$POSTGRES_USER\";"
