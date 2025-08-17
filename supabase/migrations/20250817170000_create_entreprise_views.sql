-- Table des consultations d'entreprises (vues uniques par utilisateur)
CREATE TABLE IF NOT EXISTS public.entreprise_view (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES public.entreprise(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entreprise_id, user_id)
);

-- Index pour accélérer les comptages par entreprise
CREATE INDEX IF NOT EXISTS idx_entreprise_view_entreprise_id ON public.entreprise_view(entreprise_id);

-- Activer RLS
ALTER TABLE public.entreprise_view ENABLE ROW LEVEL SECURITY;

-- Politique: lecture autorisée aux utilisateurs avec pass actif ou admin
DROP POLICY IF EXISTS "Users with pass or admin can read entreprise_view" ON public.entreprise_view;
CREATE POLICY "Users with pass or admin can read entreprise_view"
ON public.entreprise_view
FOR SELECT
USING (
  auth.role() = 'authenticated'::text AND (
    EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.access_pass ap
      WHERE ap.user_id = auth.uid()
        AND ap.status = 'active'
        AND ap.expires_at > now()
    )
  )
);

-- Politique: insertion autorisée (enregistre une vue) si pass actif ou admin, et seulement pour soi
DROP POLICY IF EXISTS "Users can insert own entreprise_view when allowed" ON public.entreprise_view;
CREATE POLICY "Users can insert own entreprise_view when allowed"
ON public.entreprise_view
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'::text AND (
    EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.access_pass ap
      WHERE ap.user_id = auth.uid()
        AND ap.status = 'active'
        AND ap.expires_at > now()
    )
  ) AND user_id = auth.uid()
);

