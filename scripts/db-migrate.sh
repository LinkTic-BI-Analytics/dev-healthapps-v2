#!/bin/sh
# `pnpm db:migrate --name <nombre>`: los argumentos van a `prisma migrate dev`.
# Prisma 7 ya no regenera el cliente después de migrar, así que se hace aquí.
set -e
prisma migrate dev "$@"
prisma generate
