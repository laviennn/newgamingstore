--
-- PostgreSQL database dump
--

\restrict GPcJT87rHMO3C4lHUR8Gjq1yeXtd121cuWnEk6byItx6UtO9rmiBJeTA4arZwe4

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_realtime_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_realtime_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_realtime_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_realtime_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_realtime_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: create_admin_operator(text, text, uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_admin_operator(p_email text, p_password text, p_role_id uuid, p_tenant_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RAISE EXCEPTION 'User with email % already exists', p_email;
    END IF;

    -- Generate UUID for new user
    new_user_id := gen_random_uuid();

    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', p_email, 
        crypt(p_password, gen_salt('bf')), now(), 
        now(), now(), '', '', '', ''
    );

    -- Insert into public.admin_users
    INSERT INTO public.admin_users (id, email, role_id, tenant_id, is_superadmin)
    VALUES (new_user_id, p_email, p_role_id, p_tenant_id, false);

    RETURN new_user_id;
END;
$$;


ALTER FUNCTION public.create_admin_operator(p_email text, p_password text, p_role_id uuid, p_tenant_id uuid) OWNER TO postgres;

--
-- Name: deduct_wallet_balance(text, numeric, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.deduct_wallet_balance(p_email text, p_amount numeric, p_tenant_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  current_balance numeric;
BEGIN
  -- Lock the row
  SELECT balance INTO current_balance 
  FROM public.wallets 
  WHERE email = p_email AND tenant_id = p_tenant_id
  FOR UPDATE;
  
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RAISE EXCEPTION 'Saldo tidak mencukupi (Sisa saldo: %)', COALESCE(current_balance, 0);
  END IF;
  
  UPDATE public.wallets 
  SET balance = balance - p_amount, 
      updated_at = now() 
  WHERE email = p_email AND tenant_id = p_tenant_id;
END;
$$;


ALTER FUNCTION public.deduct_wallet_balance(p_email text, p_amount numeric, p_tenant_id uuid) OWNER TO postgres;

--
-- Name: update_wallet_balance(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_wallet_balance() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  pkg_name text;
BEGIN
  IF NEW.status = 'Success' AND OLD.status != 'Success' THEN
    IF NEW.metadata->>'type' = 'UPGRADE' THEN
      pkg_name := NEW.metadata->>'package_name';
      IF pkg_name IS NOT NULL THEN
        UPDATE auth.users 
        SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{level}', to_jsonb(pkg_name))
        WHERE email = NEW.customer_email;
      END IF;
    ELSE
      -- Now inserting/updating with tenant_id
      INSERT INTO public.wallets (email, tenant_id, balance, updated_at)
      VALUES (NEW.customer_email, NEW.tenant_id, NEW.amount, now())
      ON CONFLICT (email, tenant_id)
      DO UPDATE SET balance = public.wallets.balance + EXCLUDED.balance, updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_wallet_balance() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_realtime_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_realtime_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) OWNER TO supabase_realtime_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_realtime_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_realtime_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_realtime_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_realtime_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_realtime_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[array_length(_parts, 1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: admin_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.admin_roles OWNER TO postgres;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id uuid NOT NULL,
    email text NOT NULL,
    role_id uuid,
    tenant_id uuid,
    is_superadmin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- Name: api_validation_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_validation_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid,
    game_code text NOT NULL,
    user_id text NOT NULL,
    server_id text,
    provider text NOT NULL,
    status text NOT NULL,
    result_username text,
    message text,
    execution_time_ms integer,
    ratelimit_limit integer,
    ratelimit_remaining integer
);


ALTER TABLE public.api_validation_logs OWNER TO postgres;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text,
    image_url text,
    author text DEFAULT 'Admin'::text,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id uuid
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon_name text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true,
    tenant_id uuid
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: deposits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deposits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id text NOT NULL,
    customer_email text NOT NULL,
    wa_number text,
    amount numeric NOT NULL,
    payment_channel_id uuid,
    status text DEFAULT 'Pending'::text,
    payment_proof_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    tenant_id uuid,
    CONSTRAINT deposits_status_check CHECK ((status = ANY (ARRAY['Pending'::text, 'Processed'::text, 'Success'::text, 'Failed'::text])))
);


ALTER TABLE public.deposits OWNER TO postgres;

--
-- Name: faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id uuid
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    image_url text,
    form_fields jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    developer text,
    background_image text,
    category_id uuid,
    is_popular boolean DEFAULT false,
    topup_instructions text,
    guide_image_url text,
    guide_text text,
    tenant_id uuid,
    has_username_validator boolean DEFAULT false,
    validator_provider character varying(50),
    validator_game_code character varying(100),
    provider_code_overrides jsonb DEFAULT '{}'::jsonb,
    sort_order integer DEFAULT 0
);


ALTER TABLE public.games OWNER TO postgres;

--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    username text NOT NULL,
    phone text,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: membership_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    price numeric DEFAULT 0 NOT NULL,
    period_label text DEFAULT '/Tahun'::text,
    benefits jsonb DEFAULT '[]'::jsonb,
    is_popular boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id uuid
);


ALTER TABLE public.membership_packages OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    game_id uuid,
    product_id uuid,
    customer_email text NOT NULL,
    form_data jsonb NOT NULL,
    status text DEFAULT 'Pending'::text,
    total_price numeric NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    invoice_id text,
    account_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    promo_code_id uuid,
    wa_number text,
    original_price numeric DEFAULT 0,
    fee numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    payment_status text DEFAULT 'UNPAID'::text,
    payment_channel_id uuid,
    payment_proof_url text,
    CONSTRAINT orders_payment_status_check CHECK ((payment_status = ANY (ARRAY['UNPAID'::text, 'PAID'::text, 'EXPIRED'::text]))),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['Pending'::text, 'Processed'::text, 'Success'::text, 'Failed'::text])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payment_channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_channels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    name text NOT NULL,
    logo_url text,
    account_number text,
    account_name text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    qr_image_url text,
    tenant_id uuid
);


ALTER TABLE public.payment_channels OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    game_id uuid,
    name text NOT NULL,
    price numeric NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_flash_sale boolean DEFAULT false,
    original_price numeric,
    flash_sale_stock integer DEFAULT 0,
    image_url text,
    tenant_id uuid,
    variant_type text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: promo_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promo_codes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    code text NOT NULL,
    discount_type text NOT NULL,
    discount_value numeric NOT NULL,
    max_uses integer,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT promo_codes_discount_type_check CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'fixed'::text])))
);


