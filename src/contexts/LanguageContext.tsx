import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Consolidated translations (FR/EN)
const translations = {
  fr: {
    // Navigation
    'nav.hello': '_hello',
    'nav.about': '_à-propos',
    'nav.projects': '_projets',
    'nav.blog': '_blog',
    'nav.formations': '_formations',
    'nav.services': '_services',
    'nav.contact': '_me-contacter',
    'nav.download_cv': '_telecharger-le-cv',
    'nav.download_cv_mobile': '_télécharger-cv',
    'nav.admin': 'Administration',
    'nav.username': 'joel-gaetan-hassam-obah',
    'nav.username_short': 'JG',
    'nav.products': 'Produits',

    // Hero Section
    'hero.hello': 'Salut tout le monde. Je suis',
    'hero.name': 'Joël Gaëtan',
    'hero.subtitle': '> Développeur Full Stack',
    'hero.comment': '// vous pouvez aussi me trouver sur',
    'hero.comment_mobile': '// trouver mon profil sur',
    'hero.github': 'mon Github',
    'hero.linkedin': 'mon LinkedIn',
    'hero.quick_chat': "// Envie d'un échange rapide ?",
    'hero.contact_me': 'me contacter',

    // About Section
    'about.title': 'À propos de moi',
    'about.bio': "Salut ! Je suis Joël Gaëtan, un développeur passionné par la création d'expériences numériques innovantes...",
    'about.skills_title': 'Compétences',
    'about.interests_title': "Centres d'intérêt",
    'about.education_title': 'Formation',
    'about.read_more': 'En savoir plus',

    // Projects Section
    'projects.title': 'Mes projets',
    'projects.explorer': 'Explorateur',
    'projects.all_projects': 'Tous les projets',
    'projects.loading': 'Chargement des projets...',
    'projects.no_projects': '// Aucun projet disponible',
    'projects.select_project': 'Sélectionnez un projet',
    'projects.select_project_desc': 'Choisissez un projet pour voir ses détails ici.',
    'projects.phases_resources': 'Phases & Ressources',
    'projects.technologies_used': 'Technologies utilisées',
    'projects.categories.professionnel': 'Projets professionnels',
    'projects.categories.personnel': 'Projets personnels',
    'projects.categories.academique': 'Projets académiques',
    'projects.recent.title': 'Projets récents',
    'projects.recent.subtitle': 'Un aperçu des 3 derniers projets',
    'projects.none': 'Aucun projet disponible.',
    'projects.view_all': 'Voir tous les projets',
    'projects.resource.live': 'Site live',
    'projects.resource.code': 'Code source',

    // Blog
    'blog.recent.title': 'Articles récents',
    'blog.recent.subtitle': 'Les 3 derniers billets du blog',
    'blog.none': 'Aucun article publié.',
    'blog.read_blog': 'Lire le blog',

    // Contact Section
    'contact.title': 'Me contacter',
    'contact.name': 'Nom',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.phone': 'Téléphone',
    'contact.send': 'Envoyer le message',
    'contact.sending': 'Envoi en cours...',
    'contact.success': 'Message envoyé avec succès !',
    'contact.success_description': 'Votre message a été envoyé avec succès. Je vous répondrai rapidement.',
    'contact.error': 'Erreur',
    'contact.error_description': "Impossible d'envoyer le message",
    'contact.all_fields_required': 'Tous les champs sont requis',
    'contact.description': "N'hésitez pas à me laisser un message ou à utiliser les infos ci-dessous pour un contact direct.",

    // Footer
    'footer.social_links': 'mes-liens-sociaux',
    'footer.download_cv': '_telecharger-mon-cv',
    'footer.rights_reserved': 'tous-droits-reserves',
    'footer.find_me': 'Vous pouvez me retrouver ici',
    'footer.built_with': 'Construit avec ❤️ par',

    // Admin
    'admin.dashboard': 'Tableau de bord',
    'admin.projects': 'Projets',
    'admin.blog': 'Blog',
    'admin.about': 'À propos',
    'admin.messages': 'Messages',
    'admin.users': 'Utilisateurs',
    'admin.settings': 'Paramètres',
    'admin.view_site': 'Voir le site',
    'admin.logout': 'Déconnexion',
    // Ajout: états/toasts admin
    'admin.loading': 'Chargement…',
    'admin.access_denied.title': 'Accès refusé',
    'admin.access_denied.desc': "Vous n'avez pas les droits administrateur.",
    'admin.toast.signout_error': 'Erreur de déconnexion',
    'admin.toast.signout_success': 'Déconnexion réussie',
    'admin.toast.signout_success_desc': 'Vous avez été déconnecté.',
    'admin.toast.generic_error': 'Erreur',
    'admin.toast.generic_error_desc': 'Une erreur est survenue.',

    // Auth
    'auth.login': 'Se connecter',
    'auth.logout': 'Se déconnecter',

    // Accueil
    'home.greeting': '✨ Salut, je me nomme',
    'home.subtitle': 'Développement web, data et IA — découvrez mes travaux, produits et articles.',
    'home.discover.title': 'Découvrir',
    'home.discover.subtitle': 'Accédez rapidement aux sections clés',

    // Stats home
    'stats.projects_recent': 'Projets récents',
    'stats.articles_published': 'Articles publiés',
    'stats.access': 'Accès',
    'stats.current_year': 'Année courante',

    // Cursus Section
    'cursus.title': 'Cursus actuel',
    'cursus.badge': '📚 Formation en cours',
    'cursus.subtitle': 'Mon parcours académique et formations actuelles',
    'cursus.current_studies': 'Formation actuelle',
    'cursus.program': 'Licence en Informatique',
    'cursus.institution': 'Université virtuelle du Sénégal (UVS)',
    'cursus.year': '3ème année (L3)',
    'cursus.status': 'En cours',
    'cursus.specialization': 'Spécialisation',
    'cursus.spec_details': 'Développement web et applications mobiles',
    'cursus.graduation': 'Diplôme prévu',
    'cursus.graduation_date': 'Juin 2025',
    'cursus.key_courses': 'Matières clés',
    'cursus.courses.algorithms': 'Algorithmes et structures de données',
    'cursus.courses.databases': 'Bases de données',
    'cursus.courses.web': 'Développement web avancé',
    'cursus.courses.mobile': 'Développement mobile',
    'cursus.courses.ai': 'Intelligence artificielle',
    'cursus.courses.project': 'Gestion de projets IT',

    // Certifications Section
    'certifications.title': 'Certifications en cours',
    'certifications.badge': '🏆 Certifications actives',
    'certifications.subtitle': 'Certifications professionnelles que je poursuis actuellement',
    'certifications.current': 'Certifications en préparation',
    'certifications.aws.title': 'AWS Cloud Practitioner',
    'certifications.aws.provider': 'Amazon Web Services',
    'certifications.aws.progress': 'En préparation',
    'certifications.aws.expected': 'Certification prévue : Mars 2025',
    'certifications.google.title': 'Google Cloud Digital Leader',
    'certifications.google.provider': 'Google Cloud',
    'certifications.google.progress': 'En cours',
    'certifications.google.expected': 'Certification prévue : Avril 2025',
    'certifications.meta.title': 'Meta Front-End Developer',
    'certifications.meta.provider': 'Meta (Facebook)',
    'certifications.meta.progress': 'Module 3/9',
    'certifications.meta.expected': 'Certification prévue : Mai 2025',
    'certifications.skills': 'Compétences visées',
    'certifications.skills.cloud': 'Services cloud et infrastructure',
    'certifications.skills.frontend': 'Développement front-end moderne',
    'certifications.skills.react': 'React et écosystème JavaScript',
    'certifications.skills.deployment': 'Déploiement et CI/CD',

    // Quick links
    'quick.products.title': 'Produits',
    'quick.products.desc': 'Outils et solutions proposés',
    'quick.projects.title': 'Projets',
    'quick.projects.desc': 'Sélection de travaux récents',
    'quick.blog.title': 'Blog',
    'quick.blog.desc': 'Articles, notes et idées',
    'quick.directory.title': 'Annuaire',
    'quick.directory.desc': 'Entreprises et ressources',
    'quick.services.title': 'Services',
    'quick.services.desc': 'Prestations web et accompagnement',

    // Commun / Trust
    'common.trust_title': 'Fiable et sécurisé',
    'common.secure_payment': 'Paiement sécurisé',
    'common.access_24_7': 'Accès 24/7',
    'common.quality': 'Qualité soignée',
    'common.new': 'Nouveau',
    'common.copied_title': 'Numéro copié !',
    'common.copied_desc': 'Le numéro a été copié dans votre presse-papiers.',
    'common.support_24_7': 'Support 24/7',
    // Ajouts communs
    'common.country.sn': 'Sénégal',

    // Annuaire
    'annuaire.title': 'Annuaire des entreprises',
    'annuaire.hero.badge': 'Annuaire',
    'annuaire.hero.title': 'Entreprises sans site web',
    'annuaire.hero.subtitle': 'Accédez à une base à jour pour accélérer votre prospection B2B.',
    'annuaire.require_login': 'Connectez-vous pour acheter un accès et consulter la liste des entreprises.',
    'annuaire.access_restricted': "L'accès à la liste des entreprises est réservé aux membres ayant un pass actif.",
    'annuaire.duration': 'Durée: 1 heure.',
    'annuaire.price_label': 'Tarif:',
    'annuaire.btn.buy_access': "Acheter l'accès",
    'annuaire.btn.switch_account': 'Changer de compte',
    'annuaire.btn.view_product': 'Voir la page produit',
    'annuaire.note_protection': "Note: le contenu est consultable uniquement sur ce site. Le téléchargement et la copie sont limités.",

    // Annuaire stats
    'annuaire.stats.companies': 'Entreprises',
    'annuaire.stats.categories': 'Catégories',
    'annuaire.stats.time_left': 'Temps restant',
    'annuaire.stats.year': 'Année',

    // Toolbar & tri
    'annuaire.search.placeholder': 'Rechercher (nom, catégorie, téléphone...)',
    'annuaire.filter.category': 'Catégorie',
    'annuaire.filter.all_categories': 'Toutes les catégories',
    'annuaire.sort.by': 'Trier par',
    'annuaire.sort.recent': 'Plus récents',
    'annuaire.sort.name': 'Nom (A→Z)',
    'annuaire.sort.category': 'Catégorie (A→Z)',
    'annuaire.sort.views': 'Plus consultés',
    'annuaire.reset': 'Réinitialiser',

    // États
    'annuaire.loading': "Vérification de l'accès...",
    'annuaire.empty': 'Aucune entreprise ne correspond à vos filtres.',
    'annuaire.reset_filters': 'Réinitialiser les filtres',

    // Cartes annuaire
    'annuaire.card.hidden_name': 'Nom masqué — cliquez pour voir',
    'annuaire.card.added_on': 'Ajouté le',
    'annuaire.card.website': 'Site:',
    'annuaire.card.no_website': 'Pas de site',
    'annuaire.card.site_inaccessible': 'Site inaccessible',
    'annuaire.card.verified': 'Validé',
    'annuaire.card.unique_views': 'consultations uniques',
    'annuaire.card.phone': 'Téléphone',
    'annuaire.card.address': 'Adresse',

    // Achat (dialog)
    'annuaire.purchase.title': "Acheter l'accès",
    'annuaire.purchase.amount': 'Montant',
    'annuaire.purchase.choose_operator': 'choisissez votre opérateur et entrez votre numéro',
    'annuaire.purchase.operator': 'Opérateur',
    'annuaire.purchase.operator_placeholder': 'Opérateur',
    'annuaire.purchase.phone': 'Téléphone',
    'annuaire.purchase.phone_placeholder': 'Ex: 772345678',
    'annuaire.purchase.pending_info': "Si la fenêtre ne s'est pas ouverte,",
    'annuaire.purchase.click_here': 'cliquez ici',
    'annuaire.purchase.processing': 'Traitement...',
    'annuaire.btn.cancel': 'Annuler',
    'annuaire.btn.pay': 'Payer',

    // Overlay
    'annuaire.protected.title': 'Contenu protégé',
    'annuaire.protected.subtitle': "L'onglet est inactif. Le contenu est masqué pour limiter la capture.",

    // Produit Annuaire — champs
    'product.annuaire.badge': 'Base de prospects B2B',
    'product.annuaire.title': "Annuaire d'entreprises sans site web",
    'product.annuaire.subtitle': "Identifiez rapidement des entreprises sénégalaises sans présence web et démarrez la conversation avec une offre claire.",
    'product.annuaire.updated': 'Mise à jour',
    'product.annuaire.count': '500+ entreprises',
    'product.annuaire.format': 'Format: tableau sécurisé',
    'product.annuaire.what_you_get': 'Ce que vous obtenez',
    'product.annuaire.feature.coords': 'Coordonnées essentielles (téléphone professionnel, secteur, localisation)',
    'product.annuaire.feature.filter': 'Filtrage simple par secteur et zone',
    'product.annuaire.feature.normalized': 'Données normalisées et prêtes pour prospection',
    'product.annuaire.feature.updates': 'Mises à jour régulières avec corrections prioritaires',
    'product.annuaire.fields': 'Aperçu des champs',
    'product.annuaire.fields.company': 'Entreprise',
    'product.annuaire.fields.sector': 'Secteur',
    'product.annuaire.fields.phone': 'Téléphone',
    'product.annuaire.fields.location': 'Localisation',
    'product.annuaire.fields.web_status': 'Statut Web',
    'product.annuaire.fields.notes': 'Notes',
    'product.annuaire.fields.example.company': 'Ex: Boulangerie X',
    'product.annuaire.fields.example.sector': 'Ex: Restauration',
    'product.annuaire.fields.example.phone': 'Ex: 77 000 00 00',
    'product.annuaire.fields.example.location': 'Ex: Dakar',
    'product.annuaire.fields.example.web_status': 'Pas de site',
    'product.annuaire.fields.example.notes': 'Contact WhatsApp, horaires',
    'product.annuaire.sidebar.access_title': 'Accès immédiat',
    'product.annuaire.sidebar.todays_price': 'Tarif du jour',
    'product.annuaire.sidebar.buy_now': 'Acheter maintenant',
    'product.annuaire.sidebar.secure_fast': 'Paiement sécurisé • Activation rapide',
    'product.annuaire.sidebar.info': 'Informations',
    'product.annuaire.sidebar.last_update': 'Dernière mise à jour',
    'product.annuaire.sidebar.export_on_request': 'Export sur demande',
    'product.annuaire.sidebar.sn_priority': 'Sénégal (prioritaire)',
    // Bannière promo latérale
    'product.annuaire.promo_banner': "Paiement sécurisé et activation immédiate après confirmation.",

    // Paiement manuel
    'manual.title': 'Finaliser votre achat',
    'manual.subtitle': 'Processus simple et sécurisé via Wave ou Orange Money. Activation immédiate après confirmation.',
    'manual.breadcrumb.home': 'Accueil',
    'manual.breadcrumb.products': 'Produits',
    'manual.breadcrumb.directory': 'Annuaire',
    'manual.breadcrumb.payment': 'Paiement',
    'manual.wave.title': 'Paiement Wave',
    'manual.wave.desc': 'Solution mobile de paiement populaire au Sénégal',
    'manual.orange.title': 'Orange Money',
    'manual.orange.desc': "Service de paiement mobile d'Orange",
    'manual.number': 'Numéro',
    'manual.copy_number': 'Copier le numéro',
    'manual.sent_amount': 'Envoyez 1500 F CFA',
    'manual.take_screenshot': "Prenez une capture d'écran",
    'manual.contact_whatsapp': 'Contactez-nous sur WhatsApp',
    'manual.final_step': '💬 Étape finale',
    'manual.final_step_desc': "Après avoir effectué votre paiement, contactez-nous pour l'activation",
    'manual.prepared_msg': 'Message automatique préparé',
    'manual.prepared_msg_desc': "Votre email sera automatiquement inclus dans le message pour une activation plus rapide.",
    'manual.btn.send_whatsapp': 'Envoyer la capture sur WhatsApp',
    'manual.btn.back_to_product': '← Retour au produit',
    // Ajout: activation rapide (trust indicator)
    'manual.activation_fast': 'Activation rapide',

    // Annuaire (exports)
    'annuaire.export.btn_excel_admin': 'Exporter Excel',
    'annuaire.export.btn_excel_client': 'Exporter Excel (50)',
    'annuaire.export.btn_pdf': 'Exporter PDF',
    'annuaire.export.no_data': 'Aucune donnée à exporter.',
    'annuaire.export.free_used': 'Votre export gratuit a été utilisé.',
    'annuaire.export.excel_ok': 'Export Excel généré.',
    'annuaire.export.excel_fail': "Échec de l'export Excel.",
    'annuaire.export.pdf_admin_only': 'Export PDF réservé aux administrateurs.',
    'annuaire.export.pdf_ok': 'Export PDF généré.',
    'annuaire.export.pay_dialog.title': 'Export complet (payant)',
    'annuaire.export.pay_dialog.desc': "La seconde exportation est payante: 5000 F CFA pour recevoir l'intégralité de la liste en Excel. Payez comme la première fois, envoyez la capture via WhatsApp et nous vous remettrons le fichier complet par WhatsApp.",

    // Communs
    'common.amount': 'Montant:',
    'common.close': 'Fermer',
    'common.contact_whatsapp': 'Contacter WhatsApp',
    'common.proceed_payment': 'Procéder au paiement',

    // Paiement manuel — mode export complet
    'manual.export.title': 'Paiement — Export complet',
    'manual.export.subtitle': "Payez 5000 F CFA. Ensuite, envoyez la capture du paiement via WhatsApp pour recevoir l'intégralité de la liste en Excel.",
    'manual.export.banner': "Mode export complet — Montant: 5000 F CFA. Après paiement, envoyez la capture via WhatsApp; vous recevrez le fichier Excel complet par WhatsApp.",
    'manual.export.sent_amount': 'Envoyez 5000 F CFA',
    'manual.export.whatsapp_hint': 'Contactez-nous sur WhatsApp pour recevoir le fichier.',
    'manual.export.final_step': 'Dernière étape — Export complet',
    'manual.export.final_step_desc': "Après paiement, envoyez la capture sur WhatsApp pour recevoir l'Excel complet.",
    'manual.export.prepared_msg_desc': 'Message WhatsApp pré-rempli pour l’export complet.',

    // Pagination
    'pagination.prev': 'Précédent',
    'pagination.next': 'Suivant',

    // Auth & achat toasts
    'auth.require_login': 'Veuillez vous connecter.',
    'purchase.enter_phone': 'Entrez votre numéro de téléphone.',
    'purchase.initiated': "Paiement initié. Terminez-le dans l'application opérateur.",
    'purchase.activated': 'Accès activé pour 1 heure.',
    'purchase.not_confirmed': 'Paiement non confirmé à temps. Réessayez.',
    'purchase.edge_unreachable': "Paiement indisponible: fonction Edge non joignable. Déployez 'intech-operation' et vérifiez les secrets.",
    'purchase.init_failed': "Impossible d'initier le paiement.",

    // Annuaire divers
    'annuaire.access_revoked': 'Accès révoqué: tentative de capture détectée.',
    'annuaire.pass_expired': 'Votre pass a expiré. Renouvelez pour continuer.',
    'annuaire.details.category': 'Catégorie',

    // Not Found
    'notfound.title': '404',
    'notfound.subtitle': 'Oups ! Page introuvable',
    'notfound.home': 'Retour à l’accueil',

    // Blog page (hero, states, actions)
    'blog.hero.badge': 'Ressources & Actualités',
    'blog.hero.title': 'Blog & Articles',
    'blog.hero.subtitle': "Découvrez mes articles, tutoriels et réflexions sur le développement web, les technologies modernes et l'entrepreneuriat digital.",
    'blog.stats.articles': 'Articles',
    'blog.stats.categories': 'Catégories',
    'blog.stats.reading': 'Lecture',
    'blog.stats.per_week': 'par semaine',
    'blog.categories.all': 'Tous les articles',
    'blog.loading': 'Chargement des articles...',
    'blog.empty.title': 'Aucun article trouvé',
    'blog.empty.subtitle': 'Les articles seront bientôt disponibles.',
    'blog.section.latest': 'Derniers articles',
    'blog.cta.read_article': "Lire l'article →",
    'blog.interactions.new': 'Nouveau',
    'blog.interactions.comments': 'Commentaires',
    'blog.interactions.trending': 'Tendance',
    'blog.news.title': 'Restez informé',
    'blog.news.subtitle': 'Recevez les derniers articles et tutoriels directement dans votre boîte mail.',
    'blog.news.badge.tutos': 'Tutoriels exclusifs',
    'blog.news.badge.tips': 'Conseils pratiques',
    'blog.news.badge.news': 'Actualités tech',
    'blog.section.category_prefix': 'Articles:',

    // Article page
    'blog.article.not_found': 'Article introuvable',
    'blog.article.back': 'Retour au blog',
    'blog.article.views': 'vues',
    'blog.article.min': 'min',

    // Projects page (hero, states, labels)
    'projects.hero.badge': 'Portfolio & Réalisations',
    'projects.hero.subtitle': "Découvrez mes réalisations en développement web, mes expérimentations et les projets sur lesquels j'ai travaillé.",
    'projects.stats.projects': 'Projets',
    'projects.stats.categories': 'Catégories',
    'projects.stats.stack': 'Stack',
    'projects.stats.source': 'Source',
    'projects.categories.all': 'Tous les projets',
    'projects.empty.title': 'Aucun projet trouvé',
    'projects.empty.subtitle': 'Les projets seront bientôt disponibles.',
    'projects.section.my_work': 'Mes réalisations',
    'projects.section.category_prefix': 'Projets:',
    'projects.cta.view': 'Voir le projet →',
    'projects.cta.soon': 'Bientôt disponible',
    'projects.interactions.portfolio': 'Portfolio',
    'projects.interactions.recent': 'Récent',
    'projects.interactions.innovative': 'Innovant',
    'projects.stack.title': 'Technologies utilisées',
    'projects.stack.frontend': 'Frontend',
    'projects.stack.backend': 'Backend',
    'projects.stack.design': 'Design',
    'projects.stack.devops': 'DevOps',

    // Services page
    'services.hero.badge': 'Services web professionnels',
    'services.hero.title': 'Mes services de développement',
    'services.hero.subtitle': 'Des solutions complètes pour votre présence digitale. Du design à la réalisation, je vous accompagne dans tous vos projets web.',
    'services.stats.projects': 'Projets',
    'services.stats.satisfaction': 'Satisfaction',
    'services.stats.support': 'Support',
    'services.stats.delivery': 'Livraison',
    'services.section.title': 'Mes services',
    'services.section.subtitle': 'Des solutions adaptées à vos besoins, de la conception à la mise en ligne de vos projets digitaux.',
    'services.cta.quote': 'Demander un devis →',
    'services.trust.guaranteed': 'Garanti',
    'services.trust.fast_delivery': 'Livraison rapide',
    'services.trust.support_included': 'Support inclus',
    'services.process.title': 'Comment ça marche ?',
    'services.process.step1.title': 'Contact',
    'services.process.step1.desc': 'Demandez un devis',
    'services.process.step2.title': 'Devis',
    'services.process.step2.desc': 'Proposition du devis',
    'services.process.step3.title': 'Développement',
    'services.process.step3.desc': 'Réalisation du projet',
    'services.process.step4.title': 'Livraison',
    'services.process.step4.desc': 'Livraison & formation',

    // Products index
    'products.hero.badge': 'Solutions de prospection B2B',
    'products.hero.title': 'Accélérez votre prospection au Sénégal',
    'products.hero.subtitle': 'Des outils simples et efficaces pour identifier et contacter les entreprises qui ont besoin de vos services web.',
    'products.stats.companies': 'Entreprises',
    'products.stats.quality': 'Qualité',
    'products.stats.access': 'Accès',
    'products.stats.activation': 'Activation',
    'products.catalog.title': 'Notre catalogue',
    'products.catalog.subtitle': 'Découvrez nos solutions conçues spécifiquement pour les développeurs et agences web au Sénégal.',
    'products.card.popular': 'Le plus populaire',
    'products.card.features.coords': 'Coordonnées complètes',
    'products.card.features.search': 'Recherche avancée',
    'products.card.features.updates': 'Mises à jour régulières',
    'products.card.features.verified': 'Données vérifiées',
    'products.pricing.promo': 'Tarif promotionnel',
    'products.pricing.flash': 'Promotion flash 24h',
    'products.cta.view_product': 'Découvrir le produit →',
    'products.social.title': 'Rejoint par des professionnels',
    'products.social.dev': 'Développeurs freelance',
    'products.social.agencies': 'Agences web',
    'products.social.consultants': 'Consultants IT',
    // Ajout: titre page produits
    'products.title': 'Produits',

    // Ajouts titres pages
    // 'blog.title': 'Blog',
    // 'projects.title': 'Projets',
    // 'services.title': 'Services',

    // Ajout tags produit annuaire
    'product.annuaire.tag.commerce': 'Commerce',
    'product.annuaire.tag.services': 'Services',
    'product.annuaire.tag.health': 'Santé',
    'product.annuaire.tag.local': 'Local',

    // ARIA / accessibilité
    'aria.breadcrumb': "Fil d'Ariane",
    'aria.whatsapp_finalize': "Contacter sur WhatsApp pour finaliser l'achat",
    'aria.back_to_product_annuaire': 'Retour à la page produit annuaire',
    'aria.pagination': 'Pagination',
    'aria.pagination.prev': 'Aller à la page précédente',
    'aria.pagination.next': 'Aller à la page suivante',
    'aria.more_pages': 'Plus de pages',
  },
  en: {
    // Navigation
    'nav.hello': '_hello',
    'nav.about': '_about-me',
    'nav.projects': '_projects',
    'nav.blog': '_blog',
    'nav.formations': '_education',
    'nav.services': '_services',
    'nav.contact': '_contact-me',
    'nav.download_cv': '_download-resume',
    'nav.download_cv_mobile': '_download-resume',
    'nav.admin': 'Administration',
    'nav.username': 'joel-gaetan-hassam-obah',
    'nav.username_short': 'JG',
    'nav.products': 'Products',

    // Hero Section
    'hero.hello': 'Hi everyone. I am',
    'hero.name': 'Joël Gaëtan',
    'hero.subtitle': '> Full Stack Developer',
    'hero.comment': '//' + ' you can also find me on',
    'hero.comment_mobile': '//' + ' find my profile on',
    'hero.github': 'my Github',
    'hero.linkedin': 'my LinkedIn',
    'hero.quick_chat': '// Want a quick chat?',
    'hero.contact_me': 'contact me',

    // About Section
    'about.title': 'About me',
    'about.bio': "Hi! I'm Joël Gaëtan, a developer passionate about creating innovative digital experiences...",
    'about.skills_title': 'Skills',
    'about.interests_title': 'Interests',
    'about.education_title': 'Education',
    'about.read_more': 'Learn more',

    // Projects Section
    'projects.title': 'My projects',
    'projects.explorer': 'Explorer',
    'projects.all_projects': 'All projects',
    'projects.loading': 'Loading projects...',
    'projects.no_projects': '// No projects available',
    'projects.select_project': 'Select a project',
    'projects.select_project_desc': 'Choose a project to see its details here.',
    'projects.phases_resources': 'Phases & Resources',
    'projects.technologies_used': 'Technologies used',
    'projects.categories.professionnel': 'Professional projects',
    'projects.categories.personnel': 'Personal projects',
    'projects.categories.academique': 'Academic projects',
    'projects.recent.title': 'Recent projects',
    'projects.recent.subtitle': 'A look at the last 3 projects',
    'projects.none': 'No projects available.',
    'projects.view_all': 'See all projects',
    'projects.resource.live': 'Live site',
    'projects.resource.code': 'Source code',

    // Blog
    'blog.recent.title': 'Recent articles',
    'blog.recent.subtitle': 'The last 3 blog posts',
    'blog.none': 'No published articles.',
    'blog.read_blog': 'Read the blog',

    // Contact Section
    'contact.title': 'Contact me',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.phone': 'Phone',
    'contact.send': 'Send message',
    'contact.sending': 'Sending...',
    'contact.success': 'Message sent successfully!',
    'contact.success_description': 'Your message has been sent successfully. I will respond to you quickly.',
    'contact.error': 'Error',
    'contact.error_description': 'Unable to send message',
    'contact.all_fields_required': 'All fields are required',
    'contact.description': 'Feel free to leave me a message or use the info below for direct contact.',

    // Footer
    'footer.social_links': 'my-social-links',
    'footer.download_cv': '_download-resume',
    'footer.rights_reserved': 'all-rights-reserved',
    'footer.find_me': 'You can find me here',
    'footer.built_with': 'Built with ❤️ by',

    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.projects': 'Projects',
    'admin.blog': 'Blog',
    'admin.about': 'About',
    'admin.messages': 'Messages',
    'admin.users': 'Users',
    'admin.settings': 'Settings',
    'admin.view_site': 'View site',
    'admin.logout': 'Logout',
    // Added: admin states/toasts
    'admin.loading': 'Loading…',
    'admin.access_denied.title': 'Access denied',
    'admin.access_denied.desc': 'You do not have administrator rights.',
    'admin.toast.signout_error': 'Logout error',
    'admin.toast.signout_success': 'Logged out',
    'admin.toast.signout_success_desc': 'You have been logged out.',
    'admin.toast.generic_error': 'Error',
    'admin.toast.generic_error_desc': 'An error occurred.',

    // Auth
    'auth.login': 'Log in',
    'auth.logout': 'Log out',

    // Home
    'home.greeting': "✨ Hi, I'm",
    'home.subtitle': 'Web, data and AI — explore my work, products and articles.',
    'home.discover.title': 'Discover',
    'home.discover.subtitle': 'Quick access to key sections',

    // Stats home
    'stats.projects_recent': 'Recent projects',
    'stats.articles_published': 'Published articles',
    'stats.access': 'Access',
    'stats.current_year': 'Current year',

    // Cursus Section
    'cursus.title': 'Current Studies',
    'cursus.badge': '📚 Currently studying',
    'cursus.subtitle': 'My academic path and current studies',
    'cursus.current_studies': 'Current program',
    'cursus.program': 'Bachelor\'s in Computer Science',
    'cursus.institution': 'Institute Superieur of Management (ISM)',
    'cursus.year': '3rd year (L3)',
    'cursus.status': 'In progress',
    'cursus.specialization': 'Specialization',
    'cursus.spec_details': 'Web development and mobile applications',
    'cursus.graduation': 'Expected graduation',
    'cursus.graduation_date': 'June 2026',
    'cursus.key_courses': 'Key courses',
    'cursus.courses.algorithms': 'Algorithms and data structures',
    'cursus.courses.databases': 'Databases',
    'cursus.courses.web': 'Advanced web development',
    'cursus.courses.mobile': 'Mobile development',
    'cursus.courses.ai': 'Artificial intelligence',
    'cursus.courses.project': 'IT project management',

    // Certifications Section
    'certifications.title': 'Current Certifications',
    'certifications.badge': '🏆 Active certifications',
    'certifications.subtitle': 'Professional certifications I am currently pursuing',
    'certifications.current': 'Certifications in preparation',
    'certifications.aws.title': 'AWS Cloud Practitioner',
    'certifications.aws.provider': 'Amazon Web Services',
    'certifications.aws.progress': 'In preparation',
    'certifications.aws.expected': 'Expected certification: March 2025',

    'certifications.google.title': 'Google Cloud Digital Leader',
    'certifications.google.provider': 'Google Cloud',
    'certifications.google.progress': 'In progress',
    'certifications.google.expected': 'Expected certification: April 2025',
    'certifications.meta.title': 'Meta Front-End Developer',
    'certifications.meta.provider': 'Meta (Facebook)',
    'certifications.meta.progress': 'Module 3/9',
    'certifications.meta.expected': 'Expected certification: May 2025',

    'certifications.skills': 'Target skills',
    'certifications.skills.cloud': 'Cloud services and infrastructure',
    'certifications.skills.frontend': 'Modern front-end development',
    'certifications.skills.react': 'React and JavaScript ecosystem',
    'certifications.skills.deployment': 'Deployment and CI/CD',

    // Quick links
    'quick.products.title': 'Products',
    'quick.products.desc': 'Tools and solutions offered',
    'quick.projects.title': 'Projects',
    'quick.projects.desc': 'Selection of recent work',
    'quick.blog.title': 'Blog',
    'quick.blog.desc': 'Articles, notes and ideas',
    'quick.directory.title': 'Directory',
    'quick.directory.desc': 'Companies and resources',
    'quick.services.title': 'Services',
    'quick.services.desc': 'Web development services and guidance',

    // Common / Trust
    'common.trust_title': 'Reliable and secure',
    'common.secure_payment': 'Secure payment',
    'common.access_24_7': '24/7 access',
    'common.quality': 'Quality craftsmanship',
    'common.new': 'New',
    'common.copied_title': 'Number copied!',
    'common.copied_desc': 'The number was copied to your clipboard.',
    'common.support_24_7': 'Support 24/7',
    // Add: country label
    'common.country.sn': 'Senegal',

    // Directory
    'annuaire.title': 'Business directory',
    'annuaire.hero.badge': 'Directory',
    'annuaire.hero.title': 'Businesses without a website',
    'annuaire.hero.subtitle': 'Access an up-to-date base to speed up your B2B prospecting.',
    'annuaire.require_login': 'Log in to buy access and view the list of companies.',
    'annuaire.access_restricted': 'Access is restricted to members with an active pass.',
    'annuaire.duration': 'Duration: 1 hour.',
    'annuaire.price_label': 'Price:',
    'annuaire.btn.buy_access': 'Buy access',
    'annuaire.btn.switch_account': 'Switch account',
    'annuaire.btn.view_product': 'View product page',
    'annuaire.note_protection': 'Note: content is view-only on this site. Downloading and copying are limited.',

    // Directory stats
    'annuaire.stats.companies': 'Companies',
    'annuaire.stats.categories': 'Categories',
    'annuaire.stats.time_left': 'Time left',
    'annuaire.stats.year': 'Year',

    // Toolbar & sorting
    'annuaire.search.placeholder': 'Search (name, category, phone...)',
    'annuaire.filter.category': 'Category',
    'annuaire.filter.all_categories': 'All categories',
    'annuaire.sort.by': 'Sort by',
    'annuaire.sort.recent': 'Most recent',
    'annuaire.sort.name': 'Name (A→Z)',
    'annuaire.sort.category': 'Category (A→Z)',
    'annuaire.sort.views': 'Most viewed',
    'annuaire.reset': 'Reset',

    // States
    'annuaire.loading': 'Checking access...',
    'annuaire.empty': 'No companies match your filters.',
    'annuaire.reset_filters': 'Reset filters',

    // Directory cards
    'annuaire.card.hidden_name': 'Name hidden — click to view',
    'annuaire.card.added_on': 'Added on',
    'annuaire.card.website': 'Website:',
    'annuaire.card.no_website': 'No website',
    'annuaire.card.site_inaccessible': 'Website unreachable',
    'annuaire.card.verified': 'Verified',
    'annuaire.card.unique_views': 'unique views',
    'annuaire.card.phone': 'Phone',
    'annuaire.card.address': 'Address',

    // Purchase (dialog)
    'annuaire.purchase.title': 'Buy access',
    'annuaire.purchase.amount': 'Amount',
    'annuaire.purchase.choose_operator': 'choose your operator and enter your number',
    'annuaire.purchase.operator': 'Operator',
    'annuaire.purchase.operator_placeholder': 'Operator',
    'annuaire.purchase.phone': 'Phone',
    'annuaire.purchase.phone_placeholder': 'e.g. 772345678',
    'annuaire.purchase.pending_info': "If the window didn't open,",
    'annuaire.purchase.click_here': 'click here',
    'annuaire.purchase.processing': 'Processing...',
    'annuaire.btn.cancel': 'Cancel',
    'annuaire.btn.pay': 'Pay',

    // Overlay
    'annuaire.protected.title': 'Protected content',
    'annuaire.protected.subtitle': 'The tab is inactive. Content is hidden to limit capture.',

    // Produit Annuaire
    'product.annuaire.badge': 'B2B prospects database',
    'product.annuaire.title': 'Directory of businesses without a website',
    'product.annuaire.subtitle': 'Quickly identify Senegalese businesses without a web presence and start the conversation with a clear offer.',
    'product.annuaire.updated': 'Updated',
    'product.annuaire.count': '500+ companies',
    'product.annuaire.format': 'Format: secure table',
    'product.annuaire.what_you_get': 'What you get',
    'product.annuaire.feature.coords': 'Essential contact info (business phone, sector, location)',
    'product.annuaire.feature.filter': 'Simple filtering by sector and area',
    'product.annuaire.feature.normalized': 'Normalized, prospecting-ready data',
    'product.annuaire.feature.updates': 'Regular updates with priority fixes',
    'product.annuaire.fields': 'Field overview',
    'product.annuaire.fields.company': 'Company',
    'product.annuaire.fields.sector': 'Sector',
    'product.annuaire.fields.phone': 'Phone',
    'product.annuaire.fields.location': 'Location',
    'product.annuaire.fields.web_status': 'Web status',
    'product.annuaire.fields.notes': 'Notes',
    'product.annuaire.fields.example.company': 'e.g. X Bakery',
    'product.annuaire.fields.example.sector': 'e.g. Food service',
    'product.annuaire.fields.example.phone': 'e.g. 77 000 00 00',
    'product.annuaire.fields.example.location': 'e.g. Dakar',
    'product.annuaire.fields.example.web_status': 'No website',
    'product.annuaire.fields.example.notes': 'WhatsApp contact, hours',
    'product.annuaire.sidebar.access_title': 'Instant access',
    'product.annuaire.sidebar.todays_price': "Today's price",
    'product.annuaire.sidebar.buy_now': 'Buy now',
    'product.annuaire.sidebar.secure_fast': 'Secure payment • Fast activation',
    'product.annuaire.sidebar.info': 'Information',
    'product.annuaire.sidebar.last_update': 'Last update',
    'product.annuaire.sidebar.export_on_request': 'Export on request',
    'product.annuaire.sidebar.sn_priority': 'Senegal (priority)',
    // Promo banner
    'product.annuaire.promo_banner': 'Secure payment and instant activation after confirmation.',

    // Manual payment
    'manual.title': 'Complete your purchase',
    'manual.subtitle': 'Simple and secure via Wave or Orange Money. Instant activation after confirmation.',
    'manual.breadcrumb.home': 'Home',
    'manual.breadcrumb.products': 'Products',
    'manual.breadcrumb.directory': 'Directory',
    'manual.breadcrumb.payment': 'Payment',
    'manual.wave.title': 'Wave payment',
    'manual.wave.desc': 'Popular mobile payment in Senegal',
    'manual.orange.title': 'Orange Money',
    'manual.orange.desc': 'Orange mobile payment service',
    'manual.number': 'Number',
    'manual.copy_number': 'Copy number',
    'manual.sent_amount': 'Send 1500 F CFA',
    'manual.take_screenshot': 'Take a screenshot',
    'manual.contact_whatsapp': 'Contact us on WhatsApp',
    'manual.final_step': '💬 Final step',
    'manual.final_step_desc': 'After payment, contact us for activation',
    'manual.prepared_msg': 'Prepared automatic message',
    'manual.prepared_msg_desc': 'Your email will be included for faster activation.',
    'manual.btn.send_whatsapp': 'Send screenshot on WhatsApp',
    'manual.btn.back_to_product': '← Back to product',
    // Add: fast activation
    'manual.activation_fast': 'Fast activation',

    // Directory (exports)
    'annuaire.export.btn_excel_admin': 'Export Excel',
    'annuaire.export.btn_excel_client': 'Export Excel (50)',
    'annuaire.export.btn_pdf': 'Export PDF',
    'annuaire.export.no_data': 'No data to export.',
    'annuaire.export.free_used': 'Your free export has been used.',
    'annuaire.export.excel_ok': 'Excel export generated.',
    'annuaire.export.excel_fail': 'Excel export failed.',
    'annuaire.export.pdf_admin_only': 'PDF export is reserved for administrators.',
    'annuaire.export.pdf_ok': 'PDF export generated.',
    'annuaire.export.pay_dialog.title': 'Full export (paid)',
    'annuaire.export.pay_dialog.desc': 'The second export is paid: 5000 F CFA to receive the full Excel list. Pay as the first time, send the screenshot via WhatsApp and we will send you the full file via WhatsApp.',

    // Common
    'common.amount': 'Amount:',
    'common.close': 'Close',
    'common.contact_whatsapp': 'Contact WhatsApp',
    'common.proceed_payment': 'Proceed to payment',

    // Manual payment — full export mode
    'manual.export.title': 'Payment — Full export',
    'manual.export.subtitle': 'Pay 5000 F CFA. Then send the payment screenshot via WhatsApp to receive the full Excel list.',
    'manual.export.banner': 'Full export mode — Amount: 5000 F CFA. After payment, send the screenshot via WhatsApp; you will receive the full Excel file via WhatsApp.',
    'manual.export.sent_amount': 'Send 5000 F CFA',
    'manual.export.whatsapp_hint': 'Contact us on WhatsApp to receive the file.',
    'manual.export.final_step': 'Final step — Full export',
    'manual.export.final_step_desc': 'After payment, send the screenshot on WhatsApp to receive the full Excel.',
    'manual.export.prepared_msg_desc': 'Pre-filled WhatsApp message for full export.',

    // Pagination
    'pagination.prev': 'Previous',
    'pagination.next': 'Next',

    // Auth & purchase toasts
    'auth.require_login': 'Please log in.',
    'purchase.enter_phone': 'Enter your phone number.',
    'purchase.initiated': 'Payment initiated. Complete it in the operator app.',
    'purchase.activated': 'Access activated for 1 hour.',
    'purchase.not_confirmed': 'Payment not confirmed in time. Try again.',
    'purchase.edge_unreachable': 'Payment unavailable: Edge Function unreachable. Deploy intech-operation and check secrets.',
    'purchase.init_failed': 'Unable to initiate payment.',

    // Directory misc
    'annuaire.access_revoked': 'Access revoked: capture attempt detected.',
    'annuaire.pass_expired': 'Your pass has expired. Renew to continue.',
    'annuaire.details.category': 'Category',

    // Not Found
    'notfound.title': '404',
    'notfound.subtitle': 'Oups ! Page introuvable',
    'notfound.home': 'Retour à l’accueil',

    // Blog page (hero, states, actions)
    'blog.hero.badge': 'Ressources & Actualités',
    'blog.hero.title': 'Blog & Articles',
    'blog.hero.subtitle': "Découvrez mes articles, tutoriels et réflexions sur le développement web, les technologies modernes et l'entrepreneuriat digital.",
    'blog.stats.articles': 'Articles',
    'blog.stats.categories': 'Catégories',
    'blog.stats.reading': 'Lecture',
    'blog.stats.per_week': 'par semaine',
    'blog.categories.all': 'Tous les articles',
    'blog.loading': 'Chargement des articles...',
    'blog.empty.title': 'Aucun article trouvé',
    'blog.empty.subtitle': 'Les articles seront bientôt disponibles.',
    'blog.section.latest': 'Derniers articles',
    'blog.cta.read_article': "Lire l'article →",
    'blog.interactions.new': 'Nouveau',
    'blog.interactions.comments': 'Commentaires',
    'blog.interactions.trending': 'Tendance',
    'blog.news.title': 'Restez informé',
    'blog.news.subtitle': 'Recevez les derniers articles et tutoriels directement dans votre boîte mail.',
    'blog.news.badge.tutos': 'Tutoriels exclusifs',
    'blog.news.badge.tips': 'Conseils pratiques',
    'blog.news.badge.news': 'Actualités tech',
    'blog.section.category_prefix': 'Articles:',

    // Article page
    'blog.article.not_found': 'Article introuvable',
    'blog.article.back': 'Retour au blog',
    'blog.article.views': 'vues',
    'blog.article.min': 'min',

    // Projects page (hero, states, labels)
    'projects.hero.badge': 'Portfolio & Réalisations',
    'projects.hero.subtitle': "Découvrez mes réalisations en développement web, mes expérimentations et les projets sur lesquels j'ai travaillé.",
    'projects.stats.projects': 'Projets',
    'projects.stats.categories': 'Catégories',
    'projects.stats.stack': 'Stack',
    'projects.stats.source': 'Source',
    'projects.categories.all': 'Tous les projets',
    'projects.empty.title': 'Aucun projet trouvé',
    'projects.empty.subtitle': 'Les projets seront bientôt disponibles.',
    'projects.section.my_work': 'Mes réalisations',
    'projects.section.category_prefix': 'Projets:',
    'projects.cta.view': 'Voir le projet →',
    'projects.cta.soon': 'Bientôt disponible',
    'projects.interactions.portfolio': 'Portfolio',
    'projects.interactions.recent': 'Récent',
    'projects.interactions.innovative': 'Innovant',
    'projects.stack.title': 'Technologies utilisées',
    'projects.stack.frontend': 'Frontend',
    'projects.stack.backend': 'Backend',
    'projects.stack.design': 'Design',
    'projects.stack.devops': 'DevOps',

    // Services page
    'services.hero.badge': 'Services web professionnels',
    'services.hero.title': 'Mes services de développement',
    'services.hero.subtitle': 'Des solutions complètes pour votre présence digitale. Du design à la réalisation, je vous accompagne dans tous vos projets web.',
    'services.stats.projects': 'Projets',
    'services.stats.satisfaction': 'Satisfaction',
    'services.stats.support': 'Support',
    'services.stats.delivery': 'Livraison',
    'services.section.title': 'Mes services',
    'services.section.subtitle': 'Des solutions adaptées à vos besoins, de la conception à la mise en ligne de vos projets digitaux.',
    'services.cta.quote': 'Demander un devis →',
    'services.trust.guaranteed': 'Garanti',
    'services.trust.fast_delivery': 'Livraison rapide',
    'services.trust.support_included': 'Support inclus',
    'services.process.title': 'Comment ça marche ?',
    'services.process.step1.title': 'Contact',
    'services.process.step1.desc': 'Demandez un devis',
    'services.process.step2.title': 'Devis',
    'services.process.step2.desc': 'Proposition du devis',
    'services.process.step3.title': 'Développement',
    'services.process.step3.desc': 'Réalisation du projet',
    'services.process.step4.title': 'Livraison',
    'services.process.step4.desc': 'Livraison & formation',

    // Products index
    'products.hero.badge': 'Solutions de prospection B2B',
    'products.hero.title': 'Accélérez votre prospection au Sénégal',
    'products.hero.subtitle': 'Des outils simples et efficaces pour identifier et contacter les entreprises qui ont besoin de vos services web.',
    'products.stats.companies': 'Entreprises',
    'products.stats.quality': 'Qualité',
    'products.stats.access': 'Accès',
    'products.stats.activation': 'Activation',
    'products.catalog.title': 'Notre catalogue',
    'products.catalog.subtitle': 'Découvrez nos solutions conçues spécifiquement pour les développeurs et agences web au Sénégal.',
    'products.card.popular': 'Le plus populaire',
    'products.card.features.coords': 'Coordonnées complètes',
    'products.card.features.search': 'Recherche avancée',
    'products.card.features.updates': 'Mises à jour régulières',
    'products.card.features.verified': 'Données vérifiées',
    'products.pricing.promo': 'Tarif promotionnel',
    'products.pricing.flash': 'Promotion flash 24h',
    'products.cta.view_product': 'Découvrir le produit →',
    'products.social.title': 'Rejoint par des professionnels',
    'products.social.dev': 'Développeurs freelance',
    'products.social.agencies': 'Agences web',
    'products.social.consultants': 'Consultants IT',
    // Ajout: titre page produits
    'products.title': 'Produits',

    // Ajouts titres pages
    // 'blog.title': 'Blog',
    // 'projects.title': 'Projets',
    // 'services.title': 'Services',

    // Ajout tags produit annuaire
    'product.annuaire.tag.commerce': 'Commerce',
    'product.annuaire.tag.services': 'Services',
    'product.annuaire.tag.health': 'Santé',
    'product.annuaire.tag.local': 'Local',

    // ARIA / accessibilité
    'aria.breadcrumb': "Fil d'Ariane",
    'aria.whatsapp_finalize': "Contacter sur WhatsApp pour finaliser l'achat",
    'aria.back_to_product_annuaire': 'Retour à la page produit annuaire',
    'aria.pagination': 'Pagination',
    'aria.pagination.prev': 'Aller à la page précédente',
    'aria.pagination.next': 'Aller à la page suivante',
    'aria.more_pages': 'Plus de pages',
  }
} as const;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const dict: any = translations;
    return (dict[language] && dict[language][key]) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
