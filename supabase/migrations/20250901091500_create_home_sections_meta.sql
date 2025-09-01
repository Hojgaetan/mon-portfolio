-- Métadonnées d'en-tête pour sections d'accueil (badge/titre/sous-titre)
CREATE TABLE IF NOT EXISTS public.home_sections_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL CHECK (section_key IN ('cursus','certifications')),
  locale TEXT NOT NULL CHECK (locale IN ('fr','en')),
  badge TEXT,
  title TEXT,
  subtitle TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (section_key, locale)
);

ALTER TABLE public.home_sections_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active home metas" ON public.home_sections_meta;
CREATE POLICY "Public can read active home metas"
ON public.home_sections_meta
FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can read all home metas" ON public.home_sections_meta;
CREATE POLICY "Admins can read all home metas"
ON public.home_sections_meta
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert home metas" ON public.home_sections_meta;
CREATE POLICY "Admins can insert home metas"
ON public.home_sections_meta
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update home metas" ON public.home_sections_meta;
CREATE POLICY "Admins can update home metas"
ON public.home_sections_meta
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete home metas" ON public.home_sections_meta;
CREATE POLICY "Admins can delete home metas"
ON public.home_sections_meta
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

-- trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at_home_sections_meta ON public.home_sections_meta;
CREATE TRIGGER trg_set_updated_at_home_sections_meta
BEFORE UPDATE ON public.home_sections_meta
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

