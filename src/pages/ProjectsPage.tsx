import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { 
  Github,
  Globe,
  Code, 
  Palette,
  Star,
  Clock,
  Zap,
  Eye,
  Calendar
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  project_url?: string; // added: URL fournie pour le projet
  // live_url?: string; // deprecated in favor of project_url
  github_url?: string;
  // figma_url?: string; // non présent dans le schéma, utiliser design_url si besoin
  technologies: string[];
  slug?: string;
  created_at: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Projets · Portfolio & Réalisations";
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(projects.map(p => p.category))];
  const filteredProjects = selectedCategory 
    ? projects.filter(project => project.category === selectedCategory)
    : projects;

  const featuredProjects = filteredProjects.slice(0, 6);

  const getProjectResources = (project: Project) => {
    const resources: { type: string; url: string; icon: any; label: string }[] = [];
    if (project.project_url) resources.push({ type: 'live', url: project.project_url, icon: Globe, label: 'Site live' });
    if (project.github_url) resources.push({ type: 'github', url: project.github_url, icon: Github, label: 'Code source' });
    return resources;
  };

  return (
    <>
      <Navigation activeTab={"projects"} setActiveTab={() => {}} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent-blue/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container mx-auto max-w-5xl p-6 relative">
          <div className="text-center py-12">
            <Badge className="mb-4 bg-accent-blue/10 text-accent-blue border-accent-blue/20">
              🚀 Portfolio & Réalisations
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Mes Projets
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Découvrez mes réalisations en développement web, mes expérimentations et les projets sur lesquels j'ai travaillé.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-blue">{projects.length}+</div>
                <div className="text-sm text-muted-foreground">Projets</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-green">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Catégories</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-sky">React</div>
                <div className="text-sm text-muted-foreground">Stack</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-red">Open</div>
                <div className="text-sm text-muted-foreground">Source</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="container mx-auto max-w-5xl p-6 py-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="h-8"
            >
              Tous les projets
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="h-8"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="container mx-auto max-w-6xl p-6">
        <section aria-labelledby="projects-heading" className="py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des projets...</p>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun projet trouvé</h3>
              <p className="text-muted-foreground">Les projets seront bientôt disponibles.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 id="projects-heading" className="text-3xl md:text-4xl font-bold mb-4">
                  {selectedCategory ? `Projets: ${selectedCategory}` : 'Mes réalisations'}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Une sélection de mes projets les plus représentatifs, du design à la mise en production.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProjects.map((project) => (
                  <Card key={project.id} className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-blue/20 bg-gradient-to-br from-card to-accent-blue/2">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    
                    {project.image_url && (
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                          {project.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-accent-yellow text-accent-yellow" />
                          ))}
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-accent-blue transition-colors">
                        {project.title}
                      </CardTitle>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          <span>Design</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 relative">
                      <p className="text-muted-foreground leading-relaxed line-clamp-3">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Resources */}
                      <div className="flex gap-2">
                        {getProjectResources(project).map((resource, index) => {
                          const IconComponent = resource.icon;
                          return (
                            <a
                              key={index}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent-blue/5 hover:bg-accent-blue/10 text-accent-blue text-xs transition-colors"
                            >
                              <IconComponent className="w-3 h-3" />
                              <span>{resource.label}</span>
                            </a>
                          );
                        })}
                      </div>

                      {/* CTA */}
                      <div className="bg-gradient-to-r from-accent-blue/10 via-accent-blue/5 to-transparent p-4 rounded-xl border border-accent-blue/20">
                        {project.project_url ? (
                          <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                              Voir le projet →
                            </Button>
                          </a>
                        ) : project.slug ? (
                          <Link to={`/projets/${project.slug}`}>
                            <Button size="sm" className="w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                              Voir le projet →
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" className="w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white shadow-lg hover:shadow-xl transition-all duration-300" disabled>
                            Bientôt disponible
                          </Button>
                        )}
                      </div>

                      {/* Interactions */}
                      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Portfolio</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Récent</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Innovant</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Tech Stack Section */}
        <section className="py-12 text-center">
          <h3 className="text-2xl font-bold mb-8">Technologies utilisées</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto">
                <Code className="w-6 h-6 text-accent-blue" />
              </div>
              <h4 className="font-semibold">Frontend</h4>
              <p className="text-sm text-muted-foreground">React, TypeScript, Tailwind</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6 text-accent-green" />
              </div>
              <h4 className="font-semibold">Backend</h4>
              <p className="text-sm text-muted-foreground">Supabase, Node.js, API</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent-sky/10 rounded-full flex items-center justify-center mx-auto">
                <Palette className="w-6 h-6 text-accent-sky" />
              </div>
              <h4 className="font-semibold">Design</h4>
              <p className="text-sm text-muted-foreground">Figma, UI/UX, Responsive</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto">
                <Github className="w-6 h-6 text-accent-red" />
              </div>
              <h4 className="font-semibold">DevOps</h4>
              <p className="text-sm text-muted-foreground">Git, CI/CD, Deployment</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProjectsPage;
