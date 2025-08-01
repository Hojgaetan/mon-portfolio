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

  // Trouver le contenu sélectionné
  const getSelectedContent = () => {
    for (const section of sidebarData) {
      const item = section.items.find((item: any) => item.id === selectedInfo);
      if (item) return item.content;
    }
    return <div>Contenu non trouvé</div>;
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
        <ResizablePanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
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
      </div>
    </section>
  );
};
