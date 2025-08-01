import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText, FileMusic, FileCode, FileStack, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Resizable } from "re-resizable";
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
  const [openSections, setOpenSections] = useState({
    info: true,
    education: false,
    experience: false,
  });
  const [aboutSections, setAboutSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Helper function pour basculer l'état d'ouverture des sections
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId as keyof typeof prev]
    }));
  };

  // Fonction helper pour créer le contenu formaté à partir des données de la DB
  const renderContentFromDB = (section: any) => {
    const { title, content } = section;
    
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
    if (content?.company) {
      return (
        <div className="space-y-2 min-w-max font-sans">
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">1.</span><span className="text-code-comment">/**</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">2.</span><span className="text-code-comment">* {title}</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">3.</span><span className="text-code-comment">*/</span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">4.</span><span className="text-foreground"><i>{content.description}</i></span></div>
          <div className="flex"><span className="text-muted-foreground mr-4 select-none w-6">5.</span><span className="text-foreground text-[#df3821]"><i>{content.period}</i></span></div>
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
    
    return <div>Contenu non disponible</div>;
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              {/* Sections dynamiques depuis la DB */}
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

              {/* Contacts */}
              <div className="mt-4">
                <div className="flex items-center space-x-2 px-2 py-1">
                  <span className="font-mono text-sm text-sidebar-foreground">_contacts</span>
                </div>
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