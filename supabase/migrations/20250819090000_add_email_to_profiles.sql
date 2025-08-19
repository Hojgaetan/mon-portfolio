-- Add email column to profiles and an index for faster lookup
alter table if exists public.profiles
  add column if not exists email text;

create index if not exists profiles_email_idx on public.profiles (email);