ALTER TABLE public.promo_codes OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    domain text NOT NULL,
    theme_config jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    admin_domain text,
    is_maintenance boolean DEFAULT false,
    auth_mode text DEFAULT 'email'::text,
    CONSTRAINT tenants_auth_mode_check CHECK ((auth_mode = ANY (ARRAY['email'::text, 'username'::text])))
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallets (
    email text NOT NULL,
    balance numeric DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.wallets OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone DEFAULT now()
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_realtime_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
71c6bd39-e368-4838-a62c-fd3a71bde477	71c6bd39-e368-4838-a62c-fd3a71bde477	{"sub": "71c6bd39-e368-4838-a62c-fd3a71bde477", "name": "johndoe", "email": "testing21@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-02 08:57:13.623592+00	2026-08-02 08:57:13.623649+00	2026-08-02 08:57:13.623649+00	010cb43a-7781-44fc-835b-fd307fa1823f
f6f37c88-cc7b-49ce-ada4-0e7b49858427	f6f37c88-cc7b-49ce-ada4-0e7b49858427	{"sub": "f6f37c88-cc7b-49ce-ada4-0e7b49858427", "name": "lavien", "email": "lavien21@gmail.com", "phone": "0812232333", "email_verified": false, "phone_verified": false}	email	2026-08-04 13:59:50.277315+00	2026-08-04 13:59:50.277415+00	2026-08-04 13:59:50.277415+00	c973f664-73ab-4b25-93b1-d6a6a4ba6292
4ef2982c-c1b4-41eb-b233-aa075218e5fe	4ef2982c-c1b4-41eb-b233-aa075218e5fe	{"sub": "4ef2982c-c1b4-41eb-b233-aa075218e5fe", "name": "Yoga", "email": "rio182846@gmail.com", "phone": "+6282173243921", "email_verified": false, "phone_verified": false}	email	2026-08-04 23:46:41.397532+00	2026-08-04 23:46:41.397579+00	2026-08-04 23:46:41.397579+00	b77ea586-c0ba-4bac-8e0f-4f789dda4aa1
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
c7de6960-fe75-4dd9-a5d0-6a061631df64	2026-08-04 23:46:41.449861+00	2026-08-04 23:46:41.449861+00	password	be5367ad-c2a7-42c4-8f18-a237a547f187
2656e5e0-2521-45f9-afed-9a61a2e6e8bf	2026-08-12 06:38:07.816346+00	2026-08-12 06:38:07.816346+00	password	bfd3c2c4-30d1-432c-9fe3-f65151f1f4aa
ec15249e-606b-4b24-8460-dcd83a455af8	2026-08-14 15:15:14.997968+00	2026-08-14 15:15:14.997968+00	password	dbe46cd3-361a-4a44-bbd3-7e3eb341d48c
56cda5ba-c4d8-4d15-8a22-36a9be3a9d47	2026-08-14 15:20:19.751319+00	2026-08-14 15:20:19.751319+00	password	a8ee371d-e90b-47ed-a243-395cfa28241b
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	88	otkuqmrqxcze	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	f	2026-08-14 15:20:19.745137+00	2026-08-14 15:20:19.745137+00	\N	56cda5ba-c4d8-4d15-8a22-36a9be3a9d47
00000000-0000-0000-0000-000000000000	77	f6eoe634fqd7	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	t	2026-08-12 06:38:07.78624+00	2026-08-12 07:40:26.945407+00	\N	2656e5e0-2521-45f9-afed-9a61a2e6e8bf
00000000-0000-0000-0000-000000000000	79	4zeqkzg7gj5o	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	t	2026-08-12 07:40:26.967465+00	2026-08-12 10:03:32.394174+00	f6eoe634fqd7	2656e5e0-2521-45f9-afed-9a61a2e6e8bf
00000000-0000-0000-0000-000000000000	36	4v7zp3vxnktz	4ef2982c-c1b4-41eb-b233-aa075218e5fe	f	2026-08-04 23:46:41.439194+00	2026-08-04 23:46:41.439194+00	\N	c7de6960-fe75-4dd9-a5d0-6a061631df64
00000000-0000-0000-0000-000000000000	81	pm3fekgf6nvo	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	t	2026-08-12 10:03:32.419712+00	2026-08-13 17:19:36.934122+00	4zeqkzg7gj5o	2656e5e0-2521-45f9-afed-9a61a2e6e8bf
00000000-0000-0000-0000-000000000000	85	ignzbwdieeyj	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	f	2026-08-13 17:19:36.949067+00	2026-08-13 17:19:36.949067+00	pm3fekgf6nvo	2656e5e0-2521-45f9-afed-9a61a2e6e8bf
00000000-0000-0000-0000-000000000000	87	aw3zrpgbkkac	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	f	2026-08-14 15:15:14.983097+00	2026-08-14 15:15:14.983097+00	\N	ec15249e-606b-4b24-8460-dcd83a455af8
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
c7de6960-fe75-4dd9-a5d0-6a061631df64	4ef2982c-c1b4-41eb-b233-aa075218e5fe	2026-08-04 23:46:41.424929+00	2026-08-04 23:46:41.424929+00	\N	aal1	\N	\N	node	100.57.168.47	\N	\N	\N	\N	\N
ec15249e-606b-4b24-8460-dcd83a455af8	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	2026-08-14 15:15:14.966925+00	2026-08-14 15:15:14.966925+00	\N	aal1	\N	\N	node	18.142.47.69	\N	\N	\N	\N	\N
56cda5ba-c4d8-4d15-8a22-36a9be3a9d47	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	2026-08-14 15:20:19.726388+00	2026-08-14 15:20:19.726388+00	\N	aal1	\N	\N	node	36.70.34.46	\N	\N	\N	\N	\N
2656e5e0-2521-45f9-afed-9a61a2e6e8bf	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	2026-08-12 06:38:07.743159+00	2026-08-13 17:19:52.171637+00	\N	aal1	\N	2026-08-13 17:19:52.171559	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Safari/605.1.15	82.23.255.61	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	f6f37c88-cc7b-49ce-ada4-0e7b49858427	authenticated	authenticated	lavien21@gmail.com	$2a$10$3H5SYz1jgEKULjkW9IZQPO8Ly5GjFSEHM2Woo7iEAr0616tUF9Z3.	2026-08-04 13:59:50.282336+00	\N		\N		\N			\N	2026-08-05 16:05:20.650395+00	{"provider": "email", "providers": ["email"]}	{"sub": "f6f37c88-cc7b-49ce-ada4-0e7b49858427", "name": "lavien", "email": "lavien21@gmail.com", "phone": "0812232333", "email_verified": true, "phone_verified": false}	\N	2026-08-04 13:59:50.257896+00	2026-08-05 16:05:20.691102+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	1a353e02-c108-49e4-bc63-498f7a3b31b4	authenticated	authenticated	neugamingstore@gmail.com	$2a$06$IqbpHMOkJW2whHPCbJbdXetN33bPpIhyOTedtdxicrXZQzSRbDjM6	2026-08-05 16:06:23.711747+00	\N		\N		\N			\N	2026-08-11 15:02:21.343142+00	\N	\N	\N	2026-08-05 16:06:23.711747+00	2026-08-14 09:52:12.450236+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d6cf8910-bc5a-45d9-b5bf-33d081b2868b	authenticated	authenticated	lavien@gmail.com	$2a$06$6BX7cILUxOEm.dZ2XuYh0Oww167QkEQLySq3nW2BRABN9EpjmJ.E6	2026-08-03 13:32:43.466379+00	\N		\N		\N			\N	2026-08-14 15:20:19.72451+00	\N	\N	\N	2026-08-03 13:32:43.466379+00	2026-08-14 15:20:19.748353+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4ef2982c-c1b4-41eb-b233-aa075218e5fe	authenticated	authenticated	rio182846@gmail.com	$2a$10$etzObhDo5u0XnA62y2yuhOdLK9r1.SPNU96JegwIx1VXyRBLNKSQa	2026-08-04 23:46:41.41228+00	\N		\N		\N			\N	2026-08-04 23:46:41.42481+00	{"provider": "email", "providers": ["email"]}	{"sub": "4ef2982c-c1b4-41eb-b233-aa075218e5fe", "name": "Yoga", "email": "rio182846@gmail.com", "phone": "+6282173243921", "email_verified": true, "phone_verified": false}	\N	2026-08-04 23:46:41.360064+00	2026-08-04 23:46:41.448586+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	71c6bd39-e368-4838-a62c-fd3a71bde477	authenticated	authenticated	testing21@gmail.com	$2a$10$ljv4zFuIp6lAJv/BQBmO9.zCQBctcahRYxlczOUay3ctgEVdX80LG	2026-08-02 08:57:13.626574+00	\N		\N		\N			\N	2026-08-03 02:13:36.096608+00	{"provider": "email", "providers": ["email"]}	{"sub": "71c6bd39-e368-4838-a62c-fd3a71bde477", "name": "johndoe", "email": "testing21@gmail.com", "level": "Platinum", "email_verified": true, "phone_verified": false}	\N	2026-08-02 08:57:13.611525+00	2026-08-03 04:11:43.684057+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	11060bec-b5ca-4a59-add1-844aa3039700	authenticated	authenticated	newgamingstore@gmail.com	$2a$06$b0fCnOUJ5j74GLVA8bq04ePAOJpQXsMhsw3v5ISxZpW4vbeecCdeK	2026-08-05 15:12:13.318643+00	\N		\N		\N			\N	2026-08-05 15:24:33.41984+00	\N	\N	\N	2026-08-05 15:12:13.318643+00	2026-08-05 15:24:33.441623+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_roles (id, name, permissions, created_at) FROM stdin;
415b6dc6-e0ca-4b19-b0d1-5a66830647e5	Owner	["manage_games", "manage_categories", "manage_products", "manage_deposits", "manage_orders", "manage_payments", "manage_memberships", "manage_promos", "manage_members", "manage_articles", "manage_faqs", "manage_contacts", "manage_roles", "manage_operators", "manage_theme", "manage_content"]	2026-08-05 15:10:04.159206+00
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, email, role_id, tenant_id, is_superadmin, created_at) FROM stdin;
d6cf8910-bc5a-45d9-b5bf-33d081b2868b	lavien@gmail.com	\N	\N	t	2026-08-03 13:32:43.466379+00
11060bec-b5ca-4a59-add1-844aa3039700	newgamingstore@gmail.com	415b6dc6-e0ca-4b19-b0d1-5a66830647e5	9a145561-8663-4b49-9d02-9a97c93ca322	f	2026-08-05 15:12:13.318643+00
1a353e02-c108-49e4-bc63-498f7a3b31b4	neugamingstore@gmail.com	415b6dc6-e0ca-4b19-b0d1-5a66830647e5	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f	2026-08-05 16:06:23.711747+00
\.


--
-- Data for Name: api_validation_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_validation_logs (id, created_at, tenant_id, game_code, user_id, server_id, provider, status, result_username, message, execution_time_ms, ratelimit_limit, ratelimit_remaining) FROM stdin;
c14e01c0-0191-4c07-9714-1959e0822e30	2026-08-05 14:09:49.944154+00	\N	genshin-impact	854016571	os_asia	vip-reseller	SUCCESS	L*****n	\N	1151	\N	\N
b1f71b85-2a3d-40ac-86af-e6d57e385925	2026-08-05 14:13:09.720958+00	\N	cek_game_ml	971857394	12877	vip-reseller	FAILED	\N	Provider for game code 'cek-game-ml' is not available.	455	\N	\N
32777063-75ef-4bc3-9d1c-508acf79315b	2026-08-05 14:13:10.861462+00	\N	cek_game_ml	971857394	12877	rapidapi	FAILED	\N	RapidAPI HTTP Error: 404	845	\N	\N
0db24f37-b3b2-4267-8a8b-db9381e59e1a	2026-08-05 14:16:15.965874+00	\N	cek_game_ml	971857394	12877	vip-reseller	FAILED	\N	Provider for game code 'cek-game-ml' is not available.	633	\N	\N
3fe441b8-66fb-4c5b-a35c-415570725d4b	2026-08-05 14:16:19.441743+00	\N	cek_game_ml	971857394	12877	rapidapi	SUCCESS	Sky+P1nnZzz’s	\N	3177	5	2
9a5d18b3-a449-476c-89cf-ee54eb6b9227	2026-08-05 14:19:37.731462+00	\N	cek_game_ml	971857394	12877	vip-reseller	FAILED	\N	Provider for game code 'cek-game-ml' is not available.	242	\N	\N
253581ba-65d8-41dd-b022-5afc0e19674c	2026-08-05 14:19:43.870347+00	\N	cek_game_ml	971857394	12877	rapidapi	FAILED	\N	Username tidak ditemukan di RapidAPI	5879	5	1
38ec0256-2983-4014-8bf0-b645c19c2645	2026-08-05 14:20:14.450869+00	\N	cek_game_ml	971857394	12877	vip-reseller	FAILED	\N	Provider for game code 'cek-game-ml' is not available.	205	\N	\N
33e78aee-7eda-4cc5-8958-ae371ef1e503	2026-08-05 14:20:19.964812+00	\N	cek_game_ml	971857394	12877	rapidapi	SUCCESS	Sky+P1nnZzz’s (id)	\N	5312	5	0
0521fae4-da3c-49ef-831a-9b67917b769d	2026-08-05 14:20:31.908825+00	\N	cek_game_ml	971857394	12877	vip-reseller	FAILED	\N	Provider for game code 'cek-game-ml' is not available.	197	\N	\N
d99008b3-eafb-4679-b9a8-6c3a1d52bef8	2026-08-05 14:20:32.151092+00	\N	cek_game_ml	971857394	12877	rapidapi	FAILED	\N	RapidAPI HTTP Error: 429	122	5	0
d94e96a7-f7f6-4ad4-995a-2fc5b04729a2	2026-08-05 14:31:42.574449+00	\N	mobile-legends	971857394	12877	vip-reseller	SUCCESS	Sky P1nnZzz’s	\N	1981	\N	\N
f3e27f86-64d7-447d-8c26-12474894113d	2026-08-05 14:32:08.399968+00	\N	mobile-legends	971857394	12877	vip-reseller	SUCCESS	Sky P1nnZzz’s	\N	851	\N	\N
07ed32f7-30a8-41e9-ab57-7460adb931c0	2026-08-05 14:52:25.049116+00	\N	mobile-legends	971857394	12877	kokinpay	SUCCESS	Sky+P1nnZzz’s (ID)	\N	3143	\N	\N
b851dd67-b8e5-49b1-a02c-a9e87048174d	2026-08-05 14:53:06.474867+00	\N	mobile-legends	971857394	12877	kokinpay	SUCCESS	Sky+P1nnZzz’s (ID)	\N	2538	\N	\N
90fc1125-5274-4b53-baae-826a3c32bcb3	2026-08-05 14:53:15.647954+00	\N	mobile-legends	971857394	12877	kokinpay	SUCCESS	Sky+P1nnZzz’s (ID)	\N	2237	\N	\N
d2cf1fca-df7c-496d-88f5-cd69ce7f1463	2026-08-05 14:53:19.829346+00	\N	mobile-legends	971857394	12877	kokinpay	SUCCESS	Sky+P1nnZzz’s (ID)	\N	2077	\N	\N
31223de5-24b0-4d09-8b3f-9f1ee20486b5	2026-08-05 14:53:33.225088+00	\N	mobile-legends	971857394	12877	kokinpay	SUCCESS	Sky+P1nnZzz’s (ID)	\N	2353	\N	\N
cbc02857-add5-4d01-8058-c9adc3ccf793	2026-08-05 14:53:44.280481+00	\N	mobile-legends	971857394	12877	kokinpay	SUCCESS	Sky+P1nnZzz’s (ID)	\N	2632	\N	\N
e1324964-86df-443e-9826-cdf2ec9d5f95	2026-08-05 14:54:11.391801+00	\N	mobile-legends	971857394	128777	kokinpay	FAILED	\N	User ID atau Zone ID tidak ditemukan atau tidak valid	2912	\N	\N
6316930b-cbcd-4e68-b306-f7e5a905abad	2026-08-05 14:54:14.092136+00	\N	mobile-legends	971857394	128777	vip-reseller	FAILED	\N	Fails.	2535	\N	\N
ae333d86-f830-41c5-9503-bb088f685bcb	2026-08-05 14:54:15.355134+00	\N	cek_game_ml	971857394	128777	rapidapi	FAILED	\N	RapidAPI HTTP Error: 429	932	5	0
15c5a904-ab87-472c-8cf2-486dd2163921	2026-08-05 14:56:18.351984+00	\N	mobile-legends	971857394	128777	kokinpay	FAILED	\N	User ID atau Zone ID tidak ditemukan atau tidak valid	2798	\N	\N
31cbd700-ce53-42be-8b50-7d8517037d1a	2026-08-05 14:56:20.119027+00	\N	mobile-legends	971857394	128777	vip-reseller	FAILED	\N	Fails.	1579	\N	\N
e853cced-d67b-44f6-98cc-2bbcbe8cd7c8	2026-08-05 14:56:21.42138+00	\N	cek_game_ml	971857394	128777	rapidapi	FAILED	\N	RapidAPI HTTP Error: 429	969	5	0
f051127d-1301-4e90-b057-6daa1574984a	2026-08-05 14:59:54.201553+00	\N	mobile-legends	971857394	12877	kokinpay	SUCCESS	Sky+P1nnZzz’s (ID)	\N	3005	\N	\N
3831294e-28ff-41d0-ad2e-f3bd2cd46796	2026-08-05 15:35:52.003398+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 54.169.242.11 tidak diizinkan	201	\N	\N
17b1f840-7e62-4524-b565-dc5433acf043	2026-08-05 15:35:52.15538+00	\N	genshin	854016571	os_asia	rapidapi	FAILED	\N	RapidAPI HTTP Error: 404	24	\N	\N
ba730e92-3db7-435d-b92c-4e72fc8829a7	2026-08-05 15:38:49.744479+00	\N	genshin-impact	854016571	os_asia	vip-reseller	SUCCESS	L*****n	\N	586	\N	\N
810941d4-2b58-4700-922e-ed5858462090	2026-08-05 15:39:59.859166+00	\N	mobile-legends	971857394	12877	vip-reseller	FAILED	\N	IP 52.74.148.142 tidak diizinkan	134	\N	\N
f935cd55-9bef-4ccc-a08c-97b195318376	2026-08-05 15:40:00.00851+00	\N	cek_game_ml	971857394	12877	rapidapi	FAILED	\N	RapidAPI HTTP Error: 429	26	5	0
a358ab62-a160-4fb9-ae7b-e1ae55ef47a5	2026-08-05 15:49:02.28016+00	\N	mobile-legends	971857394	12877	kokinpay	SUCCESS	Sky+P1nnZzz’s (ID)	\N	3014	\N	\N
61117d57-4a37-4bbd-922e-e8ba98215f7e	2026-08-05 15:49:58.184127+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 13.214.193.244 tidak diizinkan	131	\N	\N
8bf02169-ed57-48ac-a5db-62a8ad378732	2026-08-05 15:49:59.596832+00	\N	genshin-impact	854016571	os_asia	kokinpay	FAILED	\N	User ID tidak ditemukan atau tidak valid	1321	\N	\N
e18299f9-6d0f-44e8-b620-e59169e56986	2026-08-05 15:49:59.720314+00	\N	test_game_genshin	854016571	os_asia	rapidapi	FAILED	\N	RapidAPI HTTP Error: 429	24	5	0
f1d9d8b6-4fd4-433a-bb98-add489f88090	2026-08-05 15:50:26.233535+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 13.214.193.244 tidak diizinkan	614	\N	\N
95e590ab-746a-42f4-884e-d92bf02ef61c	2026-08-05 15:50:27.477277+00	\N	genshin-impact	854016571	os_asia	kokinpay	FAILED	\N	User ID tidak ditemukan atau tidak valid	1128	\N	\N
abfdd1db-7a1b-46dc-a59a-2008ddc04ac2	2026-08-05 15:50:27.597247+00	\N	test_game_genshin	854016571	os_asia	rapidapi	FAILED	\N	RapidAPI HTTP Error: 429	27	5	0
7556e813-a8f7-4d54-928c-411e23eab8e1	2026-08-05 15:50:54.558858+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 13.214.193.244 tidak diizinkan	125	\N	\N
c8c7c860-7486-423c-8bf5-c09c61a0498b	2026-08-05 15:50:55.719599+00	\N	genshin-impact	854016571	os_asia	kokinpay	FAILED	\N	User ID tidak ditemukan atau tidak valid	1058	\N	\N
ab52118c-c994-46e4-a1d1-32149144f28d	2026-08-05 15:50:55.827647+00	\N	test_game_genshin	854016571	os_asia	rapidapi	FAILED	\N	RapidAPI HTTP Error: 429	15	5	0
d592aaf7-a9d4-47f6-8fb7-c581cd747246	2026-08-05 15:53:45.257118+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 13.214.193.244 tidak diizinkan	816	\N	\N
b2567d7b-690a-4655-a7f8-9c694a25150f	2026-08-05 15:53:46.739202+00	\N	genshin-impact	854016571	os_asia	kokinpay	FAILED	\N	User ID tidak ditemukan atau tidak valid	1365	\N	\N
f387347d-4a6b-409e-b420-cc57e177903e	2026-08-05 15:53:46.860341+00	\N	test_game_genshin	854016571	os_asia	rapidapi	FAILED	\N	RapidAPI HTTP Error: 429	25	5	0
2dfac7d8-afe3-4bbd-acd3-5b4ca305c516	2026-08-05 15:55:37.799423+00	\N	genshin-impact	854016571	os_asia	vip-reseller	SUCCESS	L*****n	\N	783	\N	\N
8538625e-c698-45cf-bb1f-a5656ef39b88	2026-08-05 16:01:54.909186+00	\N	genshin-impact	854016571	os_asia	vip-reseller	SUCCESS	L*****n	\N	2619	\N	\N
8e8cd8d8-2027-4c10-a2e2-43a2469cdce1	2026-08-05 16:03:02.122968+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 18.142.246.205 tidak diizinkan	1597	\N	\N
b55cd708-9ce5-449e-a5f2-eee98b531cb0	2026-08-05 16:03:04.214373+00	\N	genshin-impact	854016571	os_asia	kokinpay	SUCCESS	L*****n	\N	1981	\N	\N
bb1a6fb1-08dd-4785-a8d1-2abddc6babfb	2026-08-05 16:03:37.086434+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 18.142.246.205 tidak diizinkan	112	\N	\N
bbf923e7-f637-4551-a863-cf1b99e6cc77	2026-08-05 16:03:38.731841+00	\N	genshin-impact	854016571	os_asia	kokinpay	SUCCESS	L*****n	\N	1368	\N	\N
996f8ca6-118e-475e-9316-0c9090dec0b3	2026-08-05 17:40:20.999031+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 13.215.174.85 tidak diizinkan	121	\N	\N
eaaa005e-bda7-4466-9fc6-7bdaab771e4c	2026-08-05 17:40:23.348106+00	\N	genshin-impact	854016571	os_asia	kokinpay	SUCCESS	L*****n	\N	2242	\N	\N
ccff35ef-33d2-496f-be42-c315daff09c1	2026-08-06 02:29:42.085981+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 54.255.234.6 tidak diizinkan	143	\N	\N
ad86688d-65a9-4b1e-a6cc-3d9b30bbb3d2	2026-08-06 02:29:44.185028+00	\N	genshin-impact	854016571	os_asia	kokinpay	SUCCESS	L*****n	\N	1922	\N	\N
008b28ad-e48b-4715-a6dd-49f30e75ede5	2026-08-06 12:04:00.004676+00	\N	honor-of-kings/	3832563198081203267	\N	vip-reseller	FAILED	\N	IP 13.212.69.77 tidak diizinkan	122	\N	\N
41b4dd46-8408-4158-869c-67db94228bb6	2026-08-06 12:04:01.380849+00	\N	honor-of-kings/	3832563198081203267	\N	kokinpay	FAILED	\N	Game code tidak valid atau tidak tersedia	1233	\N	\N
7d5d3cdf-4d50-430b-aa92-640dc7ef9fbd	2026-08-06 12:04:01.53755+00	\N	honor-of-kings/	3832563198081203267	\N	rapidapi	FAILED	\N	RapidAPI HTTP Error: 404	23	\N	\N
7b341a13-7bc3-41af-8dbd-28ff619044f0	2026-08-06 12:04:53.09137+00	\N	honor-of-kings/	3832563198081203267	\N	vip-reseller	FAILED	\N	IP 13.212.69.77 tidak diizinkan	125	\N	\N
066da90b-edc6-4b6a-b1d2-9a1ecb6bbaec	2026-08-06 12:04:53.719681+00	\N	honor-of-kings/	3832563198081203267	\N	kokinpay	FAILED	\N	Game code tidak valid atau tidak tersedia	523	\N	\N
c2064780-6eae-4624-8498-88fa6b8b8cfb	2026-08-06 12:04:53.842556+00	\N	honor-of-kings/	3832563198081203267	\N	rapidapi	FAILED	\N	RapidAPI HTTP Error: 404	21	\N	\N
4423aa7b-1aff-48a9-b8da-6d575e25ff53	2026-08-07 09:31:12.416201+00	\N	honor-of-kings/	3832563198081203267	\N	vip-reseller	FAILED	\N	IP 52.221.238.31 tidak diizinkan	127	\N	\N
65295d89-993e-46e9-b491-c3cbbd3c2dd3	2026-08-07 09:31:13.715313+00	\N	honor-of-kings/	3832563198081203267	\N	kokinpay	FAILED	\N	Game code tidak valid atau tidak tersedia	1006	\N	\N
3d4b99be-6be3-495b-ade2-8fd104e9b724	2026-08-07 09:31:14.544843+00	\N	honor-of-kings/	3832563198081203267	\N	rapidapi	FAILED	\N	RapidAPI HTTP Error: 404	722	\N	\N
8c2d7866-befd-4796-af25-cd0a9197bb86	2026-08-08 07:31:34.302299+00	\N	pubgm	5295907539	\N	vip-reseller	FAILED	\N	IP 54.179.255.42 tidak diizinkan	140	\N	\N
b02679b6-ac9e-4b9f-ba6a-f7b737ba0abf	2026-08-08 07:31:36.713341+00	\N	pubg-mobile	5295907539	\N	kokinpay	SUCCESS	Ri'ot666	\N	2280	\N	\N
a156d32b-c796-453e-a201-be4c78dd3002	2026-08-08 07:33:59.581715+00	\N	mobile-legends	11280411561	3546	kokinpay	FAILED	\N	User ID atau Zone ID tidak ditemukan atau tidak valid	2731	\N	\N
20676995-6b51-436a-a31b-d5650071aab0	2026-08-08 07:33:59.837806+00	\N	mobile-legends	11280411561	3546	vip-reseller	FAILED	\N	IP 18.142.91.194 tidak diizinkan	143	\N	\N
df679e4c-51bb-4fe2-8240-587873544302	2026-08-08 07:34:02.891981+00	\N	cek_game_ml	11280411561	3546	rapidapi	SUCCESS	NOT FOUND	\N	2794	5	4
0a0214a3-dd72-4c7d-9f41-17efd5a3e4b9	2026-08-08 07:57:38.74661+00	\N	mobile-legends	11280411561	3546	kokinpay	FAILED	\N	User ID atau Zone ID tidak ditemukan atau tidak valid	2429	\N	\N
24ba8178-c1c4-4923-8393-9513fe2660de	2026-08-08 07:57:39.150089+00	\N	mobile-legends	11280411561	3546	vip-reseller	FAILED	\N	IP 54.151.138.48 tidak diizinkan	142	\N	\N
8a3a4c2c-1b34-4fb2-ba7f-3ebef6ea7a27	2026-08-08 07:57:41.808795+00	\N	cek_game_ml	11280411561	3546	rapidapi	SUCCESS	NOT FOUND	\N	2538	5	3
521ec219-ce08-4230-ad52-95f7aafc67db	2026-08-08 07:58:18.418847+00	\N	mobile-legends	1128041156	13546	kokinpay	SUCCESS	꧁Wong•Pusat꧂ (ID)	\N	2591	\N	\N
e3d160e1-add1-4aa2-a511-b4c2f5273ed5	2026-08-08 09:55:10.744145+00	\N	mobile-legends	1094577662	13398	kokinpay	SUCCESS	weyywii. (ID)	\N	3077	\N	\N
a8584f44-9991-43b3-9a88-b5794ddbfc52	2026-08-08 15:13:41.164606+00	\N	mobile-legends	547259384	3468	kokinpay	SUCCESS	pemilik+kembali. (PH)	\N	2278	\N	\N
b65028b1-e4ca-4175-a836-7e0e555a82e8	2026-08-08 18:07:31.870515+00	\N	mobile-legends	983841486	12931	kokinpay	SUCCESS	Hansenn. (ID)	\N	3285	\N	\N
0f4baa7d-d1a8-45fe-8596-a466c1053505	2026-08-08 18:21:19.897633+00	\N	mobile-legends	16764	1609080551	kokinpay	FAILED	\N	User ID atau Zone ID tidak ditemukan atau tidak valid	2757	\N	\N
e4f3508c-1252-4553-a8e1-66d366aa4558	2026-08-08 18:21:20.136368+00	\N	mobile-legends	16764	1609080551	vip-reseller	FAILED	\N	IP 3.1.202.168 tidak diizinkan	122	\N	\N
dc52ddd9-1945-4e8d-a6e8-a3e0b4789149	2026-08-08 18:21:23.167144+00	\N	cek_game_ml	16764	1609080551	rapidapi	SUCCESS	NOT FOUND	\N	2936	5	4
c178fcd2-760f-4b31-87cb-bbaadaee55d5	2026-08-08 18:23:08.518936+00	\N	mobile-legends	1609080551	16764	kokinpay	SUCCESS	Ahhhhh (ID)	\N	2300	\N	\N
bc611f13-5fa8-48f2-b7d2-01002274854d	2026-08-08 18:23:38.888412+00	\N	mobile-legends	1609080551	16764	kokinpay	SUCCESS	Ahhhhh (ID)	\N	2074	\N	\N
995f8282-8961-48a0-9fb8-d53f84415b3d	2026-08-08 18:53:29.850039+00	\N	mobile-legends	164722780	2826	kokinpay	SUCCESS	ダーリン (ID)	\N	2547	\N	\N
8b918508-524b-4e92-b695-2f4da9aeff82	2026-08-08 18:55:21.560987+00	\N	mobile-legends	164722780	2826	kokinpay	SUCCESS	ダーリン (ID)	\N	2506	\N	\N
f503d8f9-3d8a-4ec6-a39d-854ba98d8190	2026-08-09 04:35:47.75953+00	\N	mobile-legends	1438344507	14261	kokinpay	SUCCESS	SCoobyDOERTF4 (PH)	\N	2567	\N	\N
d24bba19-c7a4-4e91-b42f-7daee2ba02de	2026-08-09 04:39:02.317172+00	\N	mobile-legends	138085121815675	(15675)	kokinpay	FAILED	\N	User ID atau Zone ID tidak ditemukan atau tidak valid	3085	\N	\N
d196f0e0-02d6-44a9-b04b-f73b654f54bf	2026-08-09 04:39:03.582763+00	\N	mobile-legends	138085121815675	(15675)	vip-reseller	FAILED	\N	IP 18.143.196.252 tidak diizinkan	1145	\N	\N
b1ad01d7-b4ed-451b-8075-50c328563cb4	2026-08-09 04:39:03.72875+00	\N	cek_game_ml	138085121815675	(15675)	rapidapi	FAILED	\N	RapidAPI HTTP Error: 400	44	5	3
255ae711-66c2-431b-a890-6d8e850c1e93	2026-08-09 04:39:58.413453+00	\N	mobile-legends	1380851218	(15675)	kokinpay	FAILED	\N	User ID atau Zone ID tidak ditemukan atau tidak valid	2124	\N	\N
37c62238-8545-4019-9108-144b2bb3e24a	2026-08-09 04:39:58.64808+00	\N	mobile-legends	1380851218	(15675)	vip-reseller	FAILED	\N	IP 18.143.196.252 tidak diizinkan	112	\N	\N
9801d35f-8a92-44a6-b7bd-3bcf66288c7a	2026-08-09 04:39:58.792212+00	\N	cek_game_ml	1380851218	(15675)	rapidapi	FAILED	\N	RapidAPI HTTP Error: 400	36	5	2
6b7d917f-d4ff-4169-a00f-a2150519aaab	2026-08-09 04:48:23.629112+00	\N	mobile-legends	1167606198	13733	kokinpay	SUCCESS	4+U. (ID)	\N	2284	\N	\N
dc7b478d-225b-4d47-8ce9-9c8f9269b3c6	2026-08-09 05:24:13.541017+00	\N	mobile-legends	1380851218	(15675)	kokinpay	FAILED	\N	User ID atau Zone ID tidak ditemukan atau tidak valid	2881	\N	\N
d8d26a44-be25-484d-928b-706e2c03123c	2026-08-09 05:24:13.853801+00	\N	mobile-legends	1380851218	(15675)	vip-reseller	FAILED	\N	IP 13.212.128.225 tidak diizinkan	155	\N	\N
41f2cc39-b7a6-44e5-b0da-36a8674a4689	2026-08-09 05:24:14.020368+00	\N	cek_game_ml	1380851218	(15675)	rapidapi	FAILED	\N	RapidAPI HTTP Error: 400	39	5	1
5af30457-948e-4994-935a-32c6ba0d495c	2026-08-09 06:01:39.435604+00	\N	mobile-legends	462316045	2369	kokinpay	SUCCESS	INDUNG+SHUTDOWN+NPE (ID)	\N	2521	\N	\N
ee1b420c-f21e-4f40-ba05-f4933da96c94	2026-08-09 07:11:29.9412+00	\N	mobile-legends	145459677	2724	kokinpay	SUCCESS	OpungMedan03 (ID)	\N	2271	\N	\N
790cb4d1-991d-4863-835f-cc03771439cd	2026-08-09 07:11:57.204983+00	\N	mobile-legends	145459677	2724	kokinpay	SUCCESS	OpungMedan03 (ID)	\N	1963	\N	\N
66ea48d0-b161-433e-823e-53c44aef5e3d	2026-08-09 07:22:51.653321+00	\N	mobile-legends	1327858778	15479	kokinpay	SUCCESS	PremanLATEGAME (ID)	\N	2266	\N	\N
09c6318e-ae41-4a4e-9c35-aaeac090709c	2026-08-09 07:24:12.003505+00	\N	mobile-legends	1327858778	15479	kokinpay	SUCCESS	PremanLATEGAME (ID)	\N	3726	\N	\N
d8ebe7db-39b7-4457-b526-cc7bb7c83149	2026-08-09 07:24:39.370442+00	\N	mobile-legends	1327858778	15479	kokinpay	SUCCESS	PremanLATEGAME (ID)	\N	2175	\N	\N
c0dbde4a-5c3c-4ddd-b572-316b43ba7988	2026-08-09 07:31:12.408174+00	\N	mobile-legends	1741137838	18407	kokinpay	SUCCESS	One+Call+Away. (ID)	\N	2855	\N	\N
f5418dd4-2cff-49f0-a892-e758476bbf06	2026-08-09 08:17:17.927454+00	\N	mobile-legends	1611823465	16793	kokinpay	SUCCESS	Vyxx_ (ID)	\N	2313	\N	\N
15b66f9e-c50d-4610-8734-de51402ddd23	2026-08-09 08:20:42.677463+00	\N	mobile-legends	688278516	8733	kokinpay	SUCCESS	#@Oblivion_Slayer99+ (ID)	\N	2227	\N	\N
0a6f6564-e323-4425-93a2-d3007f50da48	2026-08-09 08:22:04.913059+00	\N	mobile-legends	1565182218	16564	kokinpay	SUCCESS	Y+A+N+Z+R+O♤ (ID)	\N	2791	\N	\N
fe05ea03-6fca-4788-8b59-454fed4fcafe	2026-08-09 09:04:46.94489+00	\N	mobile-legends	67965525	2119	kokinpay	SUCCESS	PapiNya+Keyraa (ID)	\N	2444	\N	\N
083f54bc-ac1a-414e-8d4c-75d326047300	2026-08-09 09:09:45.542977+00	\N	mobile-legends	448461216	2309	kokinpay	SUCCESS	納特|The+Emperor. (ID)	\N	2453	\N	\N
edd2d1b8-7b26-4cdd-a89c-3b1e2cf47be6	2026-08-09 09:22:25.805273+00	\N	mobile-legends	226281469	9178	kokinpay	SUCCESS	Super+Frince (ID)	\N	2346	\N	\N
7fdb73cd-5d8c-4074-99b1-3bd77165e2c9	2026-08-09 11:39:48.5939+00	\N	mobile-legends	1547782399	(11808)	kokinpay	FAILED	\N	User ID atau Zone ID tidak ditemukan atau tidak valid	3177	\N	\N
0ffc652b-3c62-4a1b-b97c-60b92b8a3fcb	2026-08-09 11:39:49.01568+00	\N	mobile-legends	1547782399	(11808)	vip-reseller	FAILED	\N	IP 13.212.177.72 tidak diizinkan	280	\N	\N
a1fb510b-f13f-4662-b94f-826797f7ab46	2026-08-09 11:39:49.287684+00	\N	cek_game_ml	1547782399	(11808)	rapidapi	FAILED	\N	RapidAPI HTTP Error: 400	175	5	0
749095bd-0884-460e-9b71-10299c900c28	2026-08-10 03:18:44.281077+00	\N	mobile-legends	2198456143	12797	kokinpay	SUCCESS	C+I+L+A (ID)	\N	3185	\N	\N
dc0e3f4e-6e37-42ed-8fe4-465f1797e816	2026-08-10 12:06:03.001776+00	\N	pubgm	52447564006	\N	vip-reseller	FAILED	\N	IP 13.229.106.11 tidak diizinkan	1179	\N	\N
6f5f9f5e-a0b7-4c2c-ab54-de1731f917d3	2026-08-10 12:06:07.109588+00	\N	pubg-mobile	52447564006	\N	kokinpay	SUCCESS	Kynaraaaゞ	\N	3962	\N	\N
33fa0084-24ea-4355-bd4a-2df0f58b98b4	2026-08-10 12:12:21.225007+00	\N	pubgm	52447564006	\N	vip-reseller	FAILED	\N	IP 54.151.211.192 tidak diizinkan	160	\N	\N
68f40d04-4d3b-4674-969b-7fa7d811a9d9	2026-08-10 12:12:22.777486+00	\N	pubg-mobile	52447564006	\N	kokinpay	SUCCESS	Kynaraaaゞ	\N	1430	\N	\N
0c90ab1f-40ae-4a04-b8ca-b9e883d2db7a	2026-08-11 14:17:34.654347+00	\N	mobile-legends	236438993	9251	kokinpay	SUCCESS	Iori.++Kitaharaメ (ID)	\N	3013	\N	\N
fdf683db-19a6-4a4a-80ed-7d5ed56a46af	2026-08-11 14:39:31.66799+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 114.10.69.184 tidak diizinkan	661	\N	\N
3f8695b7-6ec1-4b59-93f6-6d84238d813e	2026-08-11 14:39:33.654447+00	\N	genshin-impact	854016571	os_asia	kokinpay	SUCCESS	L*****n	\N	1803	\N	\N
e666676b-d4a2-48fb-ab32-2bbd244e85e1	2026-08-11 15:11:52.408979+00	\N	genshin-impact	854016571	os_asia	vip-reseller	FAILED	\N	IP 18.142.252.155 tidak diizinkan	123	\N	\N
b5e57e8a-dee9-4468-acf8-fcd2f3d64b05	2026-08-11 15:11:54.066115+00	\N	genshin-impact	854016571	os_asia	kokinpay	SUCCESS	L*****n	\N	1530	\N	\N
f79a3663-298b-4f75-9483-7cb28ee0bc42	2026-08-11 23:33:21.242652+00	\N	mobile-legends	45536295	2211	kokinpay	SUCCESS	Y+A+F+A+N+D+A (ID)	\N	2782	\N	\N
1cbc9002-3219-4252-8ac6-20545f0b3e37	2026-08-11 23:37:07.173361+00	\N	mobile-legends	45536295	2211	kokinpay	SUCCESS	Y+A+F+A+N+D+A (ID)	\N	2742	\N	\N
87fbafcc-6d22-427e-87a5-71ef92b9b2ab	2026-08-12 08:42:30.54643+00	\N	mobile-legends	582006032	10335	kokinpay	SUCCESS	CʜɪᴋᴀʟᴇᴛA (PH)	\N	2368	\N	\N
a199bb05-92a9-4c4c-ae5f-221a24f5f5b7	2026-08-12 11:14:15.402968+00	\N	mobile-legends	101106838	2518	kokinpay	SUCCESS	POK+AMI+AMI (ID)	\N	2354	\N	\N
ee345fd8-acc3-465c-8121-949526613c72	2026-08-12 12:52:11.00275+00	\N	mobile-legends	1147781104	13654	kokinpay	SUCCESS	(FIT) (ID)	\N	2408	\N	\N
652d3f1d-cd92-480e-bef7-6d965fb1569f	2026-08-12 13:02:51.519898+00	\N	mobile-legends	1147781104	13654	kokinpay	SUCCESS	(FIT) (ID)	\N	4174	\N	\N
56a96904-04b1-41ff-8c2f-b038d093a780	2026-08-12 13:05:30.591531+00	\N	mobile-legends	1147781104	13654	kokinpay	SUCCESS	(FIT) (ID)	\N	2062	\N	\N
e21ecd01-cdc7-45a7-add2-af15873e63bb	2026-08-13 13:03:00.900758+00	\N	mobile-legends	236438993	9251	kokinpay	SUCCESS	Iori.++Kitaharaメ (ID)	\N	2802	\N	\N
f44f919f-012b-4597-922c-0f40d27b970b	2026-08-14 06:14:34.450138+00	\N	pubgm	5123803649	\N	vip-reseller	FAILED	\N	IP 18.138.102.208 tidak diizinkan	125	\N	\N
8e5aeb8e-d926-4309-901a-bf767d3e2931	2026-08-14 06:14:37.8438+00	\N	pubg-mobile	5123803649	\N	kokinpay	SUCCESS	ムソイ・Devlin	\N	3220	\N	\N
0e7fe969-4037-4197-a9c7-7c5e1d383e1e	2026-08-14 12:20:31.355213+00	\N	mobile-legends	904979700	12589	kokinpay	SUCCESS	Max+Verstappen (ID)	\N	1985	\N	\N
fa485fe3-da93-41bf-89c9-f3c60c7973a7	2026-08-14 14:29:20.930007+00	\N	mobile-legends	135285403	2688	kokinpay	SUCCESS	Mr.+Veēy (ID)	\N	2328	\N	\N
f58529c5-837d-4d5b-9df4-a99ad7651071	2026-08-14 14:42:59.619737+00	\N	mobile-legends	598447497	8397	kokinpay	SUCCESS	MR.poseidon	\N	2293	\N	\N
9b17d617-7957-4d9f-b125-88795d3dbec8	2026-08-14 15:04:26.327712+00	\N	mobile-legends	47148012	2078	kokinpay	SUCCESS	SeanZ. (ID)	\N	2541	\N	\N
33dfff49-a13b-49c6-8a1c-159ac25ec333	2026-08-14 15:04:54.039015+00	\N	mobile-legends	2044749881	19575	kokinpay	SUCCESS	Triton (ID)	\N	2537	\N	\N
bc045749-62a6-4ccc-80fd-0188e2edcc5b	2026-08-14 15:12:04.538686+00	\N	mobile-legends	1448204652	16015	kokinpay	SUCCESS	유야산NPL (ID)	\N	2794	\N	\N
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (id, title, slug, content, image_url, author, is_published, created_at, tenant_id) FROM stdin;
e75ee5cb-2ece-4d93-a6d5-c850a156ae4f	Cara Daftar dan Aktivasi Akun di Website Yowana Store dengan Mudah	cara-daftar-dan-aktivasi-akun-di-website-yowana-store-dengan-mudah-9a145	<h1><b style=""><font color="#ffffff">Cara Daftar dan Aktivasi Akun di Website Yowana Store dengan Mudah</font></b></h1>\r\n\r\n<p><font color="#ffffff">\r\nBagi kamu yang baru pertama kali menggunakan Yowana Store, membuat akun merupakan langkah awal untuk menikmati berbagai fitur yang tersedia. Dengan memiliki akun, kamu dapat melakukan transaksi top up game dengan lebih praktis, melihat riwayat pembelian, mengikuti event bulanan, serta mendapatkan berbagai promo eksklusif.\r\n</font></p>	https://assets.newgamingstore.com/1785602684871-180704527-CARADAFTARDANAKTIVASIAKUNDIYOWANASTORE.webp	Admin	t	2026-08-01 16:44:45.921615+00	9a145561-8663-4b49-9d02-9a97c93ca322
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, icon_name, sort_order, created_at, is_active, tenant_id) FROM stdin;
7d8a34e8-ff61-44d1-af88-a83a311f746b	Top Up Games	top-up-games-9a145	Gamepad2	1	2026-08-01 16:14:57.683663+00	t	9a145561-8663-4b49-9d02-9a97c93ca322
73e3e549-b5ce-4993-a3ba-90f7fffc18d0	Specialist Mobile Legends	specialist-ml-9a145	Sparkles	2	2026-08-01 16:14:57.683663+00	f	9a145561-8663-4b49-9d02-9a97c93ca322
d77254a6-814e-44e2-9bc6-bb96245a12fd	Voucher & Tagihan	voucher-9a145	Ticket	3	2026-08-01 16:14:57.683663+00	f	9a145561-8663-4b49-9d02-9a97c93ca322
21cbb00f-1126-4d6a-ae1f-1f735a4b3845	E-Money	e-money-9a145	Wallet	4	2026-08-01 16:14:57.683663+00	f	9a145561-8663-4b49-9d02-9a97c93ca322
2283d4ad-8a3c-4d10-a75b-6100f433bcf6	Pulsa & Masa Aktif	pulsa-9a145	Globe	5	2026-08-01 16:14:57.683663+00	f	9a145561-8663-4b49-9d02-9a97c93ca322
bd58fbf9-4e25-471f-bed6-b41e1ed90170	Streaming App	streaming-9a145	Tv	6	2026-08-01 16:14:57.683663+00	f	9a145561-8663-4b49-9d02-9a97c93ca322
900c4460-c91d-4b16-be7d-dc084a365c68	Via Login	via-login-9a145	Flame	7	2026-08-01 16:14:57.683663+00	f	9a145561-8663-4b49-9d02-9a97c93ca322
69c2e769-e8bf-4e14-80e7-095ace81d26c	Top Up Games	top-up-games-a4604	Gamepad2	1	2026-08-01 16:14:57.683663+00	t	a4604e46-0d88-4a16-8e4a-ce6588bf8523
04b83348-c501-4baa-9bd4-52af677d9a86	Specialist Mobile Legends	specialist-ml-a4604	Sparkles	2	2026-08-01 16:14:57.683663+00	f	a4604e46-0d88-4a16-8e4a-ce6588bf8523
919d7020-4224-45a9-a885-ae37af3e703d	Voucher & Tagihan	voucher-a4604	Ticket	3	2026-08-01 16:14:57.683663+00	f	a4604e46-0d88-4a16-8e4a-ce6588bf8523
4e651235-08ee-496f-a16b-165587b959bd	E-Money	e-money-a4604	Wallet	4	2026-08-01 16:14:57.683663+00	f	a4604e46-0d88-4a16-8e4a-ce6588bf8523
deae2313-5a4e-422b-95da-4bac8fcb7098	Pulsa & Masa Aktif	pulsa-a4604	Globe	5	2026-08-01 16:14:57.683663+00	f	a4604e46-0d88-4a16-8e4a-ce6588bf8523
9f36382a-a1f9-4c42-9be4-e0483c19445a	Streaming App	streaming-a4604	Tv	6	2026-08-01 16:14:57.683663+00	f	a4604e46-0d88-4a16-8e4a-ce6588bf8523
6eb1bf4e-0167-40a6-b7f1-9a80ccf1d7b6	Via Login	via-login-a4604	Flame	7	2026-08-01 16:14:57.683663+00	f	a4604e46-0d88-4a16-8e4a-ce6588bf8523
\.


