-- Create table for about section data
CREATE TABLE public.about_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL, -- 'info', 'education', 'experience'
  section_key TEXT NOT NULL, -- unique identifier for the section
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- flexible content structure
  icon_name TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section_type, section_key)
);

-- Enable Row Level Security
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "About sections are publicly readable" 
ON public.about_sections 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage about sections" 
ON public.about_sections 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_about_sections_updated_at
BEFORE UPDATE ON public.about_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data for the about section
INSERT INTO public.about_sections (section_type, section_key, title, content, icon_name, order_index) VALUES
-- Personal information
('info', 'bio', 'Bio', '{"lines": [{"type": "text", "text": " "}, {"type": "text", "text": " Passionné par le développement web et l''expérience utilisateur,"}, {"type": "text", "text": " je suis Developpeur web dans la création de sites internet et d''applications web responsives."}, {"type": "text", "text": " Ma maîtrise des technologies HTML, CSS et JavaScript, combinée à une connaissance approfondie des frameworks modernes,"}, {"type": "text", "text": " me permet de transformer des maquettes graphiques en interfaces web performantes et esthétiques."}, {"type": "text", "text": " Toujours à l''affût des dernières tendances et des meilleures pratiques en matière."}]}', 'FileText', 1),
('info', 'centres-d_intérêts', 'Centres d''intérêts', '{"lines": [{"type": "text", "text": "- Programmation"}, {"type": "text", "text": "- Musique"}, {"type": "text", "text": "- Lecture"}, {"type": "text", "text": "- Sport"}]}', 'FileMusic', 2),

-- Education
('education', 'lycée/collège', 'Lycée / Collège', '{"lines": [{"type": "text", "text": "- Lycée d''Akwa Nord - Douala, Cameroun (2007 - 2010)"}, {"type": "text", "text": "- Lycée de Nkolnda, Nsimalen - Yaounde, Cameroun (2010 - 2011)"}, {"type": "text", "text": "- College Ndi Samba - Yaounde, Cameroun (2011 - 2013)"}, {"type": "text", "text": "- Lycée de Nkolndongo - Yaounde, Cameroun (2013 - 2015)"}, {"type": "text", "text": "- Lycée d''Akwa Nord - Douala, Cameroun (2015 - 2017) - Baccalaureat"}]}', 'FileStack', 1),
('education', 'université', 'Université', '{"lines": [{"type": "text", "text": "- Université de Douala, Cameroun (Mathematiques)"}, {"type": "text", "text": "- IUT de Douala, Cameroun (Genie Electrique et Informatique Industrielle)"}, {"type": "text", "text": "- ISM Dakar, Senegal (En cours)"}]}', 'FileBarChart2', 2),

-- Experience
('experience', 'dev-web-seo', 'Developpeur Web / Responsable SEO', '{"company": "MAJORANTS Academy", "description": "Entreprise specialise dans la preparation de concours Nationaux au Cameroun", "period": "Stage pre-Emploi | Douala, Cameroun | Juin 2023 - Août 2023 | CDD", "tasks": [{"type": "highlight", "text": "Maintenance et optimisation du site web : "}, {"type": "text", "text": "Mise à jour régulière du contenu et des plugins WordPress pour garantir une disponibilité à 99,9%."}, {"type": "highlight", "text": "Stratégie SEO et visibilité : "}, {"type": "text", "text": "Audit technique et optimisation des balises meta/titles (+50% de clics organiques en 02 mois)."}, {"type": "highlight", "text": "Collaboration cross-fonctionnelle : "}, {"type": "text", "text": "Refonte de l''UI/UX avec le designer (Figma), réduisant le taux de rebond de 30%."}, {"type": "highlight", "text": "Projets techniques : "}, {"type": "text", "text": "Migration du site vers un hébergement plus performant (Hostinger), diminuant le temps de chargement de 2,5s à 0,8s."}, {"type": "text", "text": "Intégration de maquettes responsive pour mobile, augmentant le trafic mobile de 40%."}]}', 'FileText', 1),
('experience', 'responsable-informatique', 'Responsable Informatique', '{"company": "MAJORANTS Academy", "description": "Entreprise specialise dans la preparation de concours Nationaux au Cameroun", "period": "Travail a distance | Douala, Cameroun | Depuis Septembre 2023 | CDD", "tasks": [{"type": "highlight", "text": "Management d''équipe à distance : "}, {"type": "text", "text": "Encadrement d''un developpeur en interne en mode remote"}, {"type": "highlight", "text": "Innovation et transformation digitale : "}, {"type": "text", "text": "Déploiement d''outils collaboratifs (Trello) pour améliorer la productivité en télétravail."}]}', 'FileText', 2);