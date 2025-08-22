-- Créer la table d'accès temporaire (pass d'accès)
CREATE TABLE IF NOT EXISTS public.access_pass (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.access_pass ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les pass: un utilisateur ne voit que ses pass et peut créer le sien
DROP POLICY IF EXISTS "Users can read own access_pass" ON public.access_pass;
CREATE POLICY "Users can read own access_pass"
ON public.access_pass
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own access_pass" ON public.access_pass;
CREATE POLICY "Users can insert own access_pass"
ON public.access_pass
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Table des administrateurs (pour bypass et gestion)
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire la liste des admins (nécessaire pour les sous-requêtes en RLS)
DROP POLICY IF EXISTS "Public can read admins" ON public.admins;
CREATE POLICY "Public can read admins"
ON public.admins
FOR SELECT
USING (true);

-- Seul service_role peut modifier la table admins (via SQL Editor / backend)
DROP POLICY IF EXISTS "Service role can modify admins" ON public.admins;
CREATE POLICY "Service role can modify admins"
ON public.admins
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Restreindre l'accès public aux entreprises: supprimer la lecture publique si elle existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'entreprise' AND policyname = 'Entreprises are publicly readable'
  ) THEN
    EXECUTE 'DROP POLICY "Entreprises are publicly readable" ON public.entreprise';
  END IF;
END $$;

-- Adapter la politique de gestion: s'assurer que SELECT est contrôlé par le pass et que insert/update/delete restent aux authentifiés
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'entreprise' AND policyname = 'Authenticated users can manage entreprises'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage entreprises" ON public.entreprise';
  END IF;
END $$;

-- Remplacer la politique de lecture: pass actif OU admin
DROP POLICY IF EXISTS "Users with active pass can read entreprises" ON public.entreprise;
CREATE POLICY "Users with active pass or admin can read entreprises"
ON public.entreprise
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

-- Écriture réservée aux admins
DROP POLICY IF EXISTS "Authenticated can insert entreprises" ON public.entreprise;
DROP POLICY IF EXISTS "Authenticated can update entreprises" ON public.entreprise;
DROP POLICY IF EXISTS "Authenticated can delete entreprises" ON public.entreprise;

CREATE POLICY "Admins can insert entreprises"
ON public.entreprise
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'::text AND EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update entreprises"
ON public.entreprise
FOR UPDATE
USING (
  auth.role() = 'authenticated'::text AND EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.role() = 'authenticated'::text AND EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete entreprises"
ON public.entreprise
FOR DELETE
USING (
  auth.role() = 'authenticated'::text AND EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  )
);
