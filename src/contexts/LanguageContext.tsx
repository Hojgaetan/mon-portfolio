import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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

    // Hero Section
    'hero.hello': 'Salut tout le monde. Je suis',
    'hero.name': 'Joël Gaëtan',
    'hero.subtitle': '> Développeur Full Stack',
    'hero.comment': '// vous pouvez aussi me trouver sur',
    'hero.comment_mobile': '// trouver mon profil sur',
    'hero.github': 'mon Github',
    'hero.linkedin': 'mon LinkedIn',
    'hero.quick_chat': '// Envie d\'un échange rapide ?',
    'hero.contact_me': 'me contacter',

    // About Section
    'about.title': 'À propos de moi',
    'about.bio': 'Salut ! Je suis Joël Gaëtan, un développeur passionné par la création d\'expériences numériques innovantes...',
    'about.skills_title': 'Compétences',
    'about.interests_title': 'Centres d\'intérêt',
    'about.education_title': 'Formation',

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
    'contact.error_description': 'Impossible d\'envoyer le message',
    'contact.all_fields_required': 'Tous les champs sont requis',
    'contact.description': 'N\'hésitez pas à me laisser un message ou à utiliser les infos ci-dessous pour un contact direct.',

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

    // Hero Section
    'hero.hello': 'Hi everyone. I am',
    'hero.name': 'Joël Gaëtan',
    'hero.subtitle': '> Full Stack Developer',
    'hero.comment': '// you can also find me on',
    'hero.comment_mobile': '// find my profile on',
    'hero.github': 'my Github',
    'hero.linkedin': 'my LinkedIn',
    'hero.quick_chat': '// Want a quick chat?',
    'hero.contact_me': 'contact me',

    // About Section
    'about.title': 'About me',
    'about.bio': 'Hi! I\'m Joël Gaëtan, a developer passionate about creating innovative digital experiences...',
    'about.skills_title': 'Skills',
    'about.interests_title': 'Interests',
    'about.education_title': 'Education',

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
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['fr', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};