--
-- Data for Name: deposits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deposits (id, invoice_id, customer_email, wa_number, amount, payment_channel_id, status, payment_proof_url, created_at, metadata, tenant_id) FROM stdin;
b7f0a48d-c73c-4348-9519-570ee96af5f1	DEP260802126035	testing21@gmail.com		50000	\N	Success	https://assets.newgamingstore.com/1785674334776-712136682-Galaxy-S25-Ultra-Audio-Eraser-Galaxy-AI-1200x674.jpg	2026-08-02 12:38:37.25078+00	{}	9a145561-8663-4b49-9d02-9a97c93ca322
77f4fb5a-6377-4bef-a685-01e66ed528b9	DEP260802432988	testing21@gmail.com		100000	\N	Success	https://assets.newgamingstore.com/1785675201108-150470093-935-BCW5_2_1.jpg	2026-08-02 12:53:04.651692+00	{}	9a145561-8663-4b49-9d02-9a97c93ca322
bb6669ed-06e1-42c4-8f1e-3312969143e0	DEP260802398261	testing21@gmail.com		1000000	\N	Success	https://assets.newgamingstore.com/1785681137914-127318469-MSIM4312-2.jpg	2026-08-02 14:31:59.07115+00	{}	9a145561-8663-4b49-9d02-9a97c93ca322
1bb4af14-6835-466c-84b7-687c4ac8b7ad	UPG-MSBX0VXHAUVGS	testing21@gmail.com	\N	300000	\N	Success	https://assets.newgamingstore.com/1785682137960-931785019-ryan.jpg	2026-08-02 14:48:32.276312+00	{}	9a145561-8663-4b49-9d02-9a97c93ca322
ac854b4c-b813-4fe3-8cb7-471cca0c0828	UPG-MSBXKWB4P9I5R	testing21@gmail.com	\N	300000	\N	Success	https://assets.newgamingstore.com/1785683056358-4203234-FIFAMobile_Helper-6b86-original.jpeg	2026-08-02 15:04:05.977175+00	{"type": "UPGRADE", "package_name": "Platinum"}	9a145561-8663-4b49-9d02-9a97c93ca322
785288a5-a2a5-4c35-a830-fad463244cf5	DEP260805955359	0812232323	0812232323	50000	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	Pending	\N	2026-08-05 02:03:11.973278+00	{}	\N
42b7ca87-489b-492f-a3b4-bf69cb1f16f2	DEP260805143004	lavien21@gmail.com	0812232333	50000	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	Pending	\N	2026-08-05 02:04:52.194852+00	{}	\N
c15c9060-252a-4106-a617-a46c302a347c	DEP260805219952	0812232323	0812232323	500000	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	Pending	\N	2026-08-05 02:21:00.816263+00	{}	9a145561-8663-4b49-9d02-9a97c93ca322
6194ece8-f52b-461f-9af0-f34d1d1eb4cf	UPG-MSFGTBT0YYGPU	lavien21@a4604e46-0d88-4a16-8e4a-ce6588bf8523.member	0812323233	300000	aba89adc-2dcf-4928-920e-837cba415e85	Pending	\N	2026-08-05 02:25:50.392313+00	{"type": "UPGRADE", "package_name": "Platinum"}	a4604e46-0d88-4a16-8e4a-ce6588bf8523
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, question, answer, sort_order, is_active, created_at, tenant_id) FROM stdin;
e1416bfc-86eb-41d4-b721-d84517e16d9c	Game apa saja yang bisa di top up?	Kami menyediakan hampir semua game populer seperti Mobile Legends, Free Fire, PUBG Mobile, Valorant, Genshin Impact, Honor of Kings, Point Blank, dan juga voucher digital lainnya.	3	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
99f4dfd0-27c7-4aa2-880a-5a14e63584b8	Bagaimana jika top up saya belum masuk?	Jangan panik. Pertama, cek status transaksi di menu "Cek Pesanan". Jika status "Sukses" tapi belum masuk, coba relogin game kamu. Jika masih terkendala, hubungi Customer Service kami via WhatsApp dengan menyertakan Invoice ID.	4	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
8ccc3132-3f87-4b5c-99a1-8ba777acfa97	Bagaimana cara melakukan top up?	1. Pilih game yang ingin kamu top up.\\n2. Masukkan User ID game kamu.\\n3. Pilih nominal dagangan yang diinginkan.\\n4. Pilih metode pembayaran.\\n5. Selesaikan pembayaran dan diamond akan otomatis masuk.	5	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
d5e14748-b622-40bf-a96f-1b1c11a2753b	Apakah bisa refund jika transaksi gagal?	Tentu. Jika transaksi dinyatakan gagal oleh sistem karena kesalahan jaringan atau stok kosong, saldo akan dikembalikan ke akun kamu (jika member) atau kami proses refund manual ke rekening pengirim.	6	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
478207e2-80ae-46ca-b5a1-431d1724e101	Apa itu NewGamingStore?	NewGamingStore adalah platform top up game termurah dan terpercaya di Indonesia. Kami menyediakan layanan isi ulang kredit game secara otomatis 24 jam non-stop dengan proses detik.	1	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
b2aff6d6-152f-4fc0-8a02-e357640d9dd8	Apakah NewGamingStore aman dan terpercaya?	Tentu saja! Kami menggunakan sistem keamanan tingkat tinggi dan semua transaksi diproses secara transparan. Ribuan gamer telah mempercayakan top-up mereka kepada kami.	2	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
17302faa-71b0-4540-9b57-d9a513f036c4	Apa saja metode pembayaran yang tersedia?	Sangat lengkap! Kamu bisa membayar via QRIS (DANA, OVO, Gopay, ShopeePay), Transfer Bank (BCA, Mandiri, BRI, BNI), hingga pembayaran tunai melalui Alfamart dan Indomaret.	7	t	2026-08-02 14:45:27.2898+00	9a145561-8663-4b49-9d02-9a97c93ca322
8d39f8a7-bfbb-420f-8204-602e63f8f6ec	Apa keuntungan jadi Member NewGamingStore?	Keuntungan jadi member:\r\nHarga lebih murah (Harga Reseller/Member).\r\nTidak perlu input ulang data saat transaksi.\r\nAkses riwayat transaksi lengkap.\r\nMendapatkan poin reward (jika event berlaku).	8	t	2026-08-02 14:45:54.148681+00	9a145561-8663-4b49-9d02-9a97c93ca322
da7d1653-414e-4c94-a993-1676d332bf48	Game apa saja yang bisa di top up?	Kami menyediakan hampir semua game populer seperti Mobile Legends, Free Fire, PUBG Mobile, Valorant, Genshin Impact, Honor of Kings, Point Blank, dan juga voucher digital lainnya.	3	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
d39c0832-ebd2-4447-a630-6dd1432a1242	Bagaimana jika top up saya belum masuk?	Jangan panik. Pertama, cek status transaksi di menu "Cek Pesanan". Jika status "Sukses" tapi belum masuk, coba relogin game kamu. Jika masih terkendala, hubungi Customer Service kami via WhatsApp dengan menyertakan Invoice ID.	4	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
45a6ccc6-6d35-4cc2-a6d5-18bd541fe708	Bagaimana cara melakukan top up?	1. Pilih game yang ingin kamu top up.\\n2. Masukkan User ID game kamu.\\n3. Pilih nominal dagangan yang diinginkan.\\n4. Pilih metode pembayaran.\\n5. Selesaikan pembayaran dan diamond akan otomatis masuk.	5	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
537cb724-0f1c-4ae0-89e7-1a058fdb5971	Apakah bisa refund jika transaksi gagal?	Tentu. Jika transaksi dinyatakan gagal oleh sistem karena kesalahan jaringan atau stok kosong, saldo akan dikembalikan ke akun kamu (jika member) atau kami proses refund manual ke rekening pengirim.	6	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
d787ceb4-8b8e-4aab-98ae-81c76c327cf0	Apa itu NewGamingStore?	NewGamingStore adalah platform top up game termurah dan terpercaya di Indonesia. Kami menyediakan layanan isi ulang kredit game secara otomatis 24 jam non-stop dengan proses detik.	1	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
ab3397a3-b4c2-4fd2-acf3-a3353443cb97	Apakah NewGamingStore aman dan terpercaya?	Tentu saja! Kami menggunakan sistem keamanan tingkat tinggi dan semua transaksi diproses secara transparan. Ribuan gamer telah mempercayakan top-up mereka kepada kami.	2	t	2026-08-01 16:50:14.685776+00	9a145561-8663-4b49-9d02-9a97c93ca322
d660d121-5534-45df-a436-1df9a40f5ff1	Apa saja metode pembayaran yang tersedia?	Sangat lengkap! Kamu bisa membayar via QRIS (DANA, OVO, Gopay, ShopeePay), Transfer Bank (BCA, Mandiri, BRI, BNI), hingga pembayaran tunai melalui Alfamart dan Indomaret.	7	t	2026-08-02 14:45:27.2898+00	9a145561-8663-4b49-9d02-9a97c93ca322
51687036-60fe-434d-84df-475af6b45dc3	Apa keuntungan jadi Member NewGamingStore?	Keuntungan jadi member:\r\nHarga lebih murah (Harga Reseller/Member).\r\nTidak perlu input ulang data saat transaksi.\r\nAkses riwayat transaksi lengkap.\r\nMendapatkan poin reward (jika event berlaku).	8	t	2026-08-02 14:45:54.148681+00	9a145561-8663-4b49-9d02-9a97c93ca322
0c7f5d2f-0f92-4dad-a3ee-fc7dfbfd307f	Game apa saja yang bisa di top up?	Kami menyediakan hampir semua game populer seperti Mobile Legends, Free Fire, PUBG Mobile, Valorant, Genshin Impact, Honor of Kings, Point Blank, dan juga voucher digital lainnya.	3	t	2026-08-01 16:50:14.685776+00	a4604e46-0d88-4a16-8e4a-ce6588bf8523
11fda05c-0050-4380-9378-9e3b45245697	Bagaimana jika top up saya belum masuk?	Jangan panik. Pertama, cek status transaksi di menu "Cek Pesanan". Jika status "Sukses" tapi belum masuk, coba relogin game kamu. Jika masih terkendala, hubungi Customer Service kami via WhatsApp dengan menyertakan Invoice ID.	4	t	2026-08-01 16:50:14.685776+00	a4604e46-0d88-4a16-8e4a-ce6588bf8523
50765414-a169-4a21-8285-7858d6066f22	Bagaimana cara melakukan top up?	1. Pilih game yang ingin kamu top up.\\n2. Masukkan User ID game kamu.\\n3. Pilih nominal dagangan yang diinginkan.\\n4. Pilih metode pembayaran.\\n5. Selesaikan pembayaran dan diamond akan otomatis masuk.	5	t	2026-08-01 16:50:14.685776+00	a4604e46-0d88-4a16-8e4a-ce6588bf8523
e54e09d2-8b70-4472-8c0b-1a94189262e3	Apakah bisa refund jika transaksi gagal?	Tentu. Jika transaksi dinyatakan gagal oleh sistem karena kesalahan jaringan atau stok kosong, saldo akan dikembalikan ke akun kamu (jika member) atau kami proses refund manual ke rekening pengirim.	6	t	2026-08-01 16:50:14.685776+00	a4604e46-0d88-4a16-8e4a-ce6588bf8523
0aff8ce6-b41c-4e72-bab0-e61d969defee	Apa itu NewGamingStore?	NewGamingStore adalah platform top up game termurah dan terpercaya di Indonesia. Kami menyediakan layanan isi ulang kredit game secara otomatis 24 jam non-stop dengan proses detik.	1	t	2026-08-01 16:50:14.685776+00	a4604e46-0d88-4a16-8e4a-ce6588bf8523
4ce14e6b-a0dd-4af7-b4c2-869870d10d5e	Apakah NewGamingStore aman dan terpercaya?	Tentu saja! Kami menggunakan sistem keamanan tingkat tinggi dan semua transaksi diproses secara transparan. Ribuan gamer telah mempercayakan top-up mereka kepada kami.	2	t	2026-08-01 16:50:14.685776+00	a4604e46-0d88-4a16-8e4a-ce6588bf8523
ccb2ba11-13e1-4845-ac88-69f87682ed78	Apa saja metode pembayaran yang tersedia?	Sangat lengkap! Kamu bisa membayar via QRIS (DANA, OVO, Gopay, ShopeePay), Transfer Bank (BCA, Mandiri, BRI, BNI), hingga pembayaran tunai melalui Alfamart dan Indomaret.	7	t	2026-08-02 14:45:27.2898+00	a4604e46-0d88-4a16-8e4a-ce6588bf8523
cd1d548e-bea3-4f14-b3fd-81695b42d3ee	Apa keuntungan jadi Member NewGamingStore?	Keuntungan jadi member:\r\nHarga lebih murah (Harga Reseller/Member).\r\nTidak perlu input ulang data saat transaksi.\r\nAkses riwayat transaksi lengkap.\r\nMendapatkan poin reward (jika event berlaku).	8	t	2026-08-02 14:45:54.148681+00	a4604e46-0d88-4a16-8e4a-ce6588bf8523
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (id, name, slug, image_url, form_fields, created_at, developer, background_image, category_id, is_popular, topup_instructions, guide_image_url, guide_text, tenant_id, has_username_validator, validator_provider, validator_game_code, provider_code_overrides, sort_order) FROM stdin;
5f34e657-004e-47f1-bd25-3828eab68414	Call Of Duty Mobile	codm	https://assets.newgamingstore.com/1785645982923-96548894-Call_of_Duty_Mobile_characters_202608021143_11zon.webp	[{"name": "openID", "type": "text", "label": "Open ID", "required": true}]	2026-08-02 04:46:24.61826+00	TIMI STUDIO GRUOP	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	\N	t	Top Up Call of Duty Mobile :\r\n1. Masukkan Open ID\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Klik Order Now & lakukan Pembayaran\r\n5. CP masuk otomatis ke akun Anda	https://assets.newgamingstore.com/1785678997201-727447230-Halper_CODM-b977.webp	Untuk menemukan PlayerID Anda, klik ikon 'settings' yang terletak di sebelah kanan layar dan klik tab 'LEGAL AND PRIVCY', Anda dapat menemukan PlayerID Anda di sini.	\N	f	\N	\N	{}	0
86098d19-4024-47c6-8bd9-b16780a3ea8e	FC Mobile	fc-mobile-9a145	https://assets.newgamingstore.com/1785766482906-606656173-Replace_Vinicius_JR_with_Lamine_202608032101-2.jpeg	[{"name": "userId", "type": "text", "label": "User ID", "required": true}]	2026-08-02 04:35:16.572891+00	EA SPORTS	https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp	7d8a34e8-ff61-44d1-af88-a83a311f746b	t	Top up FC Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785679184613-438407231-FIFAMobile_Helper-6b86-original.jpeg	Untuk mengetahui User ID Anda, silakan klik menu profile dibagian kiri atas pada menu utama game. User ID akan terlihat dibagian bawah Nama Karakter Game Anda. Silakan masukkan User ID Anda untuk menyelesaikan transaksi. Contoh : 12345678(1234).	9a145561-8663-4b49-9d02-9a97c93ca322	f	\N	\N	{}	6
2ebd3b44-5b14-45bb-8bd8-786afbc14670	Honor Of Kings	hok-9a145	https://assets.newgamingstore.com/1785643240561-131792648-honor-of-king.webp	[{"name": "userId", "type": "number", "label": "User ID", "required": true}]	2026-07-31 16:16:12.345877+00	Tencents	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	7d8a34e8-ff61-44d1-af88-a83a311f746b	t	Beli top up diamond Honor Of Kings harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup MLBB :\r\n1) Masukkan Data Akun\r\n2) Pilih Nominal\r\n3) Pilih Pembayaran\r\n4) Masukkan Kode Promo (jika ada)\r\n5) Isi Detail Kontak\r\n6) Klik Pesan Sekarang dan lakukan Pembayaran\r\n7) Selesai	https://assets.newgamingstore.com/1785679337424-711196702-hokhelper-3df1-original.webp	ID berupa angka, bukan nickname !! Contoh : 12345678910111213	9a145561-8663-4b49-9d02-9a97c93ca322	f	\N	\N	{}	8
a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	Valorant	valorant-9a145	https://assets.newgamingstore.com/1785645451915-504135596-Woman_pointing_gun_Valorant_logo_202608021132_11zon.webp	[{"name": "userId", "type": "text", "label": "Riot ID", "required": true}]	2026-08-02 04:37:32.915347+00	RIOT GAMES	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	7d8a34e8-ff61-44d1-af88-a83a311f746b	t	Top up point Valorant harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785679080109-256099176-valorant-top-up-points-guide.jpg	Contoh : usernamekamu#123	9a145561-8663-4b49-9d02-9a97c93ca322	f	\N	\N	{}	1
ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	Call Of Duty Mobile	codm-9a145	https://assets.newgamingstore.com/1785645982923-96548894-Call_of_Duty_Mobile_characters_202608021143_11zon.webp	[{"name": "openID", "type": "text", "label": "Open ID", "required": true}]	2026-08-02 04:46:24.61826+00	TIMI STUDIO GRUOP	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	7d8a34e8-ff61-44d1-af88-a83a311f746b	t	Top Up Call of Duty Mobile :\r\n1. Masukkan Open ID\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Klik Order Now & lakukan Pembayaran\r\n5. CP masuk otomatis ke akun Anda	https://assets.newgamingstore.com/1785678997201-727447230-Halper_CODM-b977.webp	Untuk menemukan PlayerID Anda, klik ikon 'settings' yang terletak di sebelah kanan layar dan klik tab 'LEGAL AND PRIVCY', Anda dapat menemukan PlayerID Anda di sini.	9a145561-8663-4b49-9d02-9a97c93ca322	t	auto	cod-mobile	{}	3
5869ed06-5786-4684-b8ed-1484c3c410f4	PUBG Mobile	pubg-mobile-9a145	https://assets.newgamingstore.com/1785645373711-11502655-Man_saluting_with_game_logo_202608021129_11zon.jpeg	[{"name": "userId", "type": "text", "label": "ID", "required": true}]	2026-08-02 04:36:14.6117+00	Tencents	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	7d8a34e8-ff61-44d1-af88-a83a311f746b	t	Top up UC PUBG Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup PUBGM :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785679135518-339295110-pubg-mobile-guide.jpg	Untuk menemukan ID Karakter Anda, masuk ke akun Anda di aplikasi. Klik avatar yang terletak di pojok kiri atas layar utama. Anda dapat menemukan ID Karakter Anda tepat di bawah profil Anda	9a145561-8663-4b49-9d02-9a97c93ca322	t	auto	pubgm	{}	5
9080ff51-f599-450f-9fde-ef81fa7dd557	Heartopia	heartopia-9a145	https://assets.newgamingstore.com/1785646904466-194849548-Heartopia_characters_in_town_202608021200_11zon.webp	[{"name": "userId", "type": "text", "label": "User ID", "required": true}]	2026-08-02 05:01:47.081084+00	XD Entertaiment	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	7d8a34e8-ff61-44d1-af88-a83a311f746b	t	\N	\N	\N	9a145561-8663-4b49-9d02-9a97c93ca322	f	\N	\N	{}	4
b0af1dd3-f015-44b6-be4e-ba57b015a7c4	Mobile Legends	mobile-legends-9a145	https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg	[{"name": "userId", "type": "number", "label": "User ID", "required": true}, {"name": "serverID", "type": "text", "label": "Masukkan Server", "required": true}]	2026-08-02 04:09:06.314145+00	Moonton	https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp	7d8a34e8-ff61-44d1-af88-a83a311f746b	t	Beli top up ML diamond Mobile Legends dan Weekly Diamond Pass harga MLBB paling murah, aman, cepat, dan terpercaya.\r\n\r\n\r\n\r\nCara topup MLBB :\r\n1. Masukkan Data Akun\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Masukkan Kode Promo (jika ada)\r\n5. Isi Detail Kontak\r\n6. Klik Pesan Sekarang dan lakukan Pembayaran\r\n7. Selesai	https://assets.newgamingstore.com/1785679277302-580417955-MASUKANIDSERVERTANPACONTOH12345612341080x400piksel12.webp	Untuk menemukan ID Pengguna Anda, klik avatar Anda di pojok kiri atas layar dan buka tab Info Umum. Contoh: 12345678 (1234).	9a145561-8663-4b49-9d02-9a97c93ca322	t	auto	cek_game_ml	{}	7
747a8732-b175-4ed2-bcd1-f498fc62f63a	Valorant	valorant-a4604	https://assets.newgamingstore.com/1785645451915-504135596-Woman_pointing_gun_Valorant_logo_202608021132_11zon.webp	[{"name": "userId", "type": "text", "label": "Riot ID", "required": true}]	2026-08-02 04:37:32.915347+00	RIOT GAMES	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	f	Top up point Valorant harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785679080109-256099176-valorant-top-up-points-guide.jpg	Contoh : usernamekamu#123	a4604e46-0d88-4a16-8e4a-ce6588bf8523	t	auto	valorant	{}	4
10c1b9d4-7197-4464-bf9f-ee710c1f0180	PUBG Mobile	pubg-mobile-a4604	https://assets.newgamingstore.com/1785645373711-11502655-Man_saluting_with_game_logo_202608021129_11zon.jpeg	[{"name": "userId", "type": "text", "label": "ID", "required": true}]	2026-08-02 04:36:14.6117+00	Tencents	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	f	Top up UC PUBG Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup PUBGM :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785679135518-339295110-pubg-mobile-guide.jpg	Untuk menemukan ID Karakter Anda, masuk ke akun Anda di aplikasi. Klik avatar yang terletak di pojok kiri atas layar utama. Anda dapat menemukan ID Karakter Anda tepat di bawah profil Anda	a4604e46-0d88-4a16-8e4a-ce6588bf8523	t	auto	pubgm	{}	5
5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	Honor Of Kings	hok	https://assets.newgamingstore.com/1785643240561-131792648-honor-of-king.webp	[{"name": "userId", "type": "number", "label": "User ID", "required": true}]	2026-07-31 16:16:12.345877+00	Tencents	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	\N	t	Beli top up diamond Honor Of Kings harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup MLBB :\r\n1) Masukkan Data Akun\r\n2) Pilih Nominal\r\n3) Pilih Pembayaran\r\n4) Masukkan Kode Promo (jika ada)\r\n5) Isi Detail Kontak\r\n6) Klik Pesan Sekarang dan lakukan Pembayaran\r\n7) Selesai	https://assets.newgamingstore.com/1785679337424-711196702-hokhelper-3df1-original.webp	ID berupa angka, bukan nickname !! Contoh : 12345678910111213	\N	f	\N	\N	{}	0
230fcf75-22f7-4cb9-a194-ca0378b9437c	Valorant	valorant	https://assets.newgamingstore.com/1785645451915-504135596-Woman_pointing_gun_Valorant_logo_202608021132_11zon.webp	[{"name": "userId", "type": "text", "label": "Riot ID", "required": true}]	2026-08-02 04:37:32.915347+00	RIOT GAMES	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	\N	t	Top up point Valorant harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785679080109-256099176-valorant-top-up-points-guide.jpg	Contoh : usernamekamu#123	\N	f	\N	\N	{}	0
2b5be999-9dbe-4ea7-aa25-09babf741860	PUBG Mobile	pubg-mobile	https://assets.newgamingstore.com/1785645373711-11502655-Man_saluting_with_game_logo_202608021129_11zon.jpeg	[{"name": "userId", "type": "text", "label": "ID", "required": true}]	2026-08-02 04:36:14.6117+00	Tencents	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	\N	t	Top up UC PUBG Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup PUBGM :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785679135518-339295110-pubg-mobile-guide.jpg	Untuk menemukan ID Karakter Anda, masuk ke akun Anda di aplikasi. Klik avatar yang terletak di pojok kiri atas layar utama. Anda dapat menemukan ID Karakter Anda tepat di bawah profil Anda	\N	f	\N	\N	{}	0
c12f54ca-3a23-4265-9c58-9d3eb4056c4d	Heartopia	heartopia-a4604	https://assets.newgamingstore.com/1785646904466-194849548-Heartopia_characters_in_town_202608021200_11zon.webp	[{"name": "userId", "type": "text", "label": "User ID", "required": true}]	2026-08-02 05:01:47.081084+00	XD Entertaiment	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	f				a4604e46-0d88-4a16-8e4a-ce6588bf8523	f	\N	\N	{}	9
a8e80afd-9b72-4088-b49d-52de3687d936	Roblox	roblox-a4604	https://assets.newgamingstore.com/1785770216778-162483417-Roblox_characters_celebrating_to_202608032216-2.jpeg	[{"name": "userName", "type": "text", "label": "Username", "required": true}]	2026-07-31 16:15:52.077503+00	Roblox Corporation	https://assets.newgamingstore.com/1785644307247-20395277-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	t	Cara Top-Up Rooblox Via Username ,Proses Instant 1-5 menit\r\n\r\n1)Masukkan Username\r\n2)Pilih Nominal Robux\r\n3)Pilih Metode 4Pembayaran\r\n5)Tulis nomor WhatsApp\r\n6)Klik Order Now& lakukan Pembayaran\r\n7)Robux masuk otomatis ke akun Anda		Masukkan username, password, dan kode backup dengan benar.	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f	auto	\N	{}	2
a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	FC Mobile	fc-mobile	https://assets.newgamingstore.com/1785645315122-404379389-Soccer_player_in_uniform_purple_202608021124_11zon.webp	[{"name": "userId", "type": "text", "label": "User ID", "required": true}]	2026-08-02 04:35:16.572891+00	EA SPORTS	https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp	\N	t	Top up FC Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785679184613-438407231-FIFAMobile_Helper-6b86-original.jpeg	Untuk mengetahui User ID Anda, silakan klik menu profile dibagian kiri atas pada menu utama game. User ID akan terlihat dibagian bawah Nama Karakter Game Anda. Silakan masukkan User ID Anda untuk menyelesaikan transaksi. Contoh : 12345678(1234).	\N	f	\N	\N	{}	0
484efde9-c89d-4954-afc6-3cd4d4d425f9	Genshin Impact	genshin-impact	https://assets.newgamingstore.com/1785646055780-509961279-Genshin_Impact_characters_purple_202608021146-2.webp	[{"name": "userId", "type": "text", "label": "User ID", "required": true, "placeholder": "Masukkan User ID"}, {"name": "server", "type": "select", "label": "Server", "options": [{"label": "Asia", "value": "os_asia"}, {"label": "Europe", "value": "os_euro"}, {"label": "America", "value": "os_usa"}, {"label": "TW, HK, MO", "value": "os_cht"}], "required": true}]	2026-08-02 04:47:36.893054+00	HOYOVERSE	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	\N	t	Top up crystal Genshin Impact harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785650419059-215045937-Helper_Genshin_Impact-1b1082-1.webp	Contoh : UID = 123456789, Server = Asia	\N	f	\N	\N	{}	0
edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	Mobile Legends	mobile-legends	https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg	[{"name": "userId", "type": "number", "label": "User ID", "required": true}, {"name": "serverID", "type": "text", "label": "Masukkan Server", "required": true}]	2026-08-02 04:09:06.314145+00	Moonton	https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp	\N	t	Beli top up ML diamond Mobile Legends dan Weekly Diamond Pass harga MLBB paling murah, aman, cepat, dan terpercaya.\r\n\r\n\r\n\r\nCara topup MLBB :\r\n1. Masukkan Data Akun\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Masukkan Kode Promo (jika ada)\r\n5. Isi Detail Kontak\r\n6. Klik Pesan Sekarang dan lakukan Pembayaran\r\n7. Selesai	https://assets.newgamingstore.com/1785679277302-580417955-MASUKANIDSERVERTANPACONTOH12345612341080x400piksel12.webp	Untuk menemukan ID Pengguna Anda, klik avatar Anda di pojok kiri atas layar dan buka tab Info Umum. Contoh: 12345678 (1234).	\N	f	\N	\N	{}	0
f8c0eb61-2286-4f83-b8c8-f4b014a94f2c	Heartopia	heartopia	https://assets.newgamingstore.com/1785646904466-194849548-Heartopia_characters_in_town_202608021200_11zon.webp	[{"name": "userId", "type": "text", "label": "User ID", "required": true}]	2026-08-02 05:01:47.081084+00	XD Entertaiment	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	\N	t	\N	\N	\N	\N	f	\N	\N	{}	0
980e361b-1ba2-471e-9967-54a5ed1f8fce	Roblox	roblox	https://assets.newgamingstore.com/1785643214021-467878991-Roblox_characters_celebrating_wi_202608021058.jpeg	[{"name": "userName", "type": "text", "label": "Username", "required": true}, {"name": "password", "type": "text", "label": "Password", "required": true}, {"name": "backupCode", "type": "text", "label": "Masukkan Backup Code", "required": true}]	2026-07-31 16:15:52.077503+00	Moonton	https://assets.newgamingstore.com/1785644307247-20395277-Anime_gamer_holding_controllers_202608021117_11zon.webp	\N	t	Top up Robux Roblox dengan harga paling murah, aman, cepat, dan terpercaya hanya di NEW GAMING STORE.\r\nCara topup Robux Roblox Via Login:\r\n\r\nPilih Nominal\r\nMasukkan Username dan Password Roblox kamu\r\nTentukan Jumlah Pembelian\r\nPilih Pembayaran\r\nMasukkan Kode Promo (jika ada)\r\nIsi Detail Kontak (Pastikan nomer whatsapp sudah benar! )\r\nKlik Pesan Sekarang dan lakukan Pembayaran\r\nPesanan akan proses sesuai urutan\r\nDone\r\n\r\nInfo tambahan khusus Produk Roblox :\r\n* Pesanan kamu diproses sesuai urutan, bisa sangat cepat, bisa sedikit lama. tergantung banyaknya antrian pada saat kamu membeli!\r\njangan khawatir, pesanan kamu tetap akan diproses, tidak perlu spam chat ya! 🚫\r\nSambil menunggu antrian, kamu boleh login dan memainkan game nya kok, tidak akan nabrak.\r\n\r\n* Jam kerja admin VIA LOGIN adalah dari jam 08:00 Pagi - 23:00 \r\nOrder di atas jam 00:00 akan mulai diproses pagi hari pada awal jam kerja / 08:00 WIB (sesuai urutan orderan)		Masukkan username, password, dan kode backup dengan benar.	\N	f	\N	\N	{}	0
7485df14-c3e2-42e1-8d6b-dcc4a09e64a5	Genshin Impact	genshin-impact-a4604	https://assets.newgamingstore.com/1785646055780-509961279-Genshin_Impact_characters_purple_202608021146-2.webp	[{"name": "userId", "type": "text", "label": "UID", "required": true, "placeholder": "Masukkan UID"}, {"name": "server", "type": "select", "label": "Server", "options": [{"label": "Asia", "value": "os_asia"}, {"label": "Europe", "value": "os_euro"}, {"label": "America", "value": "os_usa"}, {"label": "TW, HK, MO", "value": "os_cht"}], "required": true}]	2026-08-02 04:47:36.893054+00	HOYOVERSE	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	f	Top up crystal Genshin Impact harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Masukkan UID\r\n2) Pilih Nominal\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran	https://assets.newgamingstore.com/1785650419059-215045937-Helper_Genshin_Impact-1b1082-1.webp	Contoh : UID = 123456789, Server = Asia	a4604e46-0d88-4a16-8e4a-ce6588bf8523	t	auto	genshin-impact	{}	7
7110c289-7bbf-44f3-8d99-c5cd0a547e4d	Genshin Impact	genshin-impact-9a145	https://assets.newgamingstore.com/1785646055780-509961279-Genshin_Impact_characters_purple_202608021146-2.webp	[{"name": "userId", "type": "text", "label": "User ID", "required": true, "placeholder": "Masukkan User ID"}, {"name": "server", "type": "select", "label": "Server", "options": [{"label": "Asia", "value": "os_asia"}, {"label": "Europe", "value": "os_euro"}, {"label": "America", "value": "os_usa"}, {"label": "TW, HK, MO", "value": "os_cht"}], "required": true}]	2026-08-02 04:47:36.893054+00	HOYOVERSE	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	7d8a34e8-ff61-44d1-af88-a83a311f746b	t	Top up crystal Genshin Impact harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai	https://assets.newgamingstore.com/1785650419059-215045937-Helper_Genshin_Impact-1b1082-1.webp	Contoh : UID = 123456789, Server = Asia	9a145561-8663-4b49-9d02-9a97c93ca322	t	auto	genshin-impact	{}	2
57083f25-8e53-45c8-bce6-f9877ee04322	Coins Tiktok	coins-tiktok	https://assets.newgamingstore.com/1786116101220-898803716-Revising_image_prompt_instructions_202608071633_11zon.webp	[{"name": "username", "type": "text", "label": "Username", "required": true, "placeholder": "Masukkan Username"}]	2026-08-07 15:21:42.217117+00	Tiktok	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	t				a4604e46-0d88-4a16-8e4a-ce6588bf8523	f	auto	\N	{}	6
f6d2c442-d7c7-4315-b86c-0f0bff635377	Mobile Legends	mobile-legends-a4604	https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg	[{"name": "userId", "type": "number", "label": "User ID", "required": true, "placeholder": "Masukkan User ID"}, {"name": "serverID", "type": "text", "label": "Masukkan Server", "required": true, "placeholder": "Contoh: 1234 tanpa ()"}]	2026-08-02 04:09:06.314145+00	Moonton	https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	t	Beli top up ML diamond Mobile Legends dan Weekly Diamond Pass harga MLBB paling murah, aman, cepat, dan terpercaya.\r\n\r\n\r\n\r\nCara topup MLBB :\r\n1. Masukkan Data Akun\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Masukkan Kode Promo (jika ada)\r\n5. Isi Detail Kontak\r\n6. Klik Pesan Sekarang dan lakukan Pembayaran\r\n7. Selesai	https://assets.newgamingstore.com/1785679277302-580417955-MASUKANIDSERVERTANPACONTOH12345612341080x400piksel12.webp	Untuk menemukan ID Pengguna Anda, klik avatar Anda di pojok kiri atas layar dan buka tab Info Umum. Contoh: 12345678 (1234).	a4604e46-0d88-4a16-8e4a-ce6588bf8523	t	auto	mobile-legends	{}	1
62fecbc0-82b7-4383-86a9-060912ebe19e	Call Of Duty Mobile	codm-a4604	https://assets.newgamingstore.com/1785645982923-96548894-Call_of_Duty_Mobile_characters_202608021143_11zon.webp	[{"name": "openID", "type": "text", "label": "Open ID", "required": true}]	2026-08-02 04:46:24.61826+00	TIMI STUDIO GRUOP	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	f	Top Up Call of Duty Mobile :\r\n1. Masukkan Open ID\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Klik Order Now & lakukan Pembayaran\r\n5. CP masuk otomatis ke akun Anda	https://assets.newgamingstore.com/1785678997201-727447230-Halper_CODM-b977.webp	Untuk menemukan PlayerID Anda, klik ikon 'settings' yang terletak di sebelah kanan layar dan klik tab 'LEGAL AND PRIVCY', Anda dapat menemukan PlayerID Anda di sini.	a4604e46-0d88-4a16-8e4a-ce6588bf8523	t	auto	cod-mobile	{}	10
6f222b87-29e7-4806-8fd0-9801caa713db	Roblox	roblox-9a145	https://assets.newgamingstore.com/1785643214021-467878991-Roblox_characters_celebrating_wi_202608021058.jpeg	[{"name": "userName", "type": "text", "label": "Username", "required": true}, {"name": "password", "type": "text", "label": "Password", "required": true}, {"name": "backupCode", "type": "text", "label": "Masukkan Backup Code", "required": true}]	2026-07-31 16:15:52.077503+00	Moonton	https://assets.newgamingstore.com/1785644307247-20395277-Anime_gamer_holding_controllers_202608021117_11zon.webp	7d8a34e8-ff61-44d1-af88-a83a311f746b	t	Top up Robux Roblox dengan harga paling murah, aman, cepat, dan terpercaya hanya di NEW GAMING STORE.\r\nCara topup Robux Roblox Via Login:\r\n\r\nPilih Nominal\r\nMasukkan Username dan Password Roblox kamu\r\nTentukan Jumlah Pembelian\r\nPilih Pembayaran\r\nMasukkan Kode Promo (jika ada)\r\nIsi Detail Kontak (Pastikan nomer whatsapp sudah benar! )\r\nKlik Pesan Sekarang dan lakukan Pembayaran\r\nPesanan akan proses sesuai urutan\r\nDone\r\n\r\nInfo tambahan khusus Produk Roblox :\r\n* Pesanan kamu diproses sesuai urutan, bisa sangat cepat, bisa sedikit lama. tergantung banyaknya antrian pada saat kamu membeli!\r\njangan khawatir, pesanan kamu tetap akan diproses, tidak perlu spam chat ya! 🚫\r\nSambil menunggu antrian, kamu boleh login dan memainkan game nya kok, tidak akan nabrak.\r\n\r\n* Jam kerja admin VIA LOGIN adalah dari jam 08:00 Pagi - 23:00 \r\nOrder di atas jam 00:00 akan mulai diproses pagi hari pada awal jam kerja / 08:00 WIB (sesuai urutan orderan)		Masukkan username, password, dan kode backup dengan benar.	9a145561-8663-4b49-9d02-9a97c93ca322	f	\N	\N	{}	9
a80754a9-31db-4095-9218-8b0a9feb1009	Honor Of Kings	hok-a4604	https://assets.newgamingstore.com/1785643240561-131792648-honor-of-king.webp	[{"name": "userId", "type": "text", "label": "UID", "required": true, "placeholder": "Masukkan UID"}]	2026-07-31 16:16:12.345877+00	Tencents	https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	f	Beli top up diamond Honor Of Kings harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Masukkan Data Akun\r\n2) Cara Melihat UID : Profile > Settings > UID\r\n3) Pilih Nominal\r\n4) Pilih Pembayaran\r\n5) Masukkan No WhatsApp\r\n6) Klik Pesan Sekarang & Lakukan Pembayaran\r\n\r\nToken akan otomatis masuk ke akun kamu	https://assets.newgamingstore.com/1785679337424-711196702-hokhelper-3df1-original.webp	ID berupa angka, bukan nickname !! Contoh : 12345678910111213	a4604e46-0d88-4a16-8e4a-ce6588bf8523	t	auto	honor-of-kings/	{}	8
512c6156-fe45-4cd6-a472-6adaf7b92b77	E-FOOTBALL	fc-mobile-a4604	https://assets.newgamingstore.com/1785769079638-585094448-Replace_Vinicius_JR_with_Lamine_202608032101-2.jpeg	[{"name": "userId", "type": "text", "label": "ID Pengguna", "required": true}]	2026-08-02 04:35:16.572891+00	EA SPORTS	https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp	69c2e769-e8bf-4e14-80e7-095ace81d26c	t	Top up FC Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan ID Pengguna (Contoh : ASLW-945-198-758)\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran	https://assets.newgamingstore.com/1785679184613-438407231-FIFAMobile_Helper-6b86-original.jpeg	Untuk mengetahui User ID Anda, silakan klik menu profile dibagian kiri atas pada menu utama game. User ID akan terlihat dibagian bawah Nama Karakter Game Anda. Silakan masukkan User ID Anda untuk menyelesaikan transaksi. Contoh : 12345678(1234).	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f	\N	\N	{}	3
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, tenant_id, username, phone, password_hash, created_at) FROM stdin;
e769d444-95fe-4c26-ba5c-01e969ca09fb	9a145561-8663-4b49-9d02-9a97c93ca322	lavien21	0812232323	$2b$10$gjr/qZ/smuRZykOAQCXN4u.KyzRlXJQ/OxDSyEWIA8xyJYdcTA9zq	2026-08-04 13:58:24.197188+00
0ad46f1c-0f0f-4288-be61-23f466c5f77a	a4604e46-0d88-4a16-8e4a-ce6588bf8523	lavien21	0812323233	$2b$10$BSChi47GVNO.bmn5z7Xc5.6mVL4h7ek9eRcIPTo3PS2IFQfGGl3TW	2026-08-05 02:00:51.975205+00
\.


