# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ae41e432-6ed1-4ddc-9913-5993d6ae5a61

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ae41e432-6ed1-4ddc-9913-5993d6ae5a61) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ae41e432-6ed1-4ddc-9913-5993d6ae5a61) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Configuration Intech (API + secrets)

Nous intégrons l’API Intech via des Supabase Edge Functions (Deno). Un client HTTP centralisé a été ajouté côté fonctions pour éviter la duplication de code.

- Client central: `supabase/functions/_shared/intechClient.ts`
  - Lit les variables d’environnement `INTECH_BASE_URL`, `INTECH_API_KEY`, `INTECH_CALLBACK_SECRET`.
  - Initialise un fetch JSON avec URL de base et en-têtes par défaut: `Content-Type: application/json`, `Accept: application/json`, et `Secretkey: <INTECH_API_KEY>`.
  - Fournit `IntechClient.get/post/...` et un helper `verifyWebhookSignature` (HMAC-SHA256) pour les webhooks.

- Exemple d’usage: la fonction `intech-services` consomme ce client: `supabase/functions/intech-services/index.ts`.

### Où définir les variables d’environnement

Ces secrets ne doivent pas être exposés au frontend (Vite/React). Définissez-les uniquement côté Supabase (Edge Functions).

1) En local (CLI Supabase):

- Créez votre fichier `supabase/.env` à partir de l’exemple fourni:
  - Fichier exemple: `supabase/.env.example`
  - Copiez-le vers `supabase/.env` et remplissez:
    - `INTECH_BASE_URL=https://api.intech.sn`
    - `INTECH_API_KEY=...`
    - `INTECH_CALLBACK_SECRET=...` (pour vérifier les webhooks)

- Lors du développement de fonctions:
  - Option A: servez une fonction avec les secrets chargés depuis ce fichier
    - `supabase functions serve <function-name> --env-file supabase/.env`
  - Option B: stockez les secrets via la CLI, puis servez sans `--env-file`:
    - `supabase secrets set INTECH_BASE_URL=... INTECH_API_KEY=... INTECH_CALLBACK_SECRET=...`

2) En production (projet Supabase hébergé):

- Utilisez le tableau de bord Supabase: Project Settings → Functions/Secrets (ou utilisez la CLI):
  - `supabase secrets set INTECH_BASE_URL=... INTECH_API_KEY=... INTECH_CALLBACK_SECRET=...`
- Déployez les fonctions si nécessaire: `supabase functions deploy <function-name>`.

Note: Ne placez pas ces variables dans `.env` à la racine frontend ni en variables Vite (`VITE_*`). Elles doivent rester côté serveur.

### Webhook callback

- La fonction `supabase/functions/intech-callback` reçoit les notifications Intech. Vous pouvez brancher `verifyWebhookSignature` depuis `_shared/intechClient.ts` pour valider la signature envoyée par Intech (selon leur format exact). Le secret à utiliser est `INTECH_CALLBACK_SECRET`.

### Vérification rapide

- Fichier d’exemple des variables: `supabase/.env.example` (ajouté)
- Aucun avertissement/erreur de typage trouvé sur le client partagé et la fonction `intech-services` après migration.
