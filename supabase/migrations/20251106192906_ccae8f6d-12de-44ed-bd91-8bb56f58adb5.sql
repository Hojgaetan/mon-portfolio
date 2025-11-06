-- Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = $1
  );
$$;

-- Fix contact_messages exposure: Restrict to admins only
DROP POLICY IF EXISTS "Allow authenticated read" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON contact_messages;

CREATE POLICY "Admins can read contact messages" ON contact_messages
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix admin roles disclosure: Restrict to admins only
DROP POLICY IF EXISTS "Public can read admins" ON admins;

CREATE POLICY "Admins can read admin list" ON admins
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));