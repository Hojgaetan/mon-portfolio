-- Ensure ip_address is text for uniqueness
alter table if exists public.article_views
  alter column ip_address type text using ip_address::text;

-- Normalize IP values by removing any CIDR mask (e.g., 1.2.3.4/32 -> 1.2.3.4)
update public.article_views
set ip_address = split_part(ip_address, '/', 1)
where ip_address like '%/%';

-- Deduplicate existing rows by keeping the smallest id per (article_id, ip_address)
delete from public.article_views a
using public.article_views b
where a.article_id = b.article_id
  and coalesce(a.ip_address, '') = coalesce(b.ip_address, '')
  and a.id > b.id;

-- Unique index to deduplicate views by article + IP
create unique index if not exists article_views_unique_article_ip
  on public.article_views (article_id, ip_address);

-- Admin policies for comments (allow admins to see all and manage)
-- Enable RLS already enabled in previous migrations
-- Grant select for admins on all comments
drop policy if exists "comments_admin_select_all" on public.article_comments;
create policy "comments_admin_select_all"
  on public.article_comments
  for select to authenticated
  using (
    exists (select 1 from public.admins a where a.user_id = auth.uid())
  );

-- Allow admins to update any comment (approve/unapprove)
drop policy if exists "comments_admin_update_all" on public.article_comments;
create policy "comments_admin_update_all"
  on public.article_comments
  for update to authenticated
  using (
    exists (select 1 from public.admins a where a.user_id = auth.uid())
  )
  with check (true);

-- Allow admins to delete any comment
drop policy if exists "comments_admin_delete_all" on public.article_comments;
create policy "comments_admin_delete_all"
  on public.article_comments
  for delete to authenticated
  using (
    exists (select 1 from public.admins a where a.user_id = auth.uid())
  );
