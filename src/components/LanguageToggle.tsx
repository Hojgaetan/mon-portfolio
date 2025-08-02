import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

// Composants SVG pour les drapeaux
const FrenchFlag = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 16" fill="none">
    <rect width="8" height="16" fill="#002654" />
    <rect x="8" width="8" height="16" fill="#FFFFFF" />
    <rect x="16" width="8" height="16" fill="#CE1126" />
  </svg>
);

const EnglishFlag = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 16" fill="none">
    <rect width="24" height="16" fill="#012169" />
    <path d="M0 0L24 16M24 0L0 16" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1" />
    <path d="M12 0V16M0 8H24" stroke="#FFFFFF" strokeWidth="3" />
    <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="2" />
  </svg>
);

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="h-10 w-10 hover:bg-accent-sky/10 hover:text-accent-sky transition-colors"
      title={language === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      {language === 'fr' ? <EnglishFlag /> : <FrenchFlag />}
      <span className="sr-only">{language === 'fr' ? 'Switch to English' : 'Switch to French'}</span>
    </Button>
  );
};