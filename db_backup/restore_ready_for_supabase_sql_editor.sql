-- ============================================================================== 
-- DEFINITIVE RESTORE SCRIPT FOR SUPABASE WEB SQL EDITOR
-- Guaranteed zero Foreign Key conflicts (De-coupled schema -> data -> constraints)
-- ==============================================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 1: Disable replication constraints for bulk load
SET session_replication_role = 'replica';

-- Step 2: Functions & Triggers DDL
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

-- Step 3: Tables DDL
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid NOT NULL,
    email text NOT NULL,
    role_id uuid,
    tenant_id uuid,
    is_superadmin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.api_validation_logs (
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
CREATE TABLE IF NOT EXISTS public.articles (
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
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon_name text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true,
    tenant_id uuid
);
CREATE TABLE IF NOT EXISTS public.deposits (
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
CREATE TABLE IF NOT EXISTS public.faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id uuid
);
CREATE TABLE IF NOT EXISTS public.games (
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
CREATE TABLE IF NOT EXISTS public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    username text NOT NULL,
    phone text,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.membership_packages (
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
CREATE TABLE IF NOT EXISTS public.orders (
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
CREATE TABLE IF NOT EXISTS public.payment_channels (
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
CREATE TABLE IF NOT EXISTS public.products (
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
CREATE TABLE IF NOT EXISTS public.promo_codes (
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
CREATE TABLE IF NOT EXISTS public.tenants (
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
CREATE TABLE IF NOT EXISTS public.wallets (
    email text NOT NULL,
    balance numeric DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id uuid NOT NULL
);

-- Step 4: Primary Keys & Unique Constraints
ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.api_validation_logs
    ADD CONSTRAINT api_validation_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_invoice_id_key UNIQUE (invoice_id);
ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_tenant_id_username_key UNIQUE (tenant_id, username);
ALTER TABLE ONLY public.membership_packages
    ADD CONSTRAINT membership_packages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_invoice_id_key UNIQUE (invoice_id);
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payment_channels
    ADD CONSTRAINT payment_channels_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_code_key UNIQUE (code);
ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_admin_domain_key UNIQUE (admin_domain);
ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_domain_key UNIQUE (domain);
ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (email, tenant_id);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Step 5: Insert All Data (Strictly ordered)

-- ------------------------------------------------------------------------------
-- Data for public.tenants (2 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.tenants (id, name, domain, theme_config, created_at, admin_domain, is_maintenance, auth_mode) VALUES
('a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'New Gaming Store', 'newgamingstore.com', '{"email": "", "ga4Id": "", "gtmId": "", "tiktok": "", "logoUrl": "https://assets.newgamingstore.com/logo-newgaming.png", "ogImage": "https://assets.newgamingstore.com/1785681417474-776161383-PHOTO-2026-08-02-18-26-57.jpg", "sliders": ["https://assets.newgamingstore.com/1785681417474-776161383-PHOTO-2026-08-02-18-26-57.jpg", "https://assets.newgamingstore.com/uploads/4d976ad2-3d90-4c7d-a724-a09a7bb9b318.jpg"], "youtube": "", "seoTitle": "NewGamingStore | Top Up Cepat Murah", "whatsapp": "6282227495470", "instagram": "", "promoCode": "", "seoKeywords": "", "waChannelUrl": "", "promoHeadline": "", "seoDescription": "NEWGAMINGSTORE - Platform topup game terlengkap, cepat & termurah di Indonesia dengan layanan 24/7. Nikmati topup Mobile Legends, Starlight & lainya secara instan", "waFloatingText": "Chat CS Online", "footerBannerUrl": "", "gscVerification": "", "waChannelActive": false, "gameDetailBanner": "https://assets.newgamingstore.com/Game_characters_text_banner_logo_202608021252_11zon.webp", "operationalHours": "", "waDefaultMessage": "Halo Admin, saya ingin bertanya seputar layanan top-up.", "waFloatingActive": true, "heroBackgroundUrl": "https://assets.newgamingstore.com/bg_utama_1777997049.webp", "waFloatingAvatarUrl": ""}', '2026-08-02 14:29:47.378346+00', 'admin.newgamingstore.com', 'f', 'username'),
('9a145561-8663-4b49-9d02-9a97c93ca322', 'NewGamingStore Mockup', 'localhost', '{"colors": {"card": "#0e221b", "text": "#ffffff", "primary": "#10b981", "background": "#06120e"}, "themePreset": "emerald"}', '2026-07-31 14:46:32.227505+00', 'admin.localhost', 'f', 'username')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for auth.users (6 rows)
-- ------------------------------------------------------------------------------
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES
('00000000-0000-0000-0000-000000000000', 'f6f37c88-cc7b-49ce-ada4-0e7b49858427', 'authenticated', 'authenticated', 'lavien21@gmail.com', '$2a$10$3H5SYz1jgEKULjkW9IZQPO8Ly5GjFSEHM2Woo7iEAr0616tUF9Z3.', '2026-08-04 13:59:50.282336+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-05 16:05:20.650395+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f6f37c88-cc7b-49ce-ada4-0e7b49858427", "name": "lavien", "email": "lavien21@gmail.com", "phone": "0812232333", "email_verified": true, "phone_verified": false}', NULL, '2026-08-04 13:59:50.257896+00', '2026-08-05 16:05:20.691102+00', NULL, NULL, '', '', NULL, '', '0', NULL, '', NULL, 'f', NULL, 'f'),
('00000000-0000-0000-0000-000000000000', '1a353e02-c108-49e4-bc63-498f7a3b31b4', 'authenticated', 'authenticated', 'neugamingstore@gmail.com', '$2a$06$IqbpHMOkJW2whHPCbJbdXetN33bPpIhyOTedtdxicrXZQzSRbDjM6', '2026-08-05 16:06:23.711747+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-11 15:02:21.343142+00', NULL, NULL, NULL, '2026-08-05 16:06:23.711747+00', '2026-08-14 09:52:12.450236+00', NULL, NULL, '', '', NULL, '', '0', NULL, '', NULL, 'f', NULL, 'f'),
('00000000-0000-0000-0000-000000000000', 'd6cf8910-bc5a-45d9-b5bf-33d081b2868b', 'authenticated', 'authenticated', 'lavien@gmail.com', '$2a$06$6BX7cILUxOEm.dZ2XuYh0Oww167QkEQLySq3nW2BRABN9EpjmJ.E6', '2026-08-03 13:32:43.466379+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-14 15:20:19.72451+00', NULL, NULL, NULL, '2026-08-03 13:32:43.466379+00', '2026-08-14 15:20:19.748353+00', NULL, NULL, '', '', NULL, '', '0', NULL, '', NULL, 'f', NULL, 'f'),
('00000000-0000-0000-0000-000000000000', '4ef2982c-c1b4-41eb-b233-aa075218e5fe', 'authenticated', 'authenticated', 'rio182846@gmail.com', '$2a$10$etzObhDo5u0XnA62y2yuhOdLK9r1.SPNU96JegwIx1VXyRBLNKSQa', '2026-08-04 23:46:41.41228+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-04 23:46:41.42481+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "4ef2982c-c1b4-41eb-b233-aa075218e5fe", "name": "Yoga", "email": "rio182846@gmail.com", "phone": "+6282173243921", "email_verified": true, "phone_verified": false}', NULL, '2026-08-04 23:46:41.360064+00', '2026-08-04 23:46:41.448586+00', NULL, NULL, '', '', NULL, '', '0', NULL, '', NULL, 'f', NULL, 'f'),
('00000000-0000-0000-0000-000000000000', '71c6bd39-e368-4838-a62c-fd3a71bde477', 'authenticated', 'authenticated', 'testing21@gmail.com', '$2a$10$ljv4zFuIp6lAJv/BQBmO9.zCQBctcahRYxlczOUay3ctgEVdX80LG', '2026-08-02 08:57:13.626574+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-03 02:13:36.096608+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "71c6bd39-e368-4838-a62c-fd3a71bde477", "name": "johndoe", "email": "testing21@gmail.com", "level": "Platinum", "email_verified": true, "phone_verified": false}', NULL, '2026-08-02 08:57:13.611525+00', '2026-08-03 04:11:43.684057+00', NULL, NULL, '', '', NULL, '', '0', NULL, '', NULL, 'f', NULL, 'f'),
('00000000-0000-0000-0000-000000000000', '11060bec-b5ca-4a59-add1-844aa3039700', 'authenticated', 'authenticated', 'newgamingstore@gmail.com', '$2a$06$b0fCnOUJ5j74GLVA8bq04ePAOJpQXsMhsw3v5ISxZpW4vbeecCdeK', '2026-08-05 15:12:13.318643+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-05 15:24:33.41984+00', NULL, NULL, NULL, '2026-08-05 15:12:13.318643+00', '2026-08-05 15:24:33.441623+00', NULL, NULL, '', '', NULL, '', '0', NULL, '', NULL, 'f', NULL, 'f')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for auth.identities (3 rows)
-- ------------------------------------------------------------------------------
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES
('71c6bd39-e368-4838-a62c-fd3a71bde477', '71c6bd39-e368-4838-a62c-fd3a71bde477', '{"sub": "71c6bd39-e368-4838-a62c-fd3a71bde477", "name": "johndoe", "email": "testing21@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-08-02 08:57:13.623592+00', '2026-08-02 08:57:13.623649+00', '2026-08-02 08:57:13.623649+00', '010cb43a-7781-44fc-835b-fd307fa1823f'),
('f6f37c88-cc7b-49ce-ada4-0e7b49858427', 'f6f37c88-cc7b-49ce-ada4-0e7b49858427', '{"sub": "f6f37c88-cc7b-49ce-ada4-0e7b49858427", "name": "lavien", "email": "lavien21@gmail.com", "phone": "0812232333", "email_verified": false, "phone_verified": false}', 'email', '2026-08-04 13:59:50.277315+00', '2026-08-04 13:59:50.277415+00', '2026-08-04 13:59:50.277415+00', 'c973f664-73ab-4b25-93b1-d6a6a4ba6292'),
('4ef2982c-c1b4-41eb-b233-aa075218e5fe', '4ef2982c-c1b4-41eb-b233-aa075218e5fe', '{"sub": "4ef2982c-c1b4-41eb-b233-aa075218e5fe", "name": "Yoga", "email": "rio182846@gmail.com", "phone": "+6282173243921", "email_verified": false, "phone_verified": false}', 'email', '2026-08-04 23:46:41.397532+00', '2026-08-04 23:46:41.397579+00', '2026-08-04 23:46:41.397579+00', 'b77ea586-c0ba-4bac-8e0f-4f789dda4aa1')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.categories (14 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, icon_name, sort_order, created_at, is_active, tenant_id) VALUES
('7d8a34e8-ff61-44d1-af88-a83a311f746b', 'Top Up Games', 'top-up-games-9a145', 'Gamepad2', '1', '2026-08-01 16:14:57.683663+00', 't', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('73e3e549-b5ce-4993-a3ba-90f7fffc18d0', 'Specialist Mobile Legends', 'specialist-ml-9a145', 'Sparkles', '2', '2026-08-01 16:14:57.683663+00', 'f', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('d77254a6-814e-44e2-9bc6-bb96245a12fd', 'Voucher & Tagihan', 'voucher-9a145', 'Ticket', '3', '2026-08-01 16:14:57.683663+00', 'f', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('21cbb00f-1126-4d6a-ae1f-1f735a4b3845', 'E-Money', 'e-money-9a145', 'Wallet', '4', '2026-08-01 16:14:57.683663+00', 'f', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('2283d4ad-8a3c-4d10-a75b-6100f433bcf6', 'Pulsa & Masa Aktif', 'pulsa-9a145', 'Globe', '5', '2026-08-01 16:14:57.683663+00', 'f', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('bd58fbf9-4e25-471f-bed6-b41e1ed90170', 'Streaming App', 'streaming-9a145', 'Tv', '6', '2026-08-01 16:14:57.683663+00', 'f', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('900c4460-c91d-4b16-be7d-dc084a365c68', 'Via Login', 'via-login-9a145', 'Flame', '7', '2026-08-01 16:14:57.683663+00', 'f', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('69c2e769-e8bf-4e14-80e7-095ace81d26c', 'Top Up Games', 'top-up-games-a4604', 'Gamepad2', '1', '2026-08-01 16:14:57.683663+00', 't', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('04b83348-c501-4baa-9bd4-52af677d9a86', 'Specialist Mobile Legends', 'specialist-ml-a4604', 'Sparkles', '2', '2026-08-01 16:14:57.683663+00', 'f', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('919d7020-4224-45a9-a885-ae37af3e703d', 'Voucher & Tagihan', 'voucher-a4604', 'Ticket', '3', '2026-08-01 16:14:57.683663+00', 'f', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('4e651235-08ee-496f-a16b-165587b959bd', 'E-Money', 'e-money-a4604', 'Wallet', '4', '2026-08-01 16:14:57.683663+00', 'f', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('deae2313-5a4e-422b-95da-4bac8fcb7098', 'Pulsa & Masa Aktif', 'pulsa-a4604', 'Globe', '5', '2026-08-01 16:14:57.683663+00', 'f', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('9f36382a-a1f9-4c42-9be4-e0483c19445a', 'Streaming App', 'streaming-a4604', 'Tv', '6', '2026-08-01 16:14:57.683663+00', 'f', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('6eb1bf4e-0167-40a6-b7f1-9a80ccf1d7b6', 'Via Login', 'via-login-a4604', 'Flame', '7', '2026-08-01 16:14:57.683663+00', 'f', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.admin_roles (1 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.admin_roles (id, name, permissions, created_at) VALUES
('415b6dc6-e0ca-4b19-b0d1-5a66830647e5', 'Owner', '["manage_games", "manage_categories", "manage_products", "manage_deposits", "manage_orders", "manage_payments", "manage_memberships", "manage_promos", "manage_members", "manage_articles", "manage_faqs", "manage_contacts", "manage_roles", "manage_operators", "manage_theme", "manage_content"]', '2026-08-05 15:10:04.159206+00')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.admin_users (3 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.admin_users (id, email, role_id, tenant_id, is_superadmin, created_at) VALUES
('d6cf8910-bc5a-45d9-b5bf-33d081b2868b', 'lavien@gmail.com', NULL, NULL, 't', '2026-08-03 13:32:43.466379+00'),
('11060bec-b5ca-4a59-add1-844aa3039700', 'newgamingstore@gmail.com', '415b6dc6-e0ca-4b19-b0d1-5a66830647e5', '9a145561-8663-4b49-9d02-9a97c93ca322', 'f', '2026-08-05 15:12:13.318643+00'),
('1a353e02-c108-49e4-bc63-498f7a3b31b4', 'neugamingstore@gmail.com', '415b6dc6-e0ca-4b19-b0d1-5a66830647e5', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f', '2026-08-05 16:06:23.711747+00')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.games (28 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.games (id, name, slug, image_url, form_fields, created_at, developer, background_image, category_id, is_popular, topup_instructions, guide_image_url, guide_text, tenant_id, has_username_validator, validator_provider, validator_game_code, provider_code_overrides, sort_order) VALUES
('5f34e657-004e-47f1-bd25-3828eab68414', 'Call Of Duty Mobile', 'codm', 'https://assets.newgamingstore.com/1785645982923-96548894-Call_of_Duty_Mobile_characters_202608021143_11zon.webp', '[{"name": "openID", "type": "text", "label": "Open ID", "required": true}]', '2026-08-02 04:46:24.61826+00', 'TIMI STUDIO GRUOP', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', NULL, 't', 'Top Up Call of Duty Mobile :\r\n1. Masukkan Open ID\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Klik Order Now & lakukan Pembayaran\r\n5. CP masuk otomatis ke akun Anda', 'https://assets.newgamingstore.com/1785678997201-727447230-Halper_CODM-b977.webp', 'Untuk menemukan PlayerID Anda, klik ikon ''settings'' yang terletak di sebelah kanan layar dan klik tab ''LEGAL AND PRIVCY'', Anda dapat menemukan PlayerID Anda di sini.', NULL, 'f', NULL, NULL, '{}', '0'),
('86098d19-4024-47c6-8bd9-b16780a3ea8e', 'FC Mobile', 'fc-mobile-9a145', 'https://assets.newgamingstore.com/1785766482906-606656173-Replace_Vinicius_JR_with_Lamine_202608032101-2.jpeg', '[{"name": "userId", "type": "text", "label": "User ID", "required": true}]', '2026-08-02 04:35:16.572891+00', 'EA SPORTS', 'https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp', '7d8a34e8-ff61-44d1-af88-a83a311f746b', 't', 'Top up FC Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785679184613-438407231-FIFAMobile_Helper-6b86-original.jpeg', 'Untuk mengetahui User ID Anda, silakan klik menu profile dibagian kiri atas pada menu utama game. User ID akan terlihat dibagian bawah Nama Karakter Game Anda. Silakan masukkan User ID Anda untuk menyelesaikan transaksi. Contoh : 12345678(1234).', '9a145561-8663-4b49-9d02-9a97c93ca322', 'f', NULL, NULL, '{}', '6'),
('2ebd3b44-5b14-45bb-8bd8-786afbc14670', 'Honor Of Kings', 'hok-9a145', 'https://assets.newgamingstore.com/1785643240561-131792648-honor-of-king.webp', '[{"name": "userId", "type": "number", "label": "User ID", "required": true}]', '2026-07-31 16:16:12.345877+00', 'Tencents', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '7d8a34e8-ff61-44d1-af88-a83a311f746b', 't', 'Beli top up diamond Honor Of Kings harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup MLBB :\r\n1) Masukkan Data Akun\r\n2) Pilih Nominal\r\n3) Pilih Pembayaran\r\n4) Masukkan Kode Promo (jika ada)\r\n5) Isi Detail Kontak\r\n6) Klik Pesan Sekarang dan lakukan Pembayaran\r\n7) Selesai', 'https://assets.newgamingstore.com/1785679337424-711196702-hokhelper-3df1-original.webp', 'ID berupa angka, bukan nickname !! Contoh : 12345678910111213', '9a145561-8663-4b49-9d02-9a97c93ca322', 'f', NULL, NULL, '{}', '8'),
('a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', 'Valorant', 'valorant-9a145', 'https://assets.newgamingstore.com/1785645451915-504135596-Woman_pointing_gun_Valorant_logo_202608021132_11zon.webp', '[{"name": "userId", "type": "text", "label": "Riot ID", "required": true}]', '2026-08-02 04:37:32.915347+00', 'RIOT GAMES', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '7d8a34e8-ff61-44d1-af88-a83a311f746b', 't', 'Top up point Valorant harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785679080109-256099176-valorant-top-up-points-guide.jpg', 'Contoh : usernamekamu#123', '9a145561-8663-4b49-9d02-9a97c93ca322', 'f', NULL, NULL, '{}', '1'),
('ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', 'Call Of Duty Mobile', 'codm-9a145', 'https://assets.newgamingstore.com/1785645982923-96548894-Call_of_Duty_Mobile_characters_202608021143_11zon.webp', '[{"name": "openID", "type": "text", "label": "Open ID", "required": true}]', '2026-08-02 04:46:24.61826+00', 'TIMI STUDIO GRUOP', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '7d8a34e8-ff61-44d1-af88-a83a311f746b', 't', 'Top Up Call of Duty Mobile :\r\n1. Masukkan Open ID\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Klik Order Now & lakukan Pembayaran\r\n5. CP masuk otomatis ke akun Anda', 'https://assets.newgamingstore.com/1785678997201-727447230-Halper_CODM-b977.webp', 'Untuk menemukan PlayerID Anda, klik ikon ''settings'' yang terletak di sebelah kanan layar dan klik tab ''LEGAL AND PRIVCY'', Anda dapat menemukan PlayerID Anda di sini.', '9a145561-8663-4b49-9d02-9a97c93ca322', 't', 'auto', 'cod-mobile', '{}', '3'),
('5869ed06-5786-4684-b8ed-1484c3c410f4', 'PUBG Mobile', 'pubg-mobile-9a145', 'https://assets.newgamingstore.com/1785645373711-11502655-Man_saluting_with_game_logo_202608021129_11zon.jpeg', '[{"name": "userId", "type": "text", "label": "ID", "required": true}]', '2026-08-02 04:36:14.6117+00', 'Tencents', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '7d8a34e8-ff61-44d1-af88-a83a311f746b', 't', 'Top up UC PUBG Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup PUBGM :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785679135518-339295110-pubg-mobile-guide.jpg', 'Untuk menemukan ID Karakter Anda, masuk ke akun Anda di aplikasi. Klik avatar yang terletak di pojok kiri atas layar utama. Anda dapat menemukan ID Karakter Anda tepat di bawah profil Anda', '9a145561-8663-4b49-9d02-9a97c93ca322', 't', 'auto', 'pubgm', '{}', '5'),
('9080ff51-f599-450f-9fde-ef81fa7dd557', 'Heartopia', 'heartopia-9a145', 'https://assets.newgamingstore.com/1785646904466-194849548-Heartopia_characters_in_town_202608021200_11zon.webp', '[{"name": "userId", "type": "text", "label": "User ID", "required": true}]', '2026-08-02 05:01:47.081084+00', 'XD Entertaiment', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '7d8a34e8-ff61-44d1-af88-a83a311f746b', 't', NULL, NULL, NULL, '9a145561-8663-4b49-9d02-9a97c93ca322', 'f', NULL, NULL, '{}', '4'),
('b0af1dd3-f015-44b6-be4e-ba57b015a7c4', 'Mobile Legends', 'mobile-legends-9a145', 'https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg', '[{"name": "userId", "type": "number", "label": "User ID", "required": true}, {"name": "serverID", "type": "text", "label": "Masukkan Server", "required": true}]', '2026-08-02 04:09:06.314145+00', 'Moonton', 'https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp', '7d8a34e8-ff61-44d1-af88-a83a311f746b', 't', 'Beli top up ML diamond Mobile Legends dan Weekly Diamond Pass harga MLBB paling murah, aman, cepat, dan terpercaya.\r\n\r\n\r\n\r\nCara topup MLBB :\r\n1. Masukkan Data Akun\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Masukkan Kode Promo (jika ada)\r\n5. Isi Detail Kontak\r\n6. Klik Pesan Sekarang dan lakukan Pembayaran\r\n7. Selesai', 'https://assets.newgamingstore.com/1785679277302-580417955-MASUKANIDSERVERTANPACONTOH12345612341080x400piksel12.webp', 'Untuk menemukan ID Pengguna Anda, klik avatar Anda di pojok kiri atas layar dan buka tab Info Umum. Contoh: 12345678 (1234).', '9a145561-8663-4b49-9d02-9a97c93ca322', 't', 'auto', 'cek_game_ml', '{}', '7'),
('747a8732-b175-4ed2-bcd1-f498fc62f63a', 'Valorant', 'valorant-a4604', 'https://assets.newgamingstore.com/1785645451915-504135596-Woman_pointing_gun_Valorant_logo_202608021132_11zon.webp', '[{"name": "userId", "type": "text", "label": "Riot ID", "required": true}]', '2026-08-02 04:37:32.915347+00', 'RIOT GAMES', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 'f', 'Top up point Valorant harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785679080109-256099176-valorant-top-up-points-guide.jpg', 'Contoh : usernamekamu#123', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 't', 'auto', 'valorant', '{}', '4'),
('10c1b9d4-7197-4464-bf9f-ee710c1f0180', 'PUBG Mobile', 'pubg-mobile-a4604', 'https://assets.newgamingstore.com/1785645373711-11502655-Man_saluting_with_game_logo_202608021129_11zon.jpeg', '[{"name": "userId", "type": "text", "label": "ID", "required": true}]', '2026-08-02 04:36:14.6117+00', 'Tencents', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 'f', 'Top up UC PUBG Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup PUBGM :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785679135518-339295110-pubg-mobile-guide.jpg', 'Untuk menemukan ID Karakter Anda, masuk ke akun Anda di aplikasi. Klik avatar yang terletak di pojok kiri atas layar utama. Anda dapat menemukan ID Karakter Anda tepat di bawah profil Anda', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 't', 'auto', 'pubgm', '{}', '5'),
('5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', 'Honor Of Kings', 'hok', 'https://assets.newgamingstore.com/1785643240561-131792648-honor-of-king.webp', '[{"name": "userId", "type": "number", "label": "User ID", "required": true}]', '2026-07-31 16:16:12.345877+00', 'Tencents', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', NULL, 't', 'Beli top up diamond Honor Of Kings harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup MLBB :\r\n1) Masukkan Data Akun\r\n2) Pilih Nominal\r\n3) Pilih Pembayaran\r\n4) Masukkan Kode Promo (jika ada)\r\n5) Isi Detail Kontak\r\n6) Klik Pesan Sekarang dan lakukan Pembayaran\r\n7) Selesai', 'https://assets.newgamingstore.com/1785679337424-711196702-hokhelper-3df1-original.webp', 'ID berupa angka, bukan nickname !! Contoh : 12345678910111213', NULL, 'f', NULL, NULL, '{}', '0'),
('230fcf75-22f7-4cb9-a194-ca0378b9437c', 'Valorant', 'valorant', 'https://assets.newgamingstore.com/1785645451915-504135596-Woman_pointing_gun_Valorant_logo_202608021132_11zon.webp', '[{"name": "userId", "type": "text", "label": "Riot ID", "required": true}]', '2026-08-02 04:37:32.915347+00', 'RIOT GAMES', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', NULL, 't', 'Top up point Valorant harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785679080109-256099176-valorant-top-up-points-guide.jpg', 'Contoh : usernamekamu#123', NULL, 'f', NULL, NULL, '{}', '0'),
('2b5be999-9dbe-4ea7-aa25-09babf741860', 'PUBG Mobile', 'pubg-mobile', 'https://assets.newgamingstore.com/1785645373711-11502655-Man_saluting_with_game_logo_202608021129_11zon.jpeg', '[{"name": "userId", "type": "text", "label": "ID", "required": true}]', '2026-08-02 04:36:14.6117+00', 'Tencents', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', NULL, 't', 'Top up UC PUBG Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup PUBGM :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785679135518-339295110-pubg-mobile-guide.jpg', 'Untuk menemukan ID Karakter Anda, masuk ke akun Anda di aplikasi. Klik avatar yang terletak di pojok kiri atas layar utama. Anda dapat menemukan ID Karakter Anda tepat di bawah profil Anda', NULL, 'f', NULL, NULL, '{}', '0'),
('c12f54ca-3a23-4265-9c58-9d3eb4056c4d', 'Heartopia', 'heartopia-a4604', 'https://assets.newgamingstore.com/1785646904466-194849548-Heartopia_characters_in_town_202608021200_11zon.webp', '[{"name": "userId", "type": "text", "label": "User ID", "required": true}]', '2026-08-02 05:01:47.081084+00', 'XD Entertaiment', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 'f', '', '', '', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f', NULL, NULL, '{}', '9'),
('a8e80afd-9b72-4088-b49d-52de3687d936', 'Roblox', 'roblox-a4604', 'https://assets.newgamingstore.com/1785770216778-162483417-Roblox_characters_celebrating_to_202608032216-2.jpeg', '[{"name": "userName", "type": "text", "label": "Username", "required": true}]', '2026-07-31 16:15:52.077503+00', 'Roblox Corporation', 'https://assets.newgamingstore.com/1785644307247-20395277-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 't', 'Cara Top-Up Rooblox Via Username ,Proses Instant 1-5 menit\r\n\r\n1)Masukkan Username\r\n2)Pilih Nominal Robux\r\n3)Pilih Metode 4Pembayaran\r\n5)Tulis nomor WhatsApp\r\n6)Klik Order Now& lakukan Pembayaran\r\n7)Robux masuk otomatis ke akun Anda', '', 'Masukkan username, password, dan kode backup dengan benar.', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f', 'auto', NULL, '{}', '2'),
('a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', 'FC Mobile', 'fc-mobile', 'https://assets.newgamingstore.com/1785645315122-404379389-Soccer_player_in_uniform_purple_202608021124_11zon.webp', '[{"name": "userId", "type": "text", "label": "User ID", "required": true}]', '2026-08-02 04:35:16.572891+00', 'EA SPORTS', 'https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp', NULL, 't', 'Top up FC Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785679184613-438407231-FIFAMobile_Helper-6b86-original.jpeg', 'Untuk mengetahui User ID Anda, silakan klik menu profile dibagian kiri atas pada menu utama game. User ID akan terlihat dibagian bawah Nama Karakter Game Anda. Silakan masukkan User ID Anda untuk menyelesaikan transaksi. Contoh : 12345678(1234).', NULL, 'f', NULL, NULL, '{}', '0'),
('484efde9-c89d-4954-afc6-3cd4d4d425f9', 'Genshin Impact', 'genshin-impact', 'https://assets.newgamingstore.com/1785646055780-509961279-Genshin_Impact_characters_purple_202608021146-2.webp', '[{"name": "userId", "type": "text", "label": "User ID", "required": true, "placeholder": "Masukkan User ID"}, {"name": "server", "type": "select", "label": "Server", "options": [{"label": "Asia", "value": "os_asia"}, {"label": "Europe", "value": "os_euro"}, {"label": "America", "value": "os_usa"}, {"label": "TW, HK, MO", "value": "os_cht"}], "required": true}]', '2026-08-02 04:47:36.893054+00', 'HOYOVERSE', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', NULL, 't', 'Top up crystal Genshin Impact harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785650419059-215045937-Helper_Genshin_Impact-1b1082-1.webp', 'Contoh : UID = 123456789, Server = Asia', NULL, 'f', NULL, NULL, '{}', '0'),
('edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', 'Mobile Legends', 'mobile-legends', 'https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg', '[{"name": "userId", "type": "number", "label": "User ID", "required": true}, {"name": "serverID", "type": "text", "label": "Masukkan Server", "required": true}]', '2026-08-02 04:09:06.314145+00', 'Moonton', 'https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp', NULL, 't', 'Beli top up ML diamond Mobile Legends dan Weekly Diamond Pass harga MLBB paling murah, aman, cepat, dan terpercaya.\r\n\r\n\r\n\r\nCara topup MLBB :\r\n1. Masukkan Data Akun\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Masukkan Kode Promo (jika ada)\r\n5. Isi Detail Kontak\r\n6. Klik Pesan Sekarang dan lakukan Pembayaran\r\n7. Selesai', 'https://assets.newgamingstore.com/1785679277302-580417955-MASUKANIDSERVERTANPACONTOH12345612341080x400piksel12.webp', 'Untuk menemukan ID Pengguna Anda, klik avatar Anda di pojok kiri atas layar dan buka tab Info Umum. Contoh: 12345678 (1234).', NULL, 'f', NULL, NULL, '{}', '0'),
('f8c0eb61-2286-4f83-b8c8-f4b014a94f2c', 'Heartopia', 'heartopia', 'https://assets.newgamingstore.com/1785646904466-194849548-Heartopia_characters_in_town_202608021200_11zon.webp', '[{"name": "userId", "type": "text", "label": "User ID", "required": true}]', '2026-08-02 05:01:47.081084+00', 'XD Entertaiment', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', NULL, 't', NULL, NULL, NULL, NULL, 'f', NULL, NULL, '{}', '0'),
('980e361b-1ba2-471e-9967-54a5ed1f8fce', 'Roblox', 'roblox', 'https://assets.newgamingstore.com/1785643214021-467878991-Roblox_characters_celebrating_wi_202608021058.jpeg', '[{"name": "userName", "type": "text", "label": "Username", "required": true}, {"name": "password", "type": "text", "label": "Password", "required": true}, {"name": "backupCode", "type": "text", "label": "Masukkan Backup Code", "required": true}]', '2026-07-31 16:15:52.077503+00', 'Moonton', 'https://assets.newgamingstore.com/1785644307247-20395277-Anime_gamer_holding_controllers_202608021117_11zon.webp', NULL, 't', 'Top up Robux Roblox dengan harga paling murah, aman, cepat, dan terpercaya hanya di NEW GAMING STORE.\r\nCara topup Robux Roblox Via Login:\r\n\r\nPilih Nominal\r\nMasukkan Username dan Password Roblox kamu\r\nTentukan Jumlah Pembelian\r\nPilih Pembayaran\r\nMasukkan Kode Promo (jika ada)\r\nIsi Detail Kontak (Pastikan nomer whatsapp sudah benar! )\r\nKlik Pesan Sekarang dan lakukan Pembayaran\r\nPesanan akan proses sesuai urutan\r\nDone\r\n\r\nInfo tambahan khusus Produk Roblox :\r\n* Pesanan kamu diproses sesuai urutan, bisa sangat cepat, bisa sedikit lama. tergantung banyaknya antrian pada saat kamu membeli!\r\njangan khawatir, pesanan kamu tetap akan diproses, tidak perlu spam chat ya! 🚫\r\nSambil menunggu antrian, kamu boleh login dan memainkan game nya kok, tidak akan nabrak.\r\n\r\n* Jam kerja admin VIA LOGIN adalah dari jam 08:00 Pagi - 23:00 \r\nOrder di atas jam 00:00 akan mulai diproses pagi hari pada awal jam kerja / 08:00 WIB (sesuai urutan orderan)', '', 'Masukkan username, password, dan kode backup dengan benar.', NULL, 'f', NULL, NULL, '{}', '0'),
('7485df14-c3e2-42e1-8d6b-dcc4a09e64a5', 'Genshin Impact', 'genshin-impact-a4604', 'https://assets.newgamingstore.com/1785646055780-509961279-Genshin_Impact_characters_purple_202608021146-2.webp', '[{"name": "userId", "type": "text", "label": "UID", "required": true, "placeholder": "Masukkan UID"}, {"name": "server", "type": "select", "label": "Server", "options": [{"label": "Asia", "value": "os_asia"}, {"label": "Europe", "value": "os_euro"}, {"label": "America", "value": "os_usa"}, {"label": "TW, HK, MO", "value": "os_cht"}], "required": true}]', '2026-08-02 04:47:36.893054+00', 'HOYOVERSE', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 'f', 'Top up crystal Genshin Impact harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Masukkan UID\r\n2) Pilih Nominal\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran', 'https://assets.newgamingstore.com/1785650419059-215045937-Helper_Genshin_Impact-1b1082-1.webp', 'Contoh : UID = 123456789, Server = Asia', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 't', 'auto', 'genshin-impact', '{}', '7'),
('7110c289-7bbf-44f3-8d99-c5cd0a547e4d', 'Genshin Impact', 'genshin-impact-9a145', 'https://assets.newgamingstore.com/1785646055780-509961279-Genshin_Impact_characters_purple_202608021146-2.webp', '[{"name": "userId", "type": "text", "label": "User ID", "required": true, "placeholder": "Masukkan User ID"}, {"name": "server", "type": "select", "label": "Server", "options": [{"label": "Asia", "value": "os_asia"}, {"label": "Europe", "value": "os_euro"}, {"label": "America", "value": "os_usa"}, {"label": "TW, HK, MO", "value": "os_cht"}], "required": true}]', '2026-08-02 04:47:36.893054+00', 'HOYOVERSE', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '7d8a34e8-ff61-44d1-af88-a83a311f746b', 't', 'Top up crystal Genshin Impact harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan Data Akun\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Masukkan Kode Promo (jika ada)\r\n6) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran\r\n8) Selesai', 'https://assets.newgamingstore.com/1785650419059-215045937-Helper_Genshin_Impact-1b1082-1.webp', 'Contoh : UID = 123456789, Server = Asia', '9a145561-8663-4b49-9d02-9a97c93ca322', 't', 'auto', 'genshin-impact', '{}', '2'),
('57083f25-8e53-45c8-bce6-f9877ee04322', 'Coins Tiktok', 'coins-tiktok', 'https://assets.newgamingstore.com/1786116101220-898803716-Revising_image_prompt_instructions_202608071633_11zon.webp', '[{"name": "username", "type": "text", "label": "Username", "required": true, "placeholder": "Masukkan Username"}]', '2026-08-07 15:21:42.217117+00', 'Tiktok', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 't', '', '', '', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f', 'auto', NULL, '{}', '6'),
('f6d2c442-d7c7-4315-b86c-0f0bff635377', 'Mobile Legends', 'mobile-legends-a4604', 'https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg', '[{"name": "userId", "type": "number", "label": "User ID", "required": true, "placeholder": "Masukkan User ID"}, {"name": "serverID", "type": "text", "label": "Masukkan Server", "required": true, "placeholder": "Contoh: 1234 tanpa ()"}]', '2026-08-02 04:09:06.314145+00', 'Moonton', 'https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 't', 'Beli top up ML diamond Mobile Legends dan Weekly Diamond Pass harga MLBB paling murah, aman, cepat, dan terpercaya.\r\n\r\n\r\n\r\nCara topup MLBB :\r\n1. Masukkan Data Akun\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Masukkan Kode Promo (jika ada)\r\n5. Isi Detail Kontak\r\n6. Klik Pesan Sekarang dan lakukan Pembayaran\r\n7. Selesai', 'https://assets.newgamingstore.com/1785679277302-580417955-MASUKANIDSERVERTANPACONTOH12345612341080x400piksel12.webp', 'Untuk menemukan ID Pengguna Anda, klik avatar Anda di pojok kiri atas layar dan buka tab Info Umum. Contoh: 12345678 (1234).', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 't', 'auto', 'mobile-legends', '{}', '1'),
('62fecbc0-82b7-4383-86a9-060912ebe19e', 'Call Of Duty Mobile', 'codm-a4604', 'https://assets.newgamingstore.com/1785645982923-96548894-Call_of_Duty_Mobile_characters_202608021143_11zon.webp', '[{"name": "openID", "type": "text", "label": "Open ID", "required": true}]', '2026-08-02 04:46:24.61826+00', 'TIMI STUDIO GRUOP', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 'f', 'Top Up Call of Duty Mobile :\r\n1. Masukkan Open ID\r\n2. Pilih Nominal\r\n3. Pilih Pembayaran\r\n4. Klik Order Now & lakukan Pembayaran\r\n5. CP masuk otomatis ke akun Anda', 'https://assets.newgamingstore.com/1785678997201-727447230-Halper_CODM-b977.webp', 'Untuk menemukan PlayerID Anda, klik ikon ''settings'' yang terletak di sebelah kanan layar dan klik tab ''LEGAL AND PRIVCY'', Anda dapat menemukan PlayerID Anda di sini.', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 't', 'auto', 'cod-mobile', '{}', '10'),
('6f222b87-29e7-4806-8fd0-9801caa713db', 'Roblox', 'roblox-9a145', 'https://assets.newgamingstore.com/1785643214021-467878991-Roblox_characters_celebrating_wi_202608021058.jpeg', '[{"name": "userName", "type": "text", "label": "Username", "required": true}, {"name": "password", "type": "text", "label": "Password", "required": true}, {"name": "backupCode", "type": "text", "label": "Masukkan Backup Code", "required": true}]', '2026-07-31 16:15:52.077503+00', 'Moonton', 'https://assets.newgamingstore.com/1785644307247-20395277-Anime_gamer_holding_controllers_202608021117_11zon.webp', '7d8a34e8-ff61-44d1-af88-a83a311f746b', 't', 'Top up Robux Roblox dengan harga paling murah, aman, cepat, dan terpercaya hanya di NEW GAMING STORE.\r\nCara topup Robux Roblox Via Login:\r\n\r\nPilih Nominal\r\nMasukkan Username dan Password Roblox kamu\r\nTentukan Jumlah Pembelian\r\nPilih Pembayaran\r\nMasukkan Kode Promo (jika ada)\r\nIsi Detail Kontak (Pastikan nomer whatsapp sudah benar! )\r\nKlik Pesan Sekarang dan lakukan Pembayaran\r\nPesanan akan proses sesuai urutan\r\nDone\r\n\r\nInfo tambahan khusus Produk Roblox :\r\n* Pesanan kamu diproses sesuai urutan, bisa sangat cepat, bisa sedikit lama. tergantung banyaknya antrian pada saat kamu membeli!\r\njangan khawatir, pesanan kamu tetap akan diproses, tidak perlu spam chat ya! 🚫\r\nSambil menunggu antrian, kamu boleh login dan memainkan game nya kok, tidak akan nabrak.\r\n\r\n* Jam kerja admin VIA LOGIN adalah dari jam 08:00 Pagi - 23:00 \r\nOrder di atas jam 00:00 akan mulai diproses pagi hari pada awal jam kerja / 08:00 WIB (sesuai urutan orderan)', '', 'Masukkan username, password, dan kode backup dengan benar.', '9a145561-8663-4b49-9d02-9a97c93ca322', 'f', NULL, NULL, '{}', '9'),
('a80754a9-31db-4095-9218-8b0a9feb1009', 'Honor Of Kings', 'hok-a4604', 'https://assets.newgamingstore.com/1785643240561-131792648-honor-of-king.webp', '[{"name": "userId", "type": "text", "label": "UID", "required": true, "placeholder": "Masukkan UID"}]', '2026-07-31 16:16:12.345877+00', 'Tencents', 'https://assets.newgamingstore.com/1785644284999-497802885-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 'f', 'Beli top up diamond Honor Of Kings harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Masukkan Data Akun\r\n2) Cara Melihat UID : Profile > Settings > UID\r\n3) Pilih Nominal\r\n4) Pilih Pembayaran\r\n5) Masukkan No WhatsApp\r\n6) Klik Pesan Sekarang & Lakukan Pembayaran\r\n\r\nToken akan otomatis masuk ke akun kamu', 'https://assets.newgamingstore.com/1785679337424-711196702-hokhelper-3df1-original.webp', 'ID berupa angka, bukan nickname !! Contoh : 12345678910111213', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 't', 'auto', 'honor-of-kings/', '{}', '8'),
('512c6156-fe45-4cd6-a472-6adaf7b92b77', 'E-FOOTBALL', 'fc-mobile-a4604', 'https://assets.newgamingstore.com/1785769079638-585094448-Replace_Vinicius_JR_with_Lamine_202608032101-2.jpeg', '[{"name": "userId", "type": "text", "label": "ID Pengguna", "required": true}]', '2026-08-02 04:35:16.572891+00', 'EA SPORTS', 'https://assets.newgamingstore.com/1785644276707-987732902-Anime_gamer_holding_controllers_202608021117_11zon.webp', '69c2e769-e8bf-4e14-80e7-095ace81d26c', 't', 'Top up FC Mobile harga paling murah, aman, cepat, dan terpercaya .\r\n\r\nCara topup :\r\n1) Pilih Nominal\r\n2) Masukkan ID Pengguna (Contoh : ASLW-945-198-758)\r\n3) Tentukan Jumlah Pembelian\r\n4) Pilih Pembayaran\r\n5) Isi Detail Kontak\r\n7) Klik Pesan Sekarang dan lakukan Pembayaran', 'https://assets.newgamingstore.com/1785679184613-438407231-FIFAMobile_Helper-6b86-original.jpeg', 'Untuk mengetahui User ID Anda, silakan klik menu profile dibagian kiri atas pada menu utama game. User ID akan terlihat dibagian bawah Nama Karakter Game Anda. Silakan masukkan User ID Anda untuk menyelesaikan transaksi. Contoh : 12345678(1234).', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f', NULL, NULL, '{}', '3')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.products (277 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.products (id, game_id, name, price, active, created_at, is_flash_sale, original_price, flash_sale_stock, image_url, tenant_id, variant_type) VALUES
('84cba569-e7ef-4813-b72c-f73b929c8fb2', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '25.200 FC Points', '750000', 't', '2026-08-02 08:40:19.4772+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', 'iOS'),
('5c63b563-8cae-4618-801a-a3efb9cba342', '484efde9-c89d-4954-afc6-3cd4d4d425f9', 'Genshin Impact 1050 Genesis Crystals (ID)', '100000', 't', '2026-08-02 06:15:33.053848+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', NULL, NULL),
('13c6fecd-10e3-4d2a-96fc-3604634735fa', '484efde9-c89d-4954-afc6-3cd4d4d425f9', '2.350 Genshin Impact Genesis Crystals ', '200000', 't', '2026-08-02 08:38:49.991856+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', NULL, NULL),
('a81844fa-533d-4e47-a70b-5e7e2bc79cf5', '484efde9-c89d-4954-afc6-3cd4d4d425f9', '5.200 Genshin Impact Genesis Crystals ', '400000', 't', '2026-08-02 08:38:50.367314+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', NULL, NULL),
('17a03840-2fdf-4c82-a835-e4677f3a3b5e', '484efde9-c89d-4954-afc6-3cd4d4d425f9', '7.880 Genshin Impact Genesis Crystals ', '500000', 't', '2026-08-02 08:38:50.762331+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', NULL, NULL),
('b23e68c0-1e97-485c-b682-c580b4c0e13d', '484efde9-c89d-4954-afc6-3cd4d4d425f9', '7.880 *4 Genshin Impact Genesis Crystals ', '3150000', 't', '2026-08-02 08:38:51.228164+00', 'f', '3150000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', NULL, NULL),
('7092f5a3-5a73-4d68-b9c1-778404ed9402', '484efde9-c89d-4954-afc6-3cd4d4d425f9', '7.880 *6 Genshin Impact Genesis Crystals ', '4700000', 't', '2026-08-02 08:38:51.511479+00', 'f', '4700000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', NULL, NULL),
('da8038cc-fe31-4f1c-a89a-e611776bceb2', '5f34e657-004e-47f1-bd25-3828eab68414', '1.700 CP', '100000', 't', '2026-08-02 08:38:51.92023+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('796b0318-825b-43a7-bf4e-38a9cff19e7e', '5f34e657-004e-47f1-bd25-3828eab68414', '3.950 CP', '200000', 't', '2026-08-02 08:38:52.170872+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('6a5be454-c4f2-4fa1-b505-8e4226fea14f', '5f34e657-004e-47f1-bd25-3828eab68414', '5.300 CP', '300000', 't', '2026-08-02 08:38:52.448303+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('02b77e76-db9d-4884-a51d-9a014b7e1159', '5f34e657-004e-47f1-bd25-3828eab68414', '8.400 CP', '400000', 't', '2026-08-02 08:38:52.681274+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('bec59245-ef0d-494b-b291-9d552de5660d', '5f34e657-004e-47f1-bd25-3828eab68414', '13.500 CP', '500000', 't', '2026-08-02 08:38:52.978944+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('3618f41b-d55c-45c0-bb98-a61bf90e902d', '5f34e657-004e-47f1-bd25-3828eab68414', '17.400 CP', '600000', 't', '2026-08-02 08:38:53.395323+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('294f27f7-badf-4014-b43d-20a4b7f19260', '5f34e657-004e-47f1-bd25-3828eab68414', '22.000 CP', '700000', 't', '2026-08-02 08:38:53.622952+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('3e51c42b-b33c-471b-b2d1-616d7e8334c5', '5f34e657-004e-47f1-bd25-3828eab68414', '28.000 CP', '800000', 't', '2026-08-02 08:38:53.849459+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('efa98016-cc15-4a3e-9e77-bd9c7ed277f2', '5f34e657-004e-47f1-bd25-3828eab68414', '33.700 CP', '900000', 't', '2026-08-02 08:38:54.154009+00', 'f', '900000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('c25a44ff-62e1-4ce8-abb4-c9a60082e81f', '5f34e657-004e-47f1-bd25-3828eab68414', '40.000 CP', '1000000', 't', '2026-08-02 08:38:54.386866+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', NULL, NULL),
('c901ea4c-de2a-46c2-9445-3a65ec56dd98', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '2.500 Token', '100000', 't', '2026-08-02 08:38:54.784011+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('a1fdc3a4-0c38-4e4b-893c-a085200d8be0', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '5.500 Token', '200000', 't', '2026-08-02 08:38:55.077696+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('c3662609-0a05-4c93-ac3c-7722ce885642', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '9.500 Token', '300000', 't', '2026-08-02 08:38:55.306585+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('a22ed89b-6fa2-40bc-9fe7-dc9b37dc81ae', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '15.200 Token', '400000', 't', '2026-08-02 08:38:55.622937+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('a9d9186c-4452-4e14-815d-1062c6b880eb', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '18.500 Token', '500000', 't', '2026-08-02 08:38:55.861397+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('1a50ed07-5546-44d0-a0e6-2b98ccca5bdb', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '21.500 Token', '600000', 't', '2026-08-02 08:38:56.121383+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('4ad7c68a-c3d4-4e8a-b8d9-24190ff67bcf', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '24.300 Token', '700000', 't', '2026-08-02 08:38:56.355958+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('29b2229f-35c5-44a4-a6b3-30a5275f1efc', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '29.700 Token', '800000', 't', '2026-08-02 08:38:56.646167+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('c410170c-be5f-469e-8e59-164b006c1ca4', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '48.500 Token', '1000000', 't', '2026-08-02 08:38:56.868916+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('aea8c77e-eed0-4669-a68f-4c26d26855f1', '5f7808f9-bc8d-45c6-a448-4cc50f11a9bf', '68.700 Token', '1500000', 't', '2026-08-02 08:38:57.19055+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', NULL, NULL),
('2224ef9b-076b-4d6c-9452-ec941511c78b', 'f8c0eb61-2286-4f83-b8c8-f4b014a94f2c', '1.000 Diamond', '100000', 't', '2026-08-02 08:38:57.541579+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', NULL, NULL),
('c9441126-ea47-4b1e-91a3-65c1ddc1d32a', 'f8c0eb61-2286-4f83-b8c8-f4b014a94f2c', '2.000 Diamond', '200000', 't', '2026-08-02 08:38:57.819835+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', NULL, NULL),
('d7a6c2b9-4a82-4d9d-a8bb-582d706044b8', 'f8c0eb61-2286-4f83-b8c8-f4b014a94f2c', '3.000 Diamond', '300000', 't', '2026-08-02 08:38:58.047713+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', NULL, NULL),
('2b13e755-e65c-455b-9a74-1e16eecd15f2', 'f8c0eb61-2286-4f83-b8c8-f4b014a94f2c', '4.500 Diamond', '450000', 't', '2026-08-02 08:38:58.349184+00', 'f', '450000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', NULL, NULL),
('4d249e6e-60e3-474f-ae62-1347d9da1c9f', 'f8c0eb61-2286-4f83-b8c8-f4b014a94f2c', '5.300 Diamond', '550000', 't', '2026-08-02 08:38:58.633168+00', 'f', '550000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', NULL, NULL),
('96d38fb0-36b9-4daf-8129-a4223fe37aaf', 'f8c0eb61-2286-4f83-b8c8-f4b014a94f2c', '6.600 Diamond', '650000', 't', '2026-08-02 08:38:58.880375+00', 'f', '650000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', NULL, NULL),
('d463de7e-2905-4743-a216-9750c28d3bc6', 'f8c0eb61-2286-4f83-b8c8-f4b014a94f2c', '10.000 Diamond', '800000', 't', '2026-08-02 08:38:59.105149+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', NULL, NULL),
('512f84d0-c9f8-4e97-8b5d-ebb78f77fe13', 'f8c0eb61-2286-4f83-b8c8-f4b014a94f2c', '15.000 Diamond', '1000000', 't', '2026-08-02 08:38:59.392311+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', NULL, NULL),
('f16d150c-4e65-479f-b225-1215911ef7d1', '230fcf75-22f7-4cb9-a194-ca0378b9437c', '2.500 VP', '100000', 't', '2026-08-02 08:38:59.784962+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', NULL, NULL),
('1d1136e0-9a04-46b7-9c9b-604026e916bb', '230fcf75-22f7-4cb9-a194-ca0378b9437c', '5.000 VP', '200000', 't', '2026-08-02 08:39:00.023468+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', NULL, NULL),
('6828dffc-9b17-487e-908f-36f17ee4fc9d', '230fcf75-22f7-4cb9-a194-ca0378b9437c', '7.500 VP', '350000', 't', '2026-08-02 08:39:00.323927+00', 'f', '350000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', NULL, NULL),
('92ee8493-ae10-4cc9-b91a-7cfc73a52c11', '230fcf75-22f7-4cb9-a194-ca0378b9437c', '10.100 VP', '550000', 't', '2026-08-02 08:39:00.579255+00', 'f', '550000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', NULL, NULL),
('db236deb-109f-42e8-a050-5b3993d6b883', '230fcf75-22f7-4cb9-a194-ca0378b9437c', '17.800 VP', '750000', 't', '2026-08-02 08:39:00.851081+00', 'f', '750000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', NULL, NULL),
('744340e3-04ae-4539-b57c-8a4204a35fc4', '230fcf75-22f7-4cb9-a194-ca0378b9437c', '25.100 VP', '1000000', 't', '2026-08-02 08:39:01.102879+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', NULL, NULL),
('088e993b-7e1d-4824-86e4-5c4c985f3621', '230fcf75-22f7-4cb9-a194-ca0378b9437c', '33.980 VP', '1500000', 't', '2026-08-02 08:39:01.381118+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', NULL, NULL),
('d1191bc2-e3c7-49db-b223-8f2e2cf6355b', '2b5be999-9dbe-4ea7-aa25-09babf741860', '1.700 UC', '100000', 't', '2026-08-02 08:39:01.744417+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('0944646e-0523-4b46-9a5e-e86c13a3debf', '2b5be999-9dbe-4ea7-aa25-09babf741860', '5.300 UC', '300000', 't', '2026-08-02 08:39:02.263008+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('f9058b2e-5cdc-4321-bfd9-901520a86ec2', '2b5be999-9dbe-4ea7-aa25-09babf741860', '8.400 UC', '400000', 't', '2026-08-02 08:39:02.531314+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('5bef7ad1-4244-47a5-8a55-7a0e6e8ef047', '484efde9-c89d-4954-afc6-3cd4d4d425f9', '7.880 *2 Genshin Impact Genesis Crystals ', '750000', 't', '2026-08-02 08:38:50.990417+00', 't', '850000', '20', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', NULL, NULL),
('1cd2528e-e6cb-4ec2-83aa-bef44a8464a1', '2b5be999-9dbe-4ea7-aa25-09babf741860', '13.500 UC', '500000', 't', '2026-08-02 08:39:02.758981+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('8f727e64-038b-4512-af38-428ce4cd21f5', '2b5be999-9dbe-4ea7-aa25-09babf741860', '28.000 UC', '800000', 't', '2026-08-02 08:39:03.576844+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('bac101b0-fd6a-472b-b3f1-5b4e9d3e8e87', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '5.050 FC Points (Top Up Android)', '250000', 't', '2026-08-02 08:40:16.334688+00', 'f', '250000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('b3c24db9-58b4-455f-ab2a-e8a56e1c02a0', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '17.050 FC Points (Top Up Android)', '500000', 't', '2026-08-02 08:40:17.096025+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, game_id, name, price, active, created_at, is_flash_sale, original_price, flash_sale_stock, image_url, tenant_id, variant_type) VALUES
('9c067c79-17b8-4673-aa6c-f4cdc04896ba', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '1.600 FC Points (Top Up iOS)', '100000', 't', '2026-08-02 08:40:17.908017+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('ef8397d6-5d36-47f7-a344-eb2f94b912bc', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '8.100 FC Points (Top Up iOS)', '300000', 't', '2026-08-02 08:40:18.65068+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('17fd84c5-285e-4954-9ab3-2cfe26e61797', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '25.200 FC Points (Top Up iOS)', '750000', 't', '2026-08-02 08:40:19.4772+00', 'f', '750000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('e94622de-2abd-4e48-bee4-811a5374f67e', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '9.500 Robux', '300000', 't', '2026-08-02 08:39:05.298019+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('b58d1083-2dc6-438f-b436-41fcd8dae785', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '21.500 Robux', '600000', 't', '2026-08-02 08:39:06.078071+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('7366145d-430f-4570-ac22-a53f652b020c', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '48.500 Robux', '1000000', 't', '2026-08-02 08:39:06.853697+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('4c01385c-3611-40c0-9aa3-8ab5d9905f57', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '9.500 Diamond', '300000', 't', '2026-08-02 08:39:08.013265+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('66ce8195-ee68-480d-a799-c596612606fd', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '21.500 Diamond', '600000', 't', '2026-08-02 08:39:08.821572+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('bdfc93e0-4d61-449b-9c82-716bc0bc8b90', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '48.500 Diamond', '1000000', 't', '2026-08-02 08:39:09.573823+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('7b31bfdf-b30f-4147-9836-973cde951a30', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '25.200 Coin (IOS)', '750000', 't', '2026-08-02 08:40:19.4772+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'iOS'),
('36171d64-caa9-4719-9cc0-86ea40e1dfb2', '57083f25-8e53-45c8-bce6-f9877ee04322', '35000 Coins', '1000000', 't', '2026-08-07 16:21:57.109316+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('6bc41bcc-0fb6-4a92-b7dc-0c9c0a37701c', '2b5be999-9dbe-4ea7-aa25-09babf741860', '17.400 UC', '600000', 't', '2026-08-02 08:39:03.054489+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('3c82d96b-5e86-4f7a-b2b0-8652c947d8c8', '2b5be999-9dbe-4ea7-aa25-09babf741860', '33.700 UC', '900000', 't', '2026-08-02 08:39:03.804757+00', 'f', '900000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('ce6026bf-e7d9-4ea7-a198-1e84462c7887', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '2.500 Robux', '100000', 't', '2026-08-02 08:39:04.746349+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('e874cc32-a8f0-4aae-85a1-a48785234a73', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '15.200 Robux', '400000', 't', '2026-08-02 08:39:05.579365+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('1e6b44d7-fe26-4cd7-b7e8-1be47703e086', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '24.300 Robux', '700000', 't', '2026-08-02 08:39:06.310385+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('afbd2e77-4096-4d0c-a48f-ab0e65b96afb', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '68.700 Robux', '1500000', 't', '2026-08-02 08:39:07.131154+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('e846076e-be24-42fd-824f-f7787f70ad9f', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '2.500 Diamond', '100000', 't', '2026-08-02 08:39:07.514694+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('b0b72072-1a7f-410a-bc1c-f769ffafec7e', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '15.200 Diamond', '400000', 't', '2026-08-02 08:39:08.328404+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('e358f82e-6d97-4c55-b05e-d3f6327a451a', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '24.300 Diamond', '700000', 't', '2026-08-02 08:39:09.046731+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('469edc1d-0847-4682-a703-035b884e6179', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '68.700 Diamond', '1500000', 't', '2026-08-02 08:39:09.86939+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('84ef1553-0185-4815-b705-adeeca275c40', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '8.100 Coin (IOS)', '300000', 't', '2026-08-02 08:40:18.65068+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'iOS'),
('cc3f72e6-2626-4e22-9964-ad8e246123a0', '57083f25-8e53-45c8-bce6-f9877ee04322', '55000 Coins', '1500000', 't', '2026-08-07 16:22:19.147726+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('e9dd50e3-670e-49ff-b34c-6f8e7cf491cf', '484efde9-c89d-4954-afc6-3cd4d4d425f9', '1.050 Genshin Impact Genesis Crystals ', '100000', 't', '2026-08-02 08:38:49.682907+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', NULL, NULL),
('e26b2218-900d-42e0-abd9-86820b21a858', '2b5be999-9dbe-4ea7-aa25-09babf741860', '3.950 UC', '200000', 't', '2026-08-02 08:39:02.029888+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('19a0493f-14d4-4e77-880c-4f4a1d55f655', '2b5be999-9dbe-4ea7-aa25-09babf741860', '22.000 UC', '700000', 't', '2026-08-02 08:39:03.298788+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('b2666714-4dc4-4281-9ed3-56c57ba9ed15', '2b5be999-9dbe-4ea7-aa25-09babf741860', '40.000 UC', '1000000', 't', '2026-08-02 08:39:04.117064+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', NULL, NULL),
('aa7cd8d0-709a-4007-b729-55a6bd692a37', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '1.500 FC Points (Top Up Android)', '100000', 't', '2026-08-02 08:40:15.81591+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('9cda4390-52ab-4bc5-bb5a-134dffb42ccd', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '3.850 FC Points (Top Up Android)', '200000', 't', '2026-08-02 08:40:16.043612+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('36163350-d27d-452b-a3be-2f0ea3150d19', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '8.050 FC Points (Top Up Android)', '300000', 't', '2026-08-02 08:40:16.567453+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('aaad1db9-b287-4529-ba6f-22b8b25137d9', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '13.050 FC Points (Top Up Android)', '400000', 't', '2026-08-02 08:40:16.86381+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('ffb9c3fc-affb-4057-b508-9d6bfc00aed1', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '25.050 FC Points (Top Up Android)', '750000', 't', '2026-08-02 08:40:17.375204+00', 'f', '750000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('4b9140a4-eb16-45e4-943c-1420a4488a09', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '38.000 FC Points (Top Up Android)', '1000000', 't', '2026-08-02 08:40:17.606961+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('74d781c4-192b-4614-8898-537632797ab6', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '3.900 FC Points (Top Up iOS)', '200000', 't', '2026-08-02 08:40:18.152169+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('92fea928-6101-402f-921c-5b28d4beffde', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '5.100 FC Points (Top Up iOS)', '250000', 't', '2026-08-02 08:40:18.422608+00', 'f', '250000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('15c50e72-acea-49b8-81e0-55ec5d941215', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '13.150 FC Points (Top Up iOS)', '400000', 't', '2026-08-02 08:40:18.959918+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('8ae934a4-d97c-4756-9fc2-6e9d4429fee5', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '17.150 FC Points (Top Up iOS)', '500000', 't', '2026-08-02 08:40:19.191192+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('f10ab622-e840-42a9-af23-591cb0457ba7', 'a4111b2c-92d8-4ad8-8157-2bc5d5fcc79f', '38.250 FC Points (Top Up iOS)', '1000000', 't', '2026-08-02 08:40:19.714826+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', NULL, NULL),
('3ac10d8d-cf3f-48d6-bb14-073bb8278b14', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '5.500 Robux', '200000', 't', '2026-08-02 08:39:05.046817+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('3918ba90-4cb8-4cce-bfb1-cdaed64d84b1', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '18.500 Robux', '500000', 't', '2026-08-02 08:39:05.807301+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('006aa1a4-b06c-4e4d-817c-18ad252b0304', '980e361b-1ba2-471e-9967-54a5ed1f8fce', '29.700 Robux', '800000', 't', '2026-08-02 08:39:06.618488+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', NULL, NULL),
('73e977eb-0703-4870-8fa3-458c629f9376', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '5.500 Diamond', '200000', 't', '2026-08-02 08:39:07.761263+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('3aaf8b68-2ffc-4e62-abfb-0dd3fd4eae49', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '18.500 Diamond', '500000', 't', '2026-08-02 08:39:08.563693+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('4da69657-ecd3-4393-8325-ef9cbbcf9dfe', 'edb8e7a1-6812-4a8f-a84f-18e2b3f6d084', '29.700 Diamond', '800000', 't', '2026-08-02 08:39:09.33716+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', NULL, NULL),
('93bfe81b-688c-4621-9190-abbd925b971f', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', 'Genshin Impact 1050 Genesis Crystals (ID)', '100000', 't', '2026-08-02 06:15:33.053848+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('a8db31b1-9854-4d9b-9431-3b3de8ee9cec', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', '2.350 Genshin Impact Genesis Crystals ', '200000', 't', '2026-08-02 08:38:49.991856+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('d6be7b45-ee86-4c72-81a1-3669573ac2df', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', '5.200 Genshin Impact Genesis Crystals ', '400000', 't', '2026-08-02 08:38:50.367314+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('e0eef048-ddda-4878-b5b0-3f0c1ef72f36', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', '7.880 Genshin Impact Genesis Crystals ', '500000', 't', '2026-08-02 08:38:50.762331+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('4f30c7e2-450d-4296-90a6-2c622fb30abe', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', '7.880 *4 Genshin Impact Genesis Crystals ', '3150000', 't', '2026-08-02 08:38:51.228164+00', 'f', '3150000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('c45948de-525d-4087-ad4d-c295c90bb1ef', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', '7.880 *6 Genshin Impact Genesis Crystals ', '4700000', 't', '2026-08-02 08:38:51.511479+00', 'f', '4700000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, game_id, name, price, active, created_at, is_flash_sale, original_price, flash_sale_stock, image_url, tenant_id, variant_type) VALUES
('313c99e6-01c2-41da-a01a-83f44e35bf1d', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '1.700 CP', '100000', 't', '2026-08-02 08:38:51.92023+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('f6673b72-e0f3-43a9-881a-6f486bc11fe3', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '3.950 CP', '200000', 't', '2026-08-02 08:38:52.170872+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('d7ade87c-d863-4c55-9fcb-65037e32df1c', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '5.300 CP', '300000', 't', '2026-08-02 08:38:52.448303+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('ca826b44-fb4b-4b79-9d12-ee9f516e7da9', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '8.400 CP', '400000', 't', '2026-08-02 08:38:52.681274+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('9dd24e70-e209-4ead-be64-470dd8721365', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '13.500 CP', '500000', 't', '2026-08-02 08:38:52.978944+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('f79c9623-2a6c-4f5a-bf68-ba012b31179f', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '17.400 CP', '600000', 't', '2026-08-02 08:38:53.395323+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('32992564-5c38-4dc1-b35c-d9b2876849a2', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '22.000 CP', '700000', 't', '2026-08-02 08:38:53.622952+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('40dfc152-7312-4255-bf58-1303e55fd14d', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '28.000 CP', '800000', 't', '2026-08-02 08:38:53.849459+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('0aa21a79-2377-4ed2-968a-8a6c1ca7b31f', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '33.700 CP', '900000', 't', '2026-08-02 08:38:54.154009+00', 'f', '900000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('99a3536a-d6fc-4b0a-bfc0-448fa16d55ce', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '40.000 CP', '1000000', 't', '2026-08-02 08:38:54.386866+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3', '57083f25-8e53-45c8-bce6-f9877ee04322', '2200 Coins', '100000', 't', '2026-08-07 16:17:14.566368+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('77cf6933-4498-4b79-b271-f3658c71e067', '57083f25-8e53-45c8-bce6-f9877ee04322', '77000 Coins', '2000000', 't', '2026-08-07 16:23:21.505337+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('0d03514c-eb08-40b6-835d-030843828f2b', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '2.500 Token', '100000', 't', '2026-08-02 08:38:54.784011+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('66d732ae-a317-44ee-9ca9-f4e5c7ae8a02', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '5.500 Token', '200000', 't', '2026-08-02 08:38:55.077696+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('54f1489b-660b-4ec9-928d-ded0dba9e52e', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '9.500 Token', '300000', 't', '2026-08-02 08:38:55.306585+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('60750fe9-dd24-4c59-8010-7b9ef203c311', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '15.200 Token', '400000', 't', '2026-08-02 08:38:55.622937+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('c3205b6d-f9e2-49c8-a176-727a681378b8', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '18.500 Token', '500000', 't', '2026-08-02 08:38:55.861397+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('11abe2c0-f895-4c60-a3e5-36ea294a4655', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '21.500 Token', '600000', 't', '2026-08-02 08:38:56.121383+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('223671b8-c723-4cf1-8d6a-781789f83015', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '24.300 Token', '700000', 't', '2026-08-02 08:38:56.355958+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('c99ccaee-23e5-4664-beb1-7ee1cb911c40', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '29.700 Token', '800000', 't', '2026-08-02 08:38:56.646167+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('46ac1270-e6ca-458b-9db7-a59a2243f3db', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '48.500 Token', '1000000', 't', '2026-08-02 08:38:56.868916+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('61d1db3c-55e6-4f0e-aee0-81ffec23f131', '2ebd3b44-5b14-45bb-8bd8-786afbc14670', '68.700 Token', '1500000', 't', '2026-08-02 08:38:57.19055+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('956ce24b-66c6-48d1-b8fa-2353b40fe21c', '9080ff51-f599-450f-9fde-ef81fa7dd557', '1.000 Diamond', '100000', 't', '2026-08-02 08:38:57.541579+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('da627e98-8c45-42ad-a3ea-e168dde0c2e7', '9080ff51-f599-450f-9fde-ef81fa7dd557', '2.000 Diamond', '200000', 't', '2026-08-02 08:38:57.819835+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('f0d0eab6-695c-4aac-86da-415e81721f9f', '9080ff51-f599-450f-9fde-ef81fa7dd557', '3.000 Diamond', '300000', 't', '2026-08-02 08:38:58.047713+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('8a3cdf49-f773-42f1-b0be-c37e59586587', '9080ff51-f599-450f-9fde-ef81fa7dd557', '4.500 Diamond', '450000', 't', '2026-08-02 08:38:58.349184+00', 'f', '450000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('d28c66c8-1fd5-4f98-8fb1-032202c68162', '9080ff51-f599-450f-9fde-ef81fa7dd557', '5.300 Diamond', '550000', 't', '2026-08-02 08:38:58.633168+00', 'f', '550000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('b9f1be41-ee3b-4de6-8fe6-0c73fb358c20', '9080ff51-f599-450f-9fde-ef81fa7dd557', '6.600 Diamond', '650000', 't', '2026-08-02 08:38:58.880375+00', 'f', '650000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('e1b3ee35-27d5-415a-8286-3515d2092b91', '9080ff51-f599-450f-9fde-ef81fa7dd557', '10.000 Diamond', '800000', 't', '2026-08-02 08:38:59.105149+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('3f889cc2-96e6-4517-9657-f4d36409007e', '9080ff51-f599-450f-9fde-ef81fa7dd557', '15.000 Diamond', '1000000', 't', '2026-08-02 08:38:59.392311+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('74a1cd50-c77b-4cb4-9422-17ea06643eaa', 'a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', '2.500 VP', '100000', 't', '2026-08-02 08:38:59.784962+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('26c97466-ff59-46dd-bcd0-1f04f8d4286f', 'a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', '5.000 VP', '200000', 't', '2026-08-02 08:39:00.023468+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('245e0419-f136-4daa-9da5-8b840936af37', 'a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', '7.500 VP', '350000', 't', '2026-08-02 08:39:00.323927+00', 'f', '350000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('e5f9140e-d43e-49aa-9a22-a72997a304d1', 'a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', '10.100 VP', '550000', 't', '2026-08-02 08:39:00.579255+00', 'f', '550000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('e5c3c630-01e8-458b-b948-a91d02d2a101', 'a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', '17.800 VP', '750000', 't', '2026-08-02 08:39:00.851081+00', 'f', '750000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('714f0a34-d485-4abd-9438-6cff27315806', 'a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', '25.100 VP', '1000000', 't', '2026-08-02 08:39:01.102879+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('b3385b0a-a623-40e5-b767-5059e1274c7f', 'a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', '33.980 VP', '1500000', 't', '2026-08-02 08:39:01.381118+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('c27efd1a-d389-406b-a823-eddcac6573a0', '5869ed06-5786-4684-b8ed-1484c3c410f4', '1.700 UC', '100000', 't', '2026-08-02 08:39:01.744417+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('690dd15a-2142-458c-aa52-e38b77db055d', '5869ed06-5786-4684-b8ed-1484c3c410f4', '5.300 UC', '300000', 't', '2026-08-02 08:39:02.263008+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('7451cd3d-8d07-433a-9628-a28776b5153d', '5869ed06-5786-4684-b8ed-1484c3c410f4', '8.400 UC', '400000', 't', '2026-08-02 08:39:02.531314+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('bae0aa14-9cf5-4313-8511-2f30f5734919', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', '7.880 *2 Genshin Impact Genesis Crystals ', '750000', 't', '2026-08-02 08:38:50.990417+00', 't', '850000', '20', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('8653a81a-97c4-4ad5-ae57-3ee14838099e', '5869ed06-5786-4684-b8ed-1484c3c410f4', '13.500 UC', '500000', 't', '2026-08-02 08:39:02.758981+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('5aa8f2db-7a57-4b2a-b5f9-9026a10852cd', '5869ed06-5786-4684-b8ed-1484c3c410f4', '28.000 UC', '800000', 't', '2026-08-02 08:39:03.576844+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('4b37125b-0c3f-46bd-9f64-d82f20f48f90', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '5.050 FC Points (Top Up Android)', '250000', 't', '2026-08-02 08:40:16.334688+00', 'f', '250000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('b55ef37c-a7dd-43f1-aacf-0f9d132f6fc0', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '17.050 FC Points (Top Up Android)', '500000', 't', '2026-08-02 08:40:17.096025+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('8846d535-c220-4145-82ce-a5f327f30c3b', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '1.600 FC Points (Top Up iOS)', '100000', 't', '2026-08-02 08:40:17.908017+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('15aea95a-4d11-458e-b53c-2f372e0155ef', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '8.100 FC Points (Top Up iOS)', '300000', 't', '2026-08-02 08:40:18.65068+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('628ed7fe-283e-4380-baf8-d73990e484e1', '6f222b87-29e7-4806-8fd0-9801caa713db', '9.500 Robux', '300000', 't', '2026-08-02 08:39:05.298019+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('3bb96c58-b3ce-4746-8bee-ba819db710c8', '6f222b87-29e7-4806-8fd0-9801caa713db', '21.500 Robux', '600000', 't', '2026-08-02 08:39:06.078071+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('3cdb5cd2-63c0-4eeb-a9cd-0e858dca103c', '6f222b87-29e7-4806-8fd0-9801caa713db', '48.500 Robux', '1000000', 't', '2026-08-02 08:39:06.853697+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, game_id, name, price, active, created_at, is_flash_sale, original_price, flash_sale_stock, image_url, tenant_id, variant_type) VALUES
('e6bb44c2-39e9-471e-83fe-daf04bafb867', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '9.500 Diamond', '300000', 't', '2026-08-02 08:39:08.013265+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('f1bd5d65-bc36-41f4-86af-4a6885af11e3', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '21.500 Diamond', '600000', 't', '2026-08-02 08:39:08.821572+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('e6b59a0a-dced-455c-8898-ed48b86ce961', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '48.500 Diamond', '1000000', 't', '2026-08-02 08:39:09.573823+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('851845b9-056b-4278-9255-22ac26468885', '5869ed06-5786-4684-b8ed-1484c3c410f4', '17.400 UC', '600000', 't', '2026-08-02 08:39:03.054489+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('d9bdd934-417f-49bb-9953-a9f7384d5d39', '5869ed06-5786-4684-b8ed-1484c3c410f4', '33.700 UC', '900000', 't', '2026-08-02 08:39:03.804757+00', 'f', '900000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('45969c91-bab1-489b-b406-89200858495a', '6f222b87-29e7-4806-8fd0-9801caa713db', '2.500 Robux', '100000', 't', '2026-08-02 08:39:04.746349+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('abe08016-b7ec-43f5-91fa-10f7d956c9c4', '6f222b87-29e7-4806-8fd0-9801caa713db', '15.200 Robux', '400000', 't', '2026-08-02 08:39:05.579365+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('878f6e44-a052-4581-b68c-7ef14faecf1b', '6f222b87-29e7-4806-8fd0-9801caa713db', '24.300 Robux', '700000', 't', '2026-08-02 08:39:06.310385+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('e5176d2b-63f4-4cb5-bb52-d4f9d2ca07bf', '6f222b87-29e7-4806-8fd0-9801caa713db', '68.700 Robux', '1500000', 't', '2026-08-02 08:39:07.131154+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('52fbbf8a-88c4-420e-8244-9e1ed1c3b091', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '2.500 Diamond', '100000', 't', '2026-08-02 08:39:07.514694+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('9ddc0f25-841d-4607-b3b7-6c3d502839ca', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '15.200 Diamond', '400000', 't', '2026-08-02 08:39:08.328404+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('c8212a24-c56e-4cea-8607-71b2e0422581', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '24.300 Diamond', '700000', 't', '2026-08-02 08:39:09.046731+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('0062ea4d-8ce4-4928-921b-5b35a07b1eea', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '68.700 Diamond', '1500000', 't', '2026-08-02 08:39:09.86939+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('8bff98df-b1c8-4449-a8f6-eadee08390d0', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', '1.050 Genshin Impact Genesis Crystals ', '100000', 't', '2026-08-02 08:38:49.682907+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('d40201af-4727-4750-b891-95b44377fa8d', '5869ed06-5786-4684-b8ed-1484c3c410f4', '3.950 UC', '200000', 't', '2026-08-02 08:39:02.029888+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('580ed97b-5e36-4f39-a12e-22fff9917381', '5869ed06-5786-4684-b8ed-1484c3c410f4', '22.000 UC', '700000', 't', '2026-08-02 08:39:03.298788+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('8693630a-98b1-4bb3-a07b-43c2a2675580', '5869ed06-5786-4684-b8ed-1484c3c410f4', '40.000 UC', '1000000', 't', '2026-08-02 08:39:04.117064+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('2e645715-7d84-45e2-9eb0-d85e31d8c6cd', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '1.500 FC Points (Top Up Android)', '100000', 't', '2026-08-02 08:40:15.81591+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('84c501d3-64a9-44ee-8845-b272df1c92e4', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '3.850 FC Points (Top Up Android)', '200000', 't', '2026-08-02 08:40:16.043612+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('0c26e576-bc3e-4a2d-b656-fbb4e5792548', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '8.050 FC Points (Top Up Android)', '300000', 't', '2026-08-02 08:40:16.567453+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('9fe9e9cf-a3db-4b0f-88b5-cf20facc8f4d', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '13.050 FC Points (Top Up Android)', '400000', 't', '2026-08-02 08:40:16.86381+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('816f35c7-f329-4be2-80aa-de0cc2a91f8a', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '3.900 FC Points (Top Up iOS)', '200000', 't', '2026-08-02 08:40:18.152169+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('71155bd4-b759-460a-b3d9-d1637367c860', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '5.100 FC Points (Top Up iOS)', '250000', 't', '2026-08-02 08:40:18.422608+00', 'f', '250000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('735be275-801f-4b8c-bba1-afb67370c807', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '13.150 FC Points (Top Up iOS)', '400000', 't', '2026-08-02 08:40:18.959918+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('9c27641e-4c34-4ed6-84b3-deb3b7ccfb98', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '17.150 FC Points (Top Up iOS)', '500000', 't', '2026-08-02 08:40:19.191192+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('05b87408-c21d-4445-8941-824e7e235528', '6f222b87-29e7-4806-8fd0-9801caa713db', '5.500 Robux', '200000', 't', '2026-08-02 08:39:05.046817+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('25de16c1-a7cf-4837-9259-362563836b84', '6f222b87-29e7-4806-8fd0-9801caa713db', '18.500 Robux', '500000', 't', '2026-08-02 08:39:05.807301+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('04764086-5db1-4fa6-8582-00b0088596ad', '6f222b87-29e7-4806-8fd0-9801caa713db', '29.700 Robux', '800000', 't', '2026-08-02 08:39:06.618488+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('f2306acd-8d85-44c8-a153-b02d16380d07', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '5.500 Diamond', '200000', 't', '2026-08-02 08:39:07.761263+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('6f91ad22-4850-4c24-b63f-aed947fd14e1', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '18.500 Diamond', '500000', 't', '2026-08-02 08:39:08.563693+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('6c8aac6d-1b24-431f-9baa-9c4c35f7cc3f', 'b0af1dd3-f015-44b6-be4e-ba57b015a7c4', '29.700 Diamond', '800000', 't', '2026-08-02 08:39:09.33716+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', '9a145561-8663-4b49-9d02-9a97c93ca322', NULL),
('896f94f5-24f9-435f-8463-0c8c05c3ac4a', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '38.250 FC Points', '1000000', 't', '2026-08-02 08:40:19.714826+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', 'iOS'),
('9c57c5d6-ecb3-4ad9-91d5-fc07acaf5157', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '38.000 FC Points', '1000000', 't', '2026-08-02 08:40:17.606961+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', 'Android'),
('33c58bfd-ea4d-45dd-9020-52fd68e61fab', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '25.050 FC Points', '750000', 't', '2026-08-02 08:40:17.375204+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', '9a145561-8663-4b49-9d02-9a97c93ca322', 'Android'),
('eea48ac4-eeef-40be-8759-1408c71e3b6d', '57083f25-8e53-45c8-bce6-f9877ee04322', '5000 Coins', '200000', 't', '2026-08-07 16:18:34.113957+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('a9784ceb-44b6-423d-b062-cf989767b371', '57083f25-8e53-45c8-bce6-f9877ee04322', '16000 Coins', '500000', 't', '2026-08-07 16:19:40.581571+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('16f36618-a67b-4750-9c37-0e4f99be7b01', '57083f25-8e53-45c8-bce6-f9877ee04322', '8300 Coins', '300000', 't', '2026-08-07 16:18:48.560738+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('d2d99243-7c10-46f9-bc5f-c7ec33dd4813', '57083f25-8e53-45c8-bce6-f9877ee04322', '11700 Coins', '400000', 't', '2026-08-07 16:19:17.880974+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('13b84cfd-3c08-471a-99fa-b893042880cd', '57083f25-8e53-45c8-bce6-f9877ee04322', '20000 Coins', '600000', 't', '2026-08-07 16:20:17.996669+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('4f5778bc-1721-4bba-8991-19386259b1bf', '7485df14-c3e2-42e1-8d6b-dcc4a09e64a5', 'Genshin Impact 1050 Genesis Crystals (ID)', '100000', 't', '2026-08-02 06:15:33.053848+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('12cc2986-19c8-4df0-b1a0-728a7e648ef6', '7485df14-c3e2-42e1-8d6b-dcc4a09e64a5', '2.350 Genshin Impact Genesis Crystals ', '200000', 't', '2026-08-02 08:38:49.991856+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('750f6e3c-d2cd-4a5c-a0c5-c0846ae01b45', '7485df14-c3e2-42e1-8d6b-dcc4a09e64a5', '5.200 Genshin Impact Genesis Crystals ', '400000', 't', '2026-08-02 08:38:50.367314+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('d71a388c-75df-46b0-9be0-5ecc1e219d3a', '7485df14-c3e2-42e1-8d6b-dcc4a09e64a5', '7.880 Genshin Impact Genesis Crystals ', '500000', 't', '2026-08-02 08:38:50.762331+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('7beaf302-aa34-40de-a1ad-5ab03d133982', '7485df14-c3e2-42e1-8d6b-dcc4a09e64a5', '7.880 *4 Genshin Impact Genesis Crystals ', '3150000', 't', '2026-08-02 08:38:51.228164+00', 'f', '3150000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('884055ed-a25a-42c5-ba62-0b90ff4915fe', '7485df14-c3e2-42e1-8d6b-dcc4a09e64a5', '7.880 *6 Genshin Impact Genesis Crystals ', '4700000', 't', '2026-08-02 08:38:51.511479+00', 'f', '4700000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('a3ddfc76-b8a1-425e-a7a7-f46626a8c820', '62fecbc0-82b7-4383-86a9-060912ebe19e', '1.700 CP', '100000', 't', '2026-08-02 08:38:51.92023+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('436d011d-fc8f-4b19-9dc2-0747a2e66443', '62fecbc0-82b7-4383-86a9-060912ebe19e', '3.950 CP', '200000', 't', '2026-08-02 08:38:52.170872+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('426e3a84-e39f-4ff8-9864-5a28239eb227', '62fecbc0-82b7-4383-86a9-060912ebe19e', '5.300 CP', '300000', 't', '2026-08-02 08:38:52.448303+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('078872c6-a728-4af1-ab81-2e3ea3742ec6', '62fecbc0-82b7-4383-86a9-060912ebe19e', '8.400 CP', '400000', 't', '2026-08-02 08:38:52.681274+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('4ce21a88-4878-4bc1-8d6f-9c83616afe47', '62fecbc0-82b7-4383-86a9-060912ebe19e', '13.500 CP', '500000', 't', '2026-08-02 08:38:52.978944+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, game_id, name, price, active, created_at, is_flash_sale, original_price, flash_sale_stock, image_url, tenant_id, variant_type) VALUES
('b7483c88-742d-4ad0-b165-07f823ed3e94', '62fecbc0-82b7-4383-86a9-060912ebe19e', '17.400 CP', '600000', 't', '2026-08-02 08:38:53.395323+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('b6a6c384-ea79-44a0-a69a-e01b599f6abc', '62fecbc0-82b7-4383-86a9-060912ebe19e', '22.000 CP', '700000', 't', '2026-08-02 08:38:53.622952+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('ec2d7155-280d-4b27-99ff-ffaa234d0225', '62fecbc0-82b7-4383-86a9-060912ebe19e', '28.000 CP', '800000', 't', '2026-08-02 08:38:53.849459+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('fef6d0cf-5b09-450e-8902-1f34f809bb43', '62fecbc0-82b7-4383-86a9-060912ebe19e', '33.700 CP', '900000', 't', '2026-08-02 08:38:54.154009+00', 'f', '900000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('40585624-0c10-40e5-9682-30a4dffb08b7', '62fecbc0-82b7-4383-86a9-060912ebe19e', '40.000 CP', '1000000', 't', '2026-08-02 08:38:54.386866+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/zFSU5cAxuY2fyVv.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('94259e7b-d8e4-4cb9-ad5e-f778dbfe684f', 'a80754a9-31db-4095-9218-8b0a9feb1009', '2.500 Token', '100000', 't', '2026-08-02 08:38:54.784011+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('48031e31-c227-4894-ac34-031508320931', 'a80754a9-31db-4095-9218-8b0a9feb1009', '5.500 Token', '200000', 't', '2026-08-02 08:38:55.077696+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('4f73975f-e339-427c-8a65-dfa7821e47a2', 'a80754a9-31db-4095-9218-8b0a9feb1009', '9.500 Token', '300000', 't', '2026-08-02 08:38:55.306585+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('1c0cdeea-f22c-4f03-8cb7-5e9d85a1ad81', 'a80754a9-31db-4095-9218-8b0a9feb1009', '15.200 Token', '400000', 't', '2026-08-02 08:38:55.622937+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('11fd1e9e-cfa9-4b7b-8dad-8b439cb4258e', 'a80754a9-31db-4095-9218-8b0a9feb1009', '18.500 Token', '500000', 't', '2026-08-02 08:38:55.861397+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('9873d92b-b10c-4f59-a39e-b4d6a954686a', 'a80754a9-31db-4095-9218-8b0a9feb1009', '21.500 Token', '600000', 't', '2026-08-02 08:38:56.121383+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('34682b4e-1a0a-4319-aa52-ab933d5d093b', 'a80754a9-31db-4095-9218-8b0a9feb1009', '24.300 Token', '700000', 't', '2026-08-02 08:38:56.355958+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('c6d2d5ca-30cf-4af9-a084-5a4c0d6c78f2', 'a80754a9-31db-4095-9218-8b0a9feb1009', '29.700 Token', '800000', 't', '2026-08-02 08:38:56.646167+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('a03d60c7-0f7e-4e18-a411-dfd7c982b800', 'a80754a9-31db-4095-9218-8b0a9feb1009', '48.500 Token', '1000000', 't', '2026-08-02 08:38:56.868916+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('2073f5d4-cc54-470a-a1f8-9f25e4d0cdcd', 'a80754a9-31db-4095-9218-8b0a9feb1009', '68.700 Token', '1500000', 't', '2026-08-02 08:38:57.19055+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/gJIlsxO6UORU9zZ.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('26ca65dc-c806-4e42-88d2-d91ccf84b349', 'c12f54ca-3a23-4265-9c58-9d3eb4056c4d', '1.000 Diamond', '100000', 't', '2026-08-02 08:38:57.541579+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('03a23302-377c-4d45-b8c1-04921f08df9e', 'c12f54ca-3a23-4265-9c58-9d3eb4056c4d', '2.000 Diamond', '200000', 't', '2026-08-02 08:38:57.819835+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('31a0fd1e-05f7-4ce9-94e3-9ec170cd0866', 'c12f54ca-3a23-4265-9c58-9d3eb4056c4d', '3.000 Diamond', '300000', 't', '2026-08-02 08:38:58.047713+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('9fc3aed5-2ebc-4d61-ab3e-b8fa9eedc15f', 'c12f54ca-3a23-4265-9c58-9d3eb4056c4d', '4.500 Diamond', '450000', 't', '2026-08-02 08:38:58.349184+00', 'f', '450000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('52cafd3b-24f7-4fa4-bdbc-754369d3cf8a', 'c12f54ca-3a23-4265-9c58-9d3eb4056c4d', '5.300 Diamond', '550000', 't', '2026-08-02 08:38:58.633168+00', 'f', '550000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('0beda884-064d-4119-adfa-adc43e5ba98d', 'c12f54ca-3a23-4265-9c58-9d3eb4056c4d', '6.600 Diamond', '650000', 't', '2026-08-02 08:38:58.880375+00', 'f', '650000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('95c578f2-d8fd-43a9-82ff-6d863e65f82e', 'c12f54ca-3a23-4265-9c58-9d3eb4056c4d', '10.000 Diamond', '800000', 't', '2026-08-02 08:38:59.105149+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('c47c5596-0aea-4147-aa5a-856c26e740c3', 'c12f54ca-3a23-4265-9c58-9d3eb4056c4d', '15.000 Diamond', '1000000', 't', '2026-08-02 08:38:59.392311+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/imgop.itemku.com.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('719f0e77-8034-46a9-bd28-9a3de1b89e33', '747a8732-b175-4ed2-bcd1-f498fc62f63a', '2.500 VP', '100000', 't', '2026-08-02 08:38:59.784962+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('e408a595-0fb0-40e1-a3ce-68f3489f7fea', '747a8732-b175-4ed2-bcd1-f498fc62f63a', '5.000 VP', '200000', 't', '2026-08-02 08:39:00.023468+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('9bc6d635-6e97-4fb0-af4f-9f3bcf6aebf0', '747a8732-b175-4ed2-bcd1-f498fc62f63a', '7.500 VP', '350000', 't', '2026-08-02 08:39:00.323927+00', 'f', '350000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('7fe10501-8baf-4cda-a4f5-be4dbf529f45', '747a8732-b175-4ed2-bcd1-f498fc62f63a', '10.100 VP', '550000', 't', '2026-08-02 08:39:00.579255+00', 'f', '550000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('23bd68d8-1e7d-419d-8545-9ea133f16a35', '747a8732-b175-4ed2-bcd1-f498fc62f63a', '17.800 VP', '750000', 't', '2026-08-02 08:39:00.851081+00', 'f', '750000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('75e16e35-898d-4661-b940-4113a73cd077', '747a8732-b175-4ed2-bcd1-f498fc62f63a', '25.100 VP', '1000000', 't', '2026-08-02 08:39:01.102879+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('fc8166aa-b83f-49b7-a62f-9338598128bd', '747a8732-b175-4ed2-bcd1-f498fc62f63a', '33.980 VP', '1500000', 't', '2026-08-02 08:39:01.381118+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/EKUtaHaYdpoKgHo.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('7608bfa3-54c6-4fa5-897d-386135e57a72', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '1.700 UC', '100000', 't', '2026-08-02 08:39:01.744417+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('1f14d7e9-4253-4e93-b1f1-19c6a6e31fbc', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '5.300 UC', '300000', 't', '2026-08-02 08:39:02.263008+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('d44cf307-755a-4f9a-becb-c9203b12b4ef', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '8.400 UC', '400000', 't', '2026-08-02 08:39:02.531314+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('6f1df0f5-d0f5-4a7c-b2de-0daff6c7651a', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '13.500 UC', '500000', 't', '2026-08-02 08:39:02.758981+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('e399ff77-0fc1-4aae-a132-0afc81288507', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '28.000 UC', '800000', 't', '2026-08-02 08:39:03.576844+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('741449be-0fd3-4259-8ae3-ee0971258fb9', 'a8e80afd-9b72-4088-b49d-52de3687d936', '9.500 Robux', '300000', 't', '2026-08-02 08:39:05.298019+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('6b5e7b12-c52b-4ee9-978b-274571a8d26a', 'a8e80afd-9b72-4088-b49d-52de3687d936', '21.500 Robux', '600000', 't', '2026-08-02 08:39:06.078071+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('c0bfc1fe-6ffa-47fd-a82d-83cd4f4b7724', 'a8e80afd-9b72-4088-b49d-52de3687d936', '48.500 Robux', '1000000', 't', '2026-08-02 08:39:06.853697+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('68e8fa9c-e240-43d7-bbca-c4c66a4a4d9f', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '9.500 Diamond', '300000', 't', '2026-08-02 08:39:08.013265+00', 'f', '300000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('ad4bda76-296d-4a60-b27e-40610e4596e6', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '21.500 Diamond', '600000', 't', '2026-08-02 08:39:08.821572+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('e7a9ab30-dd3f-4372-823a-c8ef01418b82', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '48.500 Diamond', '1000000', 't', '2026-08-02 08:39:09.573823+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('801bc4fc-5dd1-49b3-8f0d-8deff5059386', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '17.400 UC', '600000', 't', '2026-08-02 08:39:03.054489+00', 'f', '600000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('18a677f1-60b4-4181-9ffe-4c9cf86db827', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '17.050 Coin (Android)', '500000', 't', '2026-08-02 08:40:17.096025+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'Android'),
('d77584f4-eed0-4135-a585-132b81b448da', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '5.050 Coin (Android)', '250000', 't', '2026-08-02 08:40:16.334688+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'Android'),
('2d42e7bf-496b-4aef-80d2-b477f3d92105', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '1.600 Coin (IOS)', '100000', 't', '2026-08-02 08:40:17.908017+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'iOS'),
('8bcb17e9-6321-48d8-a927-dfdee34d3975', '7485df14-c3e2-42e1-8d6b-dcc4a09e64a5', '7.880 *2 Genshin Impact Genesis Crystals ', '750000', 't', '2026-08-02 08:38:50.990417+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('671519c7-4257-4f3e-98a8-a90b4a29e3f4', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '33.700 UC', '900000', 't', '2026-08-02 08:39:03.804757+00', 'f', '900000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('0850cdad-09e2-4737-9f94-055dbf3ff231', 'a8e80afd-9b72-4088-b49d-52de3687d936', '2.500 Robux', '100000', 't', '2026-08-02 08:39:04.746349+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('85d1a827-01d5-4348-9235-7404aac6c295', 'a8e80afd-9b72-4088-b49d-52de3687d936', '15.200 Robux', '400000', 't', '2026-08-02 08:39:05.579365+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('ae04a2cf-056c-4886-b015-4c10e07b58b3', 'a8e80afd-9b72-4088-b49d-52de3687d936', '24.300 Robux', '700000', 't', '2026-08-02 08:39:06.310385+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, game_id, name, price, active, created_at, is_flash_sale, original_price, flash_sale_stock, image_url, tenant_id, variant_type) VALUES
('49a20754-e51c-4988-87df-90e4168a0da4', 'a8e80afd-9b72-4088-b49d-52de3687d936', '68.700 Robux', '1500000', 't', '2026-08-02 08:39:07.131154+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('7a74e715-f19c-454f-9f73-ced40248ba63', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '2.500 Diamond', '100000', 't', '2026-08-02 08:39:07.514694+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('4e19cd3b-5904-4138-b9bf-52329cf10c20', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '15.200 Diamond', '400000', 't', '2026-08-02 08:39:08.328404+00', 'f', '400000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('64f96493-6aab-4968-8451-1175f3dc2455', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '24.300 Diamond', '700000', 't', '2026-08-02 08:39:09.046731+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('31fcb04b-fbf1-46d1-93fe-81916aaba694', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '68.700 Diamond', '1500000', 't', '2026-08-02 08:39:09.86939+00', 'f', '1500000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('2337e527-a2c9-4621-91ff-d03412eb1c97', '7485df14-c3e2-42e1-8d6b-dcc4a09e64a5', '1.050 Genshin Impact Genesis Crystals ', '100000', 't', '2026-08-02 08:38:49.682907+00', 'f', '100000', '0', 'https://assets.newgamingstore.com/1785651270310-27123511-0TuDiSMTRsDAAKu.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('c1e939d6-156f-4018-b104-eb3700b16fea', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '3.950 UC', '200000', 't', '2026-08-02 08:39:02.029888+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('a06df1a1-b7c1-483c-99f6-3c12e4a0dd72', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '22.000 UC', '700000', 't', '2026-08-02 08:39:03.298788+00', 'f', '700000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('a6e83832-e871-4233-97d9-da845999d651', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '40.000 UC', '1000000', 't', '2026-08-02 08:39:04.117064+00', 'f', '1000000', '0', 'https://assets.newgamingstore.com/vDZORckp1H6izkA.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('55a0b858-e8d0-4373-93e7-f7f656057257', 'a8e80afd-9b72-4088-b49d-52de3687d936', '5.500 Robux', '200000', 't', '2026-08-02 08:39:05.046817+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('cd176605-d909-4ff6-bbcf-8270ee4b8fe7', 'a8e80afd-9b72-4088-b49d-52de3687d936', '18.500 Robux', '500000', 't', '2026-08-02 08:39:05.807301+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('a5d36480-7c5c-4395-bff2-0b0cbd149297', 'a8e80afd-9b72-4088-b49d-52de3687d936', '29.700 Robux', '800000', 't', '2026-08-02 08:39:06.618488+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/6sMiKF2sBFjQimM.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('7a16753e-d851-4faf-954d-9b8a4077867d', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '5.500 Diamond', '200000', 't', '2026-08-02 08:39:07.761263+00', 'f', '200000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('0813d5ae-a040-4f2e-a665-94580ce930bc', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '18.500 Diamond', '500000', 't', '2026-08-02 08:39:08.563693+00', 'f', '500000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('11630997-cbd9-43f8-9aca-eddcaf3a2b67', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '29.700 Diamond', '800000', 't', '2026-08-02 08:39:09.33716+00', 'f', '800000', '0', 'https://assets.newgamingstore.com/FydFVpjrOwp4jPl.webp', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('8f6320c0-3702-4a4b-983d-a04d94c86a16', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '17.150 Coin (IOS)', '500000', 't', '2026-08-02 08:40:19.191192+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'iOS'),
('9da6a566-bc5c-4458-980c-644e646dbb26', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '3.850 Coin (Android)', '200000', 't', '2026-08-02 08:40:16.043612+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'Android'),
('faf7b240-6b35-4e92-b974-60a69c4fdb1d', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '1.500 Coin (Android)', '100000', 't', '2026-08-02 08:40:15.81591+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'Android'),
('bc08e697-f3cd-4f18-9831-2d49f1946215', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '5.100 Coin (IOS)', '250000', 't', '2026-08-02 08:40:18.422608+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'iOS'),
('87307348-e3f1-4782-8d66-e9a495ddebae', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '3.900 Coin (IOS)', '200000', 't', '2026-08-02 08:40:18.152169+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'iOS'),
('8f144ac2-03aa-423e-b59a-d159aab31285', '57083f25-8e53-45c8-bce6-f9877ee04322', '25000 Coins', '750000', 't', '2026-08-07 16:20:45.775493+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1786119403406-173159794-TikTokCoins-removebg-preview.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', NULL),
('da353d89-8fca-4375-94c5-0b92bf6acadd', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '38.000 Coin (Android)', '1000000', 't', '2026-08-02 08:40:17.606961+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'Android'),
('3eab3b50-73bb-444d-9318-c0e5cfd49238', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '13.150 Coin (IOS)', '400000', 't', '2026-08-02 08:40:18.959918+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/zJTfZ4UkUAvAj6E.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'iOS'),
('d2b3735c-d47d-4681-8d16-c8972ec70bf4', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '38.250 Coin (IOS)', '1000000', 't', '2026-08-02 08:40:19.714826+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'iOS'),
('bf6c6adb-3357-44dd-82fd-dc1ba8e9db2e', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '25.050 Coin (Android)', '750000', 't', '2026-08-02 08:40:17.375204+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'Android'),
('ed6b1015-ba58-4d62-93bf-219e8917bd3a', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '13.050 Coin (Android)', '400000', 't', '2026-08-02 08:40:16.86381+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'Android'),
('0e04af83-ddf0-4159-97fa-d46f6003a953', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '8.050 Coin (Android)', '300000', 't', '2026-08-02 08:40:16.567453+00', 'f', NULL, '0', 'https://assets.newgamingstore.com/1785831459858-531889420-PHOTO-2026-08-04-14-06-09-removebg-preview1.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'Android')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.membership_packages (2 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.membership_packages (id, name, price, period_label, benefits, is_popular, is_active, created_at, tenant_id) VALUES
('c0e962b3-438f-4ead-85b4-013401f89f14', 'Platinum', '300000', '/Tahun', '["Potongan Harga Rp 200 - Rp 1.000/produk", "Point Reward per Transaksi", "Prioritas Antrian Proses (Flash Process)", "Akses Grup WhatsApp Khusus Member", "Bebas Biaya Admin (Metode Saldo)", "Free Website Top Up Games"]', 't', 't', '2026-08-02 13:23:19.480636+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('745cb4a2-9037-4a7b-be8d-1637de9b700c', 'Platinum', '500000', '/Tahun', '["Potongan Harga Rp 200 - Rp 1.000/produk", "Point Reward per Transaksi", "Prioritas Antrian Proses (Flash Process)", "Akses Grup WhatsApp Khusus Member", "Bebas Biaya Admin (Metode Saldo)", "Free Website Top Up Games"]', 't', 't', '2026-08-02 13:23:19.480636+00', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.payment_channels (10 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.payment_channels (id, category, name, logo_url, account_number, account_name, is_active, created_at, qr_image_url, tenant_id) VALUES
('6ffacf1b-3278-4cfc-bd9a-5029bf56b3ab', 'Bank Transfer', 'OVO', 'https://assets.newgamingstore.com/1785630013435-695586733-ovo.webp', '89343434', 'PT OVO', 'f', '2026-08-02 00:20:20.178135+00', NULL, '9a145561-8663-4b49-9d02-9a97c93ca322'),
('70dad690-01bd-46b3-a80e-4ffc217ff578', 'E-Wallet', 'ShopeePay', 'https://assets.newgamingstore.com/1785629986625-365173900-shopeepay.webp', '2434343434', 'PT Admin', 'f', '2026-08-02 00:20:06.52272+00', NULL, '9a145561-8663-4b49-9d02-9a97c93ca322'),
('da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', 'QRIS', 'QRIS', 'https://assets.newgamingstore.com/1785678302656-552055253-qris-2.webp', '', '', 't', '2026-08-02 13:45:40.777362+00', 'https://assets.newgamingstore.com/1785678336655-37127872-PHOTO-2026-08-02-14-58-39.jpg', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('2027fece-7023-4454-b1f6-4897f18e50b5', 'E-Wallet', 'Saldo Akun (Wallet)', 'https://assets.newgamingstore.com/1785687878042-817520548-56b9a54f-b52d-4170-a448-67bc516e44ae-2.png', 'WALLET', 'Auto Deduct', 't', '2026-08-02 15:25:10.002818+00', '', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('a522962e-afc5-4e7c-9dbd-ff72f896ce8d', 'E-Wallet', 'Saldo Akun (Wallet)', 'https://assets.newgamingstore.com/1785687878042-817520548-56b9a54f-b52d-4170-a448-67bc516e44ae-2.png', 'WALLET', 'Auto Deduct', 'f', '2026-08-02 15:25:10.002818+00', '', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('56a29eda-ab98-4976-a78e-54ce2b17f8f8', 'Bank Transfer', 'BNI', 'https://assets.newgamingstore.com/1786371866616-952591050-2311.png', '2089605657', 'HEHEN', 't', '2026-08-10 14:25:16.707623+00', '', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('94f6490f-6b9f-47c0-8bd3-5e3baef4838c', 'Bank Transfer', 'BRI', 'https://assets.newgamingstore.com/1786372162339-189544337-2314.jpg', 'Transfer ke BNI 2089605657', 'HEHEN', 't', '2026-08-02 00:20:06.52272+00', '', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('3b1d9ac7-d6ad-4ab8-b1a0-c8db8a5e1177', 'Bank Transfer', 'BCA', 'https://assets.newgamingstore.com/1786372302468-926824699-2312.jpg', 'Transfer ke BNI 2089605657', 'HEHEN', 't', '2026-08-02 00:20:20.178135+00', '', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('f09763dc-a474-4fac-b87a-ca2af1c721fb', 'Bank Transfer', 'MANDIRI', 'https://assets.newgamingstore.com/1786372454564-220228930-2315.png', 'Transfer ke BNI 2089605657', 'HEHEN', 't', '2026-08-10 14:34:23.85025+00', '', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('aba89adc-2dcf-4928-920e-837cba415e85', 'QRIS', 'QRIS', 'https://assets.newgamingstore.com/1785678302656-552055253-qris-2.webp', '', 'STORE GAME', 't', '2026-08-02 13:45:40.777362+00', 'https://assets.newgamingstore.com/uploads/1ad725ba-b52b-4eaf-8839-bac2c6bf095c.png', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.orders (88 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.orders (id, tenant_id, game_id, product_id, customer_email, form_data, status, total_price, created_at, invoice_id, account_data, promo_code_id, wa_number, original_price, fee, discount_amount, payment_status, payment_channel_id, payment_proof_url) VALUES
('d958bbc1-41a1-4ab2-b9b2-deeb69032044', '9a145561-8663-4b49-9d02-9a97c93ca322', '9080ff51-f599-450f-9fde-ef81fa7dd557', 'da627e98-8c45-42ad-a3ea-e168dde0c2e7', '6282298196246', '{"User ID": "Iwhwiowh"}', 'Pending', '200000', '2026-08-03 13:16:04.954528+00', 'NGS260803518799', '{"User ID": "Iwhwiowh"}', NULL, '6282298196246', '200000', '0', '0', 'UNPAID', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', NULL),
('fa631406-da49-4e52-b773-8d8c3e35e8ed', '9a145561-8663-4b49-9d02-9a97c93ca322', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '2e645715-7d84-45e2-9eb0-d85e31d8c6cd', '628973434343', '{"User ID": "834344"}', 'Pending', '100000', '2026-08-03 14:17:26.650569+00', 'NGS260803813360', '{"User ID": "834344"}', NULL, '628973434343', '100000', '0', '0', 'UNPAID', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', NULL),
('6abdb197-edb6-4920-8665-e137341f8f9a', '9a145561-8663-4b49-9d02-9a97c93ca322', 'ae1cc343-aaa9-426a-87a4-3f42b7fdacd6', '313c99e6-01c2-41da-a01a-83f44e35bf1d', '6275454554', '{"Open ID": "32323"}', 'Pending', '100000', '2026-08-03 14:40:43.626265+00', 'NGS260803607858', '{"Open ID": "32323"}', NULL, '6275454554', '100000', '0', '0', 'UNPAID', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', NULL),
('7939e7ba-03f3-4452-952e-3d5f6a0c9016', '9a145561-8663-4b49-9d02-9a97c93ca322', '86098d19-4024-47c6-8bd9-b16780a3ea8e', '33c58bfd-ea4d-45dd-9020-52fd68e61fab', '62783434344', '{"User ID": "434344"}', 'Pending', '750000', '2026-08-03 14:50:13.921634+00', 'NGS260803726105', '{"User ID": "434344"}', NULL, '62783434344', '750000', '0', '0', 'UNPAID', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', NULL),
('0617b530-33a7-447b-89c7-940726dc941a', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '0e04af83-ddf0-4159-97fa-d46f6003a953', '6285173007569', '{"ID Pengguna": "ASEM-116-449-670"}', 'Pending', '300000', '2026-08-05 23:28:36.69731+00', 'NGS260805598995', '{"ID Pengguna": "ASEM-116-449-670"}', NULL, '6285173007569', '300000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('575bc375-416e-49bb-a827-12a2356bd2e2', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '55a0b858-e8d0-4373-93e7-f7f656057257', '6282298196246', '{"Username": "@tesdicoba"}', 'Pending', '200000', '2026-08-06 02:28:31.628014+00', 'NGS260806905473', '{"Username": "@tesdicoba"}', NULL, '6282298196246', '200000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('d122ae64-2e7f-4236-8de1-63ea7b4f8680', '9a145561-8663-4b49-9d02-9a97c93ca322', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', 'd6be7b45-ee86-4c72-81a1-3669573ac2df', 'lavien21@gmail.com', '{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}', 'Pending', '400000', '2026-08-05 02:06:31.231455+00', 'NGS260805174456', '{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}', NULL, '62893434343', '400000', '0', '0', 'PAID', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', 'https://assets.newgamingstore.com/1785895602634-748923506-f81bdfd3-c104-4739-b40d-ae665f64bd5c.jpeg'),
('35212c11-374a-4f3f-9ae3-ab750bfc8eb2', '9a145561-8663-4b49-9d02-9a97c93ca322', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', 'd6be7b45-ee86-4c72-81a1-3669573ac2df', '62893434443', '{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}', 'Success', '400000', '2026-08-05 02:35:56.460355+00', 'NGS260805279821', '{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}', NULL, '62893434443', '400000', '0', '0', 'PAID', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', 'https://assets.newgamingstore.com/1785897403151-450201622-smiling-malay-woman-using-smartphone-on-train-commute-photo.jpeg'),
('5f6e4da7-000a-4af3-982a-c8e4c1cb89c3', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a80754a9-31db-4095-9218-8b0a9feb1009', '94259e7b-d8e4-4cb9-ad5e-f778dbfe684f', '6285188354185', '{"UID": "3832563198081203267"}', 'Pending', '100000', '2026-08-06 12:04:55.561654+00', 'NGS260806804106', '{"UID": "3832563198081203267"}', NULL, '6285188354185', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786018007132-787147004-Screenshot_2026-08-06-19-06-32-55_78ed797590cf9a33dfc5e341b7a9537a.jpg'),
('73b06309-c91b-4610-88d6-cdeb2f1dbe7b', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'faf7b240-6b35-4e92-b974-60a69c4fdb1d', '082168559123', '{"ID Pengguna": "ASQL-487-658-247"}', 'Pending', '100000', '2026-08-06 14:06:58.245594+00', 'NGS260806610676', '{"ID Pengguna": "ASQL-487-658-247"}', NULL, '082168559123', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('4da13774-5480-4a06-8b78-65bb7d453015', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '57083f25-8e53-45c8-bce6-f9877ee04322', '0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3', '6285227467777', '{"Username": "Iqbalrizantha23"}', 'Pending', '100000', '2026-08-08 03:59:44.650999+00', 'NGS260808235775', '{"Username": "Iqbalrizantha23"}', NULL, '6285227467777', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('7469c2e1-c191-41be-9b53-c59a17e77d59', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'd77584f4-eed0-4135-a585-132b81b448da', '628139905775', '{"ID Pengguna": "nettryouell"}', 'Pending', '250000', '2026-08-06 15:28:09.753136+00', 'NGS260806830754', '{"ID Pengguna": "nettryouell"}', NULL, '628139905775', '250000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('f5eb88ed-8b03-4596-86e6-0c745d157dc7', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'faf7b240-6b35-4e92-b974-60a69c4fdb1d', '081210359523', '{"ID Pengguna": "ASAA-663-564-945"}', 'Pending', '100000', '2026-08-06 19:21:02.943033+00', 'NGS260806812340', '{"ID Pengguna": "ASAA-663-564-945"}', NULL, '081210359523', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('dc6539f2-72b4-4ee8-8def-d6d7295fdefb', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'faf7b240-6b35-4e92-b974-60a69c4fdb1d', '6282227662002', '{"ID Pengguna": "ASPZ-562-563-754"}', 'Pending', '100000', '2026-08-06 19:58:16.084627+00', 'NGS260806913182', '{"ID Pengguna": "ASPZ-562-563-754"}', NULL, '6282227662002', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786046526702-660042980-IMG-20260807-WA0001.jpg'),
('d4732b8a-3159-48e8-a975-13e240d90e46', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'ed6b1015-ba58-4d62-93bf-219e8917bd3a', '081267508702', '{"ID Pengguna": "ASNQ558551759"}', 'Pending', '400000', '2026-08-06 22:37:37.856999+00', 'NGS260806513825', '{"ID Pengguna": "ASNQ558551759"}', NULL, '081267508702', '400000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('d9dd74d2-7749-4de5-b94f-42a1ee5dbeb7', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '0e04af83-ddf0-4159-97fa-d46f6003a953', '081267508702', '{"ID Pengguna": "ASNQ558551759"}', 'Pending', '300000', '2026-08-06 22:39:27.034702+00', 'NGS260806334688', '{"ID Pengguna": "ASNQ558551759"}', NULL, '081267508702', '300000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786056138045-423167100-inbound1623523935004744709.jpg'),
('3936ebf6-1275-4fa3-958d-8ff4de345cb3', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '9da6a566-bc5c-4458-980c-644e646dbb26', '6289529375568', '{"ID Pengguna": "ASNM-420-169-551"}', 'Pending', '200000', '2026-08-07 07:48:08.226861+00', 'NGS260807549747', '{"ID Pengguna": "ASNM-420-169-551"}', NULL, '6289529375568', '200000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786089033774-164071400-1000038844.jpg'),
('31680e31-9761-4829-9a6c-69be8660d338', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a80754a9-31db-4095-9218-8b0a9feb1009', '94259e7b-d8e4-4cb9-ad5e-f778dbfe684f', '6285188354185', '{"UID": "3832563198081203267"}', 'Pending', '100000', '2026-08-07 09:31:17.342588+00', 'NGS260807101781', '{"UID": "3832563198081203267"}', NULL, '6285188354185', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('0ef037a6-739d-4444-890d-b4343eef147d', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'bc08e697-f3cd-4f18-9831-2d49f1946215', '+6283116128433', '{"ID Pengguna": "ASMG-999-132-259"}', 'Pending', '250000', '2026-08-07 09:41:30.911059+00', 'NGS260807783983', '{"ID Pengguna": "ASMG-999-132-259"}', NULL, '+6283116128433', '250000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('2c642874-9202-4398-8064-3b739e60c30d', '9a145561-8663-4b49-9d02-9a97c93ca322', 'a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', 'e5f9140e-d43e-49aa-9a22-a72997a304d1', '6289343433', '{"Riot ID": "8343433"}', 'Pending', '550000', '2026-08-07 15:36:31.387738+00', 'NGS260807574354', '{"Riot ID": "8343433"}', NULL, '6289343433', '550000', '0', '0', 'PAID', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', 'https://assets.newgamingstore.com/1786117371848-593669558-fc7a5db1-c61c-4f5f-8603-ee698b5c105d.png'),
('c6caae60-9d4d-4c9a-9c5d-8deca6307ec4', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '57083f25-8e53-45c8-bce6-f9877ee04322', '0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3', '085321626658', '{"Username": "Duta shampo lain"}', 'Pending', '100000', '2026-08-07 23:59:33.7259+00', 'NGS260807256022', '{"Username": "Duta shampo lain"}', NULL, '085321626658', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('dd797824-2d0a-4cc9-b064-1679ce03daf4', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '57083f25-8e53-45c8-bce6-f9877ee04322', '0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3', '085321626658', '{"Username": "Duta shampo lain"}', 'Pending', '100000', '2026-08-08 00:09:18.557315+00', 'NGS260808262496', '{"Username": "Duta shampo lain"}', NULL, '085321626658', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786147784332-525966297-15984.jpg'),
('912808cb-0489-4b2f-8c17-2d10fbaab378', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '0850cdad-09e2-4737-9f94-055dbf3ff231', '0895401107649', '{"Username": "Screeet9"}', 'Pending', '100000', '2026-08-08 00:22:26.27052+00', 'NGS260808300715', '{"Username": "Screeet9"}', NULL, '0895401107649', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786148805315-571427707-a4d5f9a6-9d16-4865-b838-3c61c9f90efe.jpeg'),
('4f853d34-283e-4974-9f3b-8b939b014dfb', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '57083f25-8e53-45c8-bce6-f9877ee04322', '0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3', '6285227467777', '{"Username": "Iqbalrizantha23"}', 'Pending', '100000', '2026-08-08 04:28:29.707133+00', 'NGS260808212721', '{"Username": "Iqbalrizantha23"}', NULL, '6285227467777', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('36bc8911-a472-4173-9c24-519f7bb853cd', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '7608bfa3-54c6-4fa5-897d-386135e57a72', '083135595148', '{"ID": "5295907539", "Username": "Ri''ot666"}', 'Pending', '100000', '2026-08-08 07:31:40.079844+00', 'NGS260808681794', '{"ID": "5295907539", "Username": "Ri''ot666"}', NULL, '083135595148', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786174423179-790973000-inbound485691646491246106.jpg'),
('0b5672a5-f866-4b58-9b5e-a8686d8b73a1', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '087777361495', '{"User ID": "1128041156", "Username": "꧁Wong•Pusat꧂ (ID)", "Masukkan Server": "13546"}', 'Pending', '100000', '2026-08-08 07:58:24.065958+00', 'NGS260808931322', '{"User ID": "1128041156", "Username": "꧁Wong•Pusat꧂ (ID)", "Masukkan Server": "13546"}', NULL, '087777361495', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('15ab192a-c7a6-439f-b493-4e1c3ae0caff', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '+6289510046849', '{"User ID": "1094577662", "Username": "weyywii. (ID)", "Masukkan Server": "13398"}', 'Pending', '100000', '2026-08-08 09:55:17.276555+00', 'NGS260808492284', '{"User ID": "1094577662", "Username": "weyywii. (ID)", "Masukkan Server": "13398"}', NULL, '+6289510046849', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('82cd4384-d58c-45f0-8238-1450ef123d13', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '0e04af83-ddf0-4159-97fa-d46f6003a953', '6281334444338', '{"ID Pengguna": "ASAA-717-231-282"}', 'Pending', '300000', '2026-08-08 10:25:46.694369+00', 'NGS260808631441', '{"ID Pengguna": "ASAA-717-231-282"}', NULL, '6281334444338', '300000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786185496827-571502916-449681.jpg'),
('73c7453e-c545-4457-8b36-8fe09d4c2a7c', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '9da6a566-bc5c-4458-980c-644e646dbb26', '081231917383', '{"ID Pengguna": "ASLW-943-617-091"}', 'Pending', '200000', '2026-08-08 11:14:18.514012+00', 'NGS260808646002', '{"ID Pengguna": "ASLW-943-617-091"}', NULL, '081231917383', '200000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786187747671-498679587-1000263505.jpg'),
('f2772173-e5fb-4fea-be0d-010176c233ba', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '0850cdad-09e2-4737-9f94-055dbf3ff231', '081266991055', '{"Username": "Razaq272"}', 'Pending', '100000', '2026-08-08 12:10:44.708261+00', 'NGS260808688537', '{"Username": "Razaq272"}', NULL, '081266991055', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786191115216-966099540-1000563033.jpg'),
('f9e4a807-5821-4ae9-8221-31edac773646', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '089670086136', '{"User ID": "547259384", "Username": "pemilik+kembali. (PH)", "Masukkan Server": "3468"}', 'Pending', '100000', '2026-08-08 15:13:47.818216+00', 'NGS260808332183', '{"User ID": "547259384", "Username": "pemilik+kembali. (PH)", "Masukkan Server": "3468"}', NULL, '089670086136', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('2b6ffb0c-2441-454c-bc5a-e3f0106b2e24', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'bf6c6adb-3357-44dd-82fd-dc1ba8e9db2e', '628996296856', '{"ID Pengguna": "ASAA-555-141-444"}', 'Pending', '750000', '2026-08-08 15:48:49.761279+00', 'NGS260808236353', '{"ID Pengguna": "ASAA-555-141-444"}', NULL, '628996296856', '750000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786204305315-174422576-15309.jpg'),
('4b202cb9-c037-49b9-a93b-6b8260e189d9', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a16753e-d851-4faf-954d-9b8a4077867d', '6285645778835', '{"User ID": "983841486", "Username": "Hansenn. (ID)", "Masukkan Server": "12931"}', 'Pending', '200000', '2026-08-08 18:08:22.338879+00', 'NGS260808435823', '{"User ID": "983841486", "Username": "Hansenn. (ID)", "Masukkan Server": "12931"}', NULL, '6285645778835', '200000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786212688464-198333394-inbound5476907962954808102.jpg'),
('d352344a-5ec5-4506-88c0-e12373a498ab', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '68e8fa9c-e240-43d7-bbca-c4c66a4a4d9f', '081383599120', '{"User ID": "1609080551", "Username": "Ahhhhh (ID)", "Masukkan Server": "16764"}', 'Pending', '300000', '2026-08-08 18:23:50.238646+00', 'NGS260808373067', '{"User ID": "1609080551", "Username": "Ahhhhh (ID)", "Masukkan Server": "16764"}', NULL, '081383599120', '300000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786213599014-537759436-inbound682015795094129834.jpg'),
('c82333d1-fa1c-4bfe-a262-018fdb666e21', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '081365183583', '{"User ID": "164722780", "Username": "ダーリン (ID)", "Masukkan Server": "2826"}', 'Pending', '100000', '2026-08-08 18:53:34.179846+00', 'NGS260808552928', '{"User ID": "164722780", "Username": "ダーリン (ID)", "Masukkan Server": "2826"}', NULL, '081365183583', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786215293952-735247404-Screenshot_20260809_015356_SamsungBrowser.jpg'),
('7af96833-b1a9-4ed5-ab6c-95b7365a0c60', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '081365183583', '{"User ID": "164722780", "Username": "ダーリン (ID)", "Masukkan Server": "2826"}', 'Pending', '100000', '2026-08-08 18:55:23.584441+00', 'NGS260808102688', '{"User ID": "164722780", "Username": "ダーリン (ID)", "Masukkan Server": "2826"}', NULL, '081365183583', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786215333459-926125186-Transaksi_BCAmobile-20260809-015428.jpg'),
('7b4b5f13-87aa-45e0-8ce2-d8215c6377bc', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'faf7b240-6b35-4e92-b974-60a69c4fdb1d', '6282277295626', '{"ID Pengguna": "ASER-422-350-951"}', 'Pending', '100000', '2026-08-09 04:24:42.230991+00', 'NGS260809557133', '{"ID Pengguna": "ASER-422-350-951"}', NULL, '6282277295626', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786249592030-20270831-25210.jpg'),
('9cbbdf68-9ec3-492c-bae6-ef8ef129269b', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6283180001454', '{"User ID": "1167606198", "Username": "4+U. (ID)", "Masukkan Server": "13733"}', 'Pending', '100000', '2026-08-09 04:48:29.49969+00', 'NGS260809792947', '{"User ID": "1167606198", "Username": "4+U. (ID)", "Masukkan Server": "13733"}', NULL, '6283180001454', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786251306963-65088347-inbound9092958960975045560.jpg'),
('6fa4b3be-8ddd-4006-907a-3462e8a76187', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '081347946994', '{"User ID": "462316045", "Username": "INDUNG+SHUTDOWN+NPE (ID)", "Masukkan Server": "2369"}', 'Pending', '100000', '2026-08-09 06:01:47.070535+00', 'NGS260809800407', '{"User ID": "462316045", "Username": "INDUNG+SHUTDOWN+NPE (ID)", "Masukkan Server": "2369"}', NULL, '081347946994', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786255486108-932872696-inbound5113998880917528925.jpg'),
('2ebfa2c1-824c-4e79-92fd-c52957a830b4', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '57083f25-8e53-45c8-bce6-f9877ee04322', '36171d64-caa9-4719-9cc0-86ea40e1dfb2', '085685662336', '{"Username": "bukan manusia biasa"}', 'Pending', '1000000', '2026-08-09 06:36:02.909345+00', 'NGS260809714364', '{"Username": "bukan manusia biasa"}', NULL, '085685662336', '1000000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('78e51307-8569-4c38-a029-39280421b1e6', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '082180387723', '{"User ID": "1327858778", "Username": "PremanLATEGAME (ID)", "Masukkan Server": "15479"}', 'Pending', '100000', '2026-08-09 07:23:01.831926+00', 'NGS260809875965', '{"User ID": "1327858778", "Username": "PremanLATEGAME (ID)", "Masukkan Server": "15479"}', NULL, '082180387723', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('4509ca07-f7f3-42fe-a467-abd639bef5d0', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '0850cdad-09e2-4737-9f94-055dbf3ff231', '083147337283', '{"Username": "ironmen010205"}', 'Pending', '100000', '2026-08-09 07:25:09.890314+00', 'NGS260809138018', '{"Username": "ironmen010205"}', NULL, '083147337283', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786260421434-728965525-inbound7464967421033052488.jpg'),
('c6b697e9-72b2-44e8-afb7-b841ef8f3c9c', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '68e8fa9c-e240-43d7-bbca-c4c66a4a4d9f', '6281376821520', '{"User ID": "1741137838", "Username": "One+Call+Away. (ID)", "Masukkan Server": "18407"}', 'Pending', '300000', '2026-08-09 07:31:17.753975+00', 'NGS260809617906', '{"User ID": "1741137838", "Username": "One+Call+Away. (ID)", "Masukkan Server": "18407"}', NULL, '6281376821520', '300000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786260752093-648801265-IMG_0387.png'),
('6a76cd9c-a367-48f3-aa94-04a2a53210d6', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '087784489878', '{"User ID": "1611823465", "Username": "Vyxx_ (ID)", "Masukkan Server": "16793"}', 'Pending', '100000', '2026-08-09 08:17:26.324695+00', 'NGS260809546320', '{"User ID": "1611823465", "Username": "Vyxx_ (ID)", "Masukkan Server": "16793"}', NULL, '087784489878', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786263586575-966763743-inbound3739055039828470853.jpg'),
('09c16556-9ce6-45ca-b8cc-068255671277', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6281234296443', '{"User ID": "688278516", "Username": "#@Oblivion_Slayer99+ (ID)", "Masukkan Server": "8733"}', 'Pending', '100000', '2026-08-09 08:20:47.473125+00', 'NGS260809394984', '{"User ID": "688278516", "Username": "#@Oblivion_Slayer99+ (ID)", "Masukkan Server": "8733"}', NULL, '6281234296443', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('e0d25d5d-d825-418a-8f22-da8e8518fa4b', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a16753e-d851-4faf-954d-9b8a4077867d', '6285183062272', '{"User ID": "1565182218", "Username": "Y+A+N+Z+R+O♤ (ID)", "Masukkan Server": "16564"}', 'Pending', '200000', '2026-08-09 08:22:07.375432+00', 'NGS260809151098', '{"User ID": "1565182218", "Username": "Y+A+N+Z+R+O♤ (ID)", "Masukkan Server": "16564"}', NULL, '6285183062272', '200000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786263922743-212938407-inbound2996905842810737633.png'),
('c19efe53-c2f8-4afc-85c0-91d72c0514ad', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6281289384331', '{"User ID": "67965525", "Username": "PapiNya+Keyraa (ID)", "Masukkan Server": "2119"}', 'Pending', '100000', '2026-08-09 09:05:13.997233+00', 'NGS260809113798', '{"User ID": "67965525", "Username": "PapiNya+Keyraa (ID)", "Masukkan Server": "2119"}', NULL, '6281289384331', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('b67b52d0-dbeb-412d-a06f-54aef2a61b31', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6282286439073', '{"User ID": "448461216", "Username": "納特|The+Emperor. (ID)", "Masukkan Server": "2309"}', 'Pending', '100000', '2026-08-09 09:09:56.039788+00', 'NGS260809593111', '{"User ID": "448461216", "Username": "納特|The+Emperor. (ID)", "Masukkan Server": "2309"}', NULL, '6282286439073', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786266754759-565603039-Screenshot_2026-08-09-16-12-21-22_25224148702d48aef118cfcab279573b.jpg'),
('e4a29aa1-fb27-46dc-8074-c43c55ff67c3', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6285223351296', '{"User ID": "226281469", "Username": "Super+Frince (ID)", "Masukkan Server": "9178"}', 'Pending', '100000', '2026-08-09 09:22:30.874548+00', 'NGS260809700906', '{"User ID": "226281469", "Username": "Super+Frince (ID)", "Masukkan Server": "9178"}', NULL, '6285223351296', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786267416696-117854736-inbound5860333654899357755.jpg'),
('4f69e7db-12c7-441e-a155-77e0a7d623ee', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '55a0b858-e8d0-4373-93e7-f7f656057257', '628132254231', '{"Username": "@tes"}', 'Pending', '200000', '2026-08-09 10:10:27.039783+00', 'NGS260809814872', '{"Username": "@tes"}', NULL, '628132254231', '200000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786270246903-765200216-inbound2791493235313916774.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO public.orders (id, tenant_id, game_id, product_id, customer_email, form_data, status, total_price, created_at, invoice_id, account_data, promo_code_id, wa_number, original_price, fee, discount_amount, payment_status, payment_channel_id, payment_proof_url) VALUES
('c717e5c0-8c9e-436e-9808-8369e56eac1b', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '082272237669', '{"User ID": "1547782399", "Masukkan Server": "(11808)"}', 'Pending', '100000', '2026-08-09 11:39:51.823704+00', 'NGS260809877651', '{"User ID": "1547782399", "Masukkan Server": "(11808)"}', NULL, '082272237669', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786275798920-186037258-inbound2029547189051233885.jpg'),
('3e4abdab-a21c-4276-b3fa-6d3bd5b7aeb8', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'da353d89-8fca-4375-94c5-0b92bf6acadd', '081227498335', '{"ID Pengguna": "ASAA-868-026-858"}', 'Pending', '1000000', '2026-08-09 11:48:52.128959+00', 'NGS260809623192', '{"ID Pengguna": "ASAA-868-026-858"}', NULL, '081227498335', '1000000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('47becc90-e54c-4ad3-9641-d87b603bc858', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'da353d89-8fca-4375-94c5-0b92bf6acadd', '081227498335', '{"ID Pengguna": "ASAA-868-026-858"}', 'Pending', '1000000', '2026-08-09 11:52:04.302085+00', 'NGS260809310255', '{"ID Pengguna": "ASAA-868-026-858"}', NULL, '081227498335', '1000000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('dd5c4acf-dc18-4850-8ed9-3c8c68865e8a', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '0850cdad-09e2-4737-9f94-055dbf3ff231', '085176978802', '{"Username": "jolmncox"}', 'Pending', '100000', '2026-08-09 12:43:56.21949+00', 'NGS260809503677', '{"Username": "jolmncox"}', NULL, '085176978802', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('ac66d13f-48f0-415e-aa22-32db3383aa52', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'da353d89-8fca-4375-94c5-0b92bf6acadd', '081227498335', '{"ID Pengguna": "ASAA-868-026-858"}', 'Pending', '1000000', '2026-08-09 13:20:33.752429+00', 'NGS260809462704', '{"ID Pengguna": "ASAA-868-026-858"}', NULL, '081227498335', '1000000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('668cbdda-1e5c-494e-b998-8c636fb9841d', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '0850cdad-09e2-4737-9f94-055dbf3ff231', '6282189849655', '{"Username": "yura7813"}', 'Pending', '100000', '2026-08-09 13:26:06.615265+00', 'NGS260809612601', '{"Username": "yura7813"}', NULL, '6282189849655', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786282194610-806829021-inbound3900958841761102976.png'),
('82b31fee-c377-4069-a3a6-e61aaaf8c20f', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '57083f25-8e53-45c8-bce6-f9877ee04322', '0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3', '082173498245', '{"Username": "mr_robot30"}', 'Pending', '100000', '2026-08-09 14:47:49.75778+00', 'NGS260809145722', '{"Username": "mr_robot30"}', NULL, '082173498245', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786286928387-393165630-inbound2652506385039803073.jpg'),
('62bb2845-8d1a-43b5-a913-e95563b96f9e', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '087791721900', '{"User ID": "2198456143", "Username": "C+I+L+A (ID)", "Masukkan Server": "12797"}', 'Pending', '100000', '2026-08-10 03:18:53.240964+00', 'NGS260810906820', '{"User ID": "2198456143", "Username": "C+I+L+A (ID)", "Masukkan Server": "12797"}', NULL, '087791721900', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786332079544-813507461-IMG_0945.png'),
('9e8defe2-a5b3-473f-b4a7-36507fd57208', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '0850cdad-09e2-4737-9f94-055dbf3ff231', '628989400799', '{"Username": "Galaxyplaysyt423"}', 'Pending', '100000', '2026-08-10 09:09:24.441676+00', 'NGS260810549666', '{"Username": "Galaxyplaysyt423"}', NULL, '628989400799', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('c0931f68-00ee-4eb4-a3d4-5d2df109db9c', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '0850cdad-09e2-4737-9f94-055dbf3ff231', '628989400799', '{"Username": "Galaxyplaysyt423"}', 'Pending', '100000', '2026-08-10 09:13:18.143119+00', 'NGS260810284034', '{"Username": "Galaxyplaysyt423"}', NULL, '628989400799', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786353249414-116920547-inbound1163341305967695188.jpg'),
('24df0351-7718-4025-b9f8-0f294807f352', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '0850cdad-09e2-4737-9f94-055dbf3ff231', '081973164183', '{"Username": "Ajiiidorr"}', 'Pending', '100000', '2026-08-10 11:09:49.962078+00', 'NGS260810563571', '{"Username": "Ajiiidorr"}', NULL, '081973164183', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/1786360246291-257366063-Transaksi_BCAmobile-20260810-180142.jpg'),
('827534c8-ace1-4861-b352-72630bae0d58', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '7608bfa3-54c6-4fa5-897d-386135e57a72', '087769341972', '{"ID": "52447564006", "Username": "Kynaraaaゞ"}', 'Pending', '100000', '2026-08-10 12:06:11.907762+00', 'NGS260810144127', '{"ID": "52447564006", "Username": "Kynaraaaゞ"}', NULL, '087769341972', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('0ffc3cdc-c3ab-4269-9f88-633a1ae641fe', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '7608bfa3-54c6-4fa5-897d-386135e57a72', '087769341972', '{"ID": "52447564006", "Username": "Kynaraaaゞ"}', 'Pending', '100000', '2026-08-10 12:12:35.773901+00', 'NGS260810695947', '{"ID": "52447564006", "Username": "Kynaraaaゞ"}', NULL, '087769341972', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('84eb67f4-a462-4dae-a59b-932b3b340c92', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '57083f25-8e53-45c8-bce6-f9877ee04322', 'eea48ac4-eeef-40be-8759-1408c71e3b6d', '6285223322124', '{"Username": "@ishwiwus"}', 'Pending', '200000', '2026-08-10 14:26:34.146534+00', 'NGS260810674262', '{"Username": "@ishwiwus"}', NULL, '6285223322124', '200000', '0', '0', 'UNPAID', '56a29eda-ab98-4976-a78e-54ce2b17f8f8', NULL),
('0bea7d79-872b-41e4-b660-ab9c11dbd385', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '57083f25-8e53-45c8-bce6-f9877ee04322', '0d8a18c6-2d1f-4b5c-97c5-6ca53bc48ea3', '6285524552321', '{"Username": "@hshwhw"}', 'Pending', '100000', '2026-08-10 14:36:22.939693+00', 'NGS260810137726', '{"Username": "@hshwhw"}', NULL, '6285524552321', '100000', '0', '0', 'UNPAID', '94f6490f-6b9f-47c0-8bd3-5e3baef4838c', NULL),
('09d3710f-d80c-44f2-8826-41be917f3366', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6285188354185', '{"User ID": "236438993", "Username": "Iori.++Kitaharaメ (ID)", "Masukkan Server": "9251"}', 'Pending', '100000', '2026-08-11 14:17:36.989409+00', 'NGS260811743478', '{"User ID": "236438993", "Username": "Iori.++Kitaharaメ (ID)", "Masukkan Server": "9251"}', NULL, '6285188354185', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('eb90084b-ae39-45af-98fc-1ffdd7a3a53c', '9a145561-8663-4b49-9d02-9a97c93ca322', 'a5eb7ecb-3307-4692-a7f2-8fbe7908c38f', '74a1cd50-c77b-4cb4-9422-17ea06643eaa', '628934343444', '{"Riot ID": "riotxx1"}', 'Pending', '100000', '2026-08-11 14:24:57.476608+00', 'NGS260811737220', '{"Riot ID": "riotxx1"}', NULL, '628934343444', '100000', '0', '0', 'PAID', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', 'https://assets.newgamingstore.com/uploads/9fdc0f76-db39-4df5-b623-c8766a7608c4.png'),
('5bb11e64-0404-4470-a50d-135788bbf146', '9a145561-8663-4b49-9d02-9a97c93ca322', '7110c289-7bbf-44f3-8d99-c5cd0a547e4d', '93bfe81b-688c-4621-9190-abbd925b971f', '6289343434434', '{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}', 'Pending', '100000', '2026-08-11 14:39:35.496308+00', 'NGS260811328056', '{"Server": "os_asia", "User ID": "854016571", "Username": "L*****n"}', NULL, '6289343434434', '100000', '0', '0', 'UNPAID', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', NULL),
('130f04b8-b215-486a-94e3-42f033f4463e', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '0850cdad-09e2-4737-9f94-055dbf3ff231', '6287813715532', '{"Username": "bhumi_2025"}', 'Pending', '100000', '2026-08-14 11:48:47.421265+00', 'NGS260814796294', '{"Username": "bhumi_2025"}', NULL, '6287813715532', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('0762cf0a-2619-4afd-a5de-2c82749b8614', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '85d1a827-01d5-4348-9235-7404aac6c295', '6289343434', '{"Username": "wdawdawd"}', 'Pending', '400000', '2026-08-11 15:13:46.222933+00', 'NGS260811601005', '{"Username": "wdawdawd"}', NULL, '6289343434', '400000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('9816985f-e4db-4c54-bd00-3792833cc311', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '085126512875', '{"User ID": "45536295", "Username": "Y+A+F+A+N+D+A (ID)", "Masukkan Server": "2211"}', 'Pending', '100000', '2026-08-11 23:33:26.359539+00', 'NGS260811928251', '{"User ID": "45536295", "Username": "Y+A+F+A+N+D+A (ID)", "Masukkan Server": "2211"}', NULL, '085126512875', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('29bcdb8f-e7f7-437d-8171-ff6655f2bf23', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '085126512875', '{"User ID": "45536295", "Username": "Y+A+F+A+N+D+A (ID)", "Masukkan Server": "2211"}', 'Pending', '100000', '2026-08-11 23:37:13.153591+00', 'NGS260811349714', '{"User ID": "45536295", "Username": "Y+A+F+A+N+D+A (ID)", "Masukkan Server": "2211"}', NULL, '085126512875', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/uploads/a5507403-38d9-480c-be73-73ab10849d22.jpg'),
('0e058832-c804-42a0-ab87-e42532f15810', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'a8e80afd-9b72-4088-b49d-52de3687d936', '55a0b858-e8d0-4373-93e7-f7f656057257', '62852362626', '{"Username": "Hrhrhrhrjrj"}', 'Pending', '200000', '2026-08-12 09:13:36.222165+00', 'NGS260812438293', '{"Username": "Hrhrhrhrjrj"}', NULL, '62852362626', '200000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('01c1d9bf-4f1c-455e-93f7-d4b958025fef', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '31fcb04b-fbf1-46d1-93fe-81916aaba694', '62854545444', '{"User ID": "101106838", "Username": "POK+AMI+AMI (ID)", "Masukkan Server": "2518"}', 'Pending', '1500000', '2026-08-12 11:14:16.977425+00', 'NGS260812944658', '{"User ID": "101106838", "Username": "POK+AMI+AMI (ID)", "Masukkan Server": "2518"}', NULL, '62854545444', '1500000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('6a5faf62-e6e5-48a3-8a44-26ccdd2aabf0', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '085161632125', '{"User ID": "1147781104", "Username": "(FIT) (ID)", "Masukkan Server": "13654"}', 'Pending', '100000', '2026-08-12 12:52:16.982789+00', 'NGS260812454499', '{"User ID": "1147781104", "Username": "(FIT) (ID)", "Masukkan Server": "13654"}', NULL, '085161632125', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('0b112eb6-8a3d-4bc0-a562-3ab20b79d6bb', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '085161632125', '{"User ID": "1147781104", "Username": "(FIT) (ID)", "Masukkan Server": "13654"}', 'Pending', '100000', '2026-08-12 13:05:32.12541+00', 'NGS260812595704', '{"User ID": "1147781104", "Username": "(FIT) (ID)", "Masukkan Server": "13654"}', NULL, '085161632125', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('aa2546b1-0b21-4f7c-90c7-366ffa3b4218', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6285188354185', '{"User ID": "236438993", "Username": "Iori.++Kitaharaメ (ID)", "Masukkan Server": "9251"}', 'Pending', '100000', '2026-08-13 13:03:02.428513+00', 'NGS260813352508', '{"User ID": "236438993", "Username": "Iori.++Kitaharaメ (ID)", "Masukkan Server": "9251"}', NULL, '6285188354185', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('1dc7d209-d545-4d28-82b1-142fd3aafb42', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', '2d42e7bf-496b-4aef-80d2-b477f3d92105', '082237812173', '{"ID Pengguna": "ASLR-660-701–098"}', 'Pending', '100000', '2026-08-13 14:29:51.83624+00', 'NGS260813374795', '{"ID Pengguna": "ASLR-660-701–098"}', NULL, '082237812173', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('97cd9741-2212-4776-af89-588d41b348b7', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'faf7b240-6b35-4e92-b974-60a69c4fdb1d', '6282363631018', '{"ID Pengguna": "ASDG-214-849-411"}', 'Pending', '100000', '2026-08-13 14:47:45.54195+00', 'NGS260813342299', '{"ID Pengguna": "ASDG-214-849-411"}', NULL, '6282363631018', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('c0fc2a03-3a1e-46b4-b980-f08b26ccbe8b', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'faf7b240-6b35-4e92-b974-60a69c4fdb1d', '6282262724323', '{"ID Pengguna": "ASHS-717-025-830"}', 'Pending', '100000', '2026-08-13 14:50:40.498774+00', 'NGS260813253749', '{"ID Pengguna": "ASHS-717-025-830"}', NULL, '6282262724323', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/uploads/ee88ff43-ccd1-4ef5-b852-cf22a39f719e.jpg'),
('b66e2c3e-b7b7-4045-baa4-d85084b470e7', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '512c6156-fe45-4cd6-a472-6adaf7b92b77', 'faf7b240-6b35-4e92-b974-60a69c4fdb1d', '628211244322', '{"ID Pengguna": "Jabahajaja"}', 'Pending', '100000', '2026-08-13 15:51:14.098482+00', 'NGS260813264043', '{"ID Pengguna": "Jabahajaja"}', NULL, '628211244322', '100000', '0', '0', 'UNPAID', 'aba89adc-2dcf-4928-920e-837cba415e85', NULL),
('3b2e139c-bb61-488c-91ee-1f19484adf75', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', '10c1b9d4-7197-4464-bf9f-ee710c1f0180', '7608bfa3-54c6-4fa5-897d-386135e57a72', '628155176558', '{"ID": "5123803649", "Username": "ムソイ・Devlin"}', 'Pending', '100000', '2026-08-14 06:14:44.816763+00', 'NGS260814693396', '{"ID": "5123803649", "Username": "ムソイ・Devlin"}', NULL, '628155176558', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/uploads/af347d6a-0f99-4385-b459-71e92c53e5f4.jpg'),
('37f0ff29-8e4c-4249-b011-c612cf24378e', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6289687005660', '{"User ID": "904979700", "Username": "Max+Verstappen (ID)", "Masukkan Server": "12589"}', 'Pending', '100000', '2026-08-14 12:20:35.515676+00', 'NGS260814760850', '{"User ID": "904979700", "Username": "Max+Verstappen (ID)", "Masukkan Server": "12589"}', NULL, '6289687005660', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/uploads/8c661f3e-0172-47bd-b69f-73b51b409cd6.png'),
('b16374dd-9e6c-489c-9d88-e38cee3e96cd', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6287841240553', '{"User ID": "135285403", "Username": "Mr.+Veēy (ID)", "Masukkan Server": "2688"}', 'Pending', '100000', '2026-08-14 14:29:30.545823+00', 'NGS260814158315', '{"User ID": "135285403", "Username": "Mr.+Veēy (ID)", "Masukkan Server": "2688"}', NULL, '6287841240553', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/uploads/5bda6cde-73c2-4acf-a507-f63daac99b8e.jpg'),
('7e53a4e8-1a67-4d64-967b-d3c00b3104f9', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6285766792292', '{"User ID": "598447497", "Username": "MR.poseidon", "Masukkan Server": "8397"}', 'Pending', '100000', '2026-08-14 14:43:03.960689+00', 'NGS260814843994', '{"User ID": "598447497", "Username": "MR.poseidon", "Masukkan Server": "8397"}', NULL, '6285766792292', '100000', '0', '0', 'PAID', '56a29eda-ab98-4976-a78e-54ce2b17f8f8', 'https://assets.newgamingstore.com/uploads/0e303f73-ac71-4af8-857c-c4fad66f2503.jpg'),
('15868951-3bfe-4458-8af6-3d143b8e0200', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6285262402003', '{"User ID": "2044749881", "Username": "Triton (ID)", "Masukkan Server": "19575"}', 'Pending', '100000', '2026-08-14 15:04:59.799462+00', 'NGS260814811244', '{"User ID": "2044749881", "Username": "Triton (ID)", "Masukkan Server": "19575"}', NULL, '6285262402003', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/uploads/7986f10f-fc50-444e-957b-610e4048dda5.jpg'),
('838b7de9-3264-4a55-99bd-e8f09061386f', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '082135522539', '{"User ID": "47148012", "Username": "SeanZ. (ID)", "Masukkan Server": "2078"}', 'Pending', '100000', '2026-08-14 15:04:32.934163+00', 'NGS260814539422', '{"User ID": "47148012", "Username": "SeanZ. (ID)", "Masukkan Server": "2078"}', NULL, '082135522539', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/uploads/6f3cb651-f590-4ae6-ab1c-447f204c8fe0.jpg'),
('658f789e-f1c5-4042-ba72-6506706c7fff', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'f6d2c442-d7c7-4315-b86c-0f0bff635377', '7a74e715-f19c-454f-9f73-ced40248ba63', '6283874692104', '{"User ID": "1448204652", "Username": "유야산NPL (ID)", "Masukkan Server": "16015"}', 'Pending', '100000', '2026-08-14 15:12:08.374083+00', 'NGS260814623474', '{"User ID": "1448204652", "Username": "유야산NPL (ID)", "Masukkan Server": "16015"}', NULL, '6283874692104', '100000', '0', '0', 'PAID', 'aba89adc-2dcf-4928-920e-837cba415e85', 'https://assets.newgamingstore.com/uploads/9684454c-24ab-4396-8bb2-768a33c3033a.jpg')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.deposits (9 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.deposits (id, invoice_id, customer_email, wa_number, amount, payment_channel_id, status, payment_proof_url, created_at, metadata, tenant_id) VALUES
('b7f0a48d-c73c-4348-9519-570ee96af5f1', 'DEP260802126035', 'testing21@gmail.com', '', '50000', NULL, 'Success', 'https://assets.newgamingstore.com/1785674334776-712136682-Galaxy-S25-Ultra-Audio-Eraser-Galaxy-AI-1200x674.jpg', '2026-08-02 12:38:37.25078+00', '{}', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('77f4fb5a-6377-4bef-a685-01e66ed528b9', 'DEP260802432988', 'testing21@gmail.com', '', '100000', NULL, 'Success', 'https://assets.newgamingstore.com/1785675201108-150470093-935-BCW5_2_1.jpg', '2026-08-02 12:53:04.651692+00', '{}', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('bb6669ed-06e1-42c4-8f1e-3312969143e0', 'DEP260802398261', 'testing21@gmail.com', '', '1000000', NULL, 'Success', 'https://assets.newgamingstore.com/1785681137914-127318469-MSIM4312-2.jpg', '2026-08-02 14:31:59.07115+00', '{}', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('1bb4af14-6835-466c-84b7-687c4ac8b7ad', 'UPG-MSBX0VXHAUVGS', 'testing21@gmail.com', NULL, '300000', NULL, 'Success', 'https://assets.newgamingstore.com/1785682137960-931785019-ryan.jpg', '2026-08-02 14:48:32.276312+00', '{}', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('ac854b4c-b813-4fe3-8cb7-471cca0c0828', 'UPG-MSBXKWB4P9I5R', 'testing21@gmail.com', NULL, '300000', NULL, 'Success', 'https://assets.newgamingstore.com/1785683056358-4203234-FIFAMobile_Helper-6b86-original.jpeg', '2026-08-02 15:04:05.977175+00', '{"type": "UPGRADE", "package_name": "Platinum"}', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('785288a5-a2a5-4c35-a830-fad463244cf5', 'DEP260805955359', '0812232323', '0812232323', '50000', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', 'Pending', NULL, '2026-08-05 02:03:11.973278+00', '{}', NULL),
('42b7ca87-489b-492f-a3b4-bf69cb1f16f2', 'DEP260805143004', 'lavien21@gmail.com', '0812232333', '50000', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', 'Pending', NULL, '2026-08-05 02:04:52.194852+00', '{}', NULL),
('c15c9060-252a-4106-a617-a46c302a347c', 'DEP260805219952', '0812232323', '0812232323', '500000', 'da8d1978-d2ec-4bc4-9ce4-ac2d9a422dc5', 'Pending', NULL, '2026-08-05 02:21:00.816263+00', '{}', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('6194ece8-f52b-461f-9af0-f34d1d1eb4cf', 'UPG-MSFGTBT0YYGPU', 'lavien21@a4604e46-0d88-4a16-8e4a-ce6588bf8523.member', '0812323233', '300000', 'aba89adc-2dcf-4928-920e-837cba415e85', 'Pending', NULL, '2026-08-05 02:25:50.392313+00', '{"type": "UPGRADE", "package_name": "Platinum"}', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.wallets (1 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.wallets (email, balance, updated_at, tenant_id) VALUES
('testing21@gmail.com', '500000', '2026-08-02 16:38:47.667987+00', '9a145561-8663-4b49-9d02-9a97c93ca322')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.members (2 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.members (id, tenant_id, username, phone, password_hash, created_at) VALUES
('e769d444-95fe-4c26-ba5c-01e969ca09fb', '9a145561-8663-4b49-9d02-9a97c93ca322', 'lavien21', '0812232323', '$2b$10$gjr/qZ/smuRZykOAQCXN4u.KyzRlXJQ/OxDSyEWIA8xyJYdcTA9zq', '2026-08-04 13:58:24.197188+00'),
('0ad46f1c-0f0f-4288-be61-23f466c5f77a', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523', 'lavien21', '0812323233', '$2b$10$BSChi47GVNO.bmn5z7Xc5.6mVL4h7ek9eRcIPTo3PS2IFQfGGl3TW', '2026-08-05 02:00:51.975205+00')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.articles (1 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.articles (id, title, slug, content, image_url, author, is_published, created_at, tenant_id) VALUES
('e75ee5cb-2ece-4d93-a6d5-c850a156ae4f', 'Cara Daftar dan Aktivasi Akun di Website Yowana Store dengan Mudah', 'cara-daftar-dan-aktivasi-akun-di-website-yowana-store-dengan-mudah-9a145', '<h1><b style=""><font color="#ffffff">Cara Daftar dan Aktivasi Akun di Website Yowana Store dengan Mudah</font></b></h1>\r\n\r\n<p><font color="#ffffff">\r\nBagi kamu yang baru pertama kali menggunakan Yowana Store, membuat akun merupakan langkah awal untuk menikmati berbagai fitur yang tersedia. Dengan memiliki akun, kamu dapat melakukan transaksi top up game dengan lebih praktis, melihat riwayat pembelian, mengikuti event bulanan, serta mendapatkan berbagai promo eksklusif.\r\n</font></p>', 'https://assets.newgamingstore.com/1785602684871-180704527-CARADAFTARDANAKTIVASIAKUNDIYOWANASTORE.webp', 'Admin', 't', '2026-08-01 16:44:45.921615+00', '9a145561-8663-4b49-9d02-9a97c93ca322')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.faqs (24 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.faqs (id, question, answer, sort_order, is_active, created_at, tenant_id) VALUES
('e1416bfc-86eb-41d4-b721-d84517e16d9c', 'Game apa saja yang bisa di top up?', 'Kami menyediakan hampir semua game populer seperti Mobile Legends, Free Fire, PUBG Mobile, Valorant, Genshin Impact, Honor of Kings, Point Blank, dan juga voucher digital lainnya.', '3', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('99f4dfd0-27c7-4aa2-880a-5a14e63584b8', 'Bagaimana jika top up saya belum masuk?', 'Jangan panik. Pertama, cek status transaksi di menu "Cek Pesanan". Jika status "Sukses" tapi belum masuk, coba relogin game kamu. Jika masih terkendala, hubungi Customer Service kami via WhatsApp dengan menyertakan Invoice ID.', '4', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('8ccc3132-3f87-4b5c-99a1-8ba777acfa97', 'Bagaimana cara melakukan top up?', '1. Pilih game yang ingin kamu top up.\\n2. Masukkan User ID game kamu.\\n3. Pilih nominal dagangan yang diinginkan.\\n4. Pilih metode pembayaran.\\n5. Selesaikan pembayaran dan diamond akan otomatis masuk.', '5', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('d5e14748-b622-40bf-a96f-1b1c11a2753b', 'Apakah bisa refund jika transaksi gagal?', 'Tentu. Jika transaksi dinyatakan gagal oleh sistem karena kesalahan jaringan atau stok kosong, saldo akan dikembalikan ke akun kamu (jika member) atau kami proses refund manual ke rekening pengirim.', '6', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('478207e2-80ae-46ca-b5a1-431d1724e101', 'Apa itu NewGamingStore?', 'NewGamingStore adalah platform top up game termurah dan terpercaya di Indonesia. Kami menyediakan layanan isi ulang kredit game secara otomatis 24 jam non-stop dengan proses detik.', '1', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('b2aff6d6-152f-4fc0-8a02-e357640d9dd8', 'Apakah NewGamingStore aman dan terpercaya?', 'Tentu saja! Kami menggunakan sistem keamanan tingkat tinggi dan semua transaksi diproses secara transparan. Ribuan gamer telah mempercayakan top-up mereka kepada kami.', '2', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('17302faa-71b0-4540-9b57-d9a513f036c4', 'Apa saja metode pembayaran yang tersedia?', 'Sangat lengkap! Kamu bisa membayar via QRIS (DANA, OVO, Gopay, ShopeePay), Transfer Bank (BCA, Mandiri, BRI, BNI), hingga pembayaran tunai melalui Alfamart dan Indomaret.', '7', 't', '2026-08-02 14:45:27.2898+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('8d39f8a7-bfbb-420f-8204-602e63f8f6ec', 'Apa keuntungan jadi Member NewGamingStore?', 'Keuntungan jadi member:\r\nHarga lebih murah (Harga Reseller/Member).\r\nTidak perlu input ulang data saat transaksi.\r\nAkses riwayat transaksi lengkap.\r\nMendapatkan poin reward (jika event berlaku).', '8', 't', '2026-08-02 14:45:54.148681+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('da7d1653-414e-4c94-a993-1676d332bf48', 'Game apa saja yang bisa di top up?', 'Kami menyediakan hampir semua game populer seperti Mobile Legends, Free Fire, PUBG Mobile, Valorant, Genshin Impact, Honor of Kings, Point Blank, dan juga voucher digital lainnya.', '3', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('d39c0832-ebd2-4447-a630-6dd1432a1242', 'Bagaimana jika top up saya belum masuk?', 'Jangan panik. Pertama, cek status transaksi di menu "Cek Pesanan". Jika status "Sukses" tapi belum masuk, coba relogin game kamu. Jika masih terkendala, hubungi Customer Service kami via WhatsApp dengan menyertakan Invoice ID.', '4', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('45a6ccc6-6d35-4cc2-a6d5-18bd541fe708', 'Bagaimana cara melakukan top up?', '1. Pilih game yang ingin kamu top up.\\n2. Masukkan User ID game kamu.\\n3. Pilih nominal dagangan yang diinginkan.\\n4. Pilih metode pembayaran.\\n5. Selesaikan pembayaran dan diamond akan otomatis masuk.', '5', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('537cb724-0f1c-4ae0-89e7-1a058fdb5971', 'Apakah bisa refund jika transaksi gagal?', 'Tentu. Jika transaksi dinyatakan gagal oleh sistem karena kesalahan jaringan atau stok kosong, saldo akan dikembalikan ke akun kamu (jika member) atau kami proses refund manual ke rekening pengirim.', '6', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('d787ceb4-8b8e-4aab-98ae-81c76c327cf0', 'Apa itu NewGamingStore?', 'NewGamingStore adalah platform top up game termurah dan terpercaya di Indonesia. Kami menyediakan layanan isi ulang kredit game secara otomatis 24 jam non-stop dengan proses detik.', '1', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('ab3397a3-b4c2-4fd2-acf3-a3353443cb97', 'Apakah NewGamingStore aman dan terpercaya?', 'Tentu saja! Kami menggunakan sistem keamanan tingkat tinggi dan semua transaksi diproses secara transparan. Ribuan gamer telah mempercayakan top-up mereka kepada kami.', '2', 't', '2026-08-01 16:50:14.685776+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('d660d121-5534-45df-a436-1df9a40f5ff1', 'Apa saja metode pembayaran yang tersedia?', 'Sangat lengkap! Kamu bisa membayar via QRIS (DANA, OVO, Gopay, ShopeePay), Transfer Bank (BCA, Mandiri, BRI, BNI), hingga pembayaran tunai melalui Alfamart dan Indomaret.', '7', 't', '2026-08-02 14:45:27.2898+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('51687036-60fe-434d-84df-475af6b45dc3', 'Apa keuntungan jadi Member NewGamingStore?', 'Keuntungan jadi member:\r\nHarga lebih murah (Harga Reseller/Member).\r\nTidak perlu input ulang data saat transaksi.\r\nAkses riwayat transaksi lengkap.\r\nMendapatkan poin reward (jika event berlaku).', '8', 't', '2026-08-02 14:45:54.148681+00', '9a145561-8663-4b49-9d02-9a97c93ca322'),
('0c7f5d2f-0f92-4dad-a3ee-fc7dfbfd307f', 'Game apa saja yang bisa di top up?', 'Kami menyediakan hampir semua game populer seperti Mobile Legends, Free Fire, PUBG Mobile, Valorant, Genshin Impact, Honor of Kings, Point Blank, dan juga voucher digital lainnya.', '3', 't', '2026-08-01 16:50:14.685776+00', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('11fda05c-0050-4380-9378-9e3b45245697', 'Bagaimana jika top up saya belum masuk?', 'Jangan panik. Pertama, cek status transaksi di menu "Cek Pesanan". Jika status "Sukses" tapi belum masuk, coba relogin game kamu. Jika masih terkendala, hubungi Customer Service kami via WhatsApp dengan menyertakan Invoice ID.', '4', 't', '2026-08-01 16:50:14.685776+00', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('50765414-a169-4a21-8285-7858d6066f22', 'Bagaimana cara melakukan top up?', '1. Pilih game yang ingin kamu top up.\\n2. Masukkan User ID game kamu.\\n3. Pilih nominal dagangan yang diinginkan.\\n4. Pilih metode pembayaran.\\n5. Selesaikan pembayaran dan diamond akan otomatis masuk.', '5', 't', '2026-08-01 16:50:14.685776+00', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('e54e09d2-8b70-4472-8c0b-1a94189262e3', 'Apakah bisa refund jika transaksi gagal?', 'Tentu. Jika transaksi dinyatakan gagal oleh sistem karena kesalahan jaringan atau stok kosong, saldo akan dikembalikan ke akun kamu (jika member) atau kami proses refund manual ke rekening pengirim.', '6', 't', '2026-08-01 16:50:14.685776+00', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('0aff8ce6-b41c-4e72-bab0-e61d969defee', 'Apa itu NewGamingStore?', 'NewGamingStore adalah platform top up game termurah dan terpercaya di Indonesia. Kami menyediakan layanan isi ulang kredit game secara otomatis 24 jam non-stop dengan proses detik.', '1', 't', '2026-08-01 16:50:14.685776+00', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('4ce14e6b-a0dd-4af7-b4c2-869870d10d5e', 'Apakah NewGamingStore aman dan terpercaya?', 'Tentu saja! Kami menggunakan sistem keamanan tingkat tinggi dan semua transaksi diproses secara transparan. Ribuan gamer telah mempercayakan top-up mereka kepada kami.', '2', 't', '2026-08-01 16:50:14.685776+00', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('ccb2ba11-13e1-4845-ac88-69f87682ed78', 'Apa saja metode pembayaran yang tersedia?', 'Sangat lengkap! Kamu bisa membayar via QRIS (DANA, OVO, Gopay, ShopeePay), Transfer Bank (BCA, Mandiri, BRI, BNI), hingga pembayaran tunai melalui Alfamart dan Indomaret.', '7', 't', '2026-08-02 14:45:27.2898+00', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523'),
('cd1d548e-bea3-4f14-b3fd-81695b42d3ee', 'Apa keuntungan jadi Member NewGamingStore?', 'Keuntungan jadi member:\r\nHarga lebih murah (Harga Reseller/Member).\r\nTidak perlu input ulang data saat transaksi.\r\nAkses riwayat transaksi lengkap.\r\nMendapatkan poin reward (jika event berlaku).', '8', 't', '2026-08-02 14:45:54.148681+00', 'a4604e46-0d88-4a16-8e4a-ce6588bf8523')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------------------------
-- Data for public.api_validation_logs (135 rows)
-- ------------------------------------------------------------------------------
INSERT INTO public.api_validation_logs (id, created_at, tenant_id, game_code, user_id, server_id, provider, status, result_username, message, execution_time_ms, ratelimit_limit, ratelimit_remaining) VALUES
('c14e01c0-0191-4c07-9714-1959e0822e30', '2026-08-05 14:09:49.944154+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'SUCCESS', 'L*****n', NULL, '1151', NULL, NULL),
('b1f71b85-2a3d-40ac-86af-e6d57e385925', '2026-08-05 14:13:09.720958+00', NULL, 'cek_game_ml', '971857394', '12877', 'vip-reseller', 'FAILED', NULL, 'Provider for game code ''cek-game-ml'' is not available.', '455', NULL, NULL),
('32777063-75ef-4bc3-9d1c-508acf79315b', '2026-08-05 14:13:10.861462+00', NULL, 'cek_game_ml', '971857394', '12877', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 404', '845', NULL, NULL),
('0db24f37-b3b2-4267-8a8b-db9381e59e1a', '2026-08-05 14:16:15.965874+00', NULL, 'cek_game_ml', '971857394', '12877', 'vip-reseller', 'FAILED', NULL, 'Provider for game code ''cek-game-ml'' is not available.', '633', NULL, NULL),
('3fe441b8-66fb-4c5b-a35c-415570725d4b', '2026-08-05 14:16:19.441743+00', NULL, 'cek_game_ml', '971857394', '12877', 'rapidapi', 'SUCCESS', 'Sky+P1nnZzz’s', NULL, '3177', '5', '2'),
('9a5d18b3-a449-476c-89cf-ee54eb6b9227', '2026-08-05 14:19:37.731462+00', NULL, 'cek_game_ml', '971857394', '12877', 'vip-reseller', 'FAILED', NULL, 'Provider for game code ''cek-game-ml'' is not available.', '242', NULL, NULL),
('253581ba-65d8-41dd-b022-5afc0e19674c', '2026-08-05 14:19:43.870347+00', NULL, 'cek_game_ml', '971857394', '12877', 'rapidapi', 'FAILED', NULL, 'Username tidak ditemukan di RapidAPI', '5879', '5', '1'),
('38ec0256-2983-4014-8bf0-b645c19c2645', '2026-08-05 14:20:14.450869+00', NULL, 'cek_game_ml', '971857394', '12877', 'vip-reseller', 'FAILED', NULL, 'Provider for game code ''cek-game-ml'' is not available.', '205', NULL, NULL),
('33e78aee-7eda-4cc5-8958-ae371ef1e503', '2026-08-05 14:20:19.964812+00', NULL, 'cek_game_ml', '971857394', '12877', 'rapidapi', 'SUCCESS', 'Sky+P1nnZzz’s (id)', NULL, '5312', '5', '0'),
('0521fae4-da3c-49ef-831a-9b67917b769d', '2026-08-05 14:20:31.908825+00', NULL, 'cek_game_ml', '971857394', '12877', 'vip-reseller', 'FAILED', NULL, 'Provider for game code ''cek-game-ml'' is not available.', '197', NULL, NULL),
('d99008b3-eafb-4679-b9a8-6c3a1d52bef8', '2026-08-05 14:20:32.151092+00', NULL, 'cek_game_ml', '971857394', '12877', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 429', '122', '5', '0'),
('d94e96a7-f7f6-4ad4-995a-2fc5b04729a2', '2026-08-05 14:31:42.574449+00', NULL, 'mobile-legends', '971857394', '12877', 'vip-reseller', 'SUCCESS', 'Sky P1nnZzz’s', NULL, '1981', NULL, NULL),
('f3e27f86-64d7-447d-8c26-12474894113d', '2026-08-05 14:32:08.399968+00', NULL, 'mobile-legends', '971857394', '12877', 'vip-reseller', 'SUCCESS', 'Sky P1nnZzz’s', NULL, '851', NULL, NULL),
('07ed32f7-30a8-41e9-ab57-7460adb931c0', '2026-08-05 14:52:25.049116+00', NULL, 'mobile-legends', '971857394', '12877', 'kokinpay', 'SUCCESS', 'Sky+P1nnZzz’s (ID)', NULL, '3143', NULL, NULL),
('b851dd67-b8e5-49b1-a02c-a9e87048174d', '2026-08-05 14:53:06.474867+00', NULL, 'mobile-legends', '971857394', '12877', 'kokinpay', 'SUCCESS', 'Sky+P1nnZzz’s (ID)', NULL, '2538', NULL, NULL),
('90fc1125-5274-4b53-baae-826a3c32bcb3', '2026-08-05 14:53:15.647954+00', NULL, 'mobile-legends', '971857394', '12877', 'kokinpay', 'SUCCESS', 'Sky+P1nnZzz’s (ID)', NULL, '2237', NULL, NULL),
('d2cf1fca-df7c-496d-88f5-cd69ce7f1463', '2026-08-05 14:53:19.829346+00', NULL, 'mobile-legends', '971857394', '12877', 'kokinpay', 'SUCCESS', 'Sky+P1nnZzz’s (ID)', NULL, '2077', NULL, NULL),
('31223de5-24b0-4d09-8b3f-9f1ee20486b5', '2026-08-05 14:53:33.225088+00', NULL, 'mobile-legends', '971857394', '12877', 'kokinpay', 'SUCCESS', 'Sky+P1nnZzz’s (ID)', NULL, '2353', NULL, NULL),
('cbc02857-add5-4d01-8058-c9adc3ccf793', '2026-08-05 14:53:44.280481+00', NULL, 'mobile-legends', '971857394', '12877', 'kokinpay', 'SUCCESS', 'Sky+P1nnZzz’s (ID)', NULL, '2632', NULL, NULL),
('e1324964-86df-443e-9826-cdf2ec9d5f95', '2026-08-05 14:54:11.391801+00', NULL, 'mobile-legends', '971857394', '128777', 'kokinpay', 'FAILED', NULL, 'User ID atau Zone ID tidak ditemukan atau tidak valid', '2912', NULL, NULL),
('6316930b-cbcd-4e68-b306-f7e5a905abad', '2026-08-05 14:54:14.092136+00', NULL, 'mobile-legends', '971857394', '128777', 'vip-reseller', 'FAILED', NULL, 'Fails.', '2535', NULL, NULL),
('ae333d86-f830-41c5-9503-bb088f685bcb', '2026-08-05 14:54:15.355134+00', NULL, 'cek_game_ml', '971857394', '128777', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 429', '932', '5', '0'),
('15c5a904-ab87-472c-8cf2-486dd2163921', '2026-08-05 14:56:18.351984+00', NULL, 'mobile-legends', '971857394', '128777', 'kokinpay', 'FAILED', NULL, 'User ID atau Zone ID tidak ditemukan atau tidak valid', '2798', NULL, NULL),
('31cbd700-ce53-42be-8b50-7d8517037d1a', '2026-08-05 14:56:20.119027+00', NULL, 'mobile-legends', '971857394', '128777', 'vip-reseller', 'FAILED', NULL, 'Fails.', '1579', NULL, NULL),
('e853cced-d67b-44f6-98cc-2bbcbe8cd7c8', '2026-08-05 14:56:21.42138+00', NULL, 'cek_game_ml', '971857394', '128777', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 429', '969', '5', '0'),
('f051127d-1301-4e90-b057-6daa1574984a', '2026-08-05 14:59:54.201553+00', NULL, 'mobile-legends', '971857394', '12877', 'kokinpay', 'SUCCESS', 'Sky+P1nnZzz’s (ID)', NULL, '3005', NULL, NULL),
('3831294e-28ff-41d0-ad2e-f3bd2cd46796', '2026-08-05 15:35:52.003398+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 54.169.242.11 tidak diizinkan', '201', NULL, NULL),
('17b1f840-7e62-4524-b565-dc5433acf043', '2026-08-05 15:35:52.15538+00', NULL, 'genshin', '854016571', 'os_asia', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 404', '24', NULL, NULL),
('ba730e92-3db7-435d-b92c-4e72fc8829a7', '2026-08-05 15:38:49.744479+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'SUCCESS', 'L*****n', NULL, '586', NULL, NULL),
('810941d4-2b58-4700-922e-ed5858462090', '2026-08-05 15:39:59.859166+00', NULL, 'mobile-legends', '971857394', '12877', 'vip-reseller', 'FAILED', NULL, 'IP 52.74.148.142 tidak diizinkan', '134', NULL, NULL),
('f935cd55-9bef-4ccc-a08c-97b195318376', '2026-08-05 15:40:00.00851+00', NULL, 'cek_game_ml', '971857394', '12877', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 429', '26', '5', '0'),
('a358ab62-a160-4fb9-ae7b-e1ae55ef47a5', '2026-08-05 15:49:02.28016+00', NULL, 'mobile-legends', '971857394', '12877', 'kokinpay', 'SUCCESS', 'Sky+P1nnZzz’s (ID)', NULL, '3014', NULL, NULL),
('61117d57-4a37-4bbd-922e-e8ba98215f7e', '2026-08-05 15:49:58.184127+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 13.214.193.244 tidak diizinkan', '131', NULL, NULL),
('8bf02169-ed57-48ac-a5db-62a8ad378732', '2026-08-05 15:49:59.596832+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'FAILED', NULL, 'User ID tidak ditemukan atau tidak valid', '1321', NULL, NULL),
('e18299f9-6d0f-44e8-b620-e59169e56986', '2026-08-05 15:49:59.720314+00', NULL, 'test_game_genshin', '854016571', 'os_asia', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 429', '24', '5', '0'),
('f1d9d8b6-4fd4-433a-bb98-add489f88090', '2026-08-05 15:50:26.233535+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 13.214.193.244 tidak diizinkan', '614', NULL, NULL),
('95e590ab-746a-42f4-884e-d92bf02ef61c', '2026-08-05 15:50:27.477277+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'FAILED', NULL, 'User ID tidak ditemukan atau tidak valid', '1128', NULL, NULL),
('abfdd1db-7a1b-46dc-a59a-2008ddc04ac2', '2026-08-05 15:50:27.597247+00', NULL, 'test_game_genshin', '854016571', 'os_asia', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 429', '27', '5', '0'),
('7556e813-a8f7-4d54-928c-411e23eab8e1', '2026-08-05 15:50:54.558858+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 13.214.193.244 tidak diizinkan', '125', NULL, NULL),
('c8c7c860-7486-423c-8bf5-c09c61a0498b', '2026-08-05 15:50:55.719599+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'FAILED', NULL, 'User ID tidak ditemukan atau tidak valid', '1058', NULL, NULL),
('ab52118c-c994-46e4-a1d1-32149144f28d', '2026-08-05 15:50:55.827647+00', NULL, 'test_game_genshin', '854016571', 'os_asia', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 429', '15', '5', '0'),
('d592aaf7-a9d4-47f6-8fb7-c581cd747246', '2026-08-05 15:53:45.257118+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 13.214.193.244 tidak diizinkan', '816', NULL, NULL),
('b2567d7b-690a-4655-a7f8-9c694a25150f', '2026-08-05 15:53:46.739202+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'FAILED', NULL, 'User ID tidak ditemukan atau tidak valid', '1365', NULL, NULL),
('f387347d-4a6b-409e-b420-cc57e177903e', '2026-08-05 15:53:46.860341+00', NULL, 'test_game_genshin', '854016571', 'os_asia', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 429', '25', '5', '0'),
('2dfac7d8-afe3-4bbd-acd3-5b4ca305c516', '2026-08-05 15:55:37.799423+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'SUCCESS', 'L*****n', NULL, '783', NULL, NULL),
('8538625e-c698-45cf-bb1f-a5656ef39b88', '2026-08-05 16:01:54.909186+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'SUCCESS', 'L*****n', NULL, '2619', NULL, NULL),
('8e8cd8d8-2027-4c10-a2e2-43a2469cdce1', '2026-08-05 16:03:02.122968+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 18.142.246.205 tidak diizinkan', '1597', NULL, NULL),
('b55cd708-9ce5-449e-a5f2-eee98b531cb0', '2026-08-05 16:03:04.214373+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'SUCCESS', 'L*****n', NULL, '1981', NULL, NULL),
('bb1a6fb1-08dd-4785-a8d1-2abddc6babfb', '2026-08-05 16:03:37.086434+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 18.142.246.205 tidak diizinkan', '112', NULL, NULL),
('bbf923e7-f637-4551-a863-cf1b99e6cc77', '2026-08-05 16:03:38.731841+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'SUCCESS', 'L*****n', NULL, '1368', NULL, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.api_validation_logs (id, created_at, tenant_id, game_code, user_id, server_id, provider, status, result_username, message, execution_time_ms, ratelimit_limit, ratelimit_remaining) VALUES
('996f8ca6-118e-475e-9316-0c9090dec0b3', '2026-08-05 17:40:20.999031+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 13.215.174.85 tidak diizinkan', '121', NULL, NULL),
('eaaa005e-bda7-4466-9fc6-7bdaab771e4c', '2026-08-05 17:40:23.348106+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'SUCCESS', 'L*****n', NULL, '2242', NULL, NULL),
('ccff35ef-33d2-496f-be42-c315daff09c1', '2026-08-06 02:29:42.085981+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 54.255.234.6 tidak diizinkan', '143', NULL, NULL),
('ad86688d-65a9-4b1e-a6cc-3d9b30bbb3d2', '2026-08-06 02:29:44.185028+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'SUCCESS', 'L*****n', NULL, '1922', NULL, NULL),
('008b28ad-e48b-4715-a6dd-49f30e75ede5', '2026-08-06 12:04:00.004676+00', NULL, 'honor-of-kings/', '3832563198081203267', NULL, 'vip-reseller', 'FAILED', NULL, 'IP 13.212.69.77 tidak diizinkan', '122', NULL, NULL),
('41b4dd46-8408-4158-869c-67db94228bb6', '2026-08-06 12:04:01.380849+00', NULL, 'honor-of-kings/', '3832563198081203267', NULL, 'kokinpay', 'FAILED', NULL, 'Game code tidak valid atau tidak tersedia', '1233', NULL, NULL),
('7d5d3cdf-4d50-430b-aa92-640dc7ef9fbd', '2026-08-06 12:04:01.53755+00', NULL, 'honor-of-kings/', '3832563198081203267', NULL, 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 404', '23', NULL, NULL),
('7b341a13-7bc3-41af-8dbd-28ff619044f0', '2026-08-06 12:04:53.09137+00', NULL, 'honor-of-kings/', '3832563198081203267', NULL, 'vip-reseller', 'FAILED', NULL, 'IP 13.212.69.77 tidak diizinkan', '125', NULL, NULL),
('066da90b-edc6-4b6a-b1d2-9a1ecb6bbaec', '2026-08-06 12:04:53.719681+00', NULL, 'honor-of-kings/', '3832563198081203267', NULL, 'kokinpay', 'FAILED', NULL, 'Game code tidak valid atau tidak tersedia', '523', NULL, NULL),
('c2064780-6eae-4624-8498-88fa6b8b8cfb', '2026-08-06 12:04:53.842556+00', NULL, 'honor-of-kings/', '3832563198081203267', NULL, 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 404', '21', NULL, NULL),
('4423aa7b-1aff-48a9-b8da-6d575e25ff53', '2026-08-07 09:31:12.416201+00', NULL, 'honor-of-kings/', '3832563198081203267', NULL, 'vip-reseller', 'FAILED', NULL, 'IP 52.221.238.31 tidak diizinkan', '127', NULL, NULL),
('65295d89-993e-46e9-b491-c3cbbd3c2dd3', '2026-08-07 09:31:13.715313+00', NULL, 'honor-of-kings/', '3832563198081203267', NULL, 'kokinpay', 'FAILED', NULL, 'Game code tidak valid atau tidak tersedia', '1006', NULL, NULL),
('3d4b99be-6be3-495b-ade2-8fd104e9b724', '2026-08-07 09:31:14.544843+00', NULL, 'honor-of-kings/', '3832563198081203267', NULL, 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 404', '722', NULL, NULL),
('8c2d7866-befd-4796-af25-cd0a9197bb86', '2026-08-08 07:31:34.302299+00', NULL, 'pubgm', '5295907539', NULL, 'vip-reseller', 'FAILED', NULL, 'IP 54.179.255.42 tidak diizinkan', '140', NULL, NULL),
('b02679b6-ac9e-4b9f-ba6a-f7b737ba0abf', '2026-08-08 07:31:36.713341+00', NULL, 'pubg-mobile', '5295907539', NULL, 'kokinpay', 'SUCCESS', 'Ri''ot666', NULL, '2280', NULL, NULL),
('a156d32b-c796-453e-a201-be4c78dd3002', '2026-08-08 07:33:59.581715+00', NULL, 'mobile-legends', '11280411561', '3546', 'kokinpay', 'FAILED', NULL, 'User ID atau Zone ID tidak ditemukan atau tidak valid', '2731', NULL, NULL),
('20676995-6b51-436a-a31b-d5650071aab0', '2026-08-08 07:33:59.837806+00', NULL, 'mobile-legends', '11280411561', '3546', 'vip-reseller', 'FAILED', NULL, 'IP 18.142.91.194 tidak diizinkan', '143', NULL, NULL),
('df679e4c-51bb-4fe2-8240-587873544302', '2026-08-08 07:34:02.891981+00', NULL, 'cek_game_ml', '11280411561', '3546', 'rapidapi', 'SUCCESS', 'NOT FOUND', NULL, '2794', '5', '4'),
('0a0214a3-dd72-4c7d-9f41-17efd5a3e4b9', '2026-08-08 07:57:38.74661+00', NULL, 'mobile-legends', '11280411561', '3546', 'kokinpay', 'FAILED', NULL, 'User ID atau Zone ID tidak ditemukan atau tidak valid', '2429', NULL, NULL),
('24ba8178-c1c4-4923-8393-9513fe2660de', '2026-08-08 07:57:39.150089+00', NULL, 'mobile-legends', '11280411561', '3546', 'vip-reseller', 'FAILED', NULL, 'IP 54.151.138.48 tidak diizinkan', '142', NULL, NULL),
('8a3a4c2c-1b34-4fb2-ba7f-3ebef6ea7a27', '2026-08-08 07:57:41.808795+00', NULL, 'cek_game_ml', '11280411561', '3546', 'rapidapi', 'SUCCESS', 'NOT FOUND', NULL, '2538', '5', '3'),
('521ec219-ce08-4230-ad52-95f7aafc67db', '2026-08-08 07:58:18.418847+00', NULL, 'mobile-legends', '1128041156', '13546', 'kokinpay', 'SUCCESS', '꧁Wong•Pusat꧂ (ID)', NULL, '2591', NULL, NULL),
('e3d160e1-add1-4aa2-a511-b4c2f5273ed5', '2026-08-08 09:55:10.744145+00', NULL, 'mobile-legends', '1094577662', '13398', 'kokinpay', 'SUCCESS', 'weyywii. (ID)', NULL, '3077', NULL, NULL),
('a8584f44-9991-43b3-9a88-b5794ddbfc52', '2026-08-08 15:13:41.164606+00', NULL, 'mobile-legends', '547259384', '3468', 'kokinpay', 'SUCCESS', 'pemilik+kembali. (PH)', NULL, '2278', NULL, NULL),
('b65028b1-e4ca-4175-a836-7e0e555a82e8', '2026-08-08 18:07:31.870515+00', NULL, 'mobile-legends', '983841486', '12931', 'kokinpay', 'SUCCESS', 'Hansenn. (ID)', NULL, '3285', NULL, NULL),
('0f4baa7d-d1a8-45fe-8596-a466c1053505', '2026-08-08 18:21:19.897633+00', NULL, 'mobile-legends', '16764', '1609080551', 'kokinpay', 'FAILED', NULL, 'User ID atau Zone ID tidak ditemukan atau tidak valid', '2757', NULL, NULL),
('e4f3508c-1252-4553-a8e1-66d366aa4558', '2026-08-08 18:21:20.136368+00', NULL, 'mobile-legends', '16764', '1609080551', 'vip-reseller', 'FAILED', NULL, 'IP 3.1.202.168 tidak diizinkan', '122', NULL, NULL),
('dc52ddd9-1945-4e8d-a6e8-a3e0b4789149', '2026-08-08 18:21:23.167144+00', NULL, 'cek_game_ml', '16764', '1609080551', 'rapidapi', 'SUCCESS', 'NOT FOUND', NULL, '2936', '5', '4'),
('c178fcd2-760f-4b31-87cb-bbaadaee55d5', '2026-08-08 18:23:08.518936+00', NULL, 'mobile-legends', '1609080551', '16764', 'kokinpay', 'SUCCESS', 'Ahhhhh (ID)', NULL, '2300', NULL, NULL),
('bc611f13-5fa8-48f2-b7d2-01002274854d', '2026-08-08 18:23:38.888412+00', NULL, 'mobile-legends', '1609080551', '16764', 'kokinpay', 'SUCCESS', 'Ahhhhh (ID)', NULL, '2074', NULL, NULL),
('995f8282-8961-48a0-9fb8-d53f84415b3d', '2026-08-08 18:53:29.850039+00', NULL, 'mobile-legends', '164722780', '2826', 'kokinpay', 'SUCCESS', 'ダーリン (ID)', NULL, '2547', NULL, NULL),
('8b918508-524b-4e92-b695-2f4da9aeff82', '2026-08-08 18:55:21.560987+00', NULL, 'mobile-legends', '164722780', '2826', 'kokinpay', 'SUCCESS', 'ダーリン (ID)', NULL, '2506', NULL, NULL),
('f503d8f9-3d8a-4ec6-a39d-854ba98d8190', '2026-08-09 04:35:47.75953+00', NULL, 'mobile-legends', '1438344507', '14261', 'kokinpay', 'SUCCESS', 'SCoobyDOERTF4 (PH)', NULL, '2567', NULL, NULL),
('d24bba19-c7a4-4e91-b42f-7daee2ba02de', '2026-08-09 04:39:02.317172+00', NULL, 'mobile-legends', '138085121815675', '(15675)', 'kokinpay', 'FAILED', NULL, 'User ID atau Zone ID tidak ditemukan atau tidak valid', '3085', NULL, NULL),
('d196f0e0-02d6-44a9-b04b-f73b654f54bf', '2026-08-09 04:39:03.582763+00', NULL, 'mobile-legends', '138085121815675', '(15675)', 'vip-reseller', 'FAILED', NULL, 'IP 18.143.196.252 tidak diizinkan', '1145', NULL, NULL),
('b1ad01d7-b4ed-451b-8075-50c328563cb4', '2026-08-09 04:39:03.72875+00', NULL, 'cek_game_ml', '138085121815675', '(15675)', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 400', '44', '5', '3'),
('255ae711-66c2-431b-a890-6d8e850c1e93', '2026-08-09 04:39:58.413453+00', NULL, 'mobile-legends', '1380851218', '(15675)', 'kokinpay', 'FAILED', NULL, 'User ID atau Zone ID tidak ditemukan atau tidak valid', '2124', NULL, NULL),
('37c62238-8545-4019-9108-144b2bb3e24a', '2026-08-09 04:39:58.64808+00', NULL, 'mobile-legends', '1380851218', '(15675)', 'vip-reseller', 'FAILED', NULL, 'IP 18.143.196.252 tidak diizinkan', '112', NULL, NULL),
('9801d35f-8a92-44a6-b7bd-3bcf66288c7a', '2026-08-09 04:39:58.792212+00', NULL, 'cek_game_ml', '1380851218', '(15675)', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 400', '36', '5', '2'),
('6b7d917f-d4ff-4169-a00f-a2150519aaab', '2026-08-09 04:48:23.629112+00', NULL, 'mobile-legends', '1167606198', '13733', 'kokinpay', 'SUCCESS', '4+U. (ID)', NULL, '2284', NULL, NULL),
('dc7b478d-225b-4d47-8ce9-9c8f9269b3c6', '2026-08-09 05:24:13.541017+00', NULL, 'mobile-legends', '1380851218', '(15675)', 'kokinpay', 'FAILED', NULL, 'User ID atau Zone ID tidak ditemukan atau tidak valid', '2881', NULL, NULL),
('d8d26a44-be25-484d-928b-706e2c03123c', '2026-08-09 05:24:13.853801+00', NULL, 'mobile-legends', '1380851218', '(15675)', 'vip-reseller', 'FAILED', NULL, 'IP 13.212.128.225 tidak diizinkan', '155', NULL, NULL),
('41f2cc39-b7a6-44e5-b0da-36a8674a4689', '2026-08-09 05:24:14.020368+00', NULL, 'cek_game_ml', '1380851218', '(15675)', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 400', '39', '5', '1'),
('5af30457-948e-4994-935a-32c6ba0d495c', '2026-08-09 06:01:39.435604+00', NULL, 'mobile-legends', '462316045', '2369', 'kokinpay', 'SUCCESS', 'INDUNG+SHUTDOWN+NPE (ID)', NULL, '2521', NULL, NULL),
('ee1b420c-f21e-4f40-ba05-f4933da96c94', '2026-08-09 07:11:29.9412+00', NULL, 'mobile-legends', '145459677', '2724', 'kokinpay', 'SUCCESS', 'OpungMedan03 (ID)', NULL, '2271', NULL, NULL),
('790cb4d1-991d-4863-835f-cc03771439cd', '2026-08-09 07:11:57.204983+00', NULL, 'mobile-legends', '145459677', '2724', 'kokinpay', 'SUCCESS', 'OpungMedan03 (ID)', NULL, '1963', NULL, NULL),
('66ea48d0-b161-433e-823e-53c44aef5e3d', '2026-08-09 07:22:51.653321+00', NULL, 'mobile-legends', '1327858778', '15479', 'kokinpay', 'SUCCESS', 'PremanLATEGAME (ID)', NULL, '2266', NULL, NULL),
('09c6318e-ae41-4a4e-9c35-aaeac090709c', '2026-08-09 07:24:12.003505+00', NULL, 'mobile-legends', '1327858778', '15479', 'kokinpay', 'SUCCESS', 'PremanLATEGAME (ID)', NULL, '3726', NULL, NULL),
('d8ebe7db-39b7-4457-b526-cc7bb7c83149', '2026-08-09 07:24:39.370442+00', NULL, 'mobile-legends', '1327858778', '15479', 'kokinpay', 'SUCCESS', 'PremanLATEGAME (ID)', NULL, '2175', NULL, NULL),
('c0dbde4a-5c3c-4ddd-b572-316b43ba7988', '2026-08-09 07:31:12.408174+00', NULL, 'mobile-legends', '1741137838', '18407', 'kokinpay', 'SUCCESS', 'One+Call+Away. (ID)', NULL, '2855', NULL, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.api_validation_logs (id, created_at, tenant_id, game_code, user_id, server_id, provider, status, result_username, message, execution_time_ms, ratelimit_limit, ratelimit_remaining) VALUES
('f5418dd4-2cff-49f0-a892-e758476bbf06', '2026-08-09 08:17:17.927454+00', NULL, 'mobile-legends', '1611823465', '16793', 'kokinpay', 'SUCCESS', 'Vyxx_ (ID)', NULL, '2313', NULL, NULL),
('15b66f9e-c50d-4610-8734-de51402ddd23', '2026-08-09 08:20:42.677463+00', NULL, 'mobile-legends', '688278516', '8733', 'kokinpay', 'SUCCESS', '#@Oblivion_Slayer99+ (ID)', NULL, '2227', NULL, NULL),
('0a6f6564-e323-4425-93a2-d3007f50da48', '2026-08-09 08:22:04.913059+00', NULL, 'mobile-legends', '1565182218', '16564', 'kokinpay', 'SUCCESS', 'Y+A+N+Z+R+O♤ (ID)', NULL, '2791', NULL, NULL),
('fe05ea03-6fca-4788-8b59-454fed4fcafe', '2026-08-09 09:04:46.94489+00', NULL, 'mobile-legends', '67965525', '2119', 'kokinpay', 'SUCCESS', 'PapiNya+Keyraa (ID)', NULL, '2444', NULL, NULL),
('083f54bc-ac1a-414e-8d4c-75d326047300', '2026-08-09 09:09:45.542977+00', NULL, 'mobile-legends', '448461216', '2309', 'kokinpay', 'SUCCESS', '納特|The+Emperor. (ID)', NULL, '2453', NULL, NULL),
('edd2d1b8-7b26-4cdd-a89c-3b1e2cf47be6', '2026-08-09 09:22:25.805273+00', NULL, 'mobile-legends', '226281469', '9178', 'kokinpay', 'SUCCESS', 'Super+Frince (ID)', NULL, '2346', NULL, NULL),
('7fdb73cd-5d8c-4074-99b1-3bd77165e2c9', '2026-08-09 11:39:48.5939+00', NULL, 'mobile-legends', '1547782399', '(11808)', 'kokinpay', 'FAILED', NULL, 'User ID atau Zone ID tidak ditemukan atau tidak valid', '3177', NULL, NULL),
('0ffc652b-3c62-4a1b-b97c-60b92b8a3fcb', '2026-08-09 11:39:49.01568+00', NULL, 'mobile-legends', '1547782399', '(11808)', 'vip-reseller', 'FAILED', NULL, 'IP 13.212.177.72 tidak diizinkan', '280', NULL, NULL),
('a1fb510b-f13f-4662-b94f-826797f7ab46', '2026-08-09 11:39:49.287684+00', NULL, 'cek_game_ml', '1547782399', '(11808)', 'rapidapi', 'FAILED', NULL, 'RapidAPI HTTP Error: 400', '175', '5', '0'),
('749095bd-0884-460e-9b71-10299c900c28', '2026-08-10 03:18:44.281077+00', NULL, 'mobile-legends', '2198456143', '12797', 'kokinpay', 'SUCCESS', 'C+I+L+A (ID)', NULL, '3185', NULL, NULL),
('dc0e3f4e-6e37-42ed-8fe4-465f1797e816', '2026-08-10 12:06:03.001776+00', NULL, 'pubgm', '52447564006', NULL, 'vip-reseller', 'FAILED', NULL, 'IP 13.229.106.11 tidak diizinkan', '1179', NULL, NULL),
('6f5f9f5e-a0b7-4c2c-ab54-de1731f917d3', '2026-08-10 12:06:07.109588+00', NULL, 'pubg-mobile', '52447564006', NULL, 'kokinpay', 'SUCCESS', 'Kynaraaaゞ', NULL, '3962', NULL, NULL),
('33fa0084-24ea-4355-bd4a-2df0f58b98b4', '2026-08-10 12:12:21.225007+00', NULL, 'pubgm', '52447564006', NULL, 'vip-reseller', 'FAILED', NULL, 'IP 54.151.211.192 tidak diizinkan', '160', NULL, NULL),
('68f40d04-4d3b-4674-969b-7fa7d811a9d9', '2026-08-10 12:12:22.777486+00', NULL, 'pubg-mobile', '52447564006', NULL, 'kokinpay', 'SUCCESS', 'Kynaraaaゞ', NULL, '1430', NULL, NULL),
('0c90ab1f-40ae-4a04-b8ca-b9e883d2db7a', '2026-08-11 14:17:34.654347+00', NULL, 'mobile-legends', '236438993', '9251', 'kokinpay', 'SUCCESS', 'Iori.++Kitaharaメ (ID)', NULL, '3013', NULL, NULL),
('fdf683db-19a6-4a4a-80ed-7d5ed56a46af', '2026-08-11 14:39:31.66799+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 114.10.69.184 tidak diizinkan', '661', NULL, NULL),
('3f8695b7-6ec1-4b59-93f6-6d84238d813e', '2026-08-11 14:39:33.654447+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'SUCCESS', 'L*****n', NULL, '1803', NULL, NULL),
('e666676b-d4a2-48fb-ab32-2bbd244e85e1', '2026-08-11 15:11:52.408979+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'vip-reseller', 'FAILED', NULL, 'IP 18.142.252.155 tidak diizinkan', '123', NULL, NULL),
('b5e57e8a-dee9-4468-acf8-fcd2f3d64b05', '2026-08-11 15:11:54.066115+00', NULL, 'genshin-impact', '854016571', 'os_asia', 'kokinpay', 'SUCCESS', 'L*****n', NULL, '1530', NULL, NULL),
('f79a3663-298b-4f75-9483-7cb28ee0bc42', '2026-08-11 23:33:21.242652+00', NULL, 'mobile-legends', '45536295', '2211', 'kokinpay', 'SUCCESS', 'Y+A+F+A+N+D+A (ID)', NULL, '2782', NULL, NULL),
('1cbc9002-3219-4252-8ac6-20545f0b3e37', '2026-08-11 23:37:07.173361+00', NULL, 'mobile-legends', '45536295', '2211', 'kokinpay', 'SUCCESS', 'Y+A+F+A+N+D+A (ID)', NULL, '2742', NULL, NULL),
('87fbafcc-6d22-427e-87a5-71ef92b9b2ab', '2026-08-12 08:42:30.54643+00', NULL, 'mobile-legends', '582006032', '10335', 'kokinpay', 'SUCCESS', 'CʜɪᴋᴀʟᴇᴛA (PH)', NULL, '2368', NULL, NULL),
('a199bb05-92a9-4c4c-ae5f-221a24f5f5b7', '2026-08-12 11:14:15.402968+00', NULL, 'mobile-legends', '101106838', '2518', 'kokinpay', 'SUCCESS', 'POK+AMI+AMI (ID)', NULL, '2354', NULL, NULL),
('ee345fd8-acc3-465c-8121-949526613c72', '2026-08-12 12:52:11.00275+00', NULL, 'mobile-legends', '1147781104', '13654', 'kokinpay', 'SUCCESS', '(FIT) (ID)', NULL, '2408', NULL, NULL),
('652d3f1d-cd92-480e-bef7-6d965fb1569f', '2026-08-12 13:02:51.519898+00', NULL, 'mobile-legends', '1147781104', '13654', 'kokinpay', 'SUCCESS', '(FIT) (ID)', NULL, '4174', NULL, NULL),
('56a96904-04b1-41ff-8c2f-b038d093a780', '2026-08-12 13:05:30.591531+00', NULL, 'mobile-legends', '1147781104', '13654', 'kokinpay', 'SUCCESS', '(FIT) (ID)', NULL, '2062', NULL, NULL),
('e21ecd01-cdc7-45a7-add2-af15873e63bb', '2026-08-13 13:03:00.900758+00', NULL, 'mobile-legends', '236438993', '9251', 'kokinpay', 'SUCCESS', 'Iori.++Kitaharaメ (ID)', NULL, '2802', NULL, NULL),
('f44f919f-012b-4597-922c-0f40d27b970b', '2026-08-14 06:14:34.450138+00', NULL, 'pubgm', '5123803649', NULL, 'vip-reseller', 'FAILED', NULL, 'IP 18.138.102.208 tidak diizinkan', '125', NULL, NULL),
('8e5aeb8e-d926-4309-901a-bf767d3e2931', '2026-08-14 06:14:37.8438+00', NULL, 'pubg-mobile', '5123803649', NULL, 'kokinpay', 'SUCCESS', 'ムソイ・Devlin', NULL, '3220', NULL, NULL),
('0e7fe969-4037-4197-a9c7-7c5e1d383e1e', '2026-08-14 12:20:31.355213+00', NULL, 'mobile-legends', '904979700', '12589', 'kokinpay', 'SUCCESS', 'Max+Verstappen (ID)', NULL, '1985', NULL, NULL),
('fa485fe3-da93-41bf-89c9-f3c60c7973a7', '2026-08-14 14:29:20.930007+00', NULL, 'mobile-legends', '135285403', '2688', 'kokinpay', 'SUCCESS', 'Mr.+Veēy (ID)', NULL, '2328', NULL, NULL),
('f58529c5-837d-4d5b-9df4-a99ad7651071', '2026-08-14 14:42:59.619737+00', NULL, 'mobile-legends', '598447497', '8397', 'kokinpay', 'SUCCESS', 'MR.poseidon', NULL, '2293', NULL, NULL),
('9b17d617-7957-4d9f-b125-88795d3dbec8', '2026-08-14 15:04:26.327712+00', NULL, 'mobile-legends', '47148012', '2078', 'kokinpay', 'SUCCESS', 'SeanZ. (ID)', NULL, '2541', NULL, NULL),
('33dfff49-a13b-49c6-8a1c-159ac25ec333', '2026-08-14 15:04:54.039015+00', NULL, 'mobile-legends', '2044749881', '19575', 'kokinpay', 'SUCCESS', 'Triton (ID)', NULL, '2537', NULL, NULL),
('bc045749-62a6-4ccc-80fd-0188e2edcc5b', '2026-08-14 15:12:04.538686+00', NULL, 'mobile-legends', '1448204652', '16015', 'kokinpay', 'SUCCESS', '유야산NPL (ID)', NULL, '2794', NULL, NULL)
ON CONFLICT DO NOTHING;


-- Step 6: Re-enable Foreign Key Constraints & Triggers
SET session_replication_role = 'origin';

-- Step 7: Apply Foreign Keys
DO $$ BEGIN
  ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.api_validation_logs
    ADD CONSTRAINT api_validation_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_payment_channel_id_fkey FOREIGN KEY (payment_channel_id) REFERENCES public.payment_channels(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.membership_packages
    ADD CONSTRAINT membership_packages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_channel_id_fkey FOREIGN KEY (payment_channel_id) REFERENCES public.payment_channels(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_promo_code_id_fkey FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.payment_channels
    ADD CONSTRAINT payment_channels_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Step 8: Indexes
CREATE INDEX idx_api_validation_logs_created_at ON public.api_validation_logs USING btree (created_at DESC);
CREATE INDEX idx_api_validation_logs_provider ON public.api_validation_logs USING btree (provider);
CREATE INDEX idx_api_validation_logs_tenant_id ON public.api_validation_logs USING btree (tenant_id);
CREATE INDEX idx_games_sort_order ON public.games USING btree (sort_order);

-- Step 9: Triggers
CREATE TRIGGER on_deposit_success AFTER UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

-- Step 10: RLS Policies
CREATE POLICY "Admin full access" ON public.orders USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Admin full access" ON public.promo_codes USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view active promo codes" ON public.promo_codes FOR SELECT USING ((is_active = true));
CREATE POLICY "Public can view order by invoice_id" ON public.orders FOR SELECT USING (true);