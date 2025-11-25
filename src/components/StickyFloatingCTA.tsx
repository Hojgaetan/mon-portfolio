import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneCall, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export const StickyFloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      // Afficher après 500px de scroll
      if (window.scrollY > 500 && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= 500) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative group">
            {/* Bouton de fermeture */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 bg-background border-2 border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive z-10"
              aria-label="Fermer"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Bouton principal */}
            <Button
              size="lg"
              onClick={handleClick}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-6 py-6 group-hover:scale-105"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="mr-2"
              >
                <PhoneCall className="h-5 w-5" />
              </motion.div>
              <span className="font-semibold">
                {language === 'fr' ? 'Demander un devis' : 'Request a Quote'}
              </span>
            </Button>

            {/* Effet de pulse */}
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

