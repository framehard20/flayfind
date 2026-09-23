-- Flayfind admin panel — run once in the Supabase SQL editor.
-- Creates the two tables and the public bucket for outfit photos.

create extension if not exists "pgcrypto";

create table if not exists public.outfits (
  id           uuid primary key default gen_random_uuid(),
  seccion      text not null default 'outfits' check (seccion in ('outfits', 'seguidores')),
  nombre       text not null,
  genero       text not null check (genero in ('hombre', 'mujer', 'ambos')),
  temporada    text not null check (temporada in ('invierno', 'verano')),
  categoria    text not null check (categoria in ('gym', 'elegante', 'streetwear', 'tech')),
  foto         text not null default '',
  precio_marca numeric not null default 0,
  prendas      jsonb not null default '[]'::jsonb,
  autor        text,          -- followers' section only
  instagram    text,          -- followers' section only
  posicion     int,           -- followers' section only: 1 = winner
  visible      boolean not null default true,
  orden        int not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists outfits_seccion_idx on public.outfits (seccion, visible, orden);

-- Styles created from the panel. The four built-in ones (gym, elegante,
-- streetwear, tech) live in the code and are translated; these are extra and
-- show with the name you type. Adding them means the column can't be a fixed
-- list any more:
alter table public.outfits drop constraint if exists outfits_categoria_check;

-- Accessories moved from being a section of their own to a subsection inside
-- Hombre and Mujer, so an outfit's section can now also be 'ambos' (it shows
-- in both). The old 'tech' rows become 'ambos'; their categoria stays 'tech',
-- which is what marks them as accessories.
alter table public.outfits drop constraint if exists outfits_genero_check;
update public.outfits set genero = 'ambos' where genero = 'tech';
alter table public.outfits
  add constraint outfits_genero_check check (genero in ('hombre', 'mujer', 'ambos'));

create table if not exists public.categorias (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  nombre       text not null,
  generos      text[] not null default '{hombre,mujer}',  -- where the chip shows
  traducciones jsonb  not null default '{}'::jsonb,       -- {"en":"Puffers", ...}
  orden        int not null default 0,
  created_at   timestamptz not null default now()
);

-- added later: safe to re-run on an existing table
alter table public.categorias add column if not exists generos text[] not null default '{hombre,mujer}';
alter table public.categorias add column if not exists traducciones jsonb not null default '{}'::jsonb;

alter table public.categorias enable row level security;

create table if not exists public.submissions (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  outfit_nombre   text not null default '',
  instagram       text not null,
  email           text not null,
  idea            text not null default '',
  novedades       boolean not null default false,
  hipobuy_usuario text not null default '',
  registrado      boolean not null default false,
  estado          text not null default 'nuevo' check (estado in ('nuevo', 'leido', 'aprobado', 'descartado')),
  created_at      timestamptz not null default now()
);

-- added later: safe to re-run on an existing table
alter table public.submissions add column if not exists outfit_nombre text not null default '';

create index if not exists submissions_created_idx on public.submissions (created_at desc);

-- The site talks to these tables only through the server with the service-role
-- key, so no anon access is granted: row level security with no policies
-- blocks everything else.
alter table public.outfits enable row level security;
alter table public.submissions enable row level security;

-- Public bucket for the photos uploaded from the panel.
insert into storage.buckets (id, name, public)
values ('outfits', 'outfits', true)
on conflict (id) do update set public = true;
