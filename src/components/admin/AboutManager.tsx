import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, FileText, FileMusic, FileStack, FileBarChart2, Save, X } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";

interface AboutSection {
  id: string;
  section_type: string;
  section_key: string;
  title: string;
  content: any;
  icon_name: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EditingSection extends Partial<AboutSection> {
  isEditing?: boolean;
  isNew?: boolean;
}

const ICON_OPTIONS = [
  { value: "FileText", label: "Document", icon: <FileText className="w-4 h-4" /> },
  { value: "FileMusic", label: "Musique", icon: <FileMusic className="w-4 h-4" /> },
  { value: "FileStack", label: "Pile", icon: <FileStack className="w-4 h-4" /> },
  { value: "FileBarChart2", label: "Graphique", icon: <FileBarChart2 className="w-4 h-4" /> },
];

export function AboutManager() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [editingSection, setEditingSection] = useState<EditingSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("about_sections")
        .select("*")
        .order("section_type", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des sections:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (section: AboutSection) => {
    setEditingSection({
      ...section,
      isEditing: true,
    });
  };

  const startCreating = () => {
    setEditingSection({
      section_type: "info",
      section_key: "",
      title: "",
      content: { lines: [] },
      icon_name: "FileText",
      order_index: 1,
      is_active: true,
      isNew: true,
      isEditing: true,
    });
  };

  const cancelEditing = () => {
    setEditingSection(null);
  };

  const handleContentChange = (content: string) => {
    if (!editingSection) return;
    
    setEditingSection({
      ...editingSection,
      content: content,
    });
  };

  const saveSection = async () => {
    if (!editingSection) return;

    setSaving(true);
    try {
      // Parse the content as JSON before saving
      let parsedContent;
      try {
        if (typeof editingSection.content === 'string') {
          parsedContent = JSON.parse(editingSection.content);
        } else {
          parsedContent = editingSection.content;
        }
      } catch (error) {
        toast({
          title: "Erreur de format",
          description: "Le contenu JSON n'est pas valide. Veuillez vérifier la syntaxe.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const sectionData = {
        section_type: editingSection.section_type!,
        section_key: editingSection.section_key!,
        title: editingSection.title!,
        content: parsedContent,
        icon_name: editingSection.icon_name,
        order_index: editingSection.order_index!,
        is_active: editingSection.is_active!,
      };

      if (editingSection.isNew) {
        const { error } = await supabase
          .from("about_sections")
          .insert([sectionData]);

        if (error) throw error;

        toast({
          title: "Section créée",
          description: "La nouvelle section a été créée avec succès",
        });
      } else {
        const { error } = await supabase
          .from("about_sections")
          .update(sectionData)
          .eq("id", editingSection.id);

        if (error) throw error;

        toast({
          title: "Section mise à jour",
          description: "La section a été mise à jour avec succès",
        });
      }

      await fetchSections();
      setEditingSection(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la section",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette section ?")) return;

    try {
      const { error } = await supabase
        .from("about_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Section supprimée",
        description: "La section a été supprimée avec succès",
      });

      await fetchSections();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la section",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (section: AboutSection) => {
    try {
      const { error } = await supabase
        .from("about_sections")
        .update({ is_active: !section.is_active })
        .eq("id", section.id);

      if (error) throw error;

      await fetchSections();
      toast({
        title: "Section mise à jour",
        description: `Section ${!section.is_active ? "activée" : "désactivée"}`,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la section",
        variant: "destructive",
      });
    }
  };

  const groupedSections = sections.reduce((acc, section) => {
    if (!acc[section.section_type]) {
      acc[section.section_type] = [];
    }
    acc[section.section_type].push(section);
    return acc;
  }, {} as Record<string, AboutSection[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion À propos</h1>
          <p className="text-muted-foreground">
            Gérez le contenu de la section À propos
          </p>
        </div>
        <Button onClick={startCreating} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle section
        </Button>
      </div>

      {/* Editing Modal/Card */}
      {editingSection && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingSection.isNew ? "Créer une nouvelle section" : "Modifier la section"}
              <Button variant="ghost" size="sm" onClick={cancelEditing}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section_type">Type de section</Label>
                <Select
                  value={editingSection.section_type}
                  onValueChange={(value) => setEditingSection({ ...editingSection, section_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informations personnelles</SelectItem>
                    <SelectItem value="education">Éducation</SelectItem>
                    <SelectItem value="experience">Expériences</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section_key">Clé de section</Label>
                <Input
                  id="section_key"
                  value={editingSection.section_key}
                  onChange={(e) => setEditingSection({ ...editingSection, section_key: e.target.value })}
                  placeholder="Identifiant unique"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={editingSection.title}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                placeholder="Titre de la section"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon_name">Icône</Label>
                <Select
                  value={editingSection.icon_name || ""}
                  onValueChange={(value) => setEditingSection({ ...editingSection, icon_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une icône" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_index">Ordre</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={editingSection.order_index}
                  onChange={(e) => setEditingSection({ ...editingSection, order_index: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contenu (JSON)</Label>
              <Textarea
                value={typeof editingSection.content === 'string' 
                  ? editingSection.content 
                  : JSON.stringify(editingSection.content, null, 2)}
                onChange={handleContentChange}
                placeholder="Contenu au format JSON..."
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Format attendu : {`{"lines": [{"type": "text", "text": "Votre texte"}]}`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editingSection.is_active}
                onCheckedChange={(checked) => setEditingSection({ ...editingSection, is_active: checked })}
              />
              <Label>Section active</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveSection} disabled={saving} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button variant="outline" onClick={cancelEditing}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections List */}
      <div className="space-y-6">
        {Object.entries(groupedSections).map(([type, typeSections]) => (
          <div key={type} className="space-y-4">
            <h2 className="text-xl font-semibold capitalize">
              {type === "info" ? "Informations personnelles" : 
               type === "education" ? "Éducation" : 
               type === "experience" ? "Expériences" : type}
            </h2>
            
            <div className="grid gap-4">
              {typeSections.map((section) => (
                <Card key={section.id} className={section.is_active ? "" : "opacity-60"}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge variant={section.is_active ? "default" : "secondary"}>
                          {section.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.is_active}
                          onCheckedChange={() => toggleActive(section)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(section)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSection(section.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Clé: {section.section_key} | Ordre: {section.order_index}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <strong>Contenu:</strong>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(section.content, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}