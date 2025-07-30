import logoBeige from "@/assets/logo fond beige 1.png";
import logoNuit from "@/assets/logo fond nuit 1.png";
import backgroundImage from "@/assets/portfolio-bg.jpg";
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
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl w-full">
          <div className="space-y-8">
            {/* Greeting */}
            <div className="space-y-2">
              <p className="text-muted-foreground font-mono text-lg">Salut, Je suis</p>
              
              {/* Name */}
              <h1 className="text-6xl md:text-7xl font-bold text-primary leading-tight">
                Joel Gaetan
                <br />
                <span className="text-foreground">HASSAM OBAH</span>
              </h1>
              
              {/* Title */}
              <div className="flex items-center space-x-2">
                <span className="text-code-keyword font-mono">&gt;</span>
                <p className="text-xl md:text-2xl text-muted-foreground font-mono">
                  Étudiant Développeur Web/Mobile
                </p>
              </div>
            </div>

            {/* Contact Info as Code */}
            <div className="bg-card/60 backdrop-blur-sm rounded-lg p-6 border border-border font-mono text-sm space-y-2 max-w-2xl">
              <div className="text-code-comment">// mes contacts</div>
              
              <div className="flex items-center space-x-2">
                <span className="text-code-keyword">const</span>
                <span className="text-foreground">numTelephone</span>
                <span className="text-foreground">=</span>
                <span className="text-code-string">"221 77 202 04 30"</span>
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

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground font-mono text-sm">Mes liens sociaux:</span>
              <div className="flex items-center space-x-3">
                <a href="https://www.linkedin.com/in/joel-gaetan-hassam-obah/" target="_blank" rel="noopener noreferrer" className="p-2 bg-card/60 backdrop-blur-sm rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://github.com/Hojgaetan" target="_blank" rel="noopener noreferrer" className="p-2 bg-card/60 backdrop-blur-sm rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};