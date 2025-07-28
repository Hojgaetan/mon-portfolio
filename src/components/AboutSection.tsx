import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const AboutSection = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-sidebar-background border-b lg:border-b-0 lg:border-r border-sidebar-border">
        <div className="p-4">
          <div className="space-y-2">
            {/* Informations personnelles */}
            <div>
              <Button variant="ghost" className="w-full justify-start p-1 h-auto text-sidebar-foreground">
                <ChevronDown className="w-4 h-4 mr-1" />
                <span className="font-mono text-sm">_informations-personnelles</span>
              </Button>
              <div className="ml-6 mt-2 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 flex items-center justify-center">📄</span>
                  <span className="text-accent font-mono text-sm">bio</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 flex items-center justify-center">🎯</span>
                  <span className="text-sidebar-foreground font-mono text-sm">centres-d_intérêts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 flex items-center justify-center">🎓</span>
                  <span className="text-blue-400 font-mono text-sm">éducation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 flex items-center justify-center">📸</span>
                  <span className="text-sidebar-foreground font-mono text-sm">lycée/collège</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 flex items-center justify-center">📸</span>
                  <span className="text-sidebar-foreground font-mono text-sm">université</span>
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="mt-4">
              <Button variant="ghost" className="w-full justify-start p-1 h-auto text-sidebar-foreground">
                <ChevronRight className="w-4 h-4 mr-1" />
                <span className="font-mono text-sm">_contacts</span>
              </Button>
            </div>

            {/* Contact info */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 flex items-center justify-center">📧</span>
                <span className="text-sidebar-foreground font-mono text-xs break-all">contact@joelhassam.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 flex items-center justify-center">📱</span>
                <span className="text-sidebar-foreground font-mono text-xs">+221 77 202 04 30</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 flex items-center justify-center">📱</span>
                <span className="text-sidebar-foreground font-mono text-xs">+221 70 818 40 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col xl:flex-row">
        {/* Code Editor */}
        <div className="flex-1 bg-background">
          <div className="border-b border-border bg-sidebar-background">
            <div className="flex items-center">
              <div className="px-4 py-2 bg-background border-r border-border">
                <span className="font-mono text-sm text-foreground">bio</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-x-auto">
            <div className="space-y-2 min-w-max">
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">1</span>
                <span className="text-code-comment">/**</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">2</span>
                <span className="text-code-comment">* À propos de joel-gaetan-hassam-obah</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">3</span>
                <span className="text-code-comment">. Bienvenue dans mon portfolio</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">4</span>
                <span className="text-foreground">.</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">5</span>
                <span className="text-foreground">. </span>
                <span className="text-orange-500">[Diplômé]</span>
                <span className="text-foreground"> Bachelor en conception et développement de solutions digitales</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">6</span>
                <span className="text-foreground">. </span>
                <span className="text-orange-500">[Formation]</span>
                <span className="text-foreground"> conception et développement de solutions digitales</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">7</span>
                <span className="text-foreground">. </span>
                <span className="text-orange-500">[Programmation]</span>
                <span className="text-foreground"> De septembre 2023 j'étais un étudiant en développement web d'où</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">8</span>
                <span className="text-foreground">. j'ai appris les principes de l'analyse, la conception et développement logiciel</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">9</span>
                <span className="text-foreground">.</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground mr-4 select-none w-6">10</span>
                <span className="text-code-comment">*/</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Panel */}
        <div className="w-full xl:w-80 bg-background border-t xl:border-t-0 xl:border-l border-border">
          <div className="p-4">
            <div className="text-foreground font-mono text-xs sm:text-sm mb-4">
              // les langages de programmation que je maitrise et ceux que j'apprends encore
            </div>
            
            <div className="space-y-3">
              {[
                { name: "HTML", checked: true },
                { name: "CSS", checked: true },
                { name: "JavaScript", checked: true },
                { name: "TypeScript", checked: false },
                { name: "React.js", checked: false },
                { name: "Python", checked: true },
                { name: "Git", checked: true },
              ].map((skill) => (
                <div key={skill.name} className="flex items-center space-x-3">
                  <Checkbox 
                    checked={skill.checked} 
                    className="border-accent data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <span className="text-foreground font-mono text-xs sm:text-sm">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};