import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  github_url: string | null;
  technologies: string[] | null;
  featured: boolean | null;
  planning_url: string | null; // nouveau champ
  analysis_url: string | null; // nouveau champ
  design_url: string | null; // nouveau champ
  prototype_url: string | null; // nouveau champ
  created_at: string;
  updated_at: string;
}

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    project_url: "",
    github_url: "",
    planning_url: "", // nouveau champ
    analysis_url: "", // nouveau champ
    design_url: "", // nouveau champ
    prototype_url: "", // nouveau champ
    technologies: "",
    featured: false,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(
        (data || []).map((project: any) => ({
          id: project.id,
          title: project.title,
          description: project.description ?? "",
          image_url: project.image_url ?? "",
          project_url: project.project_url ?? "",
          github_url: project.github_url ?? "",
          planning_url: project.planning_url ?? "",
          analysis_url: project.analysis_url ?? "",
          design_url: project.design_url ?? "",
          prototype_url: project.prototype_url ?? "",
          technologies: project.technologies ?? [],
          featured: project.featured ?? false,
          created_at: project.created_at,
          updated_at: project.updated_at,
        }))
      );
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      project_url: "",
      github_url: "",
      planning_url: "",
      analysis_url: "",
      design_url: "",
      prototype_url: "",
      technologies: "",
      featured: false,
    });
    setEditingProject(null);
    setIsCreating(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
      image_url: project.image_url || "",
      project_url: project.project_url || "",
      github_url: project.github_url || "",
      planning_url: project.planning_url || "",
      analysis_url: project.analysis_url || "",
      design_url: project.design_url || "",
      prototype_url: project.prototype_url || "",
      technologies: project.technologies?.join(", ") || "",
      featured: project.featured || false,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        project_url: formData.project_url || null,
        github_url: formData.github_url || null,
        planning_url: formData.planning_url || null,
        analysis_url: formData.analysis_url || null,
        design_url: formData.design_url || null,
        prototype_url: formData.prototype_url || null,
        technologies: formData.technologies
          ? formData.technologies.split(",").map(tech => tech.trim()).filter(Boolean)
          : null,
        featured: formData.featured,
      };

      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingProject.id);

        if (error) throw error;
        
        toast({
          title: "Projet modifié",
          description: "Le projet a été mis à jour avec succès.",
        });
      } else {
        const { error } = await supabase
          .from("projects")
          .insert(projectData);

        if (error) throw error;
        
        toast({
          title: "Projet créé",
          description: "Le nouveau projet a été ajouté avec succès.",
        });
      }

      resetForm();
      fetchProjects();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès.",
      });
      
      fetchProjects();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center">Chargement des projets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion des Projets</h2>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      {(isCreating || editingProject) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProject ? "Modifier le projet" : "Nouveau projet"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_url">URL du projet</Label>
                  <Input
                    id="project_url"
                    type="url"
                    value={formData.project_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github_url">URL GitHub</Label>
                  <Input
                    id="github_url"
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="planning_url">URL du planning</Label>
                <Input
                  id="planning_url"
                  type="url"
                  value={formData.planning_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, planning_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysis_url">URL de l'analyse</Label>
                <Input
                  id="analysis_url"
                  type="url"
                  value={formData.analysis_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, analysis_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="design_url">URL du design</Label>
                <Input
                  id="design_url"
                  type="url"
                  value={formData.design_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, design_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prototype_url">URL du prototype</Label>
                <Input
                  id="prototype_url"
                  type="url"
                  value={formData.prototype_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, prototype_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies (séparées par des virgules)</Label>
                <Input
                  id="technologies"
                  value={formData.technologies}
                  onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                  placeholder="React, TypeScript, Tailwind CSS"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Projet en vedette</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingProject ? "Mettre à jour" : "Créer"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {project.title}
                    {project.featured && (
                      <Badge variant="secondary">En vedette</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {project.technologies && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex space-x-4 text-sm text-muted-foreground">
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Voir le projet
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Code source
                  </a>
                )}
                {project.planning_url && (
                  <a
                    href={project.planning_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Planning
                  </a>
                )}
                {project.analysis_url && (
                  <a
                    href={project.analysis_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Analyse
                  </a>
                )}
                {project.design_url && (
                  <a
                    href={project.design_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Design
                  </a>
                )}
                {project.prototype_url && (
                  <a
                    href={project.prototype_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Prototype
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}