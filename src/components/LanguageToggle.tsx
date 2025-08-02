import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
      <Languages className="h-4 w-4" />
      <span className="sr-only">{language === 'fr' ? 'Switch to English' : 'Switch to French'}</span>
    </Button>
  );
};