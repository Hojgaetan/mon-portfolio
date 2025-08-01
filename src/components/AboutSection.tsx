import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText, FileMusic, FileCode, FileStack, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { TechIcon } from "@/components/TechIcon";
import { supabase } from "@/integrations/supabase/client";

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
  const [aboutSections, setAboutSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedFoldersInOverlay, setExpandedFoldersInOverlay] = useState<string[]>([]); // Nouvel état pour les dossiers ouverts dans l'overlay

  // État d'ouverture des sections calculé dynamiquement basé sur le fichier sélectionné
  const getOpenSections = () => {
    // Trouver la section qui contient le fichier sélectionné
    const selectedSection = aboutSections.find(section => section.section_key === selectedInfo);
    const selectedSectionType = selectedSection?.section_type;

    // Ouvrir seulement la section qui contient le fichier sélectionné
    return {
      info: selectedSectionType === 'info',
      education: selectedSectionType === 'education',
      experience: selectedSectionType === 'experience',
    };
  };

  const openSections = getOpenSections();

  // Fonction pour obtenir le nom du dossier actif
  const getActiveFolderName = () => {
    const selectedSection = aboutSections.find(section => section.section_key === selectedInfo);
    const sectionType = selectedSection?.section_type;

    switch (sectionType) {
      case 'info':
        return '_informations-personnelles';
      case 'education':
        return '_éducation';
      case 'experience':
        return '_experiences';
      default:
        return '_dossier';
    }
  };

  useEffect(() => {
    fetchAboutSections();
  }, []);

  const fetchAboutSections = async () => {
    try {
      const { data, error } = await supabase
        .from("about_sections")
        .select("*")
        .eq("is_active", true)
        .order("section_type", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) throw error;
      setAboutSections(data || []);
      
      // Set first available section as default
      if (data && data.length > 0) {
        setSelectedInfo(data[0].section_key);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des sections:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function pour gérer le clic sur une section
  // Sélectionne le premier fichier de la section, ce qui ouvrira automatiquement le bon dossier
  const handleSectionClick = (sectionId: string) => {
    // Trouver le premier fichier dans cette section
    const section = sidebarData.find(s => s.id === sectionId);
    if (section && section.items.length > 0) {
      setSelectedInfo(section.items[0].id);
    }
  };

  // Fonction helper pour créer le contenu formaté à partir des données de la DB
  const renderContentFromDB = (section: any) => {
    const { title } = section;
    let content = section.content;
    
    // Ensure content is parsed as object if it's a string
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing content JSON:', error);
        return <div className="text-red-500">Erreur de format du contenu</div>;
      }
    }
    
    // Validate content structure
    if (!content || typeof content !== 'object') {
      return <div className="text-muted-foreground">Contenu non disponible</div>;
    }
    
    // Handle different content formats
    if (content?.lines && Array.isArray(content.lines)) {
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
          {content.lines.map((item: any, index: number) => (
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
    }
    
    // Handle experience format
    if (content?.company || content?.description) {
      return (
        <div className="space-y-2 min-w-max font-sans">
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">1.</span><span className="text-code-comment">/**</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">2.</span><span className="text-code-comment">* {title}</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">3.</span><span className="text-code-comment">*/</span></div>
          {content.description && (
            <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">4.</span><span className="text-foreground"><i>{content.description}</i></span></div>
          )}
          {content.period && (
            <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">5.</span><span className="text-foreground text-[#df3821]"><i>{content.period}</i></span></div>
          )}
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">6.</span><span className="text-foreground"></span></div>
          {content.tasks && Array.isArray(content.tasks) && content.tasks.map((task: any, index: number) => (
            <div key={index} className="flex">
              <span className="text-muted-foreground mr-4 select-none w-6">{index + 7}</span>
              <span className={
                task.type === 'highlight' ? 'text-[#38b6ff]' :
                task.type === 'emphasis' ? 'text-[#df3821]' :
                'text-foreground'
              }>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback for simple text content
    if (typeof content === 'string') {
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
          <div className="flex">
            <span className="text-muted-foreground mr-4 select-none w-6">4.</span>
            <span className="text-foreground">{content}</span>
          </div>
        </div>
      );
    }
    
    return <div className="text-muted-foreground">Format de contenu non reconnu</div>;
  };

  // Get icon component by name
  const getIconComponent = (iconName: string | null) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'FileMusic': return <FileMusic className="w-4 h-4" />;
      case 'FileStack': return <FileStack className="w-4 h-4" />;
      case 'FileBarChart2': return <FileBarChart2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Group sections by type
  const groupedSections = aboutSections.reduce((acc, section) => {
    if (!acc[section.section_type]) {
      acc[section.section_type] = [];
    }
    acc[section.section_type].push(section);
    return acc;
  }, {} as Record<string, any[]>);

  // Configuration des données de la sidebar avec données de la DB
  const sidebarData = Object.entries(groupedSections).map(([type, sections]) => ({
    id: type,
    label: type === 'info' ? '_informations-personnelles' : 
           type === 'education' ? '_éducation' : 
           type === 'experience' ? '_experiences' : `_${type}`,
    icon: {
      closed: <Folder className="w-4 h-4 mr-1" />,
      open: <FolderOpen className="w-4 h-4 mr-1" />
    },
    items: Array.isArray(sections) ? sections.map(section => ({
      id: section.section_key,
      label: section.section_key,
      icon: getIconComponent(section.icon_name),
      content: renderContentFromDB(section)
    })) : []
  }));

  // Trouver le contenu sélectionn��
  const getSelectedContent = () => {
    for (const section of sidebarData) {
      const item = section.items.find((item: any) => item.id === selectedInfo);
      if (item) return item.content;
    }
    return <div>Contenu non trouvé</div>;
  };

  // Fonction pour obtenir les fichiers du dossier actif seulement
  const getActiveFolderFiles = () => {
    const selectedSection = aboutSections.find(section => section.section_key === selectedInfo);
    const selectedSectionType = selectedSection?.section_type;

    // Trouver la section correspondante dans sidebarData
    const activeSection = sidebarData.find(section => section.id === selectedSectionType);
    return activeSection ? activeSection.items : [];
  };

  // Fonction pour basculer l'état d'ouverture d'un dossier dans l'overlay
  const toggleFolderInOverlay = (folderId: string) => {
    setExpandedFoldersInOverlay(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (aboutSections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground font-mono">// Aucune information disponible</span>
      </div>
    );
  }

  return (
    <section id="about" className="bg-background font-sans">
      <div className="border-t">
        {isMobile ? (
          // Layout mobile optimisé avec navigation par onglets
          <div className="min-h-screen flex flex-col relative">
            {/* Header mobile avec sélection de dossier */}
            <div className="bg-sidebar-background border-b border-sidebar-border p-3 relative z-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded text-sm hover:bg-muted transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="font-mono">{getActiveFolderName()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
                </button>
                <span className="text-xs text-muted-foreground">Explorateur</span>
              </div>
            </div>

            {/* Overlay avec flou quand la navigation est ouverte */}
            {isSidebarOpen && (
              <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar mobile en overlay plein écran */}
            {isSidebarOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-sidebar-background border border-sidebar-border rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
                  {/* Header de la navigation */}
                  <div className="bg-background border-b border-border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        Explorateur
                      </h3>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Contenu de la navigation - Dossiers cliquables avec exploration progressive */}
                  <div className="overflow-y-auto max-h-[60vh] p-4">
                    <div className="space-y-3">
                      {sidebarData.map((section) => (
                        <div key={section.id} className="space-y-2">
                          {/* Header du dossier - cliquable pour révéler le contenu */}
                          <button
                            onClick={() => toggleFolderInOverlay(section.id)}
                            className="w-full flex items-center gap-2 p-3 bg-muted/80 rounded-lg font-mono text-sm text-foreground border border-border hover:bg-muted hover:shadow-md transition-all duration-200"
                          >
                            {expandedFoldersInOverlay.includes(section.id) ? (
                              <ChevronDown className="w-4 h-4 text-primary" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            {expandedFoldersInOverlay.includes(section.id) ? (
                              <FolderOpen className="w-4 h-4 text-primary" />
                            ) : (
                              <Folder className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="font-medium text-foreground flex-1 text-left">{section.label}</span>
                            <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                              {section.items.length} fichier{section.items.length > 1 ? 's' : ''}
                            </div>
                          </button>

                          {/* Fichiers du dossier - visibles seulement si le dossier est ouvert */}
                          {expandedFoldersInOverlay.includes(section.id) && (
                            <div className="ml-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                              <div className="text-xs text-muted-foreground ml-6 mb-2 italic">
                                📂 Contenu de {section.label}
                              </div>
                              {section.items.map((item) => (
                                <button
                                  key={item.id}
                                  className={`flex items-center space-x-3 w-full text-left rounded-lg px-3 py-2.5 transition-all duration-200 text-sm ml-6 ${
                                    selectedInfo === item.id 
                                      ? "bg-primary/15 text-primary font-medium border border-primary/40 shadow-sm scale-[1.02]" 
                                      : "hover:bg-muted/60 text-foreground hover:text-primary border border-transparent hover:border-border hover:scale-[1.01]"
                                  }`}
                                  onClick={() => {
                                    setSelectedInfo(item.id);
                                    setIsSidebarOpen(false);
                                  }}
                                >
                                  <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{item.icon}</span>
                                  <span className="font-sans flex-1">{item.label}</span>
                                  {selectedInfo === item.id && (
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer avec info - plus engageant */}
                  <div className="bg-muted/50 border-t border-border p-3">
                    <div className="text-xs text-foreground/70 text-center">
                      🗂️ Cliquez sur un dossier pour découvrir son contenu
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contenu principal mobile (avec flou conditionnel) */}
            <div className={`flex-1 flex flex-col transition-all duration-200 ${isSidebarOpen ? 'blur-sm' : ''}`}>

              {/* Navigation rapide en haut pour mobile - seulement les fichiers du dossier actif */}
              <div className="bg-sidebar-background border-b border-sidebar-border p-2">
                <div className="flex gap-1 overflow-x-auto">
                  {getActiveFolderFiles().map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedInfo(item.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap flex-shrink-0 ${
                        selectedInfo === item.id 
                          ? "bg-primary/15 text-primary border border-primary/30" 
                          : "bg-background text-muted-foreground border border-border hover:bg-muted/60"
                      }`}
                    >
                      <span className="w-3 h-3 flex items-center justify-center">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Editor - prend toute la largeur sur mobile */}
              <div className="flex-1 flex flex-col">
                <div className="border-b border-border bg-sidebar-background">
                  <div className="flex items-center">
                    <div className="px-3 py-2 bg-background border-r border-border">
                      <span className="font-mono text-xs">{selectedInfo}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="p-3 font-sans text-xs min-w-max">
                    {getSelectedContent()}
                  </div>
                </div>
              </div>

              {/* Navigation rapide en bas pour mobile - seulement les fichiers du dossier actif */}
              <div className="bg-sidebar-background border-t border-sidebar-border p-2">
                <div className="flex gap-1 overflow-x-auto">
                  {getActiveFolderFiles().map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedInfo(item.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap flex-shrink-0 ${
                        selectedInfo === item.id 
                          ? "bg-primary/15 text-primary border border-primary/30" 
                          : "bg-background text-muted-foreground border border-border hover:bg-muted/60"
                      }`}
                    >
                      <span className="w-3 h-3 flex items-center justify-center">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Panel - Collapsible sur mobile après la navigation */}
              <div className="border-t border-border">
                <div className="bg-sidebar-background">
                  <details>
                    <summary className="px-3 py-2 cursor-pointer text-sm font-medium flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <span>Compétences</span>
                      <ChevronDown className="w-4 h-4" />
                    </summary>
                    <div className="p-3 bg-background max-h-60 overflow-y-auto border-t border-border">
                      <div className="text-xs mb-3 text-foreground">
                        // langages de programmation
                      </div>
                      <div className="grid grid-cols-2 gap-2">
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
                          <div key={skill.name} className="flex items-center space-x-2">
                            <Checkbox
                              checked={skill.checked}
                              className="border-accent data-[state=checked]:bg-accent data-[state=checked]:border-accent h-3 w-3"
                            />
                            <TechIcon tech={skill.name} />
                            <span className="text-xs truncate">{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Layout desktop (existant)
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-screen"
          >
            {/* Sidebar Panel */}
            <ResizablePanel defaultSize={isMobile ? 30 : 20} minSize={isMobile ? 25 : 15}>
              <div className="h-full bg-sidebar-background border-r border-sidebar-border">
                <ScrollArea className="h-full p-4">
                  <h3 className="text-lg mb-4 pl-2">Explorateur</h3>
                  <div className="space-y-2">
                    {/* Sections dynamiques depuis la DB */}
                    {sidebarData.map((section) => (
                      <div key={section.id}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-2 h-auto text-sidebar-foreground hover:bg-muted"
                          onClick={() => handleSectionClick(section.id)}
                        >
                          {openSections[section.id as keyof typeof openSections] ? (
                            <ChevronDown className="w-4 h-4 mr-2" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2" />
                          )}
                          {openSections[section.id as keyof typeof openSections] ? section.icon.open : section.icon.closed}
                          <span className="font-mono text-sm">{section.label}</span>
                        </Button>
                        {openSections[section.id as keyof typeof openSections] && (
                          <div className="ml-6 mt-2 space-y-1">
                            {section.items.map((item) => (
                              <div
                                key={item.id}
                                className={`flex items-center space-x-2 cursor-pointer rounded px-2 py-1 transition-colors duration-150 text-sm ${
                                  selectedInfo === item.id 
                                    ? "bg-accent-blue/10 text-accent-blue font-semibold border-l-2 border-accent-blue" 
                                    : "hover:bg-accent-sky/10 text-muted-foreground hover:text-accent-sky"
                                }`}
                                onClick={() => setSelectedInfo(item.id)}
                              >
                                <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
                                <span className="font-sans truncate">{item.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Contacts */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center space-x-2 px-2 py-1">
                        <span className="font-mono text-sm text-sidebar-foreground">_contacts</span>
                      </div>
                      <div className="ml-6 mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 flex items-center justify-center">📧</span>
                          <span className="text-sidebar-foreground font-sans text-xs break-all">contact@joelhassam.com</span>
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
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={isMobile ? 40 : 50} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="border-b border-border bg-sidebar-background">
                  <div className="flex items-center">
                    <div className="px-4 py-2 bg-background border-r border-border">
                      <span className="font-mono text-sm text-foreground">{selectedInfo}</span>
                    </div>
                  </div>
                </div>
                {/* Défilement horizontal forcé sur mobile pour le code editor */}
                <div className="flex-1 overflow-auto">
                  <div className={`p-4 sm:p-6 font-sans text-[13px] sm:text-[15px] ${isMobile ? 'min-w-max' : ''}`}>
                    {getSelectedContent()}
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Skills Panel */}
            <ResizablePanel defaultSize={isMobile ? 30 : 30} minSize={isMobile ? 25 : 20}>
              <div className="h-full bg-background border-l border-border">
                <ScrollArea className="h-full p-4">
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
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </section>
  );
};
