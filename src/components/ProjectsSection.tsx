import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

export const ProjectsSection = () => {
  const projects = [
    {
      id: "_revue-hybrides",
      title: "projet 1 // _revue-hybrides",
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    },
    {
      id: "_pba2-camerun",
      title: "projet 2 // _pba2-camerun", 
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop",
    },
    {
      id: "_majorants-academy",
      title: "projet 3 // _majorants-academy",
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality", 
      image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&h=300&fit=crop",
    },
    {
      id: "_revue-hybrides-2",
      title: "projet 1 // _revue-hybrides",
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&h=300&fit=crop",
    },
    {
      id: "_pba2-camerun-2", 
      title: "projet 1 // _revue-hybrides",
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=300&fit=crop",
    },
    {
      id: "_majorants-academy-2",
      title: "projet 1 // _revue-hybrides", 
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
    },
  ];

  // Exemple de phases pour chaque projet
  const projectPhases = [
    {
      key: "planning",
      title: "Plannification du projet",
      description: "Organisation, tâches, avancement, Trello, etc.",
      icon: "📅",
      trello: "https://trello.com/"
    },
    {
      key: "modelisation",
      title: "Modélisation & Analyse",
      description: "Diagrammes, analyse fonctionnelle, cahier des charges, etc.",
      icon: "🧩",
    },
    {
      key: "maquette",
      title: "Maquette & Prototype",
      description: "Wireframes, maquettes Figma, prototypes interactifs, etc.",
      icon: "🖼️",
    },
    {
      key: "code",
      title: "Code Github",
      description: "Lien vers le dépôt Github du projet.",
      icon: "💻",
    },
  ];

  const [selectedProject, setSelectedProject] = useState(projects[0].id);

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
                <span className="text-sidebar-foreground font-sans text-xs sm:text-sm truncate">{project.id}</span>
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
              <span className="font-sans text-sm text-foreground">{selectedProject}</span>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {/* Affiche uniquement le projet sélectionné */}
          {projects.filter(p => p.id === selectedProject).map((project) => (
            <div key={project.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="h-32 sm:h-48 bg-muted">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-sans text-xs sm:text-sm text-accent mb-2 break-words">{project.title}</h3>
                <p className="text-muted-foreground font-sans text-xs sm:text-sm mb-4 leading-relaxed">{project.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {projectPhases.map(phase => (
                    <div key={phase.key} className="bg-background border border-border rounded-lg p-4 flex flex-col items-start gap-2 shadow-sm">
                      <span className="text-2xl">{phase.icon}</span>
                      <span className="font-sans font-semibold text-accent text-sm">{phase.title}</span>
                      <span className="text-muted-foreground font-sans text-xs">{phase.description}</span>
                      {phase.key === 'code' && (
                        <a
                          href="https://github.com/Hojgaetan"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block px-3 py-1 rounded bg-accent/10 text-accent font-sans text-xs border border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Voir sur Github
                        </a>
                      )}
                      {phase.key === 'maquette' && (
                        <a
                          href="https://www.figma.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block px-3 py-1 rounded bg-accent/10 text-accent font-sans text-xs border border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Voir sur Figma
                        </a>
                      )}
                      {phase.key === 'planning' && (
                        <a
                          href={phase.trello}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block px-3 py-1 rounded bg-accent/10 text-accent font-sans text-xs border border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Voir sur Trello
                        </a>
                      )}
                      {phase.key === 'modelisation' && (
                        <a
                          href="/uml-example.pdf"
                          download
                          className="mt-2 inline-block px-3 py-1 rounded bg-accent/10 text-accent font-sans text-xs border border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Télécharger le fichier UML
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