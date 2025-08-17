import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const entrepriseSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  site_web: z.string().optional(),
  site_web_valide: z.boolean().default(false),
  categorie_id: z.string().optional(),
});

type EntrepriseFormData = z.infer<typeof entrepriseSchema>;

interface Entreprise {
  id: string;
  nom: string;
  telephone: string | null;
  adresse: string | null;
  site_web: string | null;
  site_web_valide: boolean | null;
  categorie_id: string | null;
  created_at: string;
  updated_at: string;
  categorie?: {
    nom: string;
  };
}

interface Categorie {
  id: string;
  nom: string;
}

export function EntrepriseManager() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntreprise, setEditingEntreprise] = useState<Entreprise | null>(null);

  const form = useForm<EntrepriseFormData>({
    resolver: zodResolver(entrepriseSchema),
    defaultValues: {
      nom: "",
      telephone: "",
      adresse: "",
      site_web: "",
      site_web_valide: false,
      // utiliser undefined au lieu de string vide pour éviter l'erreur du Select
      categorie_id: undefined,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entreprisesResponse, categoriesResponse] = await Promise.all([
        supabase
          .from("entreprise")
          .select(`
            *,
            categorie (
              nom
            )
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("categorie")
          .select("id, nom")
          .order("nom")
      ]);

      if (entreprisesResponse.error) throw entreprisesResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setEntreprises(entreprisesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EntrepriseFormData) => {
    try {
      console.log("Submitting entreprise data:", data);
      const submitData = {
        ...data,
        categorie_id: data.categorie_id || null,
      };

      if (editingEntreprise) {
        const { error } = await supabase
          .from("entreprise")
          .update(submitData)
          .eq("id", editingEntreprise.id);

        if (error) throw error;
        toast.success("Entreprise mise à jour avec succès");
      } else {
        const { error } = await supabase
          .from("entreprise")
          .insert([submitData]);

        if (error) throw error;
        toast.success("Entreprise créée avec succès");
      }

      setIsDialogOpen(false);
      setEditingEntreprise(null);
      form.reset();
      fetchData();
    } catch (error: unknown) {
      console.error("Erreur:", error);
      const message = error instanceof Error ? error.message : "Une erreur s'est produite";
      toast.error(message);
    }
  };

  const handleEdit = (entreprise: Entreprise) => {
    setEditingEntreprise(entreprise);
    form.reset({
      nom: entreprise.nom,
      telephone: entreprise.telephone || "",
      adresse: entreprise.adresse || "",
      site_web: entreprise.site_web || "",
      site_web_valide: entreprise.site_web_valide || false,
      // undefined si pas de catégorie
      categorie_id: entreprise.categorie_id || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return;

    try {
      const { error } = await supabase
        .from("entreprise")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Entreprise supprimée avec succès");
      fetchData();
    } catch (error: unknown) {
      console.error("Erreur:", error);
      const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(message);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingEntreprise(null);
    form.reset();
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Entreprises</h2>
          <p className="text-muted-foreground">
            Gérez la base de données des entreprises
          </p>
        </div>
        <Button type="button" onClick={() => {
          console.log("Button clicked, opening dialog");
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Entreprise
        </Button>
      </div>

      {/* Dialog placé à la racine du composant pour éviter tout conflit d'imbrication */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEntreprise ? "Modifier l'entreprise" : "Nouvelle entreprise"}
            </DialogTitle>
            <DialogDescription>
              {editingEntreprise
                ? "Modifiez les informations de l'entreprise"
                : "Ajoutez une nouvelle entreprise à la base de données"
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
                    <FormLabel>Nom de l'entreprise</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'entreprise" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categorie_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                      value={field.value ?? "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Radix Select interdit value="" pour les items */}
                        <SelectItem value="none">Aucune catégorie</SelectItem>
                        {categories.map((categorie) => (
                          <SelectItem key={categorie.id} value={categorie.id}>
                            {categorie.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro de téléphone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adresse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Adresse complète" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="site_web"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="site_web_valide"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Site Web Valide</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Le site web est-il accessible et fonctionnel ?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingEntreprise ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Entreprises</CardTitle>
          <CardDescription>
            {entreprises.length} entreprise(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[860px] sm:min-w-0 text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Nom</TableHead>
                  <TableHead className="whitespace-nowrap">Catégorie</TableHead>
                  <TableHead className="hidden md:table-cell whitespace-nowrap">Téléphone</TableHead>
                  <TableHead className="hidden sm:table-cell whitespace-nowrap">Site Web</TableHead>
                  <TableHead className="hidden lg:table-cell whitespace-nowrap">Statut Site</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entreprises.map((entreprise) => (
                  <TableRow key={entreprise.id}>
                    <TableCell className="font-medium max-w-[180px] sm:max-w-[240px] truncate">{entreprise.nom}</TableCell>
                    <TableCell className="min-w-[120px]">
                       {entreprise.categorie ? (
                         <Badge variant="secondary">{entreprise.categorie.nom}</Badge>
                       ) : (
                         <span className="text-muted-foreground">Aucune</span>
                       )}
                     </TableCell>
                    <TableCell className="hidden md:table-cell whitespace-nowrap">{entreprise.telephone || "Non renseigné"}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                       {entreprise.site_web ? (
                         <a
                           href={entreprise.site_web}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-1 text-blue-600 hover:underline"
                         >
                          <span className="truncate max-w-[140px] md:max-w-[220px] block">{entreprise.site_web}</span>
                          <ExternalLink className="h-3 w-3" />
                         </a>
                       ) : (
                         <span className="text-muted-foreground">Aucun</span>
                       )}
                     </TableCell>
                    <TableCell className="hidden lg:table-cell">
                       {entreprise.site_web ? (
                         <Badge
                           variant={entreprise.site_web_valide ? "default" : "destructive"}
                         >
                           {entreprise.site_web_valide ? "Valide" : "Invalide"}
                         </Badge>
                       ) : (
                         <span className="text-muted-foreground">N/A</span>
                       )}
                     </TableCell>
                     <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleEdit(entreprise)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleDelete(entreprise.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}