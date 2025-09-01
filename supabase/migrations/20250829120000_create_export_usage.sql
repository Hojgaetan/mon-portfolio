-- Table de suivi des usages d'export
CREATE TABLE IF NOT EXISTS public.export_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('excel_free')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind)
);

-- Activer RLS
ALTER TABLE public.export_usage ENABLE ROW LEVEL SECURITY;

-- Politique: lecture - utilisateur authentifié peut lire ses propres lignes
DROP POLICY IF EXISTS "Users can read own export_usage" ON public.export_usage;
CREATE POLICY "Users can read own export_usage"
ON public.export_usage
FOR SELECT
USING (
  auth.role() = 'authenticated'::text AND user_id = auth.uid()
);

-- Politique: insertion - utilisateur authentifié peut insérer pour lui-même
DROP POLICY IF EXISTS "Users can insert own export_usage" ON public.export_usage;
CREATE POLICY "Users can insert own export_usage"
ON public.export_usage
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'::text AND user_id = auth.uid()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_export_usage_user_kind ON public.export_usage(user_id, kind);

