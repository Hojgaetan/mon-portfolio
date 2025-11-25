import warehouse1 from "@/assets/warehouse-1.jpg";
import warehouse2 from "@/assets/warehouse-2.jpg";
import softwareDashboard from "@/assets/software-dashboard.jpg";
import pythonInventory from "@/assets/python-inventory.jpg";
import { useTypewriter } from "@/hooks/use-typewriter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export const HeroSection = () => {
  const { language } = useLanguage();
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false }) as any
  );

  const carouselImages = [warehouse1, softwareDashboard, warehouse2, pythonInventory];

  // Animation de frappe pour le greeting
  const typewriterWords = language === 'fr' 
    ? ["gestion_de_stock", "python", "logiciels_sur_mesure", "PME", "inventaire", "ERP"]
    : ["inventory_management", "python", "custom_software", "SME", "stock_control", "ERP"];
    
  const typewriterText = useTypewriter({
    words: typewriterWords,
    typeSpeed: 150,
    deleteSpeed: 100,
    delayBetweenWords: 2000,
    loop: true
  });

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background carousel */}
      <div className="absolute inset-0">
        <Carousel
          plugins={[plugin.current as any]}
          className="w-full h-full"
          opts={{
            loop: true,
          }}
        >
          <CarouselContent className="h-screen">
            {carouselImages.map((image, index) => (
              <CarouselItem key={index} className="h-screen">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${image})` }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 font-sans">
        <div className="max-w-4xl w-full">
          <div className="space-y-8 animate-fade-in-up">
            {/* Greeting */}
            <div className="space-y-2">
              <p className="text-accent-blue font-sans text-lg md:text-xl font-medium">
                _{typewriterText}
                <span className="animate-pulse text-accent-sky">|</span>
              </p>

              {/* Name */}
              <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
                Joel-Gaetan
                <br />
                <span className="text-accent-blue">HASSAM-OBAH</span>
              </h1>
              
              {/* Title */}
              <div className="flex items-center space-x-2">
                <span className="text-accent-sky font-mono text-xl">&gt;</span>
                <p className="text-lg md:text-2xl text-muted-foreground font-sans">
                    {language === 'fr' ? 'developpeur_python_freelance' : 'freelance_python_developer'}
                    <br />
                </p>
              </div>
            </div>

            {/* Contact Info as Code */}
            <div className="bg-card/90 backdrop-blur-md rounded-lg p-6 border border-accent-blue/30 shadow-2xl font-sans text-sm space-y-2 max-w-2xl transition-all hover:border-accent-blue/50 hover:shadow-accent-blue/10">
              <div className="text-code-comment font-mono">// bio</div>

              <div className="flex items-center space-x-2 font-mono">
                <span className="text-code-keyword">var</span>
                <span className="text-foreground">bio</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-code-string">"{language === 'fr' ? 'Specialise en developpement de logiciels de gestion de stock sur mesure en Python pour les PME' : 'Specialized in custom Python inventory management software development for SMEs'}"</span>
                <span className="text-muted-foreground">;</span>
              </div>

              <div className="text-code-comment font-mono">// {language === 'fr' ? 'mes-contacts' : 'my-contacts'}</div>

              <div className="flex items-center space-x-2 font-mono">
                <span className="text-code-keyword">const</span>
                <span className="text-foreground">numTelephone</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-code-string">"+221 77 202 04 30"</span>
                <span className="text-muted-foreground">;</span>
              </div>
              
              <div className="text-code-comment font-mono">// {language === 'fr' ? 'mon mail' : 'my email'}</div>
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-code-keyword">const</span>
                <span className="text-foreground">e-mail</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-code-string">"contact@joelhassam.com"</span>
                <span className="text-muted-foreground">;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};