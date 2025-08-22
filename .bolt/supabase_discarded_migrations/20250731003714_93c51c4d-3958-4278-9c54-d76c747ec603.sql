-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, color) VALUES
  ('Web Development', 'web', 'Développement web et technologies frontend/backend', '#3B82F6'),
  ('Data Science', 'data', 'Analyse de données et visualisation', '#10B981'),
  ('Intelligence Artificielle', 'ia', 'IA générative et applications pratiques', '#8B5CF6'),
  ('Machine Learning', 'machine-learning', 'Algorithmes et modèles d''apprentissage automatique', '#F59E0B');

-- Add category_id to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Create article_views table
CREATE TABLE public.article_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create article_likes table  
CREATE TABLE public.article_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, ip_address)
);

-- Create article_shares table
CREATE TABLE public.article_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'facebook', etc.
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create article_comments table
CREATE TABLE public.article_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  ip_address INET,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, auth write)
CREATE POLICY "Categories are publicly readable" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" 
ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for views (public can add views, auth can read all)
CREATE POLICY "Anyone can add article views" 
ON public.article_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read article views" 
ON public.article_views FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for likes (public can like, auth can manage)
CREATE POLICY "Anyone can like articles" 
ON public.article_likes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read article likes" 
ON public.article_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage likes" 
ON public.article_likes FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for shares (public can share, auth can read)
CREATE POLICY "Anyone can share articles" 
ON public.article_shares FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read article shares" 
ON public.article_shares FOR SELECT USING (true);

-- RLS Policies for comments (public can comment, auth can manage)
CREATE POLICY "Anyone can add comments" 
ON public.article_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read approved comments" 
ON public.article_comments FOR SELECT USING (approved = true);

CREATE POLICY "Authenticated users can manage all comments" 
ON public.article_comments FOR ALL USING (auth.role() = 'authenticated');

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_comments_updated_at
  BEFORE UPDATE ON public.article_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX idx_article_likes_article_id ON public.article_likes(article_id);
CREATE INDEX idx_article_shares_article_id ON public.article_shares(article_id);
CREATE INDEX idx_article_comments_article_id ON public.article_comments(article_id);
CREATE INDEX idx_article_comments_approved ON public.article_comments(approved);