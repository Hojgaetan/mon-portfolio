# Portfolio de Joël Gaëtan Hassam Obah
![forks](https://img.shields.io/github/forks/Hojgaetan/mon-portfolio)
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/Hojgaetan/mon-portfolio)
![GitHub contributors](https://img.shields.io/github/contributors/Hojgaetan/mon-portfolio)
![MIT License Badge](https://img.shields.io/badge/license-MIT-green)

Un site personnel pour présenter mon profil, mes projets, mes articles et mes services, avec un produit payant (Annuaire B2B) destiné aux indépendants et petites équipes souhaitant prospecter rapidement.


## Présentation rapide
- Mission: valoriser mon travail, partager mes idées et proposer des outils utiles (Annuaire) pour créer des opportunités.
- Public visé: recruteurs, clients, partenaires, étudiants et curieux.
- Formats: portfolio de projets, blog, page services, produit Annuaire protégé, formulaire de contact, téléchargement de CV.
- Confort: interface moderne, thème clair/sombre, FR/EN, navigation fluide (SPA), design responsive.


## Ce que vous trouverez sur le site
- Accueil
  - Présentation, photo, stats dynamiques (nombre de projets, d’articles), accès rapide aux sections clés.
- Projets (/projets)
  - Sélection de travaux (professionnels, personnels, académiques). Vignettes avec image, catégorie, date; navigation vers les détails.
- Blog (/blog et /article/:slug)
  - Articles courts et billets techniques. Extraits, date, estimation du temps de lecture, page article dédiée.
- À propos (/a-propos)
  - Parcours, compétences, centres d’intérêt et quelques éléments personnels.
- Services (/services)
  - Offres (développement web, data, IA). Objectif: rendre l’offre claire et actionnable.
- Produits (/produit)
  - Annuaire B2B: « Entreprises sans site web » (priorité Sénégal). Page dédiée: /produit/annuaire.
- Annuaire (/annuaire)
  - Accès consultable aux données pour membres avec pass actif. Filtres, tri, indicateurs, et protections anti-copie basiques.
- Paiement manuel (/paiement-manuel)
  - Parcours assisté (Wave, Orange Money) avec message WhatsApp prérempli pour une activation rapide.
- Démo Intech (/intech-demo)
  - Espace de tests/intégration côté paiement (technique).
- Contact (/ via la section Me contacter)
  - Formulaire pour me joindre facilement. Notifications instantanées côté interface.
- CV
  - Téléchargement direct: [Mon CV](public/CV__Joel%20Gaetan_HASSAM%20OBAH.pdf)


## Objectifs et valeurs
- Transparence: montrer le réel (projets, drafts d’articles, itérations) plutôt que du contenu trop « parfait ».
- Utilité: proposer un produit simple, focalisé, qui fait gagner du temps (Annuaire).
- Accessibilité: site responsive, interface lisible et claire.
- Évolution continue: itérations fréquentes, retours bienvenus.


## Le produit Annuaire, en bref
- Problème: identifier rapidement des entreprises locales sans présence web pour une offre de création/refonte de site.
- Solution: base normalisée et filtrable (nom, secteur, localisation, téléphone, statut web, notes).
- Accès: via un « pass » à durée limitée (ex: 1 heure) après paiement.
- Paiement: intégration Intech (API) et parcours manuel (Wave/Orange Money) si besoin.
- Protection: consultation sur site, blocage léger quand l’onglet est inactif, limitations de copie/téléchargement.
- Support: WhatsApp avec message prérempli pour accélérer l’activation.


## Parcours type
- Recruteur/Client: découvre l’accueil → consulte projets et services → lit 1–2 articles → télécharge le CV → prend contact.
- Indépendant: découvre le produit Annuaire → achète un pass → filtre et consulte des leads → contacte pour export ou support.


## Feuille de route (extraits)
- Blog: pagination, tags, recherche, flux RSS.
- Projets: pages détaillées enrichies (galeries, étapes, ressources, stack).
- Annuaire: suivi d’accès, exports à la demande, métriques d’usage, catégories avancées.
- SEO/Partage: métadonnées par page, images sociales dédiées.
- Qualité: tests E2E, suivi de perf, améliorations d’accessibilité.


## Me contacter
- Utiliser le formulaire de contact (section en bas de page).
- Ou passer par mes liens (GitHub/LinkedIn) visibles dans le site.


---

## Pour les développeurs
Ce bloc résume la partie technique si vous souhaitez cloner et faire tourner le projet en local.

- Stack: React 18 + TypeScript + Vite 5, Tailwind + shadcn-ui, React Router, React Query.
- i18n: FR/EN via LanguageContext; thème clair/sombre via ThemeProvider (localStorage).
- Supabase: auth, base de données, Edge Functions (Intech), génération de types.
- Routage principal: voir src/App.tsx et src/pages/*.

Démarrage rapide:
```bash
npm install
npm run dev
```

Scripts utiles:
- build, preview, lint, update-types (génère src/integrations/supabase/types.ts).

Fonctions Edge (Intech + utilitaires):
- supabase/functions/intech-*: services, balance, operation (POST), transaction-status; get-ip pour debug.
- Variables d’environnement (côté fonctions uniquement): INTECH_BASE_URL, INTECH_API_KEY, INTECH_CALLBACK_URL, INTECH_CALLBACK_SECRET.
- Exemple: supabase/.env.example → copier en supabase/.env puis servir/déployer avec la CLI.

Déploiement:
- SPA: Netlify/Vercel (public/_redirects pour fallback 200).
- Fonctions: Supabase CLI (deploy) + secrets dans Project Settings → Functions → Secrets.

Support/bugs: ouvrez une issue ou envoyez un message via le formulaire de contact du site.
