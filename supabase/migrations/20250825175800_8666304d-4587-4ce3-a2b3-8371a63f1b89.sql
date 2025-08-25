-- Créer une table pour les réactions aux commentaires
CREATE TABLE public.comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  client_id TEXT,
  ip_address INET,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_client_ip ON public.comment_reactions(client_id, ip_address);

-- Contrainte unique pour éviter les doublons
CREATE UNIQUE INDEX idx_comment_reactions_unique ON public.comment_reactions(comment_id, COALESCE(client_id, ip_address::text));

-- Activer RLS
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Anyone can react to comments" 
ON public.comment_reactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read comment reactions" 
ON public.comment_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update their own reactions" 
ON public.comment_reactions 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_comment_reactions_updated_at
BEFORE UPDATE ON public.comment_reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();