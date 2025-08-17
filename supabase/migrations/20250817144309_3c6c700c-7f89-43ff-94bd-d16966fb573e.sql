-- Create categorie table first (referenced by entreprise)
CREATE TABLE public.categorie (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entreprise table with foreign key to categorie
CREATE TABLE public.entreprise (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  site_web TEXT,
  site_web_valide BOOLEAN DEFAULT false,
  categorie_id UUID REFERENCES public.categorie(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categorie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entreprise ENABLE ROW LEVEL SECURITY;

-- Create policies for categorie table
CREATE POLICY "Categories are publicly readable" 
ON public.categorie 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage categories" 
ON public.categorie 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create policies for entreprise table
CREATE POLICY "Entreprises are publicly readable" 
ON public.entreprise 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage entreprises" 
ON public.entreprise 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create trigger for automatic timestamp updates on entreprise
CREATE TRIGGER update_entreprise_updated_at
BEFORE UPDATE ON public.entreprise
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();