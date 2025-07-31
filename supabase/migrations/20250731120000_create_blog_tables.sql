-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add category_id to blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- Create article interactions tables
CREATE TABLE IF NOT EXISTS public.article_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_ip TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.article_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_ip TEXT,
  liked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_ip)
);

CREATE TABLE IF NOT EXISTS public.article_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.article_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Categories are publicly readable"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Article views are publicly readable"
ON public.article_views
FOR SELECT
USING (true);

CREATE POLICY "Article likes are publicly readable"
ON public.article_likes
FOR SELECT
USING (true);

CREATE POLICY "Approved comments are publicly readable"
ON public.article_comments
FOR SELECT
USING (approved = true);

CREATE POLICY "Article shares are publicly readable"
ON public.article_shares
FOR SELECT
USING (true);

-- Allow public inserts for interactions
CREATE POLICY "Anyone can view articles"
ON public.article_views
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can like articles"
ON public.article_likes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can comment on articles"
ON public.article_comments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can share articles"
ON public.article_shares
FOR INSERT
WITH CHECK (true);

-- Insert some default categories
INSERT INTO public.categories (name, slug, description, color) VALUES
('Développement Web', 'developpement-web', 'Articles sur le développement web moderne', '#3B82F6'),
('Data Science', 'data-science', 'Analyses de données et visualisations', '#10B981'),
('Intelligence Artificielle', 'intelligence-artificielle', 'IA et machine learning', '#8B5CF6'),
('Tutoriels', 'tutoriels', 'Guides et tutoriels pratiques', '#F59E0B')
ON CONFLICT (slug) DO NOTHING;
