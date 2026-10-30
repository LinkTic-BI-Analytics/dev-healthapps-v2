-- Preparación ÚNICA de Supabase para Health Apps. La ejecuta un administrador en el SQL Editor
-- (como `postgres`), una sola vez, ANTES de `pnpm db:deploy`. Cambia la contraseña antes de ejecutar.
--
-- Crea el esquema `auth-direction` y un rol dueño solo de ese esquema. La app, el worker y las
-- migraciones se conectan con este rol: aunque algo falle, no tiene permisos para crear ni
-- modificar objetos en public, auth, storage ni en ningún otro esquema.
-- No modifica ningún objeto existente fuera de `auth-direction`.
--
-- El nombre lleva guion: en SQL siempre va entre comillas dobles ("auth-direction").

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'auth_direction_owner') THEN
    CREATE ROLE auth_direction_owner LOGIN PASSWORD 'CAMBIAR-POR-UNA-CONTRASEÑA-SEGURA'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END
$$;

-- Necesario para que `postgres` pueda crear el esquema con este rol como dueño.
GRANT auth_direction_owner TO postgres;

CREATE SCHEMA IF NOT EXISTS "auth-direction" AUTHORIZATION auth_direction_owner;

-- Si el esquema ya existía con otro dueño, el rol igual necesita crear las tablas de la app en él.
GRANT USAGE, CREATE ON SCHEMA "auth-direction" TO auth_direction_owner;

-- Las consultas SQL crudas de la app resuelven tablas sin calificar en auth-direction, también a
-- través del pooler de Supabase (Supavisor), que puede no reenviar el parámetro `options` de la conexión.
ALTER ROLE auth_direction_owner SET search_path = "auth-direction";

-- El esquema no se expone por la Data API (PostgREST) ni a los roles de Supabase.
REVOKE ALL ON SCHEMA "auth-direction" FROM PUBLIC;
REVOKE ALL ON SCHEMA "auth-direction" FROM anon, authenticated;

-- El rol no puede crear objetos en public (en PostgreSQL 15+ ya es así por defecto; se deja explícito).
REVOKE CREATE ON SCHEMA public FROM auth_direction_owner;
