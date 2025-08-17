import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const categorieSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

type CategorieFormData = z.infer<typeof categorieSchema>;

interface Categorie {
  id: string;
  nom: string;
  description: string | null;
  created_at: string;
}

export function CategorieManager() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null);

  const form = useForm<CategorieFormData>({
    resolver: zodResolver(categorieSchema),
    defaultValues: {
      nom: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categorie")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      toast.error("Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategorieFormData) => {
    try {
      if (editingCategorie) {
        const { error } = await supabase
          .from("categorie")
          .update(data)
          .eq("id", editingCategorie.id);

        if (error) throw error;
        toast.success("Catégorie mise à jour avec succès");
      } else {
        const { error } = await supabase
          .from("categorie")
          .insert([data]);

        if (error) throw error;
        toast.success("Catégorie créée avec succès");
      }

      setIsDialogOpen(false);
      setEditingCategorie(null);
      form.reset();
      fetchCategories();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Une erreur s'est produite");
    }
  };

  const handleEdit = (categorie: Categorie) => {
    setEditingCategorie(categorie);
    form.reset({
      nom: categorie.nom,
      description: categorie.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;

    try {
      const { error } = await supabase
        .from("categorie")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Catégorie supprimée avec succès");
      fetchCategories();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategorie(null);
    form.reset();
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Catégories</h2>
          <p className="text-muted-foreground">
            Gérez les catégories pour organiser les entreprises
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategorie ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </DialogTitle>
              <DialogDescription>
                {editingCategorie 
                  ? "Modifiez les informations de la catégorie"
                  : "Ajoutez une nouvelle catégorie pour organiser les entreprises"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de la catégorie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description de la catégorie"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingCategorie ? "Mettre à jour" : "Créer"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Catégories</CardTitle>
          <CardDescription>
            {categories.length} catégorie(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((categorie) => (
                <TableRow key={categorie.id}>
                  <TableCell className="font-medium">{categorie.nom}</TableCell>
                  <TableCell>{categorie.description || "Aucune description"}</TableCell>
                  <TableCell>
                    {new Date(categorie.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(categorie)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(categorie.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}