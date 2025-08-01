-- Script SQL à exécuter directement dans Supabase SQL Editor
-- Pour créer la table contact_messages si elle n'existe pas

-- Vérifier si la table existe déjà
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_messages') THEN
        -- Créer la table contact_messages
        CREATE TABLE public.contact_messages (
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

        -- Créer les index
        CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
        CREATE INDEX idx_contact_messages_read ON public.contact_messages(read);
        CREATE INDEX idx_contact_messages_replied ON public.contact_messages(replied);

        -- Activer RLS
        ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

        -- Politique pour permettre l'insertion à tous (formulaire public)
        CREATE POLICY "Allow public insert" ON public.contact_messages
            FOR INSERT
            WITH CHECK (true);

        -- Politique pour permettre la lecture aux utilisateurs authentifiés uniquement
        CREATE POLICY "Allow authenticated read" ON public.contact_messages
            FOR SELECT
            USING (auth.role() = 'authenticated');

        -- Politique pour permettre la mise à jour aux utilisateurs authentifiés uniquement
        CREATE POLICY "Allow authenticated update" ON public.contact_messages
            FOR UPDATE
            USING (auth.role() = 'authenticated');

        -- Politique pour permettre la suppression aux utilisateurs authentifiés uniquement
        CREATE POLICY "Allow authenticated delete" ON public.contact_messages
            FOR DELETE
            USING (auth.role() = 'authenticated');

        RAISE NOTICE 'Table contact_messages créée avec succès !';
    ELSE
        RAISE NOTICE 'Table contact_messages existe déjà.';
    END IF;
END $$;
