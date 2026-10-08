-- Preparación ÚNICA de Supabase para Health Apps. La ejecuta un administrador en el SQL Editor
-- (como `postgres`), una sola vez, ANTES de `pnpm db:deploy`. Cambia la contraseña antes de ejecutar.
--
-- Crea el esquema `app_health` y un rol dueño solo de ese esquema. La app, el worker y las
-- migraciones se conectan con este rol: aunque algo falle, no tiene permisos para crear ni
-- modificar objetos en public, auth, storage ni en ningún otro esquema.
-- No modifica ningún objeto existente fuera de `app_health`.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_health_owner') THEN
    CREATE ROLE app_health_owner LOGIN PASSWORD 'CAMBIAR-POR-UNA-CONTRASEÑA-SEGURA'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END
$$;

-- Necesario para que `postgres` pueda crear el esquema con este rol como dueño.
GRANT app_health_owner TO postgres;

CREATE SCHEMA IF NOT EXISTS app_health AUTHORIZATION app_health_owner;

-- Las consultas SQL crudas de la app resuelven tablas sin calificar en app_health, también a través
-- del pooler de Supabase (Supavisor), que puede no reenviar el parámetro `options` de la conexión.
ALTER ROLE app_health_owner SET search_path = app_health;

-- El esquema no se expone por la Data API (PostgREST) ni a los roles de Supabase.
REVOKE ALL ON SCHEMA app_health FROM PUBLIC;
REVOKE ALL ON SCHEMA app_health FROM anon, authenticated;

-- El rol no puede crear objetos en public (en PostgreSQL 15+ ya es así por defecto; se deja explícito).
REVOKE CREATE ON SCHEMA public FROM app_health_owner;
