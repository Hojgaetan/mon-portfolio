-- Script de récupération complète CORRIGÉ pour restaurer toutes les tables
-- À exécuter dans Supabase SQL Editor en une seule fois

-- 1. Créer la fonction update_updated_at_column (nécessaire pour les triggers)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Créer la table projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    project_url TEXT,
    github_url TEXT,
    prototype_url TEXT,
    planning_url TEXT,
    design_url TEXT,
    analysis_url TEXT,
    technologies TEXT[],
    category TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    slug TEXT UNIQUE,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer la table categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Ajouter category_id à blog_posts si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'blog_posts' AND column_name = 'category_id') THEN
        ALTER TABLE public.blog_posts
        ADD COLUMN category_id UUID REFERENCES public.categories(id);
    END IF;
END $$;

-- 6. Créer les tables d'interactions d'articles
CREATE TABLE IF NOT EXISTS public.article_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.article_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, ip_address)
);

CREATE TABLE IF NOT EXISTS public.article_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.article_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Créer la table about_sections
CREATE TABLE IF NOT EXISTS public.about_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_type TEXT NOT NULL,
    section_key TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    icon_name TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_type, section_key)
);

-- 8. Créer la table contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    replied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- 9. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_article_id ON public.article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON public.article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_approved ON public.article_comments(approved);
CREATE INDEX IF NOT EXISTS idx_article_shares_article_id ON public.article_shares(article_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages(read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_replied ON public.contact_messages(replied);

-- 10. Créer les triggers pour updated_at (syntaxe corrigée)
DO $$
BEGIN
    -- Trigger pour projects
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at
            BEFORE UPDATE ON public.projects
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Trigger pour blog_posts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_blog_posts_updated_at') THEN
        CREATE TRIGGER update_blog_posts_updated_at
            BEFORE UPDATE ON public.blog_posts
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Trigger pour about_sections
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_about_sections_updated_at') THEN
        CREATE TRIGGER update_about_sections_updated_at
            BEFORE UPDATE ON public.about_sections
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Trigger pour contact_messages
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contact_messages_updated_at') THEN
        CREATE TRIGGER update_contact_messages_updated_at
            BEFORE UPDATE ON public.contact_messages
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Trigger pour article_comments
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_article_comments_updated_at') THEN
        CREATE TRIGGER update_article_comments_updated_at
            BEFORE UPDATE ON public.article_comments
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 11. Activer RLS (Row Level Security) sur toutes les tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 12. Créer les politiques de sécurité
DO $$
BEGIN
    -- Projets : lecture publique, modification authentifiée
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Projects are publicly readable') THEN
        CREATE POLICY "Projects are publicly readable" ON public.projects FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can manage projects') THEN
        CREATE POLICY "Authenticated users can manage projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Blog posts : lecture publique des publiés, modification authentifiée
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Published blog posts are publicly readable') THEN
        CREATE POLICY "Published blog posts are publicly readable" ON public.blog_posts FOR SELECT USING (published = true OR auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can manage blog posts') THEN
        CREATE POLICY "Authenticated users can manage blog posts" ON public.blog_posts FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Catégories : lecture publique, modification authentifiée
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Categories are publicly readable') THEN
        CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can manage categories') THEN
        CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Messages de contact : insertion publique, lecture/modification authentifiée
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can send contact messages') THEN
        CREATE POLICY "Anyone can send contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read contact messages') THEN
        CREATE POLICY "Authenticated users can read contact messages" ON public.contact_messages FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update contact messages') THEN
        CREATE POLICY "Authenticated users can update contact messages" ON public.contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete contact messages') THEN
        CREATE POLICY "Authenticated users can delete contact messages" ON public.contact_messages FOR DELETE USING (auth.role() = 'authenticated');
    END IF;

    -- About sections : lecture publique des actives, modification authentifiée
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Active about sections are publicly readable') THEN
        CREATE POLICY "Active about sections are publicly readable" ON public.about_sections FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can manage about sections') THEN
        CREATE POLICY "Authenticated users can manage about sections" ON public.about_sections FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Interactions d'articles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view articles') THEN
        CREATE POLICY "Anyone can view articles" ON public.article_views FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can like articles') THEN
        CREATE POLICY "Anyone can like articles" ON public.article_likes FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can comment on articles') THEN
        CREATE POLICY "Anyone can comment on articles" ON public.article_comments FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can share articles') THEN
        CREATE POLICY "Anyone can share articles" ON public.article_shares FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 13. Insérer les données par défaut pour about_sections
INSERT INTO public.about_sections (section_type, section_key, title, content, icon_name, order_index) VALUES
-- Personal information
('info', 'bio', 'Bio', '{"lines": [{"type": "text", "text": "Passionné par le développement web et l''expérience utilisateur, je suis Developpeur web dans la création de sites internet et d''applications web responsives."}, {"type": "text", "text": "Ma maîtrise des technologies HTML, CSS et JavaScript, combinée à une connaissance approfondie des frameworks modernes, me permet de transformer des maquettes graphiques en interfaces web performantes et esthétiques."}, {"type": "text", "text": "Toujours à l''affût des dernières tendances et des meilleures pratiques en matière de développement web."}]}', 'FileText', 1),
('info', 'centres-d_intérêts', 'Centres d''intérêts', '{"lines": [{"type": "text", "text": "- Programmation"}, {"type": "text", "text": "- Musique"}, {"type": "text", "text": "- Lecture"}, {"type": "text", "text": "- Sport"}]}', 'FileMusic', 2),

-- Education
('education', 'lycée/collège', 'Lycée / Collège', '{"lines": [{"type": "text", "text": "- Lycée d''Akwa Nord - Douala, Cameroun (2007 - 2010)"}, {"type": "text", "text": "- Lycée de Nkolnda, Nsimalen - Yaounde, Cameroun (2010 - 2011)"}, {"type": "text", "text": "- College Ndi Samba - Yaounde, Cameroun (2011 - 2013)"}, {"type": "text", "text": "- Lycée de Nkolndongo - Yaounde, Cameroun (2013 - 2015)"}, {"type": "text", "text": "- Lycée d''Akwa Nord - Douala, Cameroun (2015 - 2017) - Baccalaureat"}]}', 'FileStack', 1),
('education', 'université', 'Université', '{"lines": [{"type": "text", "text": "- Université de Douala, Cameroun (Mathematiques)"}, {"type": "text", "text": "- IUT de Douala, Cameroun (Genie Electrique et Informatique Industrielle)"}, {"type": "text", "text": "- ISM Dakar, Senegal (En cours)"}]}', 'FileBarChart2', 2),

-- Experience
('experience', 'dev-web-seo', 'Developpeur Web / Responsable SEO', '{"company": "MAJORANTS Academy", "description": "Entreprise specialise dans la preparation de concours Nationaux au Cameroun", "period": "Stage pre-Emploi | Douala, Cameroun | Juin 2023 - Août 2023 | CDD", "tasks": [{"type": "highlight", "text": "Maintenance et optimisation du site web : "}, {"type": "text", "text": "Mise à jour régulière du contenu et des plugins WordPress pour garantir une disponibilité à 99,9%."}, {"type": "highlight", "text": "Stratégie SEO et visibilité : "}, {"type": "text", "text": "Audit technique et optimisation des balises meta/titles (+50% de clics organiques en 02 mois)."}, {"type": "highlight", "text": "Collaboration cross-fonctionnelle : "}, {"type": "text", "text": "Refonte de l''UI/UX avec le designer (Figma), réduisant le taux de rebond de 30%."}, {"type": "highlight", "text": "Projets techniques : "}, {"type": "text", "text": "Migration du site vers un hébergement plus performant (Hostinger), diminuant le temps de chargement de 2,5s à 0,8s."}, {"type": "text", "text": "Intégration de maquettes responsive pour mobile, augmentant le trafic mobile de 40%."}]}', 'FileText', 1),
('experience', 'responsable-informatique', 'Responsable Informatique', '{"company": "MAJORANTS Academy", "description": "Entreprise specialise dans la preparation de concours Nationaux au Cameroun", "period": "Travail a distance | Douala, Cameroun | Depuis Septembre 2023 | CDD", "tasks": [{"type": "highlight", "text": "Management d''équipe à distance : "}, {"type": "text", "text": "Encadrement d''un developpeur en interne en mode remote"}, {"type": "highlight", "text": "Innovation et transformation digitale : "}, {"type": "text", "text": "Déploiement d''outils collaboratifs (Trello) pour améliorer la productivité en télétravail."}]}', 'FileText', 2)
ON CONFLICT (section_type, section_key) DO NOTHING;

-- 14. Insérer quelques catégories par défaut
INSERT INTO public.categories (name, slug, description, color) VALUES
('Développement Web', 'developpement-web', 'Articles sur le développement web et les technologies frontend/backend', '#3B82F6'),
('JavaScript', 'javascript', 'Tutoriels et articles sur JavaScript et ses frameworks', '#F59E0B'),
('Design', 'design', 'Articles sur le design UI/UX et les bonnes pratiques', '#8B5CF6'),
('Outils', 'outils', 'Présentation d''outils et de ressources utiles pour les développeurs', '#10B981')
ON CONFLICT (slug) DO NOTHING;

-- Message de confirmation
SELECT 'Toutes les tables ont été recréées avec succès !' as message;
