-- Tables pour gérer le Cursus et les Certifications (avec i18n par locale)

-- Table Cursus (1 enregistrement par locale)
CREATE TABLE IF NOT EXISTS public.education_cursus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL CHECK (locale IN ('fr','en')),
  program TEXT NOT NULL,
  institution TEXT NOT NULL,
  year_label TEXT NOT NULL,
  status_label TEXT NOT NULL,
  specialization_title TEXT NOT NULL,
  specialization_desc TEXT NOT NULL,
  graduation_title TEXT NOT NULL,
  graduation_date TEXT NOT NULL,
  courses JSONB NOT NULL DEFAULT '[]'::jsonb, -- tableau de chaînes
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (locale)
);

CREATE INDEX IF NOT EXISTS idx_education_cursus_locale ON public.education_cursus(locale);

-- Table Certifications (plusieurs enregistrements par locale)
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL CHECK (locale IN ('fr','en')),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  progress TEXT,
  expected TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certifications_locale ON public.certifications(locale);
CREATE INDEX IF NOT EXISTS idx_certifications_order ON public.certifications(order_index);

-- Table Compétences liées aux certifications (facultatif, pour la carte de droite)
CREATE TABLE IF NOT EXISTS public.certification_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL CHECK (locale IN ('fr','en')),
  label TEXT NOT NULL,
  icon TEXT,          -- ex: emoji ou nom d'icône
  color_class TEXT,   -- ex: classes Tailwind
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certification_skills_locale ON public.certification_skills(locale);
CREATE INDEX IF NOT EXISTS idx_certification_skills_order ON public.certification_skills(order_index);

-- RLS et politiques
ALTER TABLE public.education_cursus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_skills ENABLE ROW LEVEL SECURITY;

-- Helper pour vérifier si l'utilisateur est admin
-- Politiques de lecture: public peut lire les éléments actifs; admins peuvent tout lire

-- education_cursus
DROP POLICY IF EXISTS "Public can read active cursus" ON public.education_cursus;
CREATE POLICY "Public can read active cursus"
ON public.education_cursus
FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can read all cursus" ON public.education_cursus;
CREATE POLICY "Admins can read all cursus"
ON public.education_cursus
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can upsert cursus" ON public.education_cursus;
CREATE POLICY "Admins can upsert cursus"
ON public.education_cursus
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can update cursus" ON public.education_cursus;
CREATE POLICY "Admins can update cursus"
ON public.education_cursus
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can delete cursus" ON public.education_cursus;
CREATE POLICY "Admins can delete cursus"
ON public.education_cursus
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

-- certifications
DROP POLICY IF EXISTS "Public can read active certifications" ON public.certifications;
CREATE POLICY "Public can read active certifications"
ON public.certifications
FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can read all certifications" ON public.certifications;
CREATE POLICY "Admins can read all certifications"
ON public.certifications
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can insert certifications" ON public.certifications;
CREATE POLICY "Admins can insert certifications"
ON public.certifications
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can update certifications" ON public.certifications;
CREATE POLICY "Admins can update certifications"
ON public.certifications
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can delete certifications" ON public.certifications;
CREATE POLICY "Admins can delete certifications"
ON public.certifications
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

-- certification_skills
DROP POLICY IF EXISTS "Public can read active cert skills" ON public.certification_skills;
CREATE POLICY "Public can read active cert skills"
ON public.certification_skills
FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can read all cert skills" ON public.certification_skills;
CREATE POLICY "Admins can read all cert skills"
ON public.certification_skills
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can insert cert skills" ON public.certification_skills;
CREATE POLICY "Admins can insert cert skills"
ON public.certification_skills
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can update cert skills" ON public.certification_skills;
CREATE POLICY "Admins can update cert skills"
ON public.certification_skills
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can delete cert skills" ON public.certification_skills;
CREATE POLICY "Admins can delete cert skills"
ON public.certification_skills
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
));

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at_cursus ON public.education_cursus;
CREATE TRIGGER trg_set_updated_at_cursus
BEFORE UPDATE ON public.education_cursus
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_certifications ON public.certifications;
CREATE TRIGGER trg_set_updated_at_certifications
BEFORE UPDATE ON public.certifications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_cert_skills ON public.certification_skills;
CREATE TRIGGER trg_set_updated_at_cert_skills
BEFORE UPDATE ON public.certification_skills
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

