import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { FigmaIcon } from "@/components/FigmaIcon";
import { GithubIcon } from "@/components/GithubIcon";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FileCode } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  github_url: string | null;
  technologies: string[] | null;
  featured: boolean | null;
  planning_url?: string | null;
  modelisation_url?: string | null;
  charte_url?: string | null;
  prototype_url?: string | null;
  category: "personnel" | "professionnel" | "academique";
}


export const ProjectsSection = () => {
  const [groupedProjects, setGroupedProjects] = useState<Record<string, Project[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ professionnel: true });
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const projectCategories: Record<string, string> = {
    professionnel: t('projects.categories.professionnel'),
    personnel: t('projects.categories.personnel'),
    academique: t('projects.categories.academique'),
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*, category")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const grouped = (data || []).reduce((acc, project) => {
        const category = project.category || "personnel";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(project);
        return acc;
      }, {} as Record<string, Project[]>);

      setGroupedProjects(grouped);

      // On page load, show all projects, but select none.
      // Open the "professionnel" folder by default if it exists.
      if (data && data.length > 0) {
          if (grouped.professionnel) {
              setOpenFolders({ professionnel: true });
          }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Phases dynamiques selon les liens présents dans le projet
  const projectPhases = [
    {
      key: "planning_url",
      title: "Plannification du projet",
      description: "Organisation, tâches, avancement, Trello, etc.",
      icon: "📅",
    },
    {
      key: "modelisation_url",
      title: "Mod������lisation & Analyse",
      description: "Diagrammes, analyse fonctionnelle, cahier des charges, etc.",
      icon: "🧩",
    },
    {
      key: "charte_url",
      title: "Charte Graphique",
      description: "Palette de couleurs, typographies, logos, etc.",
      icon: "🎨",
    },
    {
      key: "prototype_url",
      title: "Maquette & Prototype",
      description: "Wireframes, maquettes Figma, prototypes interactifs, etc.",
      icon: <FigmaIcon className="w-4 h-4" />,
    },
    {
      key: "github_url",
      title: "Code Github",
      description: "Lien vers le dépôt Github du projet.",
      icon: <GithubIcon className="w-4 h-4" />,
    },
  ];

  const toggleFolder = (folderName: string) => {
    setOpenFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const handleCategoryClick = (category: string | "all") => {
    setSelectedCategory(category);
    // Don't automatically select a project when a category is clicked.
    // The user must explicitly click on a project card or file.
    setSelectedProject(null);
  };

  const allProjects = Object.values(groupedProjects).flat();

  const filteredProjects = selectedCategory === "all"
    ? allProjects
    : (groupedProjects[selectedCategory] || []);

  const currentProject = allProjects.find(p => p.id === selectedProject);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('projects.loading')}</p>
        </div>
      </div>
    );
  }

  if (Object.keys(groupedProjects).length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground font-mono">{t('projects.no_projects')}</span>
      </div>
    );
  }

  return (
    <section id="projects" className="bg-background font-sans">
      <div className="border-t">
        <ResizablePanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
          className="min-h-screen"
        >
          <ResizablePanel defaultSize={isMobile ? 40 : 20} minSize={isMobile ? 30 : 15}>
            <div className="p-4 h-full">
              <h3 className="text-lg mb-4 pl-2">{t('projects.explorer')}</h3>
              <ScrollArea className="h-[calc(100%-40px)]">
                <ul className="space-y-1 pr-2">
                  {Object.entries(projectCategories).map(([key, value]) => (
                    (groupedProjects[key] && groupedProjects[key].length > 0) && (
                      <li key={key}>
                        <div
                          className="flex items-center cursor-pointer p-2 rounded-md hover:bg-muted"
                          onClick={() => {
                            toggleFolder(key);
                            handleCategoryClick(key);
                          }}
                        >
                          {openFolders[key] ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                          {openFolders[key] ? <FolderOpen className="h-5 w-5 mr-2 text-primary" /> : <Folder className="h-5 w-5 mr-2 text-primary" />}
                          <span>{value}</span>
                        </div>
                        {openFolders[key] && (
                          <ul className="pl-6 mt-1 border-l border-dashed border-muted-foreground/30">
                            {(groupedProjects[key] || []).map((project: Project) => (
                              <li key={project.id}>
                                <div
                                  className={`flex items-center cursor-pointer p-2 rounded-md text-sm transition-colors ${
                                    selectedProject === project.id 
                                      ? 'bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue' 
                                      : 'hover:bg-accent-sky/10 hover:text-accent-sky'
                                  }`}
                                  onClick={() => handleProjectClick(project.id)}
                                >
                                  <FileCode className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">{project.title}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          {!isMobile && (
            <>
              <ResizablePanel defaultSize={30} minSize={25}>
                <ScrollArea className="h-full p-4">
                  <h3 className="text-lg mb-4">
                    {selectedCategory === 'all' ? t('projects.all_projects') : projectCategories[selectedCategory]}
                  </h3>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /></CardContent></Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProjects.map(project => (
                        <Card
                          key={project.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${currentProject?.id === project.id ? 'shadow-lg' : ''}`}
                          onClick={() => handleProjectClick(project.id)}
                        >
                          <CardHeader>
                            <CardTitle className="text-base font-normal">{project.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {project.technologies.map(tech => (
                                  <Badge key={tech} variant="secondary">{tech}</Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          <ResizablePanel defaultSize={isMobile ? 60 : 50} minSize={30}>
            <ScrollArea className="h-full p-6">
              {currentProject ? (
                <div>
                  <h3 className="text-2xl mb-2">{currentProject.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{projectCategories[currentProject.category]}</p>

                  <img src={currentProject.image_url || '/placeholder.svg'} alt={currentProject.title} className="rounded-lg object-cover w-full h-auto aspect-video mb-6 shadow-lg" />

                  {isMobile && currentProject.technologies && currentProject.technologies.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg mb-3">{t('projects.technologies_used')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.technologies.map(tech => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                    <p>{currentProject.description}</p>
                  </div>

                  <div>
                    <h4 className="text-lg mb-3 border-b pb-2">{t('projects.phases_resources')}</h4>
                    <ul className="space-y-3">
                      {projectPhases.map(phase => {
                        const url = currentProject[phase.key as keyof Project] as string | undefined;
                        if (url) {
                          return (
                            <li key={phase.key}>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-start p-3 rounded-lg hover:bg-muted transition-colors -mx-3">
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-lg mr-4 mt-1">{phase.icon}</div>
                                <div className="flex-grow">
                                  <p>{phase.title}</p>
                                  <p className="text-sm text-muted-foreground">{phase.description}</p>
                                </div>
                              </a>
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <div className="text-4xl mb-4">🖼️</div>
                    <h3 className="text-lg">{t('projects.select_project')}</h3>
                    <p className="text-sm">{t('projects.select_project_desc')}</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </section>
  );
};
