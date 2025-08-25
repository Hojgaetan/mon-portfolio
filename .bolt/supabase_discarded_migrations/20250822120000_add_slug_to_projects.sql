-- Migration: add slug to projects
-- Date: 2025-08-22

-- Ajouter la colonne slug si elle n'existe pas
alter table if exists public.projects
  add column if not exists slug text;

-- Créer un index unique sur slug (plusieurs NULL autorisés par défaut)
create unique index if not exists projects_slug_idx on public.projects (slug);

-- Optionnel: vous pouvez pré-remplir slug à partir des titres existants côté application/admin.
-- Éviter de tenter un slugify SQL ici pour ne pas dépendre d'extensions (unaccent, etc.).

