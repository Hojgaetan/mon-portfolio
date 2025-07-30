import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  github_url: string | null;
  technologies: string[] | null;
  featured: boolean | null;
}

export const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Exemple de phases pour chaque projet
  const projectPhases = [
    {
      key: "planning",
      title: "Plannification du projet",
      description: "Organisation, tâches, avancement, Trello, etc.",
      icon: "📅",
      linkKey: null,
    },
    {
      key: "modelisation",
      title: "Modélisation & Analyse",
      description: "Diagrammes, analyse fonctionnelle, cahier des charges, etc.",
      icon: "🧩",
      linkKey: null,
    },
    {
      key: "charte",
      title: "Charte Graphique",
      description: "Palette de couleurs, typographies, logos, etc.",
      icon: "🎨",
      linkKey: null,
    },
    {
      key: "maquette",
      title: "Maquette & Prototype",
      description: "Wireframes, maquettes Figma, prototypes interactifs, etc.",
      icon: "🖼️",
      linkKey: null,
    },
    {
      key: "code",
      title: "Code Github",
      description: "Lien vers le dépôt Github du projet.",
      icon: "💻",
      linkKey: "github_url",
    },
  ];

  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Set first project as selected when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground font-mono">// aucun projet disponible</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full font-sans">
      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-sidebar-background border-b lg:border-b-0 lg:border-r border-sidebar-border flex flex-col font-sans">
        <div className="p-4">
          <div className="space-y-2">
            <div className="text-sidebar-foreground font-sans text-sm mb-4">_projets</div>
            {projects.map((project) => (
              <div
                key={project.id}
                className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer transition-colors duration-150 select-none ${selectedProject === project.id ? "bg-accent/20 text-accent font-semibold" : "hover:bg-accent-red active:bg-accent-red/80"}`}
                onClick={() => setSelectedProject(project.id)}
              >
                <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
                <span className="text-sidebar-foreground font-sans text-xs sm:text-sm truncate">{project.title}</span>
                {project.featured && (
                  <Badge variant="secondary" className="text-xs">★</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-background">
        <div className="border-b border-border bg-sidebar-background">
          <div className="flex items-center">
            <div className="px-4 py-2 bg-background border-r border-border">
              <span className="font-sans text-sm text-foreground">
                {projects.find(p => p.id === selectedProject)?.title || selectedProject}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {/* Affiche uniquement le projet sélectionné */}
          {projects.filter(p => p.id === selectedProject).map((project) => (
            <div key={project.id} className="bg-card border border-border rounded-lg overflow-hidden">
              {project.image_url && (
                <div className="h-32 sm:h-48 bg-muted">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-sans text-xs sm:text-sm text-accent break-words">{project.title}</h3>
                </div>
                <p className="text-muted-foreground text-xs mb-4">{project.description}</p>
                {/* Affichage des technologies utilisées */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-mono border border-accent/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {/* Grille des phases du projet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {projectPhases.map(phase => (
                    <div key={phase.key} className="bg-muted rounded-lg p-4 flex flex-col items-start border border-border shadow-sm">
                      <div className="text-2xl mb-2">{phase.icon}</div>
                      <div className="font-semibold text-sm mb-1">{phase.title}</div>
                      <div className="text-xs text-muted-foreground mb-2">{phase.description}</div>
                      {phase.linkKey && project[phase.linkKey] && (
                        <a
                          href={project[phase.linkKey] as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline text-xs mt-auto"
                        >
                          Voir le lien
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};