--
-- Data for Name: membership_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membership_packages (id, name, price, period_label, benefits, is_popular, is_active, created_at, tenant_id) FROM stdin;
c0e962b3-438f-4ead-85b4-013401f89f14	Platinum	300000	/Tahun	["Potongan Harga Rp 200 - Rp 1.000/produk", "Point Reward per Transaksi", "Prioritas Antrian Proses (Flash Process)", "Akses Grup WhatsApp Khusus Member", "Bebas Biaya Admin (Metode Saldo)", "Free Website Top Up Games"]	t	t	2026-08-02 13:23:19.480636+00	9a145561-8663-4b49-9d02-9a97c93ca322
745cb4a2-9037-4a7b-be8d-1637de9b700c	Platinum	500000	/Tahun	["Potongan Harga Rp 200 - Rp 1.000/produk", "Point Reward per Transaksi", "Prioritas Antrian Proses (Flash Process)", "Akses Grup WhatsApp Khusus Member", "Bebas Biaya Admin (Metode Saldo)", "Free Website Top Up Games"]	t	t	2026-08-02 13:23:19.480636+00	a4604e46-0d88-4a16-8e4a-ce6588bf8523
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, tenant_id, game_id, product_id, customer_email, form_data, status, total_price, created_at, invoice_id, account_data, promo_code_id, wa_number, original_price, fee, discount_amount, payment_status, payment_channel_id, payment_proof_url) FROM stdin;
d958bbc1-41a1-4ab2-b9b2-deeb69032044	9a145561-8663-4b49-9d02-9a97c93ca322	9080ff51-f599-450f-9fde-ef81fa7dd557	da627e98-8c45-42ad-a3ea-e168dde0c2e7	6282298196246	{"User ID": "Iwhwiowh"}	Pending	200000	2026-08-03 13:16:04.954528+00	NGS260803518799	{"User ID": "Iwhwiowh"}	\N	6282298196246	200000	0	0	UNPAID	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	\N
fa631406-da49-4e52-b773-8d8c3e35e8ed	9a145561-8663-4b49-9d02-9a97c93ca322	86098d19-4024-47c6-8bd9-b16780a3ea8e	2e645715-7d84-45e2-9eb0-d85e31d8c6cd	628973434343	{"User ID": "834344"}	Pending	100000	2026-08-03 14:17:26.650569+00	NGS260803813360	{"User ID": "834344"}	\N	628973434343	100000	0	0	UNPAID	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	\N
6abdb197-edb6-4920-8665-e137341f8f9a	9a145561-8663-4b49-9d02-9a97c93ca322	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	313c99e6-01c2-41da-a01a-83f44e35bf1d	6275454554	{"Open ID": "32323"}	Pending	100000	2026-08-03 14:40:43.626265+00	NGS260803607858	{"Open ID": "32323"}	\N	6275454554	100000	0	0	UNPAID	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	\N
7939e7ba-03f3-4452-952e-3d5f6a0c9016	9a145561-8663-4b49-9d02-9a97c93ca322	86098d19-4024-47c6-8bd9-b16780a3ea8e	33c58bfd-ea4d-45dd-9020-52fd68e61fab	62783434344	{"User ID": "434344"}	Pending	750000	2026-08-03 14:50:13.921634+00	NGS260803726105	{"User ID": "434344"}	\N	62783434344	750000	0	0	UNPAID	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	\N
0617b530-33a7-447b-89c7-940726dc941a	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	0e04af83-ddf0-4159-97fa-d46f6003a953	6285173007569	{"ID Pengguna": "ASEM-116-449-670"}	Pending	300000	2026-08-05 23:28:36.69731+00	NGS260805598995	{"ID Pengguna": "ASEM-116-449-670"}	\N	6285173007569	300000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
575bc375-416e-49bb-a827-12a2356bd2e2	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	55a0b858-e8d0-4373-93e7-f7f656057257	6282298196246	{"Username": "@tesdicoba"}	Pending	200000	2026-08-06 02:28:31.628014+00	NGS260806905473	{"Username": "@tesdicoba"}	\N	6282298196246	200000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
d122ae64-2e7f-4236-8de1-63ea7b4f8680	9a145561-8663-4b49-9d02-9a97c93ca322	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	d6be7b45-ee86-4c72-81a1-3669573ac2df	lavien21@gmail.com	{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}	Pending	400000	2026-08-05 02:06:31.231455+00	NGS260805174456	{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}	\N	62893434343	400000	0	0	PAID	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	https://assets.newgamingstore.com/1785895602634-748923506-f81bdfd3-c104-4739-b40d-ae665f64bd5c.jpeg
35212c11-374a-4f3f-9ae3-ab750bfc8eb2	9a145561-8663-4b49-9d02-9a97c93ca322	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	d6be7b45-ee86-4c72-81a1-3669573ac2df	62893434443	{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}	Success	400000	2026-08-05 02:35:56.460355+00	NGS260805279821	{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}	\N	62893434443	400000	0	0	PAID	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	https://assets.newgamingstore.com/1785897403151-450201622-smiling-malay-woman-using-smartphone-on-train-commute-photo.jpeg
5f6e4da7-000a-4af3-982a-c8e4c1cb89c3	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a80754a9-31db-4095-9218-8b0a9feb1009	94259e7b-d8e4-4cb9-ad5e-f778dbfe684f	6285188354185	{"UID": "3832563198081203267"}	Pending	100000	2026-08-06 12:04:55.561654+00	NGS260806804106	{"UID": "3832563198081203267"}	\N	6285188354185	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786018007132-787147004-Screenshot_2026-08-06-19-06-32-55_78ed797590cf9a33dfc5e341b7a9537a.jpg
73b06309-c91b-4610-88d6-cdeb2f1dbe7b	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	faf7b240-6b35-4e92-b974-60a69c4fdb1d	082168559123	{"ID Pengguna": "ASQL-487-658-247"}	Pending	100000	2026-08-06 14:06:58.245594+00	NGS260806610676	{"ID Pengguna": "ASQL-487-658-247"}	\N	082168559123	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
4da13774-5480-4a06-8b78-65bb7d453015	a4604e46-0d88-4a16-8e4a-ce6588bf8523	57083f25-8e53-45c8-bce6-f9877ee04322	0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3	6285227467777	{"Username": "Iqbalrizantha23"}	Pending	100000	2026-08-08 03:59:44.650999+00	NGS260808235775	{"Username": "Iqbalrizantha23"}	\N	6285227467777	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
7469c2e1-c191-41be-9b53-c59a17e77d59	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	d77584f4-eed0-4135-a585-132b81b448da	628139905775	{"ID Pengguna": "nettryouell"}	Pending	250000	2026-08-06 15:28:09.753136+00	NGS260806830754	{"ID Pengguna": "nettryouell"}	\N	628139905775	250000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
f5eb88ed-8b03-4596-86e6-0c745d157dc7	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	faf7b240-6b35-4e92-b974-60a69c4fdb1d	081210359523	{"ID Pengguna": "ASAA-663-564-945"}	Pending	100000	2026-08-06 19:21:02.943033+00	NGS260806812340	{"ID Pengguna": "ASAA-663-564-945"}	\N	081210359523	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
dc6539f2-72b4-4ee8-8def-d6d7295fdefb	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	faf7b240-6b35-4e92-b974-60a69c4fdb1d	6282227662002	{"ID Pengguna": "ASPZ-562-563-754"}	Pending	100000	2026-08-06 19:58:16.084627+00	NGS260806913182	{"ID Pengguna": "ASPZ-562-563-754"}	\N	6282227662002	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786046526702-660042980-IMG-20260807-WA0001.jpg
d4732b8a-3159-48e8-a975-13e240d90e46	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	ed6b1015-ba58-4d62-93bf-219e8917bd3a	081267508702	{"ID Pengguna": "ASNQ558551759"}	Pending	400000	2026-08-06 22:37:37.856999+00	NGS260806513825	{"ID Pengguna": "ASNQ558551759"}	\N	081267508702	400000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
d9dd74d2-7749-4de5-b94f-42a1ee5dbeb7	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	0e04af83-ddf0-4159-97fa-d46f6003a953	081267508702	{"ID Pengguna": "ASNQ558551759"}	Pending	300000	2026-08-06 22:39:27.034702+00	NGS260806334688	{"ID Pengguna": "ASNQ558551759"}	\N	081267508702	300000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786056138045-423167100-inbound1623523935004744709.jpg
3936ebf6-1275-4fa3-958d-8ff4de345cb3	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	9da6a566-bc5c-4458-980c-644e646dbb26	6289529375568	{"ID Pengguna": "ASNM-420-169-551"}	Pending	200000	2026-08-07 07:48:08.226861+00	NGS260807549747	{"ID Pengguna": "ASNM-420-169-551"}	\N	6289529375568	200000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786089033774-164071400-1000038844.jpg
31680e31-9761-4829-9a6c-69be8660d338	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a80754a9-31db-4095-9218-8b0a9feb1009	94259e7b-d8e4-4cb9-ad5e-f778dbfe684f	6285188354185	{"UID": "3832563198081203267"}	Pending	100000	2026-08-07 09:31:17.342588+00	NGS260807101781	{"UID": "3832563198081203267"}	\N	6285188354185	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
0ef037a6-739d-4444-890d-b4343eef147d	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	bc08e697-f3cd-4f18-9831-2d49f1946215	+6283116128433	{"ID Pengguna": "ASMG-999-132-259"}	Pending	250000	2026-08-07 09:41:30.911059+00	NGS260807783983	{"ID Pengguna": "ASMG-999-132-259"}	\N	+6283116128433	250000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
2c642874-9202-4398-8064-3b739e60c30d	9a145561-8663-4b49-9d02-9a97c93ca322	a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	e5f9140e-d43e-49aa-9a22-a72997a304d1	6289343433	{"Riot ID": "8343433"}	Pending	550000	2026-08-07 15:36:31.387738+00	NGS260807574354	{"Riot ID": "8343433"}	\N	6289343433	550000	0	0	PAID	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	https://assets.newgamingstore.com/1786117371848-593669558-fc7a5db1-c61c-4f5f-8603-ee698b5c105d.png
c6caae60-9d4d-4c9a-9c5d-8deca6307ec4	a4604e46-0d88-4a16-8e4a-ce6588bf8523	57083f25-8e53-45c8-bce6-f9877ee04322	0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3	085321626658	{"Username": "Duta shampo lain"}	Pending	100000	2026-08-07 23:59:33.7259+00	NGS260807256022	{"Username": "Duta shampo lain"}	\N	085321626658	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
dd797824-2d0a-4cc9-b064-1679ce03daf4	a4604e46-0d88-4a16-8e4a-ce6588bf8523	57083f25-8e53-45c8-bce6-f9877ee04322	0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3	085321626658	{"Username": "Duta shampo lain"}	Pending	100000	2026-08-08 00:09:18.557315+00	NGS260808262496	{"Username": "Duta shampo lain"}	\N	085321626658	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786147784332-525966297-15984.jpg
912808cb-0489-4b2f-8c17-2d10fbaab378	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	0850cdad-09e2-4737-9f94-055dbf3ff231	0895401107649	{"Username": "Screeet9"}	Pending	100000	2026-08-08 00:22:26.27052+00	NGS260808300715	{"Username": "Screeet9"}	\N	0895401107649	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786148805315-571427707-a4d5f9a6-9d16-4865-b838-3c61c9f90efe.jpeg
4f853d34-283e-4974-9f3b-8b939b014dfb	a4604e46-0d88-4a16-8e4a-ce6588bf8523	57083f25-8e53-45c8-bce6-f9877ee04322	0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3	6285227467777	{"Username": "Iqbalrizantha23"}	Pending	100000	2026-08-08 04:28:29.707133+00	NGS260808212721	{"Username": "Iqbalrizantha23"}	\N	6285227467777	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
36bc8911-a472-4173-9c24-519f7bb853cd	a4604e46-0d88-4a16-8e4a-ce6588bf8523	10c1b9d4-7197-4464-bf9f-ee710c1f0180	7608bfa3-54c6-4fa5-897d-386135e57a72	083135595148	{"ID": "5295907539", "Username": "Ri'ot666"}	Pending	100000	2026-08-08 07:31:40.079844+00	NGS260808681794	{"ID": "5295907539", "Username": "Ri'ot666"}	\N	083135595148	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786174423179-790973000-inbound485691646491246106.jpg
0b5672a5-f866-4b58-9b5e-a8686d8b73a1	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	087777361495	{"User ID": "1128041156", "Username": "꧁Wong•Pusat꧂ (ID)", "Masukkan Server": "13546"}	Pending	100000	2026-08-08 07:58:24.065958+00	NGS260808931322	{"User ID": "1128041156", "Username": "꧁Wong•Pusat꧂ (ID)", "Masukkan Server": "13546"}	\N	087777361495	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
15ab192a-c7a6-439f-b493-4e1c3ae0caff	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	+6289510046849	{"User ID": "1094577662", "Username": "weyywii. (ID)", "Masukkan Server": "13398"}	Pending	100000	2026-08-08 09:55:17.276555+00	NGS260808492284	{"User ID": "1094577662", "Username": "weyywii. (ID)", "Masukkan Server": "13398"}	\N	+6289510046849	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
82cd4384-d58c-45f0-8238-1450ef123d13	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	0e04af83-ddf0-4159-97fa-d46f6003a953	6281334444338	{"ID Pengguna": "ASAA-717-231-282"}	Pending	300000	2026-08-08 10:25:46.694369+00	NGS260808631441	{"ID Pengguna": "ASAA-717-231-282"}	\N	6281334444338	300000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786185496827-571502916-449681.jpg
73c7453e-c545-4457-8b36-8fe09d4c2a7c	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	9da6a566-bc5c-4458-980c-644e646dbb26	081231917383	{"ID Pengguna": "ASLW-943-617-091"}	Pending	200000	2026-08-08 11:14:18.514012+00	NGS260808646002	{"ID Pengguna": "ASLW-943-617-091"}	\N	081231917383	200000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786187747671-498679587-1000263505.jpg
f2772173-e5fb-4fea-be0d-010176c233ba	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	0850cdad-09e2-4737-9f94-055dbf3ff231	081266991055	{"Username": "Razaq272"}	Pending	100000	2026-08-08 12:10:44.708261+00	NGS260808688537	{"Username": "Razaq272"}	\N	081266991055	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786191115216-966099540-1000563033.jpg
f9e4a807-5821-4ae9-8221-31edac773646	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	089670086136	{"User ID": "547259384", "Username": "pemilik+kembali. (PH)", "Masukkan Server": "3468"}	Pending	100000	2026-08-08 15:13:47.818216+00	NGS260808332183	{"User ID": "547259384", "Username": "pemilik+kembali. (PH)", "Masukkan Server": "3468"}	\N	089670086136	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
2b6ffb0c-2441-454c-bc5a-e3f0106b2e24	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	bf6c6adb-3357-44dd-82fd-dc1ba8e9db2e	628996296856	{"ID Pengguna": "ASAA-555-141-444"}	Pending	750000	2026-08-08 15:48:49.761279+00	NGS260808236353	{"ID Pengguna": "ASAA-555-141-444"}	\N	628996296856	750000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786204305315-174422576-15309.jpg
4b202cb9-c037-49b9-a93b-6b8260e189d9	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a16753e-d851-4faf-954d-9b8a4077867d	6285645778835	{"User ID": "983841486", "Username": "Hansenn. (ID)", "Masukkan Server": "12931"}	Pending	200000	2026-08-08 18:08:22.338879+00	NGS260808435823	{"User ID": "983841486", "Username": "Hansenn. (ID)", "Masukkan Server": "12931"}	\N	6285645778835	200000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786212688464-198333394-inbound5476907962954808102.jpg
d352344a-5ec5-4506-88c0-e12373a498ab	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	68e8fa9c-e240-43d7-bbca-c4c66a4a4d9f	081383599120	{"User ID": "1609080551", "Username": "Ahhhhh (ID)", "Masukkan Server": "16764"}	Pending	300000	2026-08-08 18:23:50.238646+00	NGS260808373067	{"User ID": "1609080551", "Username": "Ahhhhh (ID)", "Masukkan Server": "16764"}	\N	081383599120	300000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786213599014-537759436-inbound682015795094129834.jpg
c82333d1-fa1c-4bfe-a262-018fdb666e21	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	081365183583	{"User ID": "164722780", "Username": "ダーリン (ID)", "Masukkan Server": "2826"}	Pending	100000	2026-08-08 18:53:34.179846+00	NGS260808552928	{"User ID": "164722780", "Username": "ダーリン (ID)", "Masukkan Server": "2826"}	\N	081365183583	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786215293952-735247404-Screenshot_20260809_015356_SamsungBrowser.jpg
7af96833-b1a9-4ed5-ab6c-95b7365a0c60	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	081365183583	{"User ID": "164722780", "Username": "ダーリン (ID)", "Masukkan Server": "2826"}	Pending	100000	2026-08-08 18:55:23.584441+00	NGS260808102688	{"User ID": "164722780", "Username": "ダーリン (ID)", "Masukkan Server": "2826"}	\N	081365183583	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786215333459-926125186-Transaksi_BCAmobile-20260809-015428.jpg
7b4b5f13-87aa-45e0-8ce2-d8215c6377bc	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	faf7b240-6b35-4e92-b974-60a69c4fdb1d	6282277295626	{"ID Pengguna": "ASER-422-350-951"}	Pending	100000	2026-08-09 04:24:42.230991+00	NGS260809557133	{"ID Pengguna": "ASER-422-350-951"}	\N	6282277295626	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786249592030-20270831-25210.jpg
9cbbdf68-9ec3-492c-bae6-ef8ef129269b	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6283180001454	{"User ID": "1167606198", "Username": "4+U. (ID)", "Masukkan Server": "13733"}	Pending	100000	2026-08-09 04:48:29.49969+00	NGS260809792947	{"User ID": "1167606198", "Username": "4+U. (ID)", "Masukkan Server": "13733"}	\N	6283180001454	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786251306963-65088347-inbound9092958960975045560.jpg
6fa4b3be-8ddd-4006-907a-3462e8a76187	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	081347946994	{"User ID": "462316045", "Username": "INDUNG+SHUTDOWN+NPE (ID)", "Masukkan Server": "2369"}	Pending	100000	2026-08-09 06:01:47.070535+00	NGS260809800407	{"User ID": "462316045", "Username": "INDUNG+SHUTDOWN+NPE (ID)", "Masukkan Server": "2369"}	\N	081347946994	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786255486108-932872696-inbound5113998880917528925.jpg
2ebfa2c1-824c-4e79-92fd-c52957a830b4	a4604e46-0d88-4a16-8e4a-ce6588bf8523	57083f25-8e53-45c8-bce6-f9877ee04322	36171d64-caa9-4719-9cc0-86ea40e1dfb2	085685662336	{"Username": "bukan manusia biasa"}	Pending	1000000	2026-08-09 06:36:02.909345+00	NGS260809714364	{"Username": "bukan manusia biasa"}	\N	085685662336	1000000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
78e51307-8569-4c38-a029-39280421b1e6	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	082180387723	{"User ID": "1327858778", "Username": "PremanLATEGAME (ID)", "Masukkan Server": "15479"}	Pending	100000	2026-08-09 07:23:01.831926+00	NGS260809875965	{"User ID": "1327858778", "Username": "PremanLATEGAME (ID)", "Masukkan Server": "15479"}	\N	082180387723	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
4509ca07-f7f3-42fe-a467-abd639bef5d0	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	0850cdad-09e2-4737-9f94-055dbf3ff231	083147337283	{"Username": "ironmen010205"}	Pending	100000	2026-08-09 07:25:09.890314+00	NGS260809138018	{"Username": "ironmen010205"}	\N	083147337283	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786260421434-728965525-inbound7464967421033052488.jpg
c6b697e9-72b2-44e8-afb7-b841ef8f3c9c	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	68e8fa9c-e240-43d7-bbca-c4c66a4a4d9f	6281376821520	{"User ID": "1741137838", "Username": "One+Call+Away. (ID)", "Masukkan Server": "18407"}	Pending	300000	2026-08-09 07:31:17.753975+00	NGS260809617906	{"User ID": "1741137838", "Username": "One+Call+Away. (ID)", "Masukkan Server": "18407"}	\N	6281376821520	300000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786260752093-648801265-IMG_0387.png
6a76cd9c-a367-48f3-aa94-04a2a53210d6	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	087784489878	{"User ID": "1611823465", "Username": "Vyxx_ (ID)", "Masukkan Server": "16793"}	Pending	100000	2026-08-09 08:17:26.324695+00	NGS260809546320	{"User ID": "1611823465", "Username": "Vyxx_ (ID)", "Masukkan Server": "16793"}	\N	087784489878	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786263586575-966763743-inbound3739055039828470853.jpg
09c16556-9ce6-45ca-b8cc-068255671277	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6281234296443	{"User ID": "688278516", "Username": "#@Oblivion_Slayer99+ (ID)", "Masukkan Server": "8733"}	Pending	100000	2026-08-09 08:20:47.473125+00	NGS260809394984	{"User ID": "688278516", "Username": "#@Oblivion_Slayer99+ (ID)", "Masukkan Server": "8733"}	\N	6281234296443	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
e0d25d5d-d825-418a-8f22-da8e8518fa4b	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a16753e-d851-4faf-954d-9b8a4077867d	6285183062272	{"User ID": "1565182218", "Username": "Y+A+N+Z+R+O♤ (ID)", "Masukkan Server": "16564"}	Pending	200000	2026-08-09 08:22:07.375432+00	NGS260809151098	{"User ID": "1565182218", "Username": "Y+A+N+Z+R+O♤ (ID)", "Masukkan Server": "16564"}	\N	6285183062272	200000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786263922743-212938407-inbound2996905842810737633.png
c19efe53-c2f8-4afc-85c0-91d72c0514ad	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6281289384331	{"User ID": "67965525", "Username": "PapiNya+Keyraa (ID)", "Masukkan Server": "2119"}	Pending	100000	2026-08-09 09:05:13.997233+00	NGS260809113798	{"User ID": "67965525", "Username": "PapiNya+Keyraa (ID)", "Masukkan Server": "2119"}	\N	6281289384331	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
b67b52d0-dbeb-412d-a06f-54aef2a61b31	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6282286439073	{"User ID": "448461216", "Username": "納特|The+Emperor. (ID)", "Masukkan Server": "2309"}	Pending	100000	2026-08-09 09:09:56.039788+00	NGS260809593111	{"User ID": "448461216", "Username": "納特|The+Emperor. (ID)", "Masukkan Server": "2309"}	\N	6282286439073	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786266754759-565603039-Screenshot_2026-08-09-16-12-21-22_25224148702d48aef118cfcab279573b.jpg
e4a29aa1-fb27-46dc-8074-c43c55ff67c3	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6285223351296	{"User ID": "226281469", "Username": "Super+Frince (ID)", "Masukkan Server": "9178"}	Pending	100000	2026-08-09 09:22:30.874548+00	NGS260809700906	{"User ID": "226281469", "Username": "Super+Frince (ID)", "Masukkan Server": "9178"}	\N	6285223351296	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786267416696-117854736-inbound5860333654899357755.jpg
4f69e7db-12c7-441e-a155-77e0a7d623ee	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	55a0b858-e8d0-4373-93e7-f7f656057257	628132254231	{"Username": "@tes"}	Pending	200000	2026-08-09 10:10:27.039783+00	NGS260809814872	{"Username": "@tes"}	\N	628132254231	200000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786270246903-765200216-inbound2791493235313916774.jpg
c717e5c0-8c9e-436e-9808-8369e56eac1b	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	082272237669	{"User ID": "1547782399", "Masukkan Server": "(11808)"}	Pending	100000	2026-08-09 11:39:51.823704+00	NGS260809877651	{"User ID": "1547782399", "Masukkan Server": "(11808)"}	\N	082272237669	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786275798920-186037258-inbound2029547189051233885.jpg
3e4abdab-a21c-4276-b3fa-6d3bd5b7aeb8	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	da353d89-8fca-4375-94c5-0b92bf6acadd	081227498335	{"ID Pengguna": "ASAA-868-026-858"}	Pending	1000000	2026-08-09 11:48:52.128959+00	NGS260809623192	{"ID Pengguna": "ASAA-868-026-858"}	\N	081227498335	1000000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
47becc90-e54c-4ad3-9641-d87b603bc858	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	da353d89-8fca-4375-94c5-0b92bf6acadd	081227498335	{"ID Pengguna": "ASAA-868-026-858"}	Pending	1000000	2026-08-09 11:52:04.302085+00	NGS260809310255	{"ID Pengguna": "ASAA-868-026-858"}	\N	081227498335	1000000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
dd5c4acf-dc18-4850-8ed9-3c8c68865e8a	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	0850cdad-09e2-4737-9f94-055dbf3ff231	085176978802	{"Username": "jolmncox"}	Pending	100000	2026-08-09 12:43:56.21949+00	NGS260809503677	{"Username": "jolmncox"}	\N	085176978802	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
ac66d13f-48f0-415e-aa22-32db3383aa52	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	da353d89-8fca-4375-94c5-0b92bf6acadd	081227498335	{"ID Pengguna": "ASAA-868-026-858"}	Pending	1000000	2026-08-09 13:20:33.752429+00	NGS260809462704	{"ID Pengguna": "ASAA-868-026-858"}	\N	081227498335	1000000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
668cbdda-1e5c-494e-b998-8c636fb9841d	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	0850cdad-09e2-4737-9f94-055dbf3ff231	6282189849655	{"Username": "yura7813"}	Pending	100000	2026-08-09 13:26:06.615265+00	NGS260809612601	{"Username": "yura7813"}	\N	6282189849655	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786282194610-806829021-inbound3900958841761102976.png
82b31fee-c377-4069-a3a6-e61aaaf8c20f	a4604e46-0d88-4a16-8e4a-ce6588bf8523	57083f25-8e53-45c8-bce6-f9877ee04322	0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3	082173498245	{"Username": "mr_robot30"}	Pending	100000	2026-08-09 14:47:49.75778+00	NGS260809145722	{"Username": "mr_robot30"}	\N	082173498245	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786286928387-393165630-inbound2652506385039803073.jpg
62bb2845-8d1a-43b5-a913-e95563b96f9e	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	087791721900	{"User ID": "2198456143", "Username": "C+I+L+A (ID)", "Masukkan Server": "12797"}	Pending	100000	2026-08-10 03:18:53.240964+00	NGS260810906820	{"User ID": "2198456143", "Username": "C+I+L+A (ID)", "Masukkan Server": "12797"}	\N	087791721900	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786332079544-813507461-IMG_0945.png
9e8defe2-a5b3-473f-b4a7-36507fd57208	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	0850cdad-09e2-4737-9f94-055dbf3ff231	628989400799	{"Username": "Galaxyplaysyt423"}	Pending	100000	2026-08-10 09:09:24.441676+00	NGS260810549666	{"Username": "Galaxyplaysyt423"}	\N	628989400799	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
c0931f68-00ee-4eb4-a3d4-5d2df109db9c	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	0850cdad-09e2-4737-9f94-055dbf3ff231	628989400799	{"Username": "Galaxyplaysyt423"}	Pending	100000	2026-08-10 09:13:18.143119+00	NGS260810284034	{"Username": "Galaxyplaysyt423"}	\N	628989400799	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786353249414-116920547-inbound1163341305967695188.jpg
24df0351-7718-4025-b9f8-0f294807f352	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	0850cdad-09e2-4737-9f94-055dbf3ff231	081973164183	{"Username": "Ajiiidorr"}	Pending	100000	2026-08-10 11:09:49.962078+00	NGS260810563571	{"Username": "Ajiiidorr"}	\N	081973164183	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/1786360246291-257366063-Transaksi_BCAmobile-20260810-180142.jpg
827534c8-ace1-4861-b352-72630bae0d58	a4604e46-0d88-4a16-8e4a-ce6588bf8523	10c1b9d4-7197-4464-bf9f-ee710c1f0180	7608bfa3-54c6-4fa5-897d-386135e57a72	087769341972	{"ID": "52447564006", "Username": "Kynaraaaゞ"}	Pending	100000	2026-08-10 12:06:11.907762+00	NGS260810144127	{"ID": "52447564006", "Username": "Kynaraaaゞ"}	\N	087769341972	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
0ffc3cdc-c3ab-4269-9f88-633a1ae641fe	a4604e46-0d88-4a16-8e4a-ce6588bf8523	10c1b9d4-7197-4464-bf9f-ee710c1f0180	7608bfa3-54c6-4fa5-897d-386135e57a72	087769341972	{"ID": "52447564006", "Username": "Kynaraaaゞ"}	Pending	100000	2026-08-10 12:12:35.773901+00	NGS260810695947	{"ID": "52447564006", "Username": "Kynaraaaゞ"}	\N	087769341972	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
84eb67f4-a462-4dae-a59b-932b3b340c92	a4604e46-0d88-4a16-8e4a-ce6588bf8523	57083f25-8e53-45c8-bce6-f9877ee04322	eea48ac4-eeef-40be-8759-1408c71e3b6d	6285223322124	{"Username": "@ishwiwus"}	Pending	200000	2026-08-10 14:26:34.146534+00	NGS260810674262	{"Username": "@ishwiwus"}	\N	6285223322124	200000	0	0	UNPAID	56a29eda-ab98-4976-a78e-54ce2b17f8f8	\N
0bea7d79-872b-41e4-b660-ab9c11dbd385	a4604e46-0d88-4a16-8e4a-ce6588bf8523	57083f25-8e53-45c8-bce6-f9877ee04322	0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3	6285524552321	{"Username": "@hshwhw"}	Pending	100000	2026-08-10 14:36:22.939693+00	NGS260810137726	{"Username": "@hshwhw"}	\N	6285524552321	100000	0	0	UNPAID	94f6490f-6b9f-47c0-8bd3-5e3baef4838c	\N
09d3710f-d80c-44f2-8826-41be917f3366	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6285188354185	{"User ID": "236438993", "Username": "Iori.++Kitaharaメ (ID)", "Masukkan Server": "9251"}	Pending	100000	2026-08-11 14:17:36.989409+00	NGS260811743478	{"User ID": "236438993", "Username": "Iori.++Kitaharaメ (ID)", "Masukkan Server": "9251"}	\N	6285188354185	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
eb90084b-ae39-45af-98fc-1ffdd7a3a53c	9a145561-8663-4b49-9d02-9a97c93ca322	a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	74a1cd50-c77b-4cb4-9422-17ea06643eaa	628934343444	{"Riot ID": "riotxx1"}	Pending	100000	2026-08-11 14:24:57.476608+00	NGS260811737220	{"Riot ID": "riotxx1"}	\N	628934343444	100000	0	0	PAID	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	https://assets.newgamingstore.com/uploads/9fdc0f76-db39-4df5-b623-c8766a7608c4.png
5bb11e64-0404-4470-a50d-135788bbf146	9a145561-8663-4b49-9d02-9a97c93ca322	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	93bfe81b-688c-4621-9190-abbd925b971f	6289343434434	{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}	Pending	100000	2026-08-11 14:39:35.496308+00	NGS260811328056	{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}	\N	6289343434434	100000	0	0	UNPAID	da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	\N
130f04b8-b215-486a-94e3-42f033f4463e	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	0850cdad-09e2-4737-9f94-055dbf3ff231	6287813715532	{"Username": "bhumi_2025"}	Pending	100000	2026-08-14 11:48:47.421265+00	NGS260814796294	{"Username": "bhumi_2025"}	\N	6287813715532	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
0762cf0a-2619-4afd-a5de-2c82749b8614	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	85d1a827-01d5-4348-9235-7404aac6c295	6289343434	{"Username": "wdawdawd"}	Pending	400000	2026-08-11 15:13:46.222933+00	NGS260811601005	{"Username": "wdawdawd"}	\N	6289343434	400000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
9816985f-e4db-4c54-bd00-3792833cc311	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	085126512875	{"User ID": "45536295", "Username": "Y+A+F+A+N+D+A (ID)", "Masukkan Server": "2211"}	Pending	100000	2026-08-11 23:33:26.359539+00	NGS260811928251	{"User ID": "45536295", "Username": "Y+A+F+A+N+D+A (ID)", "Masukkan Server": "2211"}	\N	085126512875	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
29bcdb8f-e7f7-437d-8171-ff6655f2bf23	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	085126512875	{"User ID": "45536295", "Username": "Y+A+F+A+N+D+A (ID)", "Masukkan Server": "2211"}	Pending	100000	2026-08-11 23:37:13.153591+00	NGS260811349714	{"User ID": "45536295", "Username": "Y+A+F+A+N+D+A (ID)", "Masukkan Server": "2211"}	\N	085126512875	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/uploads/a5507403-38d9-480c-be73-73ab10849d22.jpg
0e058832-c804-42a0-ab87-e42532f15810	a4604e46-0d88-4a16-8e4a-ce6588bf8523	a8e80afd-9b72-4088-b49d-52de3687d936	55a0b858-e8d0-4373-93e7-f7f656057257	62852362626	{"Username": "Hrhrhrhrjrj"}	Pending	200000	2026-08-12 09:13:36.222165+00	NGS260812438293	{"Username": "Hrhrhrhrjrj"}	\N	62852362626	200000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
01c1d9bf-4f1c-455e-93f7-d4b958025fef	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	31fcb04b-fbf1-46d1-93fe-81916aaba694	62854545444	{"User ID": "101106838", "Username": "POK+AMI+AMI (ID)", "Masukkan Server": "2518"}	Pending	1500000	2026-08-12 11:14:16.977425+00	NGS260812944658	{"User ID": "101106838", "Username": "POK+AMI+AMI (ID)", "Masukkan Server": "2518"}	\N	62854545444	1500000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
6a5faf62-e6e5-48a3-8a44-26ccdd2aabf0	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	085161632125	{"User ID": "1147781104", "Username": "(FIT) (ID)", "Masukkan Server": "13654"}	Pending	100000	2026-08-12 12:52:16.982789+00	NGS260812454499	{"User ID": "1147781104", "Username": "(FIT) (ID)", "Masukkan Server": "13654"}	\N	085161632125	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
0b112eb6-8a3d-4bc0-a562-3ab20b79d6bb	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	085161632125	{"User ID": "1147781104", "Username": "(FIT) (ID)", "Masukkan Server": "13654"}	Pending	100000	2026-08-12 13:05:32.12541+00	NGS260812595704	{"User ID": "1147781104", "Username": "(FIT) (ID)", "Masukkan Server": "13654"}	\N	085161632125	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
aa2546b1-0b21-4f7c-90c7-366ffa3b4218	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6285188354185	{"User ID": "236438993", "Username": "Iori.++Kitaharaメ (ID)", "Masukkan Server": "9251"}	Pending	100000	2026-08-13 13:03:02.428513+00	NGS260813352508	{"User ID": "236438993", "Username": "Iori.++Kitaharaメ (ID)", "Masukkan Server": "9251"}	\N	6285188354185	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
1dc7d209-d545-4d28-82b1-142fd3aafb42	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	2d42e7bf-496b-4aef-80d2-b477f3d92105	082237812173	{"ID Pengguna": "ASLR-660-701–098"}	Pending	100000	2026-08-13 14:29:51.83624+00	NGS260813374795	{"ID Pengguna": "ASLR-660-701–098"}	\N	082237812173	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
97cd9741-2212-4776-af89-588d41b348b7	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	faf7b240-6b35-4e92-b974-60a69c4fdb1d	6282363631018	{"ID Pengguna": "ASDG-214-849-411"}	Pending	100000	2026-08-13 14:47:45.54195+00	NGS260813342299	{"ID Pengguna": "ASDG-214-849-411"}	\N	6282363631018	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
c0fc2a03-3a1e-46b4-b980-f08b26ccbe8b	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	faf7b240-6b35-4e92-b974-60a69c4fdb1d	6282262724323	{"ID Pengguna": "ASHS-717-025-830"}	Pending	100000	2026-08-13 14:50:40.498774+00	NGS260813253749	{"ID Pengguna": "ASHS-717-025-830"}	\N	6282262724323	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/uploads/ee88ff43-ccd1-4ef5-b852-cf22a39f719e.jpg
b66e2c3e-b7b7-4045-baa4-d85084b470e7	a4604e46-0d88-4a16-8e4a-ce6588bf8523	512c6156-fe45-4cd6-a472-6adaf7b92b77	faf7b240-6b35-4e92-b974-60a69c4fdb1d	628211244322	{"ID Pengguna": "Jabahajaja"}	Pending	100000	2026-08-13 15:51:14.098482+00	NGS260813264043	{"ID Pengguna": "Jabahajaja"}	\N	628211244322	100000	0	0	UNPAID	aba89adc-2dcf-4928-920e-837cba415e85	\N
3b2e139c-bb61-488c-91ee-1f19484adf75	a4604e46-0d88-4a16-8e4a-ce6588bf8523	10c1b9d4-7197-4464-bf9f-ee710c1f0180	7608bfa3-54c6-4fa5-897d-386135e57a72	628155176558	{"ID": "5123803649", "Username": "ムソイ・Devlin"}	Pending	100000	2026-08-14 06:14:44.816763+00	NGS260814693396	{"ID": "5123803649", "Username": "ムソイ・Devlin"}	\N	628155176558	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/uploads/af347d6a-0f99-4385-b459-71e92c53e5f4.jpg
37f0ff29-8e4c-4249-b011-c612cf24378e	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6289687005660	{"User ID": "904979700", "Username": "Max+Verstappen (ID)", "Masukkan Server": "12589"}	Pending	100000	2026-08-14 12:20:35.515676+00	NGS260814760850	{"User ID": "904979700", "Username": "Max+Verstappen (ID)", "Masukkan Server": "12589"}	\N	6289687005660	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/uploads/8c661f3e-0172-47bd-b69f-73b51b409cd6.png
b16374dd-9e6c-489c-9d88-e38cee3e96cd	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6287841240553	{"User ID": "135285403", "Username": "Mr.+Veēy (ID)", "Masukkan Server": "2688"}	Pending	100000	2026-08-14 14:29:30.545823+00	NGS260814158315	{"User ID": "135285403", "Username": "Mr.+Veēy (ID)", "Masukkan Server": "2688"}	\N	6287841240553	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/uploads/5bda6cde-73c2-4acf-a507-f63daac99b8e.jpg
7e53a4e8-1a67-4d64-967b-d3c00b3104f9	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6285766792292	{"User ID": "598447497", "Username": "MR.poseidon", "Masukkan Server": "8397"}	Pending	100000	2026-08-14 14:43:03.960689+00	NGS260814843994	{"User ID": "598447497", "Username": "MR.poseidon", "Masukkan Server": "8397"}	\N	6285766792292	100000	0	0	PAID	56a29eda-ab98-4976-a78e-54ce2b17f8f8	https://assets.newgamingstore.com/uploads/0e303f73-ac71-4af8-857c-c4fad66f2503.jpg
15868951-3bfe-4458-8af6-3d143b8e0200	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6285262402003	{"User ID": "2044749881", "Username": "Triton (ID)", "Masukkan Server": "19575"}	Pending	100000	2026-08-14 15:04:59.799462+00	NGS260814811244	{"User ID": "2044749881", "Username": "Triton (ID)", "Masukkan Server": "19575"}	\N	6285262402003	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/uploads/7986f10f-fc50-444e-957b-610e4048dda5.jpg
838b7de9-3264-4a55-99bd-e8f09061386f	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	082135522539	{"User ID": "47148012", "Username": "SeanZ. (ID)", "Masukkan Server": "2078"}	Pending	100000	2026-08-14 15:04:32.934163+00	NGS260814539422	{"User ID": "47148012", "Username": "SeanZ. (ID)", "Masukkan Server": "2078"}	\N	082135522539	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/uploads/6f3cb651-f590-4ae6-ab1c-447f204c8fe0.jpg
658f789e-f1c5-4042-ba72-6506706c7fff	a4604e46-0d88-4a16-8e4a-ce6588bf8523	f6d2c442-d7c7-4315-b86c-0f0bff635377	7a74e715-f19c-454f-9f73-ced40248ba63	6283874692104	{"User ID": "1448204652", "Username": "유야산NPL (ID)", "Masukkan Server": "16015"}	Pending	100000	2026-08-14 15:12:08.374083+00	NGS260814623474	{"User ID": "1448204652", "Username": "유야산NPL (ID)", "Masukkan Server": "16015"}	\N	6283874692104	100000	0	0	PAID	aba89adc-2dcf-4928-920e-837cba415e85	https://assets.newgamingstore.com/uploads/9684454c-24ab-4396-8bb2-768a33c3033a.jpg
\.


