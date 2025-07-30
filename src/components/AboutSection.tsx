import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText, FileMusic, FileCode, FileStack, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Resizable } from "re-resizable";

export const AboutSection = () => {
  const [selectedInfo, setSelectedInfo] = useState("bio");
  const [infoOpen, setInfoOpen] = useState(true);
  const [contactsOpen, setContactsOpen] = useState(false);

  const infoContents: Record<string, JSX.Element> = {
    bio: (
      <div className="space-y-2 min-w-max font-sans">
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
          <span className="text-orange-500">[Nom & Prenoms]</span>
            <span className="text-foreground"> Joel Gaetan <strong>HASSAM OBAH</strong></span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">6</span>
          <span className="text-foreground">. </span>
          <span className="text-orange-500">[Date & Lieu de Naissance]</span>
          <span className="text-foreground"> Nee le 28 Decembre 1997 a Douala, Cameroun</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">7</span>
          <span className="text-foreground">. </span>
          <span className="text-orange-500">[Lieu de Residence]</span>
          <span className="text-foreground"> Colobane - Dakar, Senegal</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">8</span>
          <span className="text-foreground">. </span>
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
    ),
    "centres-d_intérêts": (
      <div className="space-y-2 min-w-max font-sans">
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">1</span>
          <span className="text-code-comment">/**</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">2</span>
          <span className="text-code-comment">* Centres d'intérêts</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">3</span>
          <span className="text-foreground">- Programmation</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">4</span>
          <span className="text-foreground">- Musique</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">5</span>
          <span className="text-foreground">- Lecture</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">6</span>
          <span className="text-foreground">- Sport</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">7</span>
          <span className="text-code-comment">*/</span>
        </div>
      </div>
    ),
    "éducation": (
      <div className="space-y-2 min-w-max font-sans">
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">1</span>
          <span className="text-code-comment">/**</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">2</span>
          <span className="text-code-comment">* Éducation</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">3</span>
          <span className="text-foreground">- Bachelor en conception et développement de solutions digitales</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">4</span>
          <span className="text-foreground">- Formation continue en développement web</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">5</span>
          <span className="text-code-comment">*/</span>
        </div>
      </div>
    ),
    "lycée/collège": (
      <div className="space-y-2 min-w-max font-sans">
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">1</span>
          <span className="text-code-comment">/**</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">2</span>
          <span className="text-code-comment">* Lycée / Collège</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">3</span>
          <span className="text-foreground">- Lycée d'Akwa Nord - Douala, Cameroun (2007 - 2010)</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">4</span>
          <span className="text-foreground">- Lycée de Nkolnda, Nsimalen - Yaounde, Cameroun (2010 - 2011)</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">5</span>
          <span className="text-foreground">- College Ndi Samba - Yaounde, Cameroun (2011 - 2013)</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">6</span>
          <span className="text-foreground">- Lycée de Nkolndongo - Yaounde, Cameroun (2013 - 2015)</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">7</span>
          <span className="text-foreground">- Lycée d'Akwa Nord - Douala, Cameroun (2015 - 2017) - <strong>Baccalaureat</strong></span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">8</span>
          <span className="text-code-comment">*/</span>
        </div>
      </div>
    ),
    "université": (
      <div className="space-y-2 min-w-max font-sans">
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">1</span>
          <span className="text-code-comment">/**</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">2</span>
          <span className="text-code-comment">* Université</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">3</span>
          <span className="text-foreground">- Université de Douala, Cameroun (Mathematiques)</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">4</span>
          <span className="text-foreground">- IUT de Douala, Cameroun (Genie Electrique et Informatique Industrielle)</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">5</span>
          <span className="text-foreground">- ISM Dakar, Senegal (En cours)</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">4</span>
          <span className="text-code-comment">*/</span>
        </div>
      </div>
    ),
  };

  return (
    <div className="flex flex-col xl:flex-row h-full w-full font-sans">
      {/* Sidebar */}
      <Resizable
        defaultSize={{ width: 260, height: "100%" }}
        minWidth={140}
        maxWidth={480}
        enable={{ right: true }}
        handleStyles={{ right: { right: 0, width: 6, background: 'rgba(0,0,0,0.05)', cursor: 'col-resize', zIndex: 10 } }}
        className="relative h-full min-h-0 min-w-0"
      >
        <div className="h-full min-h-0 min-w-0 bg-sidebar-background border-b border-r border-sidebar-border flex flex-col font-sans">
          <div className="space-y-2">
            <div className="space-y-2 sticky top-12 z-20 bg-sidebar-background">
              {/* Informations personnelles */}
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-1 h-auto text-sidebar-foreground"
                  onClick={() => setInfoOpen((open) => !open)}
                >
                  {infoOpen ? (
                    <FolderOpen className="w-4 h-4 mr-1" />
                  ) : (
                    <Folder className="w-4 h-4 mr-1" />
                  )}
                  <span className="font-mono text-sm">_informations-personnelles</span>
                </Button>
                {infoOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {[
                      { icon: <FileText className="w-4 h-4" />, label: "bio", color: "text-sidebar-foreground" },
                      { icon: <FileMusic className="w-4 h-4" />, label: "centres-d_intérêts", color: "text-sidebar-foreground" },
                      { icon: <FileCode className="w-4 h-4" />, label: "éducation", color: "text-sidebar-foreground" },
                      { icon: <FileStack className="w-4 h-4" />, label: "lycée/collège", color: "text-sidebar-foreground" },
                      { icon: <FileBarChart2 className="w-4 h-4" />, label: "université", color: "text-sidebar-foreground" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center space-x-2 cursor-pointer rounded px-1 py-0.5 transition-colors duration-150 ${selectedInfo === item.label ? "bg-accent/20 text-accent font-semibold" : "hover:bg-accent/10"}`}
                        onClick={() => setSelectedInfo(item.label)}
                      >
                        <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
                        <span className={`${item.color} font-sans text-sm`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contacts */}
              <div className="mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-1 h-auto text-sidebar-foreground"
                  onClick={() => setContactsOpen((open) => !open)}
                >
                  {contactsOpen ? (
                    <FolderOpen className="w-4 h-4 mr-1" />
                  ) : (
                    <Folder className="w-4 h-4 mr-1" />
                  )}
                  <span className="font-mono text-sm">_contacts</span>
                </Button>
                {contactsOpen && (
                  <div className="ml-6 mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 flex items-center justify-center">📧</span>
                      <span className="text-sidebar-foreground font-sans text-xs break-all">contact@joelhassam.me</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 flex items-center justify-center">📱</span>
                      <span className="text-sidebar-foreground font-sans text-xs">+221 77 202 04 30</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 flex items-center justify-center">📱</span>
                      <span className="text-sidebar-foreground font-sans text-xs">+221 70 818 40 10</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Guide interactif pour l'utilisateur */}
              <div className="mt-6">
                <div className="bg-accent/80 text-xs text-foreground px-2 py-1 rounded shadow pointer-events-none select-none animate-pulse w-fit dark:bg-accent/60 dark:text-white text-white">
                  ↔ Glissez le bord droit pour ajuster la largeur de la barre latérale
                </div>
              </div>
            </div>
          </div>
        </div>
      </Resizable>
      {/* Main Content */}
      <div className="flex-1 flex flex-col xl:flex-row h-full font-sans">
        {/* Code Editor */}
        <div className="flex-1">
          <div className="border-b border-border bg-sidebar-background sticky top-12 z-10">
            <div className="flex items-center">
              <div className="px-4 py-2 bg-background border-r border-border">
                <span className="font-mono text-sm text-foreground">{selectedInfo}</span>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 font-sans text-xs sm:text-sm overflow-x-auto">
            {infoContents[selectedInfo]}
          </div>
        </div>
        {/* Skills Panel */}
        <div className="w-full xl:w-80 bg-background border-t xl:border-t-0 xl:border-l border-border font-sans">
          <div className="p-4">
            <div className="text-foreground font-sans text-xs sm:text-sm mb-4">
              // les langages de programmation que je maitrise et ceux que j'apprends encore
            </div>
            <div className="space-y-3">
              {[
                { name: "HTML", checked: true },
                { name: "CSS", checked: true },
                { name: "JavaScript", checked: true },
                { name: "TypeScript", checked: true },
                { name: "React.js", checked: true },
                { name: "Python", checked: true },
                { name: "Git", checked: true },
                { name: "Node.js", checked: true },
                { name: "Express.js", checked: false },
                { name: "MongoDB", checked: false },
                { name: "Next.js", checked: false },
                { name: "Vue.js", checked: false },
                { name: "Angular", checked: false },
              ].map((skill) => (
                <div key={skill.name} className="flex items-center space-x-3">
                  <Checkbox
                    checked={skill.checked}
                    className="border-accent data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <span className="text-foreground font-sans text-xs sm:text-sm">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
