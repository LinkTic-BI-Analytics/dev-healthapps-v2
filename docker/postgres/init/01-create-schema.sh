#!/bin/sh
# Crea el esquema DB_SCHEMA en la base local la primera vez que se inicializa el volumen.
set -eu
SCHEMA="${DB_SCHEMA:-public}"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -c "CREATE SCHEMA IF NOT EXISTS \"$SCHEMA\" AUTHORIZATION \"$POSTGRES_USER\";"