--
-- Data for Name: payment_channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_channels (id, category, name, logo_url, account_number, account_name, is_active, created_at, qr_image_url, tenant_id) FROM stdin;
6ffacf1b-3278-4cfc-bd9a-5029bf56b3ab	Bank Transfer	OVO	https://assets.newgamingstore.com/1785630013435-695586733-ovo.webp	89343434	PT OVO	f	2026-08-02 00:20:20.178135+00	\N	9a145561-8663-4b49-9d02-9a97c93ca322
70dad690-01bd-46b3-a80e-4ffc217ff578	E-Wallet	ShopeePay	https://assets.newgamingstore.com/1785629986625-365173900-shopeepay.webp	2434343434	PT Admin	f	2026-08-02 00:20:06.52272+00	\N	9a145561-8663-4b49-9d02-9a97c93ca322
da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5	QRIS	QRIS	https://assets.newgamingstore.com/1785678302656-552055253-qris-2.webp			t	2026-08-02 13:45:40.777362+00	https://assets.newgamingstore.com/1785678336655-37127872-PHOTO-2026-08-02-14-58-39.jpg	9a145561-8663-4b49-9d02-9a97c93ca322
2027fece-7023-4454-b1f6-4897f18e50b5	E-Wallet	Saldo Akun (Wallet)	https://assets.newgamingstore.com/1785687878042-817520548-56b9a54f-b52d-4170-a448-67bc516e44ae-2.png	WALLET	Auto Deduct	t	2026-08-02 15:25:10.002818+00		9a145561-8663-4b49-9d02-9a97c93ca322
a522962e-afc5-4e7c-9dbd-ff72f896ce8d	E-Wallet	Saldo Akun (Wallet)	https://assets.newgamingstore.com/1785687878042-817520548-56b9a54f-b52d-4170-a448-67bc516e44ae-2.png	WALLET	Auto Deduct	f	2026-08-02 15:25:10.002818+00		a4604e46-0d88-4a16-8e4a-ce6588bf8523
56a29eda-ab98-4976-a78e-54ce2b17f8f8	Bank Transfer	BNI	https://assets.newgamingstore.com/1786371866616-952591050-2311.png	2089605657	HEHEN	t	2026-08-10 14:25:16.707623+00		a4604e46-0d88-4a16-8e4a-ce6588bf8523
94f6490f-6b9f-47c0-8bd3-5e3baef4838c	Bank Transfer	BRI	https://assets.newgamingstore.com/1786372162339-189544337-2314.jpg	Transfer ke BNI 2089605657	HEHEN	t	2026-08-02 00:20:06.52272+00		a4604e46-0d88-4a16-8e4a-ce6588bf8523
3b1d9ac7-d6ad-4ab8-b1a0-c8db8a5e1177	Bank Transfer	BCA	https://assets.newgamingstore.com/1786372302468-926824699-2312.jpg	Transfer ke BNI 2089605657	HEHEN	t	2026-08-02 00:20:20.178135+00		a4604e46-0d88-4a16-8e4a-ce6588bf8523
f09763dc-a474-4fac-b87a-ca2af1c721fb	Bank Transfer	MANDIRI	https://assets.newgamingstore.com/1786372454564-220228930-2315.png	Transfer ke BNI 2089605657	HEHEN	t	2026-08-10 14:34:23.85025+00		a4604e46-0d88-4a16-8e4a-ce6588bf8523
aba89adc-2dcf-4928-920e-837cba415e85	QRIS	QRIS	https://assets.newgamingstore.com/1785678302656-552055253-qris-2.webp		STORE GAME	t	2026-08-02 13:45:40.777362+00	https://assets.newgamingstore.com/uploads/1ad725ba-b52b-4eaf-8839-bac2c6bf095c.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, game_id, name, price, active, created_at, is_flash_sale, original_price, flash_sale_stock, image_url, tenant_id, variant_type) FROM stdin;
84cba569-e7ef-4813-b72c-f73b929c8fb2	86098d19-4024-47c6-8bd9-b16780a3ea8e	25.200 FC Points	750000	t	2026-08-02 08:40:19.4772+00	f	\N	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	iOS
5c63b563-8cae-4618-801a-a3efb9cba342	484efde9-c89d-4954-afc6-3cd4d4d425f9	Genshin Impact 1050 Genesis Crystals (ID)	100000	t	2026-08-02 06:15:33.053848+00	f	\N	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	\N	\N
13c6fecd-10e3-4d2a-96fc-3604634735fa	484efde9-c89d-4954-afc6-3cd4d4d425f9	2.350 Genshin Impact Genesis Crystals 	200000	t	2026-08-02 08:38:49.991856+00	f	200000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	\N	\N
a81844fa-533d-4e47-a70b-5e7e2bc79cf5	484efde9-c89d-4954-afc6-3cd4d4d425f9	5.200 Genshin Impact Genesis Crystals 	400000	t	2026-08-02 08:38:50.367314+00	f	400000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	\N	\N
17a03840-2fdf-4c82-a835-e4677f3a3b5e	484efde9-c89d-4954-afc6-3cd4d4d425f9	7.880 Genshin Impact Genesis Crystals 	500000	t	2026-08-02 08:38:50.762331+00	f	500000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	\N	\N
b23e68c0-1e97-485c-b682-c580b4c0e13d	484efde9-c89d-4954-afc6-3cd4d4d425f9	7.880 *4 Genshin Impact Genesis Crystals 	3150000	t	2026-08-02 08:38:51.228164+00	f	3150000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	\N	\N
7092f5a3-5a73-4d68-b9c1-778404ed9402	484efde9-c89d-4954-afc6-3cd4d4d425f9	7.880 *6 Genshin Impact Genesis Crystals 	4700000	t	2026-08-02 08:38:51.511479+00	f	4700000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	\N	\N
da8038cc-fe31-4f1c-a89a-e611776bceb2	5f34e657-004e-47f1-bd25-3828eab68414	1.700 CP	100000	t	2026-08-02 08:38:51.92023+00	f	100000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
796b0318-825b-43a7-bf4e-38a9cff19e7e	5f34e657-004e-47f1-bd25-3828eab68414	3.950 CP	200000	t	2026-08-02 08:38:52.170872+00	f	200000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
6a5be454-c4f2-4fa1-b505-8e4226fea14f	5f34e657-004e-47f1-bd25-3828eab68414	5.300 CP	300000	t	2026-08-02 08:38:52.448303+00	f	300000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
02b77e76-db9d-4884-a51d-9a014b7e1159	5f34e657-004e-47f1-bd25-3828eab68414	8.400 CP	400000	t	2026-08-02 08:38:52.681274+00	f	400000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
bec59245-ef0d-494b-b291-9d552de5660d	5f34e657-004e-47f1-bd25-3828eab68414	13.500 CP	500000	t	2026-08-02 08:38:52.978944+00	f	500000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
3618f41b-d55c-45c0-bb98-a61bf90e902d	5f34e657-004e-47f1-bd25-3828eab68414	17.400 CP	600000	t	2026-08-02 08:38:53.395323+00	f	600000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
294f27f7-badf-4014-b43d-20a4b7f19260	5f34e657-004e-47f1-bd25-3828eab68414	22.000 CP	700000	t	2026-08-02 08:38:53.622952+00	f	700000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
3e51c42b-b33c-471b-b2d1-616d7e8334c5	5f34e657-004e-47f1-bd25-3828eab68414	28.000 CP	800000	t	2026-08-02 08:38:53.849459+00	f	800000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
efa98016-cc15-4a3e-9e77-bd9c7ed277f2	5f34e657-004e-47f1-bd25-3828eab68414	33.700 CP	900000	t	2026-08-02 08:38:54.154009+00	f	900000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
c25a44ff-62e1-4ce8-abb4-c9a60082e81f	5f34e657-004e-47f1-bd25-3828eab68414	40.000 CP	1000000	t	2026-08-02 08:38:54.386866+00	f	1000000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	\N	\N
c901ea4c-de2a-46c2-9445-3a65ec56dd98	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	2.500 Token	100000	t	2026-08-02 08:38:54.784011+00	f	100000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
a1fdc3a4-0c38-4e4b-893c-a085200d8be0	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	5.500 Token	200000	t	2026-08-02 08:38:55.077696+00	f	200000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
c3662609-0a05-4c93-ac3c-7722ce885642	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	9.500 Token	300000	t	2026-08-02 08:38:55.306585+00	f	300000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
a22ed89b-6fa2-40bc-9fe7-dc9b37dc81ae	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	15.200 Token	400000	t	2026-08-02 08:38:55.622937+00	f	400000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
a9d9186c-4452-4e14-815d-1062c6b880eb	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	18.500 Token	500000	t	2026-08-02 08:38:55.861397+00	f	500000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
1a50ed07-5546-44d0-a0e6-2b98ccca5bdb	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	21.500 Token	600000	t	2026-08-02 08:38:56.121383+00	f	600000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
4ad7c68a-c3d4-4e8a-b8d9-24190ff67bcf	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	24.300 Token	700000	t	2026-08-02 08:38:56.355958+00	f	700000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
29b2229f-35c5-44a4-a6b3-30a5275f1efc	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	29.700 Token	800000	t	2026-08-02 08:38:56.646167+00	f	800000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
c410170c-be5f-469e-8e59-164b006c1ca4	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	48.500 Token	1000000	t	2026-08-02 08:38:56.868916+00	f	1000000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
aea8c77e-eed0-4669-a68f-4c26d26855f1	5f7808f9-bc8d-45c6-a448-4cc50f11a9bf	68.700 Token	1500000	t	2026-08-02 08:38:57.19055+00	f	1500000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	\N	\N
2224ef9b-076b-4d6c-9452-ec941511c78b	f8c0eb61-2286-4f83-b8c8-f4b014a94f2c	1.000 Diamond	100000	t	2026-08-02 08:38:57.541579+00	f	100000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	\N	\N
c9441126-ea47-4b1e-91a3-65c1ddc1d32a	f8c0eb61-2286-4f83-b8c8-f4b014a94f2c	2.000 Diamond	200000	t	2026-08-02 08:38:57.819835+00	f	200000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	\N	\N
d7a6c2b9-4a82-4d9d-a8bb-582d706044b8	f8c0eb61-2286-4f83-b8c8-f4b014a94f2c	3.000 Diamond	300000	t	2026-08-02 08:38:58.047713+00	f	300000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	\N	\N
2b13e755-e65c-455b-9a74-1e16eecd15f2	f8c0eb61-2286-4f83-b8c8-f4b014a94f2c	4.500 Diamond	450000	t	2026-08-02 08:38:58.349184+00	f	450000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	\N	\N
4d249e6e-60e3-474f-ae62-1347d9da1c9f	f8c0eb61-2286-4f83-b8c8-f4b014a94f2c	5.300 Diamond	550000	t	2026-08-02 08:38:58.633168+00	f	550000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	\N	\N
96d38fb0-36b9-4daf-8129-a4223fe37aaf	f8c0eb61-2286-4f83-b8c8-f4b014a94f2c	6.600 Diamond	650000	t	2026-08-02 08:38:58.880375+00	f	650000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	\N	\N
d463de7e-2905-4743-a216-9750c28d3bc6	f8c0eb61-2286-4f83-b8c8-f4b014a94f2c	10.000 Diamond	800000	t	2026-08-02 08:38:59.105149+00	f	800000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	\N	\N
512f84d0-c9f8-4e97-8b5d-ebb78f77fe13	f8c0eb61-2286-4f83-b8c8-f4b014a94f2c	15.000 Diamond	1000000	t	2026-08-02 08:38:59.392311+00	f	1000000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	\N	\N
f16d150c-4e65-479f-b225-1215911ef7d1	230fcf75-22f7-4cb9-a194-ca0378b9437c	2.500 VP	100000	t	2026-08-02 08:38:59.784962+00	f	100000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	\N	\N
1d1136e0-9a04-46b7-9c9b-604026e916bb	230fcf75-22f7-4cb9-a194-ca0378b9437c	5.000 VP	200000	t	2026-08-02 08:39:00.023468+00	f	200000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	\N	\N
6828dffc-9b17-487e-908f-36f17ee4fc9d	230fcf75-22f7-4cb9-a194-ca0378b9437c	7.500 VP	350000	t	2026-08-02 08:39:00.323927+00	f	350000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	\N	\N
92ee8493-ae10-4cc9-b91a-7cfc73a52c11	230fcf75-22f7-4cb9-a194-ca0378b9437c	10.100 VP	550000	t	2026-08-02 08:39:00.579255+00	f	550000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	\N	\N
db236deb-109f-42e8-a050-5b3993d6b883	230fcf75-22f7-4cb9-a194-ca0378b9437c	17.800 VP	750000	t	2026-08-02 08:39:00.851081+00	f	750000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	\N	\N
744340e3-04ae-4539-b57c-8a4204a35fc4	230fcf75-22f7-4cb9-a194-ca0378b9437c	25.100 VP	1000000	t	2026-08-02 08:39:01.102879+00	f	1000000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	\N	\N
088e993b-7e1d-4824-86e4-5c4c985f3621	230fcf75-22f7-4cb9-a194-ca0378b9437c	33.980 VP	1500000	t	2026-08-02 08:39:01.381118+00	f	1500000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	\N	\N
d1191bc2-e3c7-49db-b223-8f2e2cf6355b	2b5be999-9dbe-4ea7-aa25-09babf741860	1.700 UC	100000	t	2026-08-02 08:39:01.744417+00	f	100000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
0944646e-0523-4b46-9a5e-e86c13a3debf	2b5be999-9dbe-4ea7-aa25-09babf741860	5.300 UC	300000	t	2026-08-02 08:39:02.263008+00	f	300000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
f9058b2e-5cdc-4321-bfd9-901520a86ec2	2b5be999-9dbe-4ea7-aa25-09babf741860	8.400 UC	400000	t	2026-08-02 08:39:02.531314+00	f	400000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
5bef7ad1-4244-47a5-8a55-7a0e6e8ef047	484efde9-c89d-4954-afc6-3cd4d4d425f9	7.880 *2 Genshin Impact Genesis Crystals 	750000	t	2026-08-02 08:38:50.990417+00	t	850000	20	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	\N	\N
1cd2528e-e6cb-4ec2-83aa-bef44a8464a1	2b5be999-9dbe-4ea7-aa25-09babf741860	13.500 UC	500000	t	2026-08-02 08:39:02.758981+00	f	500000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
8f727e64-038b-4512-af38-428ce4cd21f5	2b5be999-9dbe-4ea7-aa25-09babf741860	28.000 UC	800000	t	2026-08-02 08:39:03.576844+00	f	800000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
bac101b0-fd6a-472b-b3f1-5b4e9d3e8e87	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	5.050 FC Points (Top Up Android)	250000	t	2026-08-02 08:40:16.334688+00	f	250000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
b3c24db9-58b4-455f-ab2a-e8a56e1c02a0	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	17.050 FC Points (Top Up Android)	500000	t	2026-08-02 08:40:17.096025+00	f	500000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
9c067c79-17b8-4673-aa6c-f4cdc04896ba	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	1.600 FC Points (Top Up iOS)	100000	t	2026-08-02 08:40:17.908017+00	f	100000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
ef8397d6-5d36-47f7-a344-eb2f94b912bc	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	8.100 FC Points (Top Up iOS)	300000	t	2026-08-02 08:40:18.65068+00	f	300000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
17fd84c5-285e-4954-9ab3-2cfe26e61797	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	25.200 FC Points (Top Up iOS)	750000	t	2026-08-02 08:40:19.4772+00	f	750000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
e94622de-2abd-4e48-bee4-811a5374f67e	980e361b-1ba2-471e-9967-54a5ed1f8fce	9.500 Robux	300000	t	2026-08-02 08:39:05.298019+00	f	300000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
b58d1083-2dc6-438f-b436-41fcd8dae785	980e361b-1ba2-471e-9967-54a5ed1f8fce	21.500 Robux	600000	t	2026-08-02 08:39:06.078071+00	f	600000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
7366145d-430f-4570-ac22-a53f652b020c	980e361b-1ba2-471e-9967-54a5ed1f8fce	48.500 Robux	1000000	t	2026-08-02 08:39:06.853697+00	f	1000000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
4c01385c-3611-40c0-9aa3-8ab5d9905f57	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	9.500 Diamond	300000	t	2026-08-02 08:39:08.013265+00	f	300000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
66ce8195-ee68-480d-a799-c596612606fd	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	21.500 Diamond	600000	t	2026-08-02 08:39:08.821572+00	f	600000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
bdfc93e0-4d61-449b-9c82-716bc0bc8b90	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	48.500 Diamond	1000000	t	2026-08-02 08:39:09.573823+00	f	1000000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
7b31bfdf-b30f-4147-9836-973cde951a30	512c6156-fe45-4cd6-a472-6adaf7b92b77	25.200 Coin (IOS)	750000	t	2026-08-02 08:40:19.4772+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	iOS
36171d64-caa9-4719-9cc0-86ea40e1dfb2	57083f25-8e53-45c8-bce6-f9877ee04322	35000 Coins	1000000	t	2026-08-07 16:21:57.109316+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
6bc41bcc-0fb6-4a92-b7dc-0c9c0a37701c	2b5be999-9dbe-4ea7-aa25-09babf741860	17.400 UC	600000	t	2026-08-02 08:39:03.054489+00	f	600000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
3c82d96b-5e86-4f7a-b2b0-8652c947d8c8	2b5be999-9dbe-4ea7-aa25-09babf741860	33.700 UC	900000	t	2026-08-02 08:39:03.804757+00	f	900000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
ce6026bf-e7d9-4ea7-a198-1e84462c7887	980e361b-1ba2-471e-9967-54a5ed1f8fce	2.500 Robux	100000	t	2026-08-02 08:39:04.746349+00	f	100000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
e874cc32-a8f0-4aae-85a1-a48785234a73	980e361b-1ba2-471e-9967-54a5ed1f8fce	15.200 Robux	400000	t	2026-08-02 08:39:05.579365+00	f	400000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
1e6b44d7-fe26-4cd7-b7e8-1be47703e086	980e361b-1ba2-471e-9967-54a5ed1f8fce	24.300 Robux	700000	t	2026-08-02 08:39:06.310385+00	f	700000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
afbd2e77-4096-4d0c-a48f-ab0e65b96afb	980e361b-1ba2-471e-9967-54a5ed1f8fce	68.700 Robux	1500000	t	2026-08-02 08:39:07.131154+00	f	1500000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
e846076e-be24-42fd-824f-f7787f70ad9f	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	2.500 Diamond	100000	t	2026-08-02 08:39:07.514694+00	f	100000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
b0b72072-1a7f-410a-bc1c-f769ffafec7e	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	15.200 Diamond	400000	t	2026-08-02 08:39:08.328404+00	f	400000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
e358f82e-6d97-4c55-b05e-d3f6327a451a	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	24.300 Diamond	700000	t	2026-08-02 08:39:09.046731+00	f	700000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
469edc1d-0847-4682-a703-035b884e6179	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	68.700 Diamond	1500000	t	2026-08-02 08:39:09.86939+00	f	1500000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
84ef1553-0185-4815-b705-adeeca275c40	512c6156-fe45-4cd6-a472-6adaf7b92b77	8.100 Coin (IOS)	300000	t	2026-08-02 08:40:18.65068+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	iOS
cc3f72e6-2626-4e22-9964-ad8e246123a0	57083f25-8e53-45c8-bce6-f9877ee04322	55000 Coins	1500000	t	2026-08-07 16:22:19.147726+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
e9dd50e3-670e-49ff-b34c-6f8e7cf491cf	484efde9-c89d-4954-afc6-3cd4d4d425f9	1.050 Genshin Impact Genesis Crystals 	100000	t	2026-08-02 08:38:49.682907+00	f	100000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	\N	\N
e26b2218-900d-42e0-abd9-86820b21a858	2b5be999-9dbe-4ea7-aa25-09babf741860	3.950 UC	200000	t	2026-08-02 08:39:02.029888+00	f	200000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
19a0493f-14d4-4e77-880c-4f4a1d55f655	2b5be999-9dbe-4ea7-aa25-09babf741860	22.000 UC	700000	t	2026-08-02 08:39:03.298788+00	f	700000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
b2666714-4dc4-4281-9ed3-56c57ba9ed15	2b5be999-9dbe-4ea7-aa25-09babf741860	40.000 UC	1000000	t	2026-08-02 08:39:04.117064+00	f	1000000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	\N	\N
aa7cd8d0-709a-4007-b729-55a6bd692a37	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	1.500 FC Points (Top Up Android)	100000	t	2026-08-02 08:40:15.81591+00	f	100000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
9cda4390-52ab-4bc5-bb5a-134dffb42ccd	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	3.850 FC Points (Top Up Android)	200000	t	2026-08-02 08:40:16.043612+00	f	200000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
36163350-d27d-452b-a3be-2f0ea3150d19	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	8.050 FC Points (Top Up Android)	300000	t	2026-08-02 08:40:16.567453+00	f	300000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
aaad1db9-b287-4529-ba6f-22b8b25137d9	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	13.050 FC Points (Top Up Android)	400000	t	2026-08-02 08:40:16.86381+00	f	400000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
ffb9c3fc-affb-4057-b508-9d6bfc00aed1	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	25.050 FC Points (Top Up Android)	750000	t	2026-08-02 08:40:17.375204+00	f	750000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
4b9140a4-eb16-45e4-943c-1420a4488a09	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	38.000 FC Points (Top Up Android)	1000000	t	2026-08-02 08:40:17.606961+00	f	1000000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
74d781c4-192b-4614-8898-537632797ab6	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	3.900 FC Points (Top Up iOS)	200000	t	2026-08-02 08:40:18.152169+00	f	200000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
92fea928-6101-402f-921c-5b28d4beffde	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	5.100 FC Points (Top Up iOS)	250000	t	2026-08-02 08:40:18.422608+00	f	250000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
15c50e72-acea-49b8-81e0-55ec5d941215	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	13.150 FC Points (Top Up iOS)	400000	t	2026-08-02 08:40:18.959918+00	f	400000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
8ae934a4-d97c-4756-9fc2-6e9d4429fee5	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	17.150 FC Points (Top Up iOS)	500000	t	2026-08-02 08:40:19.191192+00	f	500000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
f10ab622-e840-42a9-af23-591cb0457ba7	a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f	38.250 FC Points (Top Up iOS)	1000000	t	2026-08-02 08:40:19.714826+00	f	1000000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	\N	\N
3ac10d8d-cf3f-48d6-bb14-073bb8278b14	980e361b-1ba2-471e-9967-54a5ed1f8fce	5.500 Robux	200000	t	2026-08-02 08:39:05.046817+00	f	200000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
3918ba90-4cb8-4cce-bfb1-cdaed64d84b1	980e361b-1ba2-471e-9967-54a5ed1f8fce	18.500 Robux	500000	t	2026-08-02 08:39:05.807301+00	f	500000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
006aa1a4-b06c-4e4d-817c-18ad252b0304	980e361b-1ba2-471e-9967-54a5ed1f8fce	29.700 Robux	800000	t	2026-08-02 08:39:06.618488+00	f	800000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	\N	\N
73e977eb-0703-4870-8fa3-458c629f9376	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	5.500 Diamond	200000	t	2026-08-02 08:39:07.761263+00	f	200000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
3aaf8b68-2ffc-4e62-abfb-0dd3fd4eae49	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	18.500 Diamond	500000	t	2026-08-02 08:39:08.563693+00	f	500000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
4da69657-ecd3-4393-8325-ef9cbbcf9dfe	edb8e7a1-6812-4a8f-a84f-18e2b3f6d084	29.700 Diamond	800000	t	2026-08-02 08:39:09.33716+00	f	800000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	\N	\N
93bfe81b-688c-4621-9190-abbd925b971f	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	Genshin Impact 1050 Genesis Crystals (ID)	100000	t	2026-08-02 06:15:33.053848+00	f	\N	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
a8db31b1-9854-4d9b-9431-3b3de8ee9cec	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	2.350 Genshin Impact Genesis Crystals 	200000	t	2026-08-02 08:38:49.991856+00	f	200000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
d6be7b45-ee86-4c72-81a1-3669573ac2df	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	5.200 Genshin Impact Genesis Crystals 	400000	t	2026-08-02 08:38:50.367314+00	f	400000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
e0eef048-ddda-4878-b5b0-3f0c1ef72f36	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	7.880 Genshin Impact Genesis Crystals 	500000	t	2026-08-02 08:38:50.762331+00	f	500000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
4f30c7e2-450d-4296-90a6-2c622fb30abe	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	7.880 *4 Genshin Impact Genesis Crystals 	3150000	t	2026-08-02 08:38:51.228164+00	f	3150000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
c45948de-525d-4087-ad4d-c295c90bb1ef	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	7.880 *6 Genshin Impact Genesis Crystals 	4700000	t	2026-08-02 08:38:51.511479+00	f	4700000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
313c99e6-01c2-41da-a01a-83f44e35bf1d	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	1.700 CP	100000	t	2026-08-02 08:38:51.92023+00	f	100000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
f6673b72-e0f3-43a9-881a-6f486bc11fe3	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	3.950 CP	200000	t	2026-08-02 08:38:52.170872+00	f	200000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
d7ade87c-d863-4c55-9fcb-65037e32df1c	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	5.300 CP	300000	t	2026-08-02 08:38:52.448303+00	f	300000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
ca826b44-fb4b-4b79-9d12-ee9f516e7da9	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	8.400 CP	400000	t	2026-08-02 08:38:52.681274+00	f	400000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
9dd24e70-e209-4ead-be64-470dd8721365	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	13.500 CP	500000	t	2026-08-02 08:38:52.978944+00	f	500000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
f79c9623-2a6c-4f5a-bf68-ba012b31179f	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	17.400 CP	600000	t	2026-08-02 08:38:53.395323+00	f	600000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
32992564-5c38-4dc1-b35c-d9b2876849a2	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	22.000 CP	700000	t	2026-08-02 08:38:53.622952+00	f	700000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
40dfc152-7312-4255-bf58-1303e55fd14d	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	28.000 CP	800000	t	2026-08-02 08:38:53.849459+00	f	800000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
0aa21a79-2377-4ed2-968a-8a6c1ca7b31f	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	33.700 CP	900000	t	2026-08-02 08:38:54.154009+00	f	900000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
99a3536a-d6fc-4b0a-bfc0-448fa16d55ce	ae1cc343-aaa9-426a-87a4-3f42b7fdacd6	40.000 CP	1000000	t	2026-08-02 08:38:54.386866+00	f	1000000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3	57083f25-8e53-45c8-bce6-f9877ee04322	2200 Coins	100000	t	2026-08-07 16:17:14.566368+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
77cf6933-4498-4b79-b271-f3658c71e067	57083f25-8e53-45c8-bce6-f9877ee04322	77000 Coins	2000000	t	2026-08-07 16:23:21.505337+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
0d03514c-eb08-40b6-835d-030843828f2b	2ebd3b44-5b14-45bb-8bd8-786afbc14670	2.500 Token	100000	t	2026-08-02 08:38:54.784011+00	f	100000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
66d732ae-a317-44ee-9ca9-f4e5c7ae8a02	2ebd3b44-5b14-45bb-8bd8-786afbc14670	5.500 Token	200000	t	2026-08-02 08:38:55.077696+00	f	200000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
54f1489b-660b-4ec9-928d-ded0dba9e52e	2ebd3b44-5b14-45bb-8bd8-786afbc14670	9.500 Token	300000	t	2026-08-02 08:38:55.306585+00	f	300000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
60750fe9-dd24-4c59-8010-7b9ef203c311	2ebd3b44-5b14-45bb-8bd8-786afbc14670	15.200 Token	400000	t	2026-08-02 08:38:55.622937+00	f	400000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
c3205b6d-f9e2-49c8-a176-727a681378b8	2ebd3b44-5b14-45bb-8bd8-786afbc14670	18.500 Token	500000	t	2026-08-02 08:38:55.861397+00	f	500000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
11abe2c0-f895-4c60-a3e5-36ea294a4655	2ebd3b44-5b14-45bb-8bd8-786afbc14670	21.500 Token	600000	t	2026-08-02 08:38:56.121383+00	f	600000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
223671b8-c723-4cf1-8d6a-781789f83015	2ebd3b44-5b14-45bb-8bd8-786afbc14670	24.300 Token	700000	t	2026-08-02 08:38:56.355958+00	f	700000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
c99ccaee-23e5-4664-beb1-7ee1cb911c40	2ebd3b44-5b14-45bb-8bd8-786afbc14670	29.700 Token	800000	t	2026-08-02 08:38:56.646167+00	f	800000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
46ac1270-e6ca-458b-9db7-a59a2243f3db	2ebd3b44-5b14-45bb-8bd8-786afbc14670	48.500 Token	1000000	t	2026-08-02 08:38:56.868916+00	f	1000000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
61d1db3c-55e6-4f0e-aee0-81ffec23f131	2ebd3b44-5b14-45bb-8bd8-786afbc14670	68.700 Token	1500000	t	2026-08-02 08:38:57.19055+00	f	1500000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
956ce24b-66c6-48d1-b8fa-2353b40fe21c	9080ff51-f599-450f-9fde-ef81fa7dd557	1.000 Diamond	100000	t	2026-08-02 08:38:57.541579+00	f	100000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
da627e98-8c45-42ad-a3ea-e168dde0c2e7	9080ff51-f599-450f-9fde-ef81fa7dd557	2.000 Diamond	200000	t	2026-08-02 08:38:57.819835+00	f	200000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
f0d0eab6-695c-4aac-86da-415e81721f9f	9080ff51-f599-450f-9fde-ef81fa7dd557	3.000 Diamond	300000	t	2026-08-02 08:38:58.047713+00	f	300000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
8a3cdf49-f773-42f1-b0be-c37e59586587	9080ff51-f599-450f-9fde-ef81fa7dd557	4.500 Diamond	450000	t	2026-08-02 08:38:58.349184+00	f	450000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
d28c66c8-1fd5-4f98-8fb1-032202c68162	9080ff51-f599-450f-9fde-ef81fa7dd557	5.300 Diamond	550000	t	2026-08-02 08:38:58.633168+00	f	550000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
b9f1be41-ee3b-4de6-8fe6-0c73fb358c20	9080ff51-f599-450f-9fde-ef81fa7dd557	6.600 Diamond	650000	t	2026-08-02 08:38:58.880375+00	f	650000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
e1b3ee35-27d5-415a-8286-3515d2092b91	9080ff51-f599-450f-9fde-ef81fa7dd557	10.000 Diamond	800000	t	2026-08-02 08:38:59.105149+00	f	800000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
3f889cc2-96e6-4517-9657-f4d36409007e	9080ff51-f599-450f-9fde-ef81fa7dd557	15.000 Diamond	1000000	t	2026-08-02 08:38:59.392311+00	f	1000000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
74a1cd50-c77b-4cb4-9422-17ea06643eaa	a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	2.500 VP	100000	t	2026-08-02 08:38:59.784962+00	f	100000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
26c97466-ff59-46dd-bcd0-1f04f8d4286f	a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	5.000 VP	200000	t	2026-08-02 08:39:00.023468+00	f	200000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
245e0419-f136-4daa-9da5-8b840936af37	a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	7.500 VP	350000	t	2026-08-02 08:39:00.323927+00	f	350000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
e5f9140e-d43e-49aa-9a22-a72997a304d1	a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	10.100 VP	550000	t	2026-08-02 08:39:00.579255+00	f	550000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
e5c3c630-01e8-458b-b948-a91d02d2a101	a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	17.800 VP	750000	t	2026-08-02 08:39:00.851081+00	f	750000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
714f0a34-d485-4abd-9438-6cff27315806	a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	25.100 VP	1000000	t	2026-08-02 08:39:01.102879+00	f	1000000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
b3385b0a-a623-40e5-b767-5059e1274c7f	a5eb7ecb-3307-4692-a7f2-8fbe7908c38f	33.980 VP	1500000	t	2026-08-02 08:39:01.381118+00	f	1500000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
c27efd1a-d389-406b-a823-eddcac6573a0	5869ed06-5786-4684-b8ed-1484c3c410f4	1.700 UC	100000	t	2026-08-02 08:39:01.744417+00	f	100000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
690dd15a-2142-458c-aa52-e38b77db055d	5869ed06-5786-4684-b8ed-1484c3c410f4	5.300 UC	300000	t	2026-08-02 08:39:02.263008+00	f	300000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
7451cd3d-8d07-433a-9628-a28776b5153d	5869ed06-5786-4684-b8ed-1484c3c410f4	8.400 UC	400000	t	2026-08-02 08:39:02.531314+00	f	400000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
bae0aa14-9cf5-4313-8511-2f30f5734919	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	7.880 *2 Genshin Impact Genesis Crystals 	750000	t	2026-08-02 08:38:50.990417+00	t	850000	20	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
8653a81a-97c4-4ad5-ae57-3ee14838099e	5869ed06-5786-4684-b8ed-1484c3c410f4	13.500 UC	500000	t	2026-08-02 08:39:02.758981+00	f	500000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
5aa8f2db-7a57-4b2a-b5f9-9026a10852cd	5869ed06-5786-4684-b8ed-1484c3c410f4	28.000 UC	800000	t	2026-08-02 08:39:03.576844+00	f	800000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
4b37125b-0c3f-46bd-9f64-d82f20f48f90	86098d19-4024-47c6-8bd9-b16780a3ea8e	5.050 FC Points (Top Up Android)	250000	t	2026-08-02 08:40:16.334688+00	f	250000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
b55ef37c-a7dd-43f1-aacf-0f9d132f6fc0	86098d19-4024-47c6-8bd9-b16780a3ea8e	17.050 FC Points (Top Up Android)	500000	t	2026-08-02 08:40:17.096025+00	f	500000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
8846d535-c220-4145-82ce-a5f327f30c3b	86098d19-4024-47c6-8bd9-b16780a3ea8e	1.600 FC Points (Top Up iOS)	100000	t	2026-08-02 08:40:17.908017+00	f	100000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
15aea95a-4d11-458e-b53c-2f372e0155ef	86098d19-4024-47c6-8bd9-b16780a3ea8e	8.100 FC Points (Top Up iOS)	300000	t	2026-08-02 08:40:18.65068+00	f	300000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
628ed7fe-283e-4380-baf8-d73990e484e1	6f222b87-29e7-4806-8fd0-9801caa713db	9.500 Robux	300000	t	2026-08-02 08:39:05.298019+00	f	300000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
3bb96c58-b3ce-4746-8bee-ba819db710c8	6f222b87-29e7-4806-8fd0-9801caa713db	21.500 Robux	600000	t	2026-08-02 08:39:06.078071+00	f	600000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
3cdb5cd2-63c0-4eeb-a9cd-0e858dca103c	6f222b87-29e7-4806-8fd0-9801caa713db	48.500 Robux	1000000	t	2026-08-02 08:39:06.853697+00	f	1000000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
e6bb44c2-39e9-471e-83fe-daf04bafb867	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	9.500 Diamond	300000	t	2026-08-02 08:39:08.013265+00	f	300000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
f1bd5d65-bc36-41f4-86af-4a6885af11e3	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	21.500 Diamond	600000	t	2026-08-02 08:39:08.821572+00	f	600000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
e6b59a0a-dced-455c-8898-ed48b86ce961	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	48.500 Diamond	1000000	t	2026-08-02 08:39:09.573823+00	f	1000000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
851845b9-056b-4278-9255-22ac26468885	5869ed06-5786-4684-b8ed-1484c3c410f4	17.400 UC	600000	t	2026-08-02 08:39:03.054489+00	f	600000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
d9bdd934-417f-49bb-9953-a9f7384d5d39	5869ed06-5786-4684-b8ed-1484c3c410f4	33.700 UC	900000	t	2026-08-02 08:39:03.804757+00	f	900000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
45969c91-bab1-489b-b406-89200858495a	6f222b87-29e7-4806-8fd0-9801caa713db	2.500 Robux	100000	t	2026-08-02 08:39:04.746349+00	f	100000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
abe08016-b7ec-43f5-91fa-10f7d956c9c4	6f222b87-29e7-4806-8fd0-9801caa713db	15.200 Robux	400000	t	2026-08-02 08:39:05.579365+00	f	400000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
878f6e44-a052-4581-b68c-7ef14faecf1b	6f222b87-29e7-4806-8fd0-9801caa713db	24.300 Robux	700000	t	2026-08-02 08:39:06.310385+00	f	700000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
e5176d2b-63f4-4cb5-bb52-d4f9d2ca07bf	6f222b87-29e7-4806-8fd0-9801caa713db	68.700 Robux	1500000	t	2026-08-02 08:39:07.131154+00	f	1500000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
52fbbf8a-88c4-420e-8244-9e1ed1c3b091	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	2.500 Diamond	100000	t	2026-08-02 08:39:07.514694+00	f	100000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
9ddc0f25-841d-4607-b3b7-6c3d502839ca	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	15.200 Diamond	400000	t	2026-08-02 08:39:08.328404+00	f	400000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
c8212a24-c56e-4cea-8607-71b2e0422581	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	24.300 Diamond	700000	t	2026-08-02 08:39:09.046731+00	f	700000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
0062ea4d-8ce4-4928-921b-5b35a07b1eea	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	68.700 Diamond	1500000	t	2026-08-02 08:39:09.86939+00	f	1500000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
8bff98df-b1c8-4449-a8f6-eadee08390d0	7110c289-7bbf-44f3-8d99-c5cd0a547e4d	1.050 Genshin Impact Genesis Crystals 	100000	t	2026-08-02 08:38:49.682907+00	f	100000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
d40201af-4727-4750-b891-95b44377fa8d	5869ed06-5786-4684-b8ed-1484c3c410f4	3.950 UC	200000	t	2026-08-02 08:39:02.029888+00	f	200000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
580ed97b-5e36-4f39-a12e-22fff9917381	5869ed06-5786-4684-b8ed-1484c3c410f4	22.000 UC	700000	t	2026-08-02 08:39:03.298788+00	f	700000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
8693630a-98b1-4bb3-a07b-43c2a2675580	5869ed06-5786-4684-b8ed-1484c3c410f4	40.000 UC	1000000	t	2026-08-02 08:39:04.117064+00	f	1000000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
2e645715-7d84-45e2-9eb0-d85e31d8c6cd	86098d19-4024-47c6-8bd9-b16780a3ea8e	1.500 FC Points (Top Up Android)	100000	t	2026-08-02 08:40:15.81591+00	f	100000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
84c501d3-64a9-44ee-8845-b272df1c92e4	86098d19-4024-47c6-8bd9-b16780a3ea8e	3.850 FC Points (Top Up Android)	200000	t	2026-08-02 08:40:16.043612+00	f	200000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
0c26e576-bc3e-4a2d-b656-fbb4e5792548	86098d19-4024-47c6-8bd9-b16780a3ea8e	8.050 FC Points (Top Up Android)	300000	t	2026-08-02 08:40:16.567453+00	f	300000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
9fe9e9cf-a3db-4b0f-88b5-cf20facc8f4d	86098d19-4024-47c6-8bd9-b16780a3ea8e	13.050 FC Points (Top Up Android)	400000	t	2026-08-02 08:40:16.86381+00	f	400000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
816f35c7-f329-4be2-80aa-de0cc2a91f8a	86098d19-4024-47c6-8bd9-b16780a3ea8e	3.900 FC Points (Top Up iOS)	200000	t	2026-08-02 08:40:18.152169+00	f	200000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
71155bd4-b759-460a-b3d9-d1637367c860	86098d19-4024-47c6-8bd9-b16780a3ea8e	5.100 FC Points (Top Up iOS)	250000	t	2026-08-02 08:40:18.422608+00	f	250000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
735be275-801f-4b8c-bba1-afb67370c807	86098d19-4024-47c6-8bd9-b16780a3ea8e	13.150 FC Points (Top Up iOS)	400000	t	2026-08-02 08:40:18.959918+00	f	400000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
9c27641e-4c34-4ed6-84b3-deb3b7ccfb98	86098d19-4024-47c6-8bd9-b16780a3ea8e	17.150 FC Points (Top Up iOS)	500000	t	2026-08-02 08:40:19.191192+00	f	500000	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	\N
05b87408-c21d-4445-8941-824e7e235528	6f222b87-29e7-4806-8fd0-9801caa713db	5.500 Robux	200000	t	2026-08-02 08:39:05.046817+00	f	200000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
25de16c1-a7cf-4837-9259-362563836b84	6f222b87-29e7-4806-8fd0-9801caa713db	18.500 Robux	500000	t	2026-08-02 08:39:05.807301+00	f	500000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
04764086-5db1-4fa6-8582-00b0088596ad	6f222b87-29e7-4806-8fd0-9801caa713db	29.700 Robux	800000	t	2026-08-02 08:39:06.618488+00	f	800000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
f2306acd-8d85-44c8-a153-b02d16380d07	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	5.500 Diamond	200000	t	2026-08-02 08:39:07.761263+00	f	200000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
6f91ad22-4850-4c24-b63f-aed947fd14e1	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	18.500 Diamond	500000	t	2026-08-02 08:39:08.563693+00	f	500000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
6c8aac6d-1b24-431f-9baa-9c4c35f7cc3f	b0af1dd3-f015-44b6-be4e-ba57b015a7c4	29.700 Diamond	800000	t	2026-08-02 08:39:09.33716+00	f	800000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	9a145561-8663-4b49-9d02-9a97c93ca322	\N
896f94f5-24f9-435f-8463-0c8c05c3ac4a	86098d19-4024-47c6-8bd9-b16780a3ea8e	38.250 FC Points	1000000	t	2026-08-02 08:40:19.714826+00	f	\N	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	iOS
9c57c5d6-ecb3-4ad9-91d5-fc07acaf5157	86098d19-4024-47c6-8bd9-b16780a3ea8e	38.000 FC Points	1000000	t	2026-08-02 08:40:17.606961+00	f	\N	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	Android
33c58bfd-ea4d-45dd-9020-52fd68e61fab	86098d19-4024-47c6-8bd9-b16780a3ea8e	25.050 FC Points	750000	t	2026-08-02 08:40:17.375204+00	f	\N	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	9a145561-8663-4b49-9d02-9a97c93ca322	Android
eea48ac4-eeef-40be-8759-1408c71e3b6d	57083f25-8e53-45c8-bce6-f9877ee04322	5000 Coins	200000	t	2026-08-07 16:18:34.113957+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
a9784ceb-44b6-423d-b062-cf989767b371	57083f25-8e53-45c8-bce6-f9877ee04322	16000 Coins	500000	t	2026-08-07 16:19:40.581571+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
16f36618-a67b-4750-9c37-0e4f99be7b01	57083f25-8e53-45c8-bce6-f9877ee04322	8300 Coins	300000	t	2026-08-07 16:18:48.560738+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
d2d99243-7c10-46f9-bc5f-c7ec33dd4813	57083f25-8e53-45c8-bce6-f9877ee04322	11700 Coins	400000	t	2026-08-07 16:19:17.880974+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
13b84cfd-3c08-471a-99fa-b893042880cd	57083f25-8e53-45c8-bce6-f9877ee04322	20000 Coins	600000	t	2026-08-07 16:20:17.996669+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
4f5778bc-1721-4bba-8991-19386259b1bf	7485df14-c3e2-42e1-8d6b-dcc4a09e64a5	Genshin Impact 1050 Genesis Crystals (ID)	100000	t	2026-08-02 06:15:33.053848+00	f	\N	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
12cc2986-19c8-4df0-b1a0-728a7e648ef6	7485df14-c3e2-42e1-8d6b-dcc4a09e64a5	2.350 Genshin Impact Genesis Crystals 	200000	t	2026-08-02 08:38:49.991856+00	f	200000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
750f6e3c-d2cd-4a5c-a0c5-c0846ae01b45	7485df14-c3e2-42e1-8d6b-dcc4a09e64a5	5.200 Genshin Impact Genesis Crystals 	400000	t	2026-08-02 08:38:50.367314+00	f	400000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
d71a388c-75df-46b0-9be0-5ecc1e219d3a	7485df14-c3e2-42e1-8d6b-dcc4a09e64a5	7.880 Genshin Impact Genesis Crystals 	500000	t	2026-08-02 08:38:50.762331+00	f	500000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
7beaf302-aa34-40de-a1ad-5ab03d133982	7485df14-c3e2-42e1-8d6b-dcc4a09e64a5	7.880 *4 Genshin Impact Genesis Crystals 	3150000	t	2026-08-02 08:38:51.228164+00	f	3150000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
884055ed-a25a-42c5-ba62-0b90ff4915fe	7485df14-c3e2-42e1-8d6b-dcc4a09e64a5	7.880 *6 Genshin Impact Genesis Crystals 	4700000	t	2026-08-02 08:38:51.511479+00	f	4700000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
a3ddfc76-b8a1-425e-a7a7-f46626a8c820	62fecbc0-82b7-4383-86a9-060912ebe19e	1.700 CP	100000	t	2026-08-02 08:38:51.92023+00	f	100000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
436d011d-fc8f-4b19-9dc2-0747a2e66443	62fecbc0-82b7-4383-86a9-060912ebe19e	3.950 CP	200000	t	2026-08-02 08:38:52.170872+00	f	200000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
426e3a84-e39f-4ff8-9864-5a28239eb227	62fecbc0-82b7-4383-86a9-060912ebe19e	5.300 CP	300000	t	2026-08-02 08:38:52.448303+00	f	300000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
078872c6-a728-4af1-ab81-2e3ea3742ec6	62fecbc0-82b7-4383-86a9-060912ebe19e	8.400 CP	400000	t	2026-08-02 08:38:52.681274+00	f	400000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
4ce21a88-4878-4bc1-8d6f-9c83616afe47	62fecbc0-82b7-4383-86a9-060912ebe19e	13.500 CP	500000	t	2026-08-02 08:38:52.978944+00	f	500000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
b7483c88-742d-4ad0-b165-07f823ed3e94	62fecbc0-82b7-4383-86a9-060912ebe19e	17.400 CP	600000	t	2026-08-02 08:38:53.395323+00	f	600000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
b6a6c384-ea79-44a0-a69a-e01b599f6abc	62fecbc0-82b7-4383-86a9-060912ebe19e	22.000 CP	700000	t	2026-08-02 08:38:53.622952+00	f	700000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
ec2d7155-280d-4b27-99ff-ffaa234d0225	62fecbc0-82b7-4383-86a9-060912ebe19e	28.000 CP	800000	t	2026-08-02 08:38:53.849459+00	f	800000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
fef6d0cf-5b09-450e-8902-1f34f809bb43	62fecbc0-82b7-4383-86a9-060912ebe19e	33.700 CP	900000	t	2026-08-02 08:38:54.154009+00	f	900000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
40585624-0c10-40e5-9682-30a4dffb08b7	62fecbc0-82b7-4383-86a9-060912ebe19e	40.000 CP	1000000	t	2026-08-02 08:38:54.386866+00	f	1000000	0	https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
94259e7b-d8e4-4cb9-ad5e-f778dbfe684f	a80754a9-31db-4095-9218-8b0a9feb1009	2.500 Token	100000	t	2026-08-02 08:38:54.784011+00	f	100000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
48031e31-c227-4894-ac34-031508320931	a80754a9-31db-4095-9218-8b0a9feb1009	5.500 Token	200000	t	2026-08-02 08:38:55.077696+00	f	200000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
4f73975f-e339-427c-8a65-dfa7821e47a2	a80754a9-31db-4095-9218-8b0a9feb1009	9.500 Token	300000	t	2026-08-02 08:38:55.306585+00	f	300000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
1c0cdeea-f22c-4f03-8cb7-5e9d85a1ad81	a80754a9-31db-4095-9218-8b0a9feb1009	15.200 Token	400000	t	2026-08-02 08:38:55.622937+00	f	400000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
11fd1e9e-cfa9-4b7b-8dad-8b439cb4258e	a80754a9-31db-4095-9218-8b0a9feb1009	18.500 Token	500000	t	2026-08-02 08:38:55.861397+00	f	500000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
9873d92b-b10c-4f59-a39e-b4d6a954686a	a80754a9-31db-4095-9218-8b0a9feb1009	21.500 Token	600000	t	2026-08-02 08:38:56.121383+00	f	600000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
34682b4e-1a0a-4319-aa52-ab933d5d093b	a80754a9-31db-4095-9218-8b0a9feb1009	24.300 Token	700000	t	2026-08-02 08:38:56.355958+00	f	700000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
c6d2d5ca-30cf-4af9-a084-5a4c0d6c78f2	a80754a9-31db-4095-9218-8b0a9feb1009	29.700 Token	800000	t	2026-08-02 08:38:56.646167+00	f	800000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
a03d60c7-0f7e-4e18-a411-dfd7c982b800	a80754a9-31db-4095-9218-8b0a9feb1009	48.500 Token	1000000	t	2026-08-02 08:38:56.868916+00	f	1000000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
2073f5d4-cc54-470a-a1f8-9f25e4d0cdcd	a80754a9-31db-4095-9218-8b0a9feb1009	68.700 Token	1500000	t	2026-08-02 08:38:57.19055+00	f	1500000	0	https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
26ca65dc-c806-4e42-88d2-d91ccf84b349	c12f54ca-3a23-4265-9c58-9d3eb4056c4d	1.000 Diamond	100000	t	2026-08-02 08:38:57.541579+00	f	100000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
03a23302-377c-4d45-b8c1-04921f08df9e	c12f54ca-3a23-4265-9c58-9d3eb4056c4d	2.000 Diamond	200000	t	2026-08-02 08:38:57.819835+00	f	200000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
31a0fd1e-05f7-4ce9-94e3-9ec170cd0866	c12f54ca-3a23-4265-9c58-9d3eb4056c4d	3.000 Diamond	300000	t	2026-08-02 08:38:58.047713+00	f	300000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
9fc3aed5-2ebc-4d61-ab3e-b8fa9eedc15f	c12f54ca-3a23-4265-9c58-9d3eb4056c4d	4.500 Diamond	450000	t	2026-08-02 08:38:58.349184+00	f	450000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
52cafd3b-24f7-4fa4-bdbc-754369d3cf8a	c12f54ca-3a23-4265-9c58-9d3eb4056c4d	5.300 Diamond	550000	t	2026-08-02 08:38:58.633168+00	f	550000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
0beda884-064d-4119-adfa-adc43e5ba98d	c12f54ca-3a23-4265-9c58-9d3eb4056c4d	6.600 Diamond	650000	t	2026-08-02 08:38:58.880375+00	f	650000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
95c578f2-d8fd-43a9-82ff-6d863e65f82e	c12f54ca-3a23-4265-9c58-9d3eb4056c4d	10.000 Diamond	800000	t	2026-08-02 08:38:59.105149+00	f	800000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
c47c5596-0aea-4147-aa5a-856c26e740c3	c12f54ca-3a23-4265-9c58-9d3eb4056c4d	15.000 Diamond	1000000	t	2026-08-02 08:38:59.392311+00	f	1000000	0	https://assets.newgamingstore.com/imgop.itemku.com.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
719f0e77-8034-46a9-bd28-9a3de1b89e33	747a8732-b175-4ed2-bcd1-f498fc62f63a	2.500 VP	100000	t	2026-08-02 08:38:59.784962+00	f	100000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
e408a595-0fb0-40e1-a3ce-68f3489f7fea	747a8732-b175-4ed2-bcd1-f498fc62f63a	5.000 VP	200000	t	2026-08-02 08:39:00.023468+00	f	200000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
9bc6d635-6e97-4fb0-af4f-9f3bcf6aebf0	747a8732-b175-4ed2-bcd1-f498fc62f63a	7.500 VP	350000	t	2026-08-02 08:39:00.323927+00	f	350000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
7fe10501-8baf-4cda-a4f5-be4dbf529f45	747a8732-b175-4ed2-bcd1-f498fc62f63a	10.100 VP	550000	t	2026-08-02 08:39:00.579255+00	f	550000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
23bd68d8-1e7d-419d-8545-9ea133f16a35	747a8732-b175-4ed2-bcd1-f498fc62f63a	17.800 VP	750000	t	2026-08-02 08:39:00.851081+00	f	750000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
75e16e35-898d-4661-b940-4113a73cd077	747a8732-b175-4ed2-bcd1-f498fc62f63a	25.100 VP	1000000	t	2026-08-02 08:39:01.102879+00	f	1000000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
fc8166aa-b83f-49b7-a62f-9338598128bd	747a8732-b175-4ed2-bcd1-f498fc62f63a	33.980 VP	1500000	t	2026-08-02 08:39:01.381118+00	f	1500000	0	https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
7608bfa3-54c6-4fa5-897d-386135e57a72	10c1b9d4-7197-4464-bf9f-ee710c1f0180	1.700 UC	100000	t	2026-08-02 08:39:01.744417+00	f	100000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
1f14d7e9-4253-4e93-b1f1-19c6a6e31fbc	10c1b9d4-7197-4464-bf9f-ee710c1f0180	5.300 UC	300000	t	2026-08-02 08:39:02.263008+00	f	300000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
d44cf307-755a-4f9a-becb-c9203b12b4ef	10c1b9d4-7197-4464-bf9f-ee710c1f0180	8.400 UC	400000	t	2026-08-02 08:39:02.531314+00	f	400000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
6f1df0f5-d0f5-4a7c-b2de-0daff6c7651a	10c1b9d4-7197-4464-bf9f-ee710c1f0180	13.500 UC	500000	t	2026-08-02 08:39:02.758981+00	f	500000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
e399ff77-0fc1-4aae-a132-0afc81288507	10c1b9d4-7197-4464-bf9f-ee710c1f0180	28.000 UC	800000	t	2026-08-02 08:39:03.576844+00	f	800000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
741449be-0fd3-4259-8ae3-ee0971258fb9	a8e80afd-9b72-4088-b49d-52de3687d936	9.500 Robux	300000	t	2026-08-02 08:39:05.298019+00	f	300000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
6b5e7b12-c52b-4ee9-978b-274571a8d26a	a8e80afd-9b72-4088-b49d-52de3687d936	21.500 Robux	600000	t	2026-08-02 08:39:06.078071+00	f	600000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
c0bfc1fe-6ffa-47fd-a82d-83cd4f4b7724	a8e80afd-9b72-4088-b49d-52de3687d936	48.500 Robux	1000000	t	2026-08-02 08:39:06.853697+00	f	1000000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
68e8fa9c-e240-43d7-bbca-c4c66a4a4d9f	f6d2c442-d7c7-4315-b86c-0f0bff635377	9.500 Diamond	300000	t	2026-08-02 08:39:08.013265+00	f	300000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
ad4bda76-296d-4a60-b27e-40610e4596e6	f6d2c442-d7c7-4315-b86c-0f0bff635377	21.500 Diamond	600000	t	2026-08-02 08:39:08.821572+00	f	600000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
e7a9ab30-dd3f-4372-823a-c8ef01418b82	f6d2c442-d7c7-4315-b86c-0f0bff635377	48.500 Diamond	1000000	t	2026-08-02 08:39:09.573823+00	f	1000000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
801bc4fc-5dd1-49b3-8f0d-8deff5059386	10c1b9d4-7197-4464-bf9f-ee710c1f0180	17.400 UC	600000	t	2026-08-02 08:39:03.054489+00	f	600000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
18a677f1-60b4-4181-9ffe-4c9cf86db827	512c6156-fe45-4cd6-a472-6adaf7b92b77	17.050 Coin (Android)	500000	t	2026-08-02 08:40:17.096025+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	Android
d77584f4-eed0-4135-a585-132b81b448da	512c6156-fe45-4cd6-a472-6adaf7b92b77	5.050 Coin (Android)	250000	t	2026-08-02 08:40:16.334688+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	Android
2d42e7bf-496b-4aef-80d2-b477f3d92105	512c6156-fe45-4cd6-a472-6adaf7b92b77	1.600 Coin (IOS)	100000	t	2026-08-02 08:40:17.908017+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	iOS
8bcb17e9-6321-48d8-a927-dfdee34d3975	7485df14-c3e2-42e1-8d6b-dcc4a09e64a5	7.880 *2 Genshin Impact Genesis Crystals 	750000	t	2026-08-02 08:38:50.990417+00	f	\N	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
671519c7-4257-4f3e-98a8-a90b4a29e3f4	10c1b9d4-7197-4464-bf9f-ee710c1f0180	33.700 UC	900000	t	2026-08-02 08:39:03.804757+00	f	900000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
0850cdad-09e2-4737-9f94-055dbf3ff231	a8e80afd-9b72-4088-b49d-52de3687d936	2.500 Robux	100000	t	2026-08-02 08:39:04.746349+00	f	100000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
85d1a827-01d5-4348-9235-7404aac6c295	a8e80afd-9b72-4088-b49d-52de3687d936	15.200 Robux	400000	t	2026-08-02 08:39:05.579365+00	f	400000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
ae04a2cf-056c-4886-b015-4c10e07b58b3	a8e80afd-9b72-4088-b49d-52de3687d936	24.300 Robux	700000	t	2026-08-02 08:39:06.310385+00	f	700000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
49a20754-e51c-4988-87df-90e4168a0da4	a8e80afd-9b72-4088-b49d-52de3687d936	68.700 Robux	1500000	t	2026-08-02 08:39:07.131154+00	f	1500000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
7a74e715-f19c-454f-9f73-ced40248ba63	f6d2c442-d7c7-4315-b86c-0f0bff635377	2.500 Diamond	100000	t	2026-08-02 08:39:07.514694+00	f	100000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
4e19cd3b-5904-4138-b9bf-52329cf10c20	f6d2c442-d7c7-4315-b86c-0f0bff635377	15.200 Diamond	400000	t	2026-08-02 08:39:08.328404+00	f	400000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
64f96493-6aab-4968-8451-1175f3dc2455	f6d2c442-d7c7-4315-b86c-0f0bff635377	24.300 Diamond	700000	t	2026-08-02 08:39:09.046731+00	f	700000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
31fcb04b-fbf1-46d1-93fe-81916aaba694	f6d2c442-d7c7-4315-b86c-0f0bff635377	68.700 Diamond	1500000	t	2026-08-02 08:39:09.86939+00	f	1500000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
2337e527-a2c9-4621-91ff-d03412eb1c97	7485df14-c3e2-42e1-8d6b-dcc4a09e64a5	1.050 Genshin Impact Genesis Crystals 	100000	t	2026-08-02 08:38:49.682907+00	f	100000	0	https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
c1e939d6-156f-4018-b104-eb3700b16fea	10c1b9d4-7197-4464-bf9f-ee710c1f0180	3.950 UC	200000	t	2026-08-02 08:39:02.029888+00	f	200000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
a06df1a1-b7c1-483c-99f6-3c12e4a0dd72	10c1b9d4-7197-4464-bf9f-ee710c1f0180	22.000 UC	700000	t	2026-08-02 08:39:03.298788+00	f	700000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
a6e83832-e871-4233-97d9-da845999d651	10c1b9d4-7197-4464-bf9f-ee710c1f0180	40.000 UC	1000000	t	2026-08-02 08:39:04.117064+00	f	1000000	0	https://assets.newgamingstore.com/vDZORckp1H6izkA.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
55a0b858-e8d0-4373-93e7-f7f656057257	a8e80afd-9b72-4088-b49d-52de3687d936	5.500 Robux	200000	t	2026-08-02 08:39:05.046817+00	f	200000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
cd176605-d909-4ff6-bbcf-8270ee4b8fe7	a8e80afd-9b72-4088-b49d-52de3687d936	18.500 Robux	500000	t	2026-08-02 08:39:05.807301+00	f	500000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
a5d36480-7c5c-4395-bff2-0b0cbd149297	a8e80afd-9b72-4088-b49d-52de3687d936	29.700 Robux	800000	t	2026-08-02 08:39:06.618488+00	f	800000	0	https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
7a16753e-d851-4faf-954d-9b8a4077867d	f6d2c442-d7c7-4315-b86c-0f0bff635377	5.500 Diamond	200000	t	2026-08-02 08:39:07.761263+00	f	200000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
0813d5ae-a040-4f2e-a665-94580ce930bc	f6d2c442-d7c7-4315-b86c-0f0bff635377	18.500 Diamond	500000	t	2026-08-02 08:39:08.563693+00	f	500000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
11630997-cbd9-43f8-9aca-eddcaf3a2b67	f6d2c442-d7c7-4315-b86c-0f0bff635377	29.700 Diamond	800000	t	2026-08-02 08:39:09.33716+00	f	800000	0	https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
8f6320c0-3702-4a4b-983d-a04d94c86a16	512c6156-fe45-4cd6-a472-6adaf7b92b77	17.150 Coin (IOS)	500000	t	2026-08-02 08:40:19.191192+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	iOS
9da6a566-bc5c-4458-980c-644e646dbb26	512c6156-fe45-4cd6-a472-6adaf7b92b77	3.850 Coin (Android)	200000	t	2026-08-02 08:40:16.043612+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	Android
faf7b240-6b35-4e92-b974-60a69c4fdb1d	512c6156-fe45-4cd6-a472-6adaf7b92b77	1.500 Coin (Android)	100000	t	2026-08-02 08:40:15.81591+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	Android
bc08e697-f3cd-4f18-9831-2d49f1946215	512c6156-fe45-4cd6-a472-6adaf7b92b77	5.100 Coin (IOS)	250000	t	2026-08-02 08:40:18.422608+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	iOS
87307348-e3f1-4782-8d66-e9a495ddebae	512c6156-fe45-4cd6-a472-6adaf7b92b77	3.900 Coin (IOS)	200000	t	2026-08-02 08:40:18.152169+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	iOS
8f144ac2-03aa-423e-b59a-d159aab31285	57083f25-8e53-45c8-bce6-f9877ee04322	25000 Coins	750000	t	2026-08-07 16:20:45.775493+00	f	\N	0	https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	\N
da353d89-8fca-4375-94c5-0b92bf6acadd	512c6156-fe45-4cd6-a472-6adaf7b92b77	38.000 Coin (Android)	1000000	t	2026-08-02 08:40:17.606961+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	Android
3eab3b50-73bb-444d-9318-c0e5cfd49238	512c6156-fe45-4cd6-a472-6adaf7b92b77	13.150 Coin (IOS)	400000	t	2026-08-02 08:40:18.959918+00	f	\N	0	https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	iOS
d2b3735c-d47d-4681-8d16-c8972ec70bf4	512c6156-fe45-4cd6-a472-6adaf7b92b77	38.250 Coin (IOS)	1000000	t	2026-08-02 08:40:19.714826+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	iOS
bf6c6adb-3357-44dd-82fd-dc1ba8e9db2e	512c6156-fe45-4cd6-a472-6adaf7b92b77	25.050 Coin (Android)	750000	t	2026-08-02 08:40:17.375204+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	Android
ed6b1015-ba58-4d62-93bf-219e8917bd3a	512c6156-fe45-4cd6-a472-6adaf7b92b77	13.050 Coin (Android)	400000	t	2026-08-02 08:40:16.86381+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	Android
0e04af83-ddf0-4159-97fa-d46f6003a953	512c6156-fe45-4cd6-a472-6adaf7b92b77	8.050 Coin (Android)	300000	t	2026-08-02 08:40:16.567453+00	f	\N	0	https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png	a4604e46-0d88-4a16-8e4a-ce6588bf8523	Android
\.


