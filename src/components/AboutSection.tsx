import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText, FileMusic, FileCode, FileStack, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Resizable } from "re-resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { TechIcon } from "@/components/TechIcon";

// Types pour une meilleure structure des données
interface SidebarItem {
  id: string;
  label: string;
  icon: JSX.Element;
  content: JSX.Element;
}

interface SidebarSection {
  id: string;
  label: string;
  icon: { closed: JSX.Element; open: JSX.Element };
  items: SidebarItem[];
}

export const AboutSection = () => {
  const isMobile = useIsMobile();
  const [selectedInfo, setSelectedInfo] = useState("bio");
  const [openSections, setOpenSections] = useState({
    info: true,
    education: false,
    experiences: false,
    stages: false,
    emplois: false,
    contacts: false,
  });

  // Helper function pour basculer l'état d'ouverture des sections
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId as keyof typeof prev]
    }));
  };

  // Fonction helper pour créer le contenu formaté
  const createFormattedContent = (title: string, content: Array<{ type: 'comment' | 'text' | 'highlight' | 'emphasis', text: string }>) => {
    return (
      <div className="space-y-2 min-w-max font-sans">
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">1.</span>
          <span className="text-code-comment">/**</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">2.</span>
          <span className="text-code-comment">* {title}</span>
        </div>
        <div className="flex">
          <span className="text-muted-foreground mr-4 select-none w-6">3.</span>
          <span className="text-code-comment">*/</span>
        </div>
        {content.map((item, index) => (
          <div key={index} className="flex">
            <span className="text-muted-foreground mr-4 select-none w-6">{index + 4}.</span>
            <span className={
              item.type === 'comment' ? 'text-code-comment' :
              item.type === 'highlight' ? 'text-[#38b6ff]' :
              item.type === 'emphasis' ? 'text-[#df3821]' :
              'text-foreground'
            }>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Configuration des données de la sidebar
  const sidebarData: SidebarSection[] = [
    {
      id: "info",
      label: "_informations-personnelles",
      icon: {
        closed: <Folder className="w-4 h-4 mr-1" />,
        open: <FolderOpen className="w-4 h-4 mr-1" />
      },
      items: [
        {
          id: "bio",
          label: "bio",
          icon: <FileText className="w-4 h-4" />,
          content: createFormattedContent("Bio", [
            { type: 'text', text: ' ' },
            { type: 'text', text: ' Passionné par le développement web et l\'expérience utilisateur,' },
            { type: 'text', text: ' je suis Developpeur web dans la création de sites internet et d\'applications web responsives.' },
            { type: 'text', text: ' Ma maîtrise des technologies HTML, CSS et JavaScript, combinée à une connaissance approfondie des frameworks modernes,' },
            { type: 'text', text: ' me permet de transformer des maquettes graphiques en interfaces web performantes et esthétiques.' },
            { type: 'text', text: ' Toujours à l\'affût des dernières tendances et des meilleures pratiques en matière.' },
          ])
        },
        {
          id: "centres-d_intérêts",
          label: "centres-d_intérêts",
          icon: <FileMusic className="w-4 h-4" />,
          content: createFormattedContent("Centres d'intérêts", [
            { type: 'text', text: '- Programmation' },
            { type: 'text', text: '- Musique' },
            { type: 'text', text: '- Lecture' },
            { type: 'text', text: '- Sport' },
          ])
        }
      ]
    },
    {
      id: "education",
      label: "_éducation",
      icon: {
        closed: <Folder className="w-4 h-4 mr-1" />,
        open: <FolderOpen className="w-4 h-4 mr-1" />
      },
      items: [
        {
          id: "lycée/collège",
          label: "lycée/collège",
          icon: <FileStack className="w-4 h-4" />,
          content: createFormattedContent("Lycée / Collège", [
            { type: 'text', text: '- Lycée d\'Akwa Nord - Douala, Cameroun (2007 - 2010)' },
            { type: 'text', text: '- Lycée de Nkolnda, Nsimalen - Yaounde, Cameroun (2010 - 2011)' },
            { type: 'text', text: '- College Ndi Samba - Yaounde, Cameroun (2011 - 2013)' },
            { type: 'text', text: '- Lycée de Nkolndongo - Yaounde, Cameroun (2013 - 2015)' },
            { type: 'text', text: '- Lycée d\'Akwa Nord - Douala, Cameroun (2015 - 2017) - Baccalaureat' },
          ])
        },
        {
          id: "université",
          label: "université",
          icon: <FileBarChart2 className="w-4 h-4" />,
          content: createFormattedContent("Université", [
            { type: 'text', text: '- Université de Douala, Cameroun (Mathematiques)' },
            { type: 'text', text: '- IUT de Douala, Cameroun (Genie Electrique et Informatique Industrielle)' },
            { type: 'text', text: '- ISM Dakar, Senegal (En cours)' },
          ])
        }
      ]
    }
  ];

  // Trouver le contenu sélectionné
  const getSelectedContent = () => {
    for (const section of sidebarData) {
      const item = section.items.find(item => item.id === selectedInfo);
      if (item) return item.content;
    }

    // Fallback pour les anciens contenus non migrés
    const legacyContent: Record<string, JSX.Element> = {
      "Developpeur Web / Responsable SEO": (
        <div className="space-y-2 min-w-max font-sans">
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">1.</span><span className="text-code-comment">/**</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">2.</span><span className="text-code-comment">* Developpeur Web / Responsable SEO - MAJORANTS Academy </span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">3.</span><span className="text-code-comment">*/</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">4.</span><span className="text-foreground"><i>Entreprise specialise dans la preparation de concours Nationaux au Cameroun</i></span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">5.</span><span className="text-foreground text-[#df3821]"><i>Stage pre-Emploi | Douala, Cameroun | Juin 2023 - Août 2023 | CDD</i></span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">6.</span><span className="text-foreground"></span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">7.</span><span className="text-foreground text-[#38b6ff]">Maintenance et optimisation du site web : </span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">8.</span><span className="text-foreground">Mise à jour régulière du contenu et des plugins WordPress pour garantir une disponibilité à 99,9%.</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">9</span><span className="text-foreground text-[#38b6ff]">Stratégie SEO et visibilité : </span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">10</span><span className="text-foreground">Audit technique et optimisation des balises meta/titles (+50% de clics organiques en 02 mois).</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">11</span><span className="text-foreground text-[#38b6ff]">Collaboration cross-fonctionnelle : </span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">12</span><span className="text-foreground">Refonte de l’UI/UX avec le designer (Figma), réduisant le taux de rebond de 30%.</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">13</span><span className="text-foreground text-[#38b6ff]">Projets techniques : </span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">14</span><span className="text-foreground">Migration du site vers un hébergement plus performant (Hostinger), diminuant le temps de chargement de 2,5s à 0,8s.</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">15</span><span className="text-foreground">Intégration de maquettes responsive pour mobile, augmentant le trafic mobile de 40%.</span></div>
        </div>
      ),
      "Responsable Informatique": (
        <div className="space-y-2 min-w-max font-sans">
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">1.</span><span className="text-code-comment">/**</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">2.</span><span className="text-code-comment">* Responsable Informatique- MAJORANTS Academy </span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">3.</span><span className="text-code-comment">*/</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">4.</span><span className="text-foreground"><i>Entreprise specialise dans la preparation de concours Nationaux au Cameroun</i></span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">5.</span><span className="text-foreground text-[#df3821]"><i>Travail a distance | Douala, Cameroun | Depuis Septembre 2023 | CDD</i></span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">6.</span><span className="text-foreground"></span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">7.</span><span className="text-foreground text-[#38b6ff]">Management d’équipe à distance : </span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">8</span><span className="text-foreground">Encadrement d’un developpeur en interne en mode remote</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">9</span><span className="text-foreground text-[#38b6ff]">Innovation et transformation digitale : </span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">10</span><span className="text-foreground">Déploiement d’outils collaboratifs (Trello) pour améliorer la productivité en télétravail.</span></div>
        </div>
      )
    };

    return legacyContent[selectedInfo] || <div>Contenu non trouvé</div>;
  };

  return (
    <div className="flex flex-col xl:flex-row h-full w-full font-sans">
      {/* Sidebar */}
      <Resizable
        size={isMobile ? { width: "100%", height: "auto" } : { width: 260, height: "100%" }}
        minWidth={isMobile ? "100%" : 140}
        maxWidth={isMobile ? "100%" : 480}
        enable={isMobile ? {} : { right: true }}
        handleStyles={isMobile ? {} : { right: { right: 0, width: 6, background: 'rgba(0,0,0,0.05)', cursor: 'col-resize', zIndex: 10 } }}
        className="relative h-full min-h-0 min-w-0 xl:h-full"
      >
        <div className="h-full min-h-0 min-w-0 bg-sidebar-background border-b border-r border-sidebar-border flex flex-col font-sans">
          <div className="space-y-2">
            <div className="space-y-2 sticky top-12 z-20 bg-sidebar-background">
              {/* Sections dynamiques */}
              {sidebarData.map((section) => (
                <div key={section.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-1 h-auto text-sidebar-foreground"
                    onClick={() => toggleSection(section.id)}
                  >
                    {openSections[section.id as keyof typeof openSections] ? (
                      <ChevronDown className="w-4 h-4 mr-1" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-1" />
                    )}
                    {openSections[section.id as keyof typeof openSections] ? section.icon.open : section.icon.closed}
                    <span className="font-mono text-sm">{section.label}</span>
                  </Button>
                  {openSections[section.id as keyof typeof openSections] && (
                    <div className="ml-6 mt-2 space-y-1">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center space-x-2 cursor-pointer rounded px-1 py-0.5 transition-colors duration-150 ${
                            selectedInfo === item.id ? "bg-accent/20 text-accent font-semibold" : "hover:bg-accent/10"
                          }`}
                          onClick={() => setSelectedInfo(item.id)}
                        >
                          <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
                          <span className="text-sidebar-foreground font-sans text-sm">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Expériences (ancienne structure maintenue pour compatibilité) */}
              <div className="mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-1 h-auto text-sidebar-foreground"
                  onClick={() => toggleSection("experiences")}
                >
                  {openSections.experiences ? (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-1" />
                  )}
                  {openSections.experiences ? (
                    <FolderOpen className="w-4 h-4 mr-1" />
                  ) : (
                    <Folder className="w-4 h-4 mr-1" />
                  )}
                  <span className="font-mono text-sm">_experiences</span>
                </Button>
                {openSections.experiences && (
                  <div className="ml-6 mt-2 space-y-1">
                    {/* Stages */}
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-1 h-auto text-sidebar-foreground"
                        onClick={() => toggleSection("stages")}
                      >
                        {openSections.stages ? (
                          <ChevronDown className="w-4 h-4 mr-1" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mr-1" />
                        )}
                        {openSections.stages ? (
                          <FolderOpen className="w-4 h-4 mr-1" />
                        ) : (
                          <Folder className="w-4 h-4 mr-1" />
                        )}
                        <span className="font-mono text-sm">_stages</span>
                      </Button>
                      {openSections.stages && (
                        <div className="ml-6 mt-2 space-y-1">
                          {["Developpeur Web / Responsable SEO"].map((file) => (
                            <div
                              key={file}
                              className={`flex items-center space-x-2 cursor-pointer rounded px-1 py-0.5 transition-colors duration-150 ${selectedInfo === file ? "bg-accent/20 text-accent font-semibold" : "hover:bg-accent/10"}`}
                              onClick={() => setSelectedInfo(file)}
                            >
                              <span className="w-4 h-4 flex items-center justify-center"><FileText className="w-4 h-4" /></span>
                              <span className="text-sidebar-foreground font-sans text-sm">{file}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Emplois */}
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-1 h-auto text-sidebar-foreground"
                        onClick={() => toggleSection("emplois")}
                      >
                        {openSections.emplois ? (
                          <ChevronDown className="w-4 h-4 mr-1" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mr-1" />
                        )}
                        {openSections.emplois ? (
                          <FolderOpen className="w-4 h-4 mr-1" />
                        ) : (
                          <Folder className="w-4 h-4 mr-1" />
                        )}
                        <span className="font-mono text-sm">_emplois</span>
                      </Button>
                      {openSections.emplois && (
                        <div className="ml-6 mt-2 space-y-1">
                          {["Responsable Informatique"].map((file) => (
                            <div
                              key={file}
                              className={`flex items-center space-x-2 cursor-pointer rounded px-1 py-0.5 transition-colors duration-150 ${selectedInfo === file ? "bg-accent/20 text-accent font-semibold" : "hover:bg-accent/10"}`}
                              onClick={() => setSelectedInfo(file)}
                            >
                              <span className="w-4 h-4 flex items-center justify-center"><FileText className="w-4 h-4" /></span>
                              <span className="text-sidebar-foreground font-sans text-sm">{file}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contacts */}
              <div className="mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-1 h-auto text-sidebar-foreground"
                  onClick={() => toggleSection("contacts")}
                >
                  {openSections.contacts ? (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-1" />
                  )}
                  {openSections.contacts ? (
                    <FolderOpen className="w-4 h-4 mr-1" />
                  ) : (
                    <Folder className="w-4 h-4 mr-1" />
                  )}
                  <span className="font-mono text-sm">_contacts</span>
                </Button>
                {openSections.contacts && (
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
            </div>
          </div>
        </div>
      </Resizable>

      {/* Main Content */}
      <div className="flex-1 flex flex-col xl:flex-row h-full font-sans text-[13px] sm:text-[15px]">
        {/* Code Editor */}
        <div className="flex-1">
          <div className="border-b border-border bg-sidebar-background sticky top-1 z-10">
            <div className="flex items-center">
              <div className="px-4 py-1 bg-background border-r border-border">
                <span className="font-mono text-sm text-foreground">{selectedInfo}</span>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 font-sans text-[13px] sm:text-[15px] overflow-x-auto">
            {getSelectedContent()}
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
                { name: "React", checked: true },
                { name: "Python", checked: true },
                { name: "Git", checked: true },
                { name: "Node.js", checked: true },
                { name: "Express", checked: false },
                { name: "MongoDB", checked: false },
                { name: "Next.js", checked: true },
                { name: "Vue.js", checked: true },
                { name: "Angular", checked: false },
              ].map((skill) => (
                <div key={skill.name} className="flex items-center space-x-3">
                  <Checkbox
                    checked={skill.checked}
                    className="border-accent data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <TechIcon tech={skill.name} />
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
