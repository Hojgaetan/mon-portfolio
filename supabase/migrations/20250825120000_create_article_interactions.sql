-- Create required extension for UUID generation
create extension if not exists pgcrypto;

-- Likes table
create table if not exists public.article_likes (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  client_id text not null,
  ip_address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Retrofit columns if table already existed without new fields
alter table public.article_likes add column if not exists client_id text;
alter table public.article_likes add column if not exists ip_address text;
alter table public.article_likes add column if not exists active boolean not null default true;
alter table public.article_likes add column if not exists created_at timestamptz not null default now();
alter table public.article_likes add column if not exists updated_at timestamptz not null default now();

-- Ensure one like per client per article
create unique index if not exists article_likes_unique_client on public.article_likes (article_id, client_id);
create index if not exists article_likes_article_active_idx on public.article_likes (article_id, active);

-- Shares table
create table if not exists public.article_shares (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  client_id text,
  ip_address text,
  platform text not null check (platform in ('twitter','linkedin','facebook','link')),
  created_at timestamptz not null default now()
);
-- Retrofit columns if table already existed without new fields
alter table public.article_shares add column if not exists client_id text;
alter table public.article_shares add column if not exists ip_address text;
alter table public.article_shares add column if not exists platform text;
alter table public.article_shares add column if not exists created_at timestamptz not null default now();

create index if not exists article_shares_article_idx on public.article_shares (article_id);

-- Comments table
create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  author_name text not null,
  author_email text not null,
  content text not null,
  approved boolean not null default false,
  client_id text,
  ip_address text,
  created_at timestamptz not null default now()
);
-- Retrofit columns if table already existed without new fields
alter table public.article_comments add column if not exists approved boolean not null default false;
alter table public.article_comments add column if not exists client_id text;
alter table public.article_comments add column if not exists ip_address text;
alter table public.article_comments add column if not exists created_at timestamptz not null default now();

create index if not exists article_comments_article_idx on public.article_comments (article_id);
create index if not exists article_comments_approved_idx on public.article_comments (approved);

-- RLS
alter table public.article_likes enable row level security;
alter table public.article_shares enable row level security;
alter table public.article_comments enable row level security;

-- Policies for likes
drop policy if exists "likes_select_all" on public.article_likes;
drop policy if exists "likes_insert_all" on public.article_likes;
drop policy if exists "likes_update_all" on public.article_likes;
create policy "likes_select_all" on public.article_likes for select using (true);
create policy "likes_insert_all" on public.article_likes for insert with check (true);
create policy "likes_update_all" on public.article_likes for update using (true) with check (true);

-- Policies for shares
drop policy if exists "shares_select_all" on public.article_shares;
drop policy if exists "shares_insert_all" on public.article_shares;
create policy "shares_select_all" on public.article_shares for select using (true);
create policy "shares_insert_all" on public.article_shares for insert with check (true);

-- Policies for comments
drop policy if exists "comments_select_only_approved" on public.article_comments;
drop policy if exists "comments_insert_all" on public.article_comments;
create policy "comments_select_only_approved" on public.article_comments for select using (approved = true);
create policy "comments_insert_all" on public.article_comments for insert with check (
  length(trim(content)) > 0 and length(trim(author_name)) > 0 and position('@' in author_email) > 1
);

-- Trigger to keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_article_likes_updated_at on public.article_likes;
create trigger trg_article_likes_updated_at
before update on public.article_likes
for each row
execute function public.set_updated_at();