--
-- Data for Name: promo_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promo_codes (id, code, discount_type, discount_value, max_uses, used_count, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, domain, theme_config, created_at, admin_domain, is_maintenance, auth_mode) FROM stdin;
a4604e46-0d88-4a16-8e4a-ce6588bf8523	New Gaming Store	newgamingstore.com	{"email": "", "ga4Id": "", "gtmId": "", "tiktok": "", "logoUrl": "https://assets.newgamingstore.com/logo-newgaming.png", "ogImage": "https://assets.newgamingstore.com/1785681417474-776161383-PHOTO-2026-08-02-18-26-57.jpg", "sliders": ["https://assets.newgamingstore.com/1785681417474-776161383-PHOTO-2026-08-02-18-26-57.jpg", "https://assets.newgamingstore.com/uploads/4d976ad2-3d90-4c7d-a724-a09a7bb9b318.jpg"], "youtube": "", "seoTitle": "NewGamingStore | Top Up Cepat Murah", "whatsapp": "6282227495470", "instagram": "", "promoCode": "", "seoKeywords": "", "waChannelUrl": "", "promoHeadline": "", "seoDescription": "NEWGAMINGSTORE - Platform topup game terlengkap, cepat & termurah di Indonesia dengan layanan 24/7. Nikmati topup Mobile Legends, Starlight & lainya secara instan", "waFloatingText": "Chat CS Online", "footerBannerUrl": "", "gscVerification": "", "waChannelActive": false, "gameDetailBanner": "https://assets.newgamingstore.com/Game_characters_text_banner_logo_202608021252_11zon.webp", "operationalHours": "", "waDefaultMessage": "Halo Admin, saya ingin bertanya seputar layanan top-up.", "waFloatingActive": true, "heroBackgroundUrl": "https://assets.newgamingstore.com/bg_utama_1777997049.webp", "waFloatingAvatarUrl": ""}	2026-08-02 14:29:47.378346+00	admin.newgamingstore.com	f	username
9a145561-8663-4b49-9d02-9a97c93ca322	NewGamingStore Mockup	localhost	{"colors": {"card": "#0e221b", "text": "#ffffff", "primary": "#10b981", "background": "#06120e"}, "themePreset": "emerald"}	2026-07-31 14:46:32.227505+00	admin.localhost	f	username
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallets (email, balance, updated_at, tenant_id) FROM stdin;
testing21@gmail.com	500000	2026-08-02 16:38:47.667987+00	9a145561-8663-4b49-9d02-9a97c93ca322
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-07-31 09:11:32
20211116045059	2026-07-31 09:11:32
20211116050929	2026-07-31 09:11:32
20211116051442	2026-07-31 09:11:32
20211116212300	2026-07-31 09:11:32
20211116213355	2026-07-31 09:11:32
20211116213934	2026-07-31 09:11:32
20211116214523	2026-07-31 09:11:32
20211122062447	2026-07-31 09:11:32
20211124070109	2026-07-31 09:11:32
20211202204204	2026-07-31 09:11:32
20211202204605	2026-07-31 09:11:32
20211210212804	2026-07-31 09:11:32
20211228014915	2026-07-31 09:11:32
20220107221237	2026-07-31 09:11:32
20220228202821	2026-07-31 09:11:32
20220312004840	2026-07-31 09:11:32
20220603231003	2026-07-31 09:11:32
20220603232444	2026-07-31 09:11:32
20220615214548	2026-07-31 09:11:32
20220712093339	2026-07-31 09:11:32
20220908172859	2026-07-31 09:11:32
20220916233421	2026-07-31 09:11:32
20230119133233	2026-07-31 09:11:32
20230128025114	2026-07-31 09:11:32
20230128025212	2026-07-31 09:11:32
20230227211149	2026-07-31 09:11:32
20230228184745	2026-07-31 09:11:32
20230308225145	2026-07-31 09:11:32
20230328144023	2026-07-31 09:11:32
20231018144023	2026-07-31 09:11:32
20231204144023	2026-07-31 09:11:32
20231204144024	2026-07-31 09:11:32
20231204144025	2026-07-31 09:11:32
20240108234812	2026-07-31 09:11:32
20240109165339	2026-07-31 09:11:32
20240227174441	2026-07-31 09:11:32
20240311171622	2026-07-31 09:11:32
20240321100241	2026-07-31 09:11:32
20240401105812	2026-07-31 09:11:32
20240418121054	2026-07-31 09:11:32
20240523004032	2026-07-31 09:11:32
20240618124746	2026-07-31 09:11:32
20240801235015	2026-07-31 09:11:32
20240805133720	2026-07-31 09:11:32
20240827160934	2026-07-31 09:11:32
20240919163303	2026-07-31 09:11:32
20240919163305	2026-07-31 09:11:32
20241019105805	2026-07-31 09:11:32
20241030150047	2026-07-31 09:11:32
20241108114728	2026-07-31 09:11:32
20241121104152	2026-07-31 09:11:32
20241130184212	2026-07-31 09:11:32
20241220035512	2026-07-31 09:11:32
20241220123912	2026-07-31 09:11:32
20241224161212	2026-07-31 09:11:32
20250107150512	2026-07-31 09:11:32
20250110162412	2026-07-31 09:11:32
20250123174212	2026-07-31 09:11:32
20250128220012	2026-07-31 09:11:32
20250506224012	2026-07-31 09:11:32
20250523164012	2026-07-31 09:11:32
20250714121412	2026-07-31 09:11:32
20250905041441	2026-07-31 09:11:32
20251103001201	2026-07-31 09:11:32
20251120212548	2026-07-31 09:11:32
20251120215549	2026-07-31 09:11:32
20260218120000	2026-07-31 09:11:32
20260326120000	2026-07-31 09:11:32
20260514120000	2026-07-31 09:11:32
20260527120000	2026-07-31 09:11:32
20260528120000	2026-07-31 09:11:32
20260603120000	2026-07-31 09:11:32
20260605120000	2026-07-31 09:11:32
20260606110000	2026-07-31 09:11:32
20260616120000	2026-07-31 09:11:32
20260624120000	2026-07-31 09:11:32
20260626120000	2026-07-31 09:11:32
20260706120000	2026-07-31 09:11:32
20260707120000	2026-07-31 09:11:32
20260709120000	2026-07-31 09:11:32
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-07-31 08:24:00.526944
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-07-31 08:24:00.565612
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-07-31 08:24:00.574901
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-07-31 08:24:00.612086
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-07-31 08:24:00.635864
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-07-31 08:24:00.645923
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-07-31 08:24:00.657063
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-07-31 08:24:00.667112
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-07-31 08:24:00.67663
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-07-31 08:24:00.686214
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-07-31 08:24:00.695733
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-07-31 08:24:00.706522
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-07-31 08:24:00.718332
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-07-31 08:24:00.728637
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-07-31 08:24:00.738108
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-07-31 08:24:00.767087
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-07-31 08:24:00.776655
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-07-31 08:24:00.785968
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-07-31 08:24:00.795413
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-07-31 08:24:00.806195
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-07-31 08:24:00.817034
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-07-31 08:24:00.828192
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-07-31 08:24:00.849375
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-07-31 08:24:00.866498
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-07-31 08:24:00.876132
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-07-31 08:24:00.885535
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-07-31 08:24:00.89497
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-07-31 08:24:00.905329
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-07-31 08:24:00.914073
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-07-31 08:24:00.92276
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-07-31 08:24:00.931719
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-07-31 08:24:00.941258
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-07-31 08:24:00.949925
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-07-31 08:24:00.958655
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-07-31 08:24:00.968266
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-07-31 08:24:00.976991
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-07-31 08:24:00.985737
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-07-31 08:24:00.994666
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-07-31 08:24:01.004356
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-07-31 08:24:01.018422
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-07-31 08:24:01.027319
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-07-31 08:24:01.036326
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-07-31 08:24:01.045656
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-07-31 08:24:01.055096
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-07-31 08:24:01.064345
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-07-31 08:24:01.075129
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-07-31 08:24:01.091776
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-07-31 08:24:01.102872
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-07-31 08:24:01.114325
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-07-31 08:24:01.143811
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-07-31 08:24:01.162138
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-07-31 08:24:01.215008
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-07-31 08:24:01.219425
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-07-31 08:24:01.290094
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-07-31 08:24:01.308014
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-07-31 08:24:01.312277
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-07-31 08:24:01.328526
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-07-31 08:24:01.355051
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-07-31 08:24:01.369162
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-07-31 08:24:01.423192
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-07-31 08:24:01.436749
61	mark-filename-immutable	fe0096517ae9d60aaec1d110172ba9036dc66bb7	2026-08-14 15:25:48.639863
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 88, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_realtime_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: api_validation_logs api_validation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_validation_logs
    ADD CONSTRAINT api_validation_logs_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: articles articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: deposits deposits_invoice_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_invoice_id_key UNIQUE (invoice_id);


