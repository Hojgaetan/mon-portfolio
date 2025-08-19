-- Update access_pass RLS to allow admins to manage passes and add FK for profile embedding

-- Ensure RLS is enabled (harmless if already enabled)
ALTER TABLE public.access_pass ENABLE ROW LEVEL SECURITY;

-- Admins can read all access passes
DROP POLICY IF EXISTS "Admins can read all access_pass" ON public.access_pass;
CREATE POLICY "Admins can read all access_pass"
ON public.access_pass
FOR SELECT
USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  )
);

-- Admins can insert access passes for any user
DROP POLICY IF EXISTS "Admins can insert access_pass" ON public.access_pass;
CREATE POLICY "Admins can insert access_pass"
ON public.access_pass
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  )
);

-- Admins can update any access pass (e.g., revoke/expire)
DROP POLICY IF EXISTS "Admins can update access_pass" ON public.access_pass;
CREATE POLICY "Admins can update access_pass"
ON public.access_pass
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  )
);

-- Users can update their own access pass (e.g., self-revoke)
DROP POLICY IF EXISTS "Users can update own access_pass" ON public.access_pass;
CREATE POLICY "Users can update own access_pass"
ON public.access_pass
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: Admins can delete access passes
DROP POLICY IF EXISTS "Admins can delete access_pass" ON public.access_pass;
CREATE POLICY "Admins can delete access_pass"
ON public.access_pass
FOR DELETE
USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  )
);

-- Add a FK to profiles for PostgREST embedding (access_pass -> profiles by user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'access_pass'
      AND tc.constraint_name = 'access_pass_user_id_fkey_profiles'
  ) THEN
    ALTER TABLE public.access_pass
      ADD CONSTRAINT access_pass_user_id_fkey_profiles
      FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END$$;

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS access_pass_user_status_expires_idx
  ON public.access_pass (user_id, status, expires_at);
