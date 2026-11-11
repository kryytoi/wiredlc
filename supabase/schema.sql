-- =====================================================================
-- Wire DLC — PostgreSQL / Supabase Migration Schema
-- Выполните в Supabase SQL Editor при переключении DB_PROVIDER=supabase
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'month', 'quarter', 'lifetime')),
  subscription_expires_at timestamptz null,
  hwid text null,
  hwid_resets_count integer not null default 0,
  discord_id text null,
  discord_username text null,
  email_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  item_code text not null check (item_code in ('month', 'quarter', 'lifetime', 'hwid_reset')),
  item_title text not null,
  amount numeric not null,
  currency text not null default 'RUB', -- 'RUB' или 'MANDARINS'
  payment_method text not null,        -- 'sbp', 'rf_card', 'usdt', 'ton', 'ltc', 'ua_support', 'mandarins'
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  note text null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1,
  hero_badge text not null,
  hero_title text not null,
  hero_subtitle text not null,
  minecraft_version text not null,
  loader_name text not null,
  free_download_note text not null,
  mandarin_note text not null,
  support_telegram text not null,
  support_discord text not null,
  logo_url text not null,
  updated_at timestamptz not null default now()
);

-- Назначение прав администратора вручную в Supabase:
-- update public.users set role = 'admin' where username = 'MrDarko';
