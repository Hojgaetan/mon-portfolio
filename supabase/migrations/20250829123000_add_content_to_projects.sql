-- Ajoute une colonne de contenu riche aux projets
alter table if exists public.projects
add column if not exists content text;

-- Optionnel: index sur le slug si non présent
create index if not exists projects_slug_idx on public.projects (slug);

