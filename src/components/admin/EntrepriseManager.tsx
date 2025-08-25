import { useState, useEffect, useMemo, useId } from "react";
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
import { Plus, Edit, Trash2, ExternalLink, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useExcelExport } from "@/hooks/useExcelExport";

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

// Alias de types pour les filtres (évite tout any)
type SiteStatus = "all" | "valide" | "invalide" | "avec" | "sans";
type SortKey = "date_desc" | "date_asc" | "name_asc" | "name_desc";

export function EntrepriseManager() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntreprise, setEditingEntreprise] = useState<Entreprise | null>(null);

  // Filtres avancés
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [siteStatus, setSiteStatus] = useState<SiteStatus>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("date_desc");

  // IDs accessibles pour lier labels et champs
  const searchId = useId();
  const categoryId = useId();
  const statusId = useId();
  const dateFromId = useId();
  const dateToId = useId();
  const sortId = useId();

  const { exportToExcel, isExporting } = useExcelExport();

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

  // Appliquer filtres client côté et tri
  const filteredEntreprises = useMemo(() => {
    let list = [...entreprises];

    // Catégorie
    if (categoryFilter !== "all") {
      list = list.filter((e) => e.categorie_id === categoryFilter);
    }

    // Statut site
    if (siteStatus === "valide") list = list.filter((e) => e.site_web_valide === true);
    if (siteStatus === "invalide") list = list.filter((e) => e.site_web_valide === false);
    if (siteStatus === "avec") list = list.filter((e) => !!e.site_web);
    if (siteStatus === "sans") list = list.filter((e) => !e.site_web);

    // Plage de dates sur created_at
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((e) => new Date(e.created_at).getTime() >= from);
    }
    if (dateTo) {
      // inclure toute la journée de fin
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      const toMs = to.getTime();
      list = list.filter((e) => new Date(e.created_at).getTime() <= toMs);
    }

    // Recherche plein texte simple
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter((e) =>
        [
          e.nom,
          e.telephone || "",
          e.adresse || "",
          e.site_web || "",
          e.categorie?.nom || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    // Tri
    list.sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name_asc":
          return a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" });
        case "name_desc":
          return b.nom.localeCompare(a.nom, "fr", { sensitivity: "base" });
        case "date_desc":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return list;
  }, [entreprises, categoryFilter, siteStatus, dateFrom, dateTo, query, sortBy]);

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setSiteStatus("all");
    setDateFrom("");
    setDateTo("");
    setSortBy("date_desc");
  };

  const handleExportToExcel = () => {
    const exportData = filteredEntreprises.map(entreprise => ({
      'Nom': entreprise.nom,
      'Téléphone': entreprise.telephone || '',
      'Adresse': entreprise.adresse || '',
      'Site Web': entreprise.site_web || '',
      'Site Web Valide': entreprise.site_web_valide ? 'Oui' : 'Non',
      'Catégorie': entreprise.categorie?.nom || 'Aucune',
      'Date de création': new Date(entreprise.created_at).toLocaleDateString('fr-FR'),
      'Dernière modification': new Date(entreprise.updated_at).toLocaleDateString('fr-FR')
    }));

    exportToExcel(exportData, {
      filename: 'entreprises',
      sheetName: 'Entreprises'
    });
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Entreprises</h2>
          <p className="text-muted-foreground">Gérez la base de données des entreprises</p>
        </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleExportToExcel}
            disabled={isExporting || filteredEntreprises.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Export...' : 'Exporter Excel'}
          </Button>
          <Button type="button" onClick={() => { setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Entreprise
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres - accessible et responsive */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
          <CardDescription>
            Affinez l’affichage. Tous les champs sont facultatifs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div role="search" aria-label="Recherche d’entreprises" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor={searchId} className="text-sm font-medium">Recherche</label>
                <Input
                  id={searchId}
                  placeholder="Nom, téléphone, site, adresse..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={categoryId} className="text-sm font-medium">Catégorie</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id={categoryId} aria-label="Filtrer par catégorie">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={statusId} className="text-sm font-medium">Statut du site</label>
                <Select value={siteStatus} onValueChange={(v) => setSiteStatus(v as SiteStatus)}>
                  <SelectTrigger id={statusId} aria-label="Filtrer par statut du site">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="avec">Avec site</SelectItem>
                    <SelectItem value="sans">Sans site</SelectItem>
                    <SelectItem value="valide">Site valide</SelectItem>
                    <SelectItem value="invalide">Site invalide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={sortId} className="text-sm font-medium">Tri</label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                  <SelectTrigger id={sortId} aria-label="Trier la liste">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Plus récentes d’abord</SelectItem>
                    <SelectItem value="date_asc">Plus anciennes d’abord</SelectItem>
                    <SelectItem value="name_asc">Nom A → Z</SelectItem>
                    <SelectItem value="name_desc">Nom Z → A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-describedby="hint-dates">
              <legend className="text-sm font-medium">Date de création</legend>
              <div className="flex flex-col gap-1">
                <label htmlFor={dateFromId} className="text-sm">Du</label>
                <Input id={dateFromId} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={dateToId} className="text-sm">Au</label>
                <Input id={dateToId} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <p id="hint-dates" className="sr-only">Filtre par intervalle de dates, inclusif.</p>
            </fieldset>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={resetFilters}>Réinitialiser</Button>
              <span role="status" aria-live="polite" className="text-sm text-muted-foreground">
                {filteredEntreprises.length} résultat(s)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {filteredEntreprises.length} entreprise(s) affichée(s) sur {entreprises.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto" aria-live="polite">
            <Table id="entreprises-table" className="min-w-[860px] sm:min-w-0 text-sm">
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
                {filteredEntreprises.map((entreprise) => (
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
