-- Corriger les politiques RLS pour article_views pour permettre la lecture et éviter les violations
-- Permettre à tout le monde de voir les vues d'articles (pour les statistiques)
CREATE POLICY "Anyone can read article views" 
ON public.article_views 
FOR SELECT 
USING (true);

-- Permettre la mise à jour des vues existantes (pour l'upsert)
CREATE POLICY "Anyone can update article views" 
ON public.article_views 
FOR UPDATE 
USING (true);