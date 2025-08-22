-- Création de la table contact_messages
CREATE TABLE contact_messages (
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

-- Index pour optimiser les requêtes
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_read ON contact_messages(read);
CREATE INDEX idx_contact_messages_replied ON contact_messages(replied);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Permettre la lecture et l'écriture pour les utilisateurs authentifiés
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion à tous (formulaire public)
CREATE POLICY "Allow public insert" ON contact_messages
    FOR INSERT
    WITH CHECK (true);

-- Politique pour permettre la lecture aux utilisateurs authentifiés uniquement
CREATE POLICY "Allow authenticated read" ON contact_messages
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés uniquement
CREATE POLICY "Allow authenticated update" ON contact_messages
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Politique pour permettre la suppression aux utilisateurs authentifiés uniquement
CREATE POLICY "Allow authenticated delete" ON contact_messages
    FOR DELETE
    USING (auth.role() = 'authenticated');
