import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
}: SEOProps) => {
  const { language } = useLanguage();

  // Valeurs par défaut selon la langue
  const defaults = {
    fr: {
      title: 'Joel Gaetan HASSAM OBAH - Développeur Python Freelance | Gestion de Stock PME',
      description: 'Développeur Python spécialisé en logiciels de gestion de stock sur mesure pour PME. Solutions complètes avec suivi temps réel, alertes automatiques et intégrations ERP.',
      keywords: 'développeur python, gestion de stock, logiciel sur mesure, PME, inventaire, ERP, Django, Flask, PostgreSQL, Sénégal',
      image: `${window.location.origin}/photo-p.JPG`,
      author: 'Joel Gaetan HASSAM OBAH',
    },
    en: {
      title: 'Joel Gaetan HASSAM OBAH - Freelance Python Developer | SME Inventory Management',
      description: 'Python developer specialized in custom inventory management software for SMEs. Complete solutions with real-time tracking, automated alerts and ERP integrations.',
      keywords: 'python developer, inventory management, custom software, SME, stock control, ERP, Django, Flask, PostgreSQL, Senegal',
      image: `${window.location.origin}/photo-p.JPG`,
      author: 'Joel Gaetan HASSAM OBAH',
    },
  };

  const currentDefaults = defaults[language as keyof typeof defaults] || defaults.fr;

  const siteTitle = title || currentDefaults.title;
  const siteDescription = description || currentDefaults.description;
  const siteKeywords = keywords || currentDefaults.keywords;
  const siteImage = image || currentDefaults.image;
  const siteUrl = url || window.location.href;
  const siteAuthor = author || currentDefaults.author;

  return (
    <Helmet>
      {/* Métadonnées de base */}
      <html lang={language} />
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content={siteAuthor} />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:locale" content={language === 'fr' ? 'fr_FR' : 'en_US'} />
      <meta property="og:site_name" content="Joel Gaetan HASSAM OBAH Portfolio" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
      <meta name="twitter:creator" content="@joelgaetan" />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Geo tags pour Sénégal */}
      <meta name="geo.region" content="SN" />
      <meta name="geo.placename" content="Dakar" />
      <meta name="geo.position" content="14.6937;-17.4441" />
      <meta name="ICBM" content="14.6937, -17.4441" />

      {/* JSON-LD Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Joel Gaetan HASSAM OBAH',
          url: window.location.origin,
          image: siteImage,
          jobTitle: language === 'fr' ? 'Développeur Python Freelance' : 'Freelance Python Developer',
          description: siteDescription,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'SN',
            addressLocality: 'Dakar',
          },
          sameAs: [
            'https://linkedin.com/in/joel-gaetan-hassam-obah',
            'https://github.com/joelgaetan',
          ],
          knowsAbout: [
            'Python',
            'Django',
            'Flask',
            'PostgreSQL',
            'Inventory Management',
            'ERP Systems',
            'Software Development',
          ],
          alumniOf: {
            '@type': 'EducationalOrganization',
            name: 'Université Virtuelle du Sénégal',
          },
        })}
      </script>

      {/* Service Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: language === 'fr' ? 'Développement Logiciel de Gestion de Stock' : 'Inventory Management Software Development',
          provider: {
            '@type': 'Person',
            name: 'Joel Gaetan HASSAM OBAH',
          },
          areaServed: {
            '@type': 'Country',
            name: 'Senegal',
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: language === 'fr' ? 'Services de Développement Python' : 'Python Development Services',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: language === 'fr' ? 'Logiciel de Gestion de Stock' : 'Inventory Management Software',
                  description: language === 'fr' ? 'Solution Python sur mesure pour la gestion de stock en temps réel' : 'Custom Python solution for real-time inventory management',
                },
              },
            ],
          },
        })}
      </script>
    </Helmet>
  );
};

