import logoBeige from "@/assets/logo fond beige 1.png";
import logoNuit from "@/assets/logo fond nuit 1.png";
import { useContext } from "react";
import { ThemeProviderContext } from "./theme-provider";

export const HeroSection = () => {
  const { theme } = useContext(ThemeProviderContext);
  const isDark = (theme === "dark") || (theme === "system" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const backgroundImageLogo = isDark ? logoNuit : logoBeige;

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
              <p className="text-muted-foreground font-sans text-lg">Salut, Je suis</p>

              {/* Name */}
              <h1 className="text-6xl md:text-7xl font-bold text-primary leading-tight">
                Joel Gaetan
                <br />
                <span className="text-foreground">HASSAM OBAH</span>
              </h1>
              
              {/* Title */}
              <div className="flex items-center space-x-2">
                <span className="text-code-keyword font-mono">&gt;</span>
                <p className="text-xl md:text-2xl text-muted-foreground font-sans">
                    Web, Data, IA et Machine Learning programmeur
                    <br />
                </p>
              </div>
            </div>

            {/* Contact Info as Code */}
            <div className="bg-card/60 backdrop-blur-sm rounded-lg p-6 border border-border font-sans text-sm space-y-2 max-w-2xl">
              <div className="text-code-comment">// bio</div>

              <div className="flex items-center space-x-2">
                <span className="text-code-keyword">var</span>
                <span className="text-foreground">bio</span>
                <span className="text-foreground">=</span>
                <span className="text-code-string">"Passionne par les nouvelles technologies, l'i.a, la data Science et l'automatisme"</span>
                <span className="text-foreground">;</span>
              </div>

              <div className="text-code-comment">// mes-contacts</div>
              
              <div className="flex items-center space-x-2">
                <span className="text-code-keyword">const</span>
                <span className="text-foreground">numTelephone</span>
                <span className="text-foreground">=</span>
                <span className="text-code-string">"+221 77 202 04 30"</span>
                <span className="text-foreground">;</span>
              </div>
              
              <div className="text-code-comment">// mon mail</div>
              <div className="flex items-center space-x-2">
                <span className="text-code-keyword">const</span>
                <span className="text-foreground">e-mail</span>
                <span className="text-foreground">=</span>
                <span className="text-code-string">"contact@joelhassam.me"</span>
                <span className="text-foreground">;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};