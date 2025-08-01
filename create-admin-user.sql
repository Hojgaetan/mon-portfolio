-- Script pour créer un utilisateur administrateur directement
-- À exécuter dans Supabase SQL Editor après avoir exécuté le script de récupération

-- Créer un utilisateur dans la table auth.users
-- Remplacez 'your-email@example.com' par votre vraie adresse email
-- Remplacez 'your-secure-password' par votre mot de passe souhaité

INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'contact@joelhassam.com', -- Remplacez par votre email
    crypt('58z8)rL(a&!8HqV!', gen_salt('bf')), -- Remplacez par votre mot de passe
    now(),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false
);

-- Créer une identité correspondante
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'contact@joelhassam.com'), -- Même email qu'au-dessus
    jsonb_build_object(
        'sub', (SELECT id FROM auth.users WHERE email = 'contact@joelhassam.com')::text,
        'email', 'contact@joelhassam.com'
    ),
    'email',
    now(),
    now()
);

-- Message de confirmation
SELECT 'Utilisateur administrateur créé avec succès !' as message,
       'Email: contact@joelhassam.com' as email,
       'Mot de passe: VotreMotDePasse123!' as password;