--
-- Name: deposits deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: games games_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_slug_key UNIQUE (slug);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: members members_tenant_id_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_tenant_id_username_key UNIQUE (tenant_id, username);


--
-- Name: membership_packages membership_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_packages
    ADD CONSTRAINT membership_packages_pkey PRIMARY KEY (id);


--
-- Name: orders orders_invoice_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_invoice_id_key UNIQUE (invoice_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_channels payment_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_channels
    ADD CONSTRAINT payment_channels_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: promo_codes promo_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_code_key UNIQUE (code);


--
-- Name: promo_codes promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_admin_domain_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_admin_domain_key UNIQUE (admin_domain);


--
-- Name: tenants tenants_domain_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_domain_key UNIQUE (domain);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (email, tenant_id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: idx_api_validation_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_validation_logs_created_at ON public.api_validation_logs USING btree (created_at DESC);


--
-- Name: idx_api_validation_logs_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_validation_logs_provider ON public.api_validation_logs USING btree (provider);


--
-- Name: idx_api_validation_logs_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_validation_logs_tenant_id ON public.api_validation_logs USING btree (tenant_id);


--
-- Name: idx_games_sort_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_games_sort_order ON public.games USING btree (sort_order);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: deposits on_deposit_success; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_deposit_success AFTER UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admin_users admin_users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admin_users admin_users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON DELETE SET NULL;


--
-- Name: admin_users admin_users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: api_validation_logs api_validation_logs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_validation_logs
    ADD CONSTRAINT api_validation_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: articles articles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: categories categories_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: deposits deposits_payment_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_payment_channel_id_fkey FOREIGN KEY (payment_channel_id) REFERENCES public.payment_channels(id) ON DELETE SET NULL;


--
-- Name: deposits deposits_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: faqs faqs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: games games_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: games games_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: members members_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: membership_packages membership_packages_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_packages
    ADD CONSTRAINT membership_packages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: orders orders_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE SET NULL;


--
-- Name: orders orders_payment_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_channel_id_fkey FOREIGN KEY (payment_channel_id) REFERENCES public.payment_channels(id);


--
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: orders orders_promo_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_promo_code_id_fkey FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id);


--
-- Name: orders orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payment_channels payment_channels_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_channels
    ADD CONSTRAINT payment_channels_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: products products_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: products products_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: wallets wallets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: orders Admin full access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin full access" ON public.orders USING ((auth.role() = 'authenticated'::text));


--
-- Name: promo_codes Admin full access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin full access" ON public.promo_codes USING ((auth.role() = 'authenticated'::text));


--
-- Name: orders Allow public update on orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: orders Public can insert orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);


