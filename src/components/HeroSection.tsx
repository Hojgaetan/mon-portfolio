import logoBeige from "@/assets/logo fond beige 1.png";
import logoNuit from "@/assets/logo fond nuit 1.png";
import { useContext } from "react";
import { ThemeProviderContext } from "./theme-provider";
import { useTypewriter } from "@/hooks/use-typewriter";
import { useLanguage } from "@/contexts/LanguageContext";

export const HeroSection = () => {
  const { theme } = useContext(ThemeProviderContext);
  const { language } = useLanguage();
  const isDark = (theme === "dark") || (theme === "system" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const backgroundImageLogo = isDark ? logoNuit : logoBeige;

  // Animation de frappe pour le greeting
  const typewriterWords = language === 'fr' 
    ? ["developpement_web", "data_science", "intelligence-artificielle", "machine-learning", "automatisation"]
    : ["web_development", "data_science", "artificial-intelligence", "machine-learning", "automation"];
    
  const typewriterText = useTypewriter({
    words: typewriterWords,
    typeSpeed: 150,
    deleteSpeed: 100,
    delayBetweenWords: 2000,
    loop: true
  });

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background with blur effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImageLogo})` }}
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 font-sans">
        <div className="max-w-4xl w-full">
          <div className="space-y-8">
            {/* Greeting */}
            <div className="space-y-2">
              <p className="text-muted-foreground font-sans text-lg">
                _{typewriterText}
                <span className="animate-pulse">|</span>

              </p>

              {/* Name */}
              <h1 className="text-6xl md:text-7xl font-bold text-primary leading-tight">
                Joel-Gaetan
                <br />
                <span className="text-foreground">HASSAM-OBAH</span>
              </h1>
              
              {/* Title */}
              <div className="flex items-center space-x-2">
                <span className="text-code-keyword font-mono">&gt;</span>
                <p className="text-xl md:text-2xl text-muted-foreground font-sans">
                    {language === 'fr' ? 'etudiant_en_informatique' : 'computer_science_student'}
                    <br />
                </p>
              </div>
            </div>

            {/* Contact Info as Code */}
            <div className="bg-card/60 backdrop-blur-sm rounded-lg p-6 border border-accent-blue/20 font-sans text-sm space-y-2 max-w-2xl">
              <div className="text-code-comment">// bio</div>

              <div className="flex items-center space-x-2">
                <span className="text-code-keyword">var</span>
                <span className="text-foreground">bio</span>
                <span className="text-foreground">=</span>
                <span className="text-code-string">"{language === 'fr' ? 'Passionne par les nouvelles technologies, le web, l\'i.a, la data, le machine learning et l\'automatisation' : 'Passionate about new technologies, web, A.I, data, machine learning and automation'}"</span>
                <span className="text-foreground">;</span>
              </div>

              <div className="text-code-comment">// {language === 'fr' ? 'mes-contacts' : 'my-contacts'}</div>
              
              <div className="flex items-center space-x-2">
                <span className="text-code-keyword">const</span>
                <span className="text-foreground">numTelephone</span>
                <span className="text-foreground">=</span>
                <span className="text-code-string">"+221 77 202 04 30"</span>
                <span className="text-foreground">;</span>
              </div>
              
              <div className="text-code-comment">// {language === 'fr' ? 'mon mail' : 'my email'}</div>
              <div className="flex items-center space-x-2">
                <span className="text-code-keyword">const</span>
                <span className="text-foreground">e-mail</span>
                <span className="text-foreground">=</span>
                <span className="text-code-string">"contact@joelhassam.com"</span>
                <span className="text-foreground">;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};