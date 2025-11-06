// filepath: /Users/mondeimpression/WebstormProjects/inspo-to-site-builder/src/pages/ProjectPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Github, Globe, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { sanitizeHTML } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  content: string | null;
  image_url: string | null;
  project_url: string | null;
  github_url: string | null;
  technologies: string[] | null;
  category: string | null;
  created_at: string;
}

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) {
          setError("Projet introuvable");
        } else if (data) {
          setProject(data as unknown as Project);
        }
      } catch {
        setError("Projet introuvable");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Projet introuvable"}</h1>
          <Button onClick={() => navigate("/projets")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux projets
          </Button>
        </div>
      </div>
    );
  }

  const technologies = project.technologies || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent-blue/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/projets")}
            className="mb-6 hover:bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux projets
          </Button>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {project.category && (
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1 rounded-full">
                {project.category}
              </Badge>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" />
                {new Date(project.created_at).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {technologies.length > 0 && (
                <span className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Tag className="w-4 h-4" />
                  {technologies.slice(0, 3).join(', ')}{technologies.length > 3 ? ` +${technologies.length - 3}` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {project.image_url && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-64 md:h-96 lg:h-[500px] object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 max-w-4xl">
            <article className="mb-16">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border border-border/50">
                <div
                  className="prose prose-lg md:prose-xl max-w-none
                             prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                             prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-6 prose-h1:mt-8
                             prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mb-4 prose-h2:mt-6
                             prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mb-3 prose-h3:mt-5
                             prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                             prose-strong:text-foreground prose-strong:font-semibold
                             prose-a:text-accent-blue prose-a:font-medium prose-a:no-underline
                             hover:prose-a:text-accent-blue/80 hover:prose-a:underline
                             prose-blockquote:border-l-accent-blue prose-blockquote:bg-muted/30
                             prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
                              prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                              prose-ul:my-4 prose-ol:my-4 prose-li:my-2
                              prose-img:rounded-xl prose-img:shadow-lg"
                   dangerouslySetInnerHTML={{ __html: sanitizeHTML(project.content || "") }}
                 />
              </div>
            </article>
          </div>

          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-3">
              {project.project_url && (
                <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" variant="default">
                    <Globe className="w-4 h-4 mr-2" /> Voir le site
                  </Button>
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" variant="secondary">
                    <Github className="w-4 h-4 mr-2" /> Code source
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