--
-- Name: promo_codes Public can view active promo codes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can view active promo codes" ON public.promo_codes FOR SELECT USING ((is_active = true));


--
-- Name: orders Public can view order by invoice_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can view order by invoice_id" ON public.orders FOR SELECT USING (true);


--
-- Name: promo_codes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin WITH GRANT OPTION;
GRANT USAGE ON SCHEMA realtime TO authenticated;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION create_admin_operator(p_email text, p_password text, p_role_id uuid, p_tenant_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_admin_operator(p_email text, p_password text, p_role_id uuid, p_tenant_id uuid) TO anon;
GRANT ALL ON FUNCTION public.create_admin_operator(p_email text, p_password text, p_role_id uuid, p_tenant_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.create_admin_operator(p_email text, p_password text, p_role_id uuid, p_tenant_id uuid) TO service_role;


--
-- Name: FUNCTION deduct_wallet_balance(p_email text, p_amount numeric, p_tenant_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.deduct_wallet_balance(p_email text, p_amount numeric, p_tenant_id uuid) TO anon;
GRANT ALL ON FUNCTION public.deduct_wallet_balance(p_email text, p_amount numeric, p_tenant_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.deduct_wallet_balance(p_email text, p_amount numeric, p_tenant_id uuid) TO service_role;


--
-- Name: FUNCTION update_wallet_balance(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_wallet_balance() TO anon;
GRANT ALL ON FUNCTION public.update_wallet_balance() TO authenticated;
GRANT ALL ON FUNCTION public.update_wallet_balance() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO service_role;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE admin_roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admin_roles TO anon;
GRANT ALL ON TABLE public.admin_roles TO authenticated;
GRANT ALL ON TABLE public.admin_roles TO service_role;


--
-- Name: TABLE admin_users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admin_users TO anon;
GRANT ALL ON TABLE public.admin_users TO authenticated;
GRANT ALL ON TABLE public.admin_users TO service_role;


--
-- Name: TABLE api_validation_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.api_validation_logs TO anon;
GRANT ALL ON TABLE public.api_validation_logs TO authenticated;
GRANT ALL ON TABLE public.api_validation_logs TO service_role;


--
-- Name: TABLE articles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.articles TO anon;
GRANT ALL ON TABLE public.articles TO authenticated;
GRANT ALL ON TABLE public.articles TO service_role;


--
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;


--
-- Name: TABLE deposits; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.deposits TO anon;
GRANT ALL ON TABLE public.deposits TO authenticated;
GRANT ALL ON TABLE public.deposits TO service_role;


--
-- Name: TABLE faqs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.faqs TO anon;
GRANT ALL ON TABLE public.faqs TO authenticated;
GRANT ALL ON TABLE public.faqs TO service_role;


--
-- Name: TABLE games; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.games TO anon;
GRANT ALL ON TABLE public.games TO authenticated;
GRANT ALL ON TABLE public.games TO service_role;


--
-- Name: TABLE members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.members TO anon;
GRANT ALL ON TABLE public.members TO authenticated;
GRANT ALL ON TABLE public.members TO service_role;


--
-- Name: TABLE membership_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.membership_packages TO anon;
GRANT ALL ON TABLE public.membership_packages TO authenticated;
GRANT ALL ON TABLE public.membership_packages TO service_role;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- Name: TABLE payment_channels; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_channels TO anon;
GRANT ALL ON TABLE public.payment_channels TO authenticated;
GRANT ALL ON TABLE public.payment_channels TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- Name: TABLE promo_codes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.promo_codes TO anon;
GRANT ALL ON TABLE public.promo_codes TO authenticated;
GRANT ALL ON TABLE public.promo_codes TO service_role;


--
-- Name: TABLE tenants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tenants TO anon;
GRANT ALL ON TABLE public.tenants TO authenticated;
GRANT ALL ON TABLE public.tenants TO service_role;


--
-- Name: TABLE wallets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.wallets TO anon;
GRANT ALL ON TABLE public.wallets TO authenticated;
GRANT ALL ON TABLE public.wallets TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict GPcJT87rHMO3C4lHUR8Gjq1yeXtd121cuWnEk6byItx6UtO9rmiBJeTA4arZwe4

