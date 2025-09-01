import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

interface CursusRow {
  id?: string;
  locale: "fr" | "en";
  program: string;
  institution: string;
  year_label: string;
  status_label: string;
  specialization_title: string;
  specialization_desc: string;
  graduation_title: string;
  graduation_date: string;
  courses: string[];
  is_active: boolean;
}

// Typage des lignes retournées par Supabase
interface CursusTableRow {
  id: string;
  locale: "fr" | "en";
  program: string;
  institution: string;
  year_label: string;
  status_label: string;
  specialization_title: string;
  specialization_desc: string;
  graduation_title: string;
  graduation_date: string;
  courses: string[] | null;
  is_active: boolean;
}

const emptyForm: CursusRow = {
  locale: "fr",
  program: "",
  institution: "",
  year_label: "",
  status_label: "",
  specialization_title: "",
  specialization_desc: "",
  graduation_title: "",
  graduation_date: "",
  courses: [],
  is_active: true,
};

export function CursusManager() {
  const { toast } = useToast();
  const [rows, setRows] = useState<CursusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CursusRow | null>(null);
  const [coursesText, setCoursesText] = useState("");

  const byLocale = useMemo(() => {
    const map: Record<string, CursusRow | undefined> = {};
    rows.forEach(r => { map[r.locale] = r; });
    return map;
  }, [rows]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("education_cursus")
          .select("*")
          .order("locale", { ascending: true });
        if (error) throw error;
        const mapped: CursusRow[] = ((data || []) as CursusTableRow[]).map((d) => ({
          id: d.id,
          locale: d.locale,
          program: d.program,
          institution: d.institution,
          year_label: d.year_label,
          status_label: d.status_label,
          specialization_title: d.specialization_title,
          specialization_desc: d.specialization_desc,
          graduation_title: d.graduation_title,
          graduation_date: d.graduation_date,
          courses: Array.isArray(d.courses) ? d.courses : [],
          is_active: !!d.is_active,
        }));
        setRows(mapped);
      } catch (e: unknown) {
        console.error(e);
        const msg = e instanceof Error ? e.message : "Chargement du cursus impossible";
        toast({ title: "Erreur", description: msg, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const startCreate = () => {
    setEditing({ ...emptyForm });
    setCoursesText("");
  };

  const startEdit = (row: CursusRow) => {
    setEditing({ ...row });
    setCoursesText((row.courses || []).join("\n"));
  };

  const cancel = () => {
    setEditing(null);
    setCoursesText("");
  };

  const onSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        locale: editing.locale,
        program: editing.program,
        institution: editing.institution,
        year_label: editing.year_label,
        status_label: editing.status_label,
        specialization_title: editing.specialization_title,
        specialization_desc: editing.specialization_desc,
        graduation_title: editing.graduation_title,
        graduation_date: editing.graduation_date,
        courses: coursesText.split("\n").map(s => s.trim()).filter(Boolean),
        is_active: editing.is_active,
      };
      if (editing.id) {
        const { error } = await supabase.from("education_cursus").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Cursus", description: "Mise à jour effectuée" });
      } else {
        const { error } = await supabase.from("education_cursus").insert([payload]);
        if (error) throw error;
        toast({ title: "Cursus", description: "Créé avec succès" });
      }
      // Refresh
      const { data } = await supabase.from("education_cursus").select("*").order("locale", { ascending: true });
      setRows(((data || []) as CursusTableRow[]).map((d) => ({
        id: d.id,
        locale: d.locale,
        program: d.program,
        institution: d.institution,
        year_label: d.year_label,
        status_label: d.status_label,
        specialization_title: d.specialization_title,
        specialization_desc: d.specialization_desc,
        graduation_title: d.graduation_title,
        graduation_date: d.graduation_date,
        courses: Array.isArray(d.courses) ? d.courses : [],
        is_active: !!d.is_active,
      })));
      setEditing(null);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Échec de la sauvegarde";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row: CursusRow) => {
    if (!row.id) return;
    if (!confirm("Supprimer ce cursus ?")) return;
    try {
      const { error } = await supabase.from("education_cursus").delete().eq("id", row.id);
      if (error) throw error;
      setRows(prev => prev.filter(r => r.id !== row.id));
      toast({ title: "Cursus", description: "Supprimé" });
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Échec de la suppression";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion Cursus</h1>
          <p className="text-muted-foreground">Gérez le contenu de la section Cursus (par langue)</p>
        </div>
        <Button onClick={startCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau cursus
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["fr","en"].map((loc) => (
          <Card key={loc}>
            <CardHeader>
              <CardTitle>Cursus — {loc.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Chargement...</div>
              ) : byLocale[loc] ? (
                <div className="space-y-2">
                  <div className="text-sm"><span className="font-medium">Programme:</span> {byLocale[loc]?.program}</div>
                  <div className="text-sm"><span className="font-medium">Établissement:</span> {byLocale[loc]?.institution}</div>
                  <div className="text-sm"><span className="font-medium">Année:</span> {byLocale[loc]?.year_label}</div>
                  <div className="text-sm"><span className="font-medium">Statut:</span> {byLocale[loc]?.status_label}</div>
                  <div className="text-sm"><span className="font-medium">Spécialisation:</span> {byLocale[loc]?.specialization_title}</div>
                  <div className="text-sm"><span className="font-medium">Diplôme:</span> {byLocale[loc]?.graduation_title} — {byLocale[loc]?.graduation_date}</div>
                  <div className="text-sm"><span className="font-medium">Cours ({byLocale[loc]?.courses?.length}):</span> {(byLocale[loc]?.courses||[]).slice(0,3).join(", ")}{(byLocale[loc]?.courses||[]).length>3?"…":""}</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(byLocale[loc]!)}><Edit2 className="w-4 h-4 mr-1"/>Modifier</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(byLocale[loc]!)}><Trash2 className="w-4 h-4 mr-1"/>Supprimer</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Aucun cursus pour {loc.toUpperCase()}.</div>
                  <Button size="sm" onClick={() => { startCreate(); setEditing(prev => prev ? { ...prev, locale: (loc === 'en' ? 'en' : 'fr') } : prev); }}>Créer</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{editing.id ? "Modifier le cursus" : "Créer un cursus"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select value={editing.locale} onValueChange={(v) => setEditing({ ...editing, locale: (v === 'en' ? 'en' : 'fr') })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Langue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Programme</Label>
                <Input value={editing.program} onChange={(e)=>setEditing({...editing, program: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Établissement</Label>
                <Input value={editing.institution} onChange={(e)=>setEditing({...editing, institution: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Année (ex: 3ème année (L3))</Label>
                <Input value={editing.year_label} onChange={(e)=>setEditing({...editing, year_label: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Statut (ex: En cours)</Label>
                <Input value={editing.status_label} onChange={(e)=>setEditing({...editing, status_label: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titre de la spécialisation</Label>
                <Input value={editing.specialization_title} onChange={(e)=>setEditing({...editing, specialization_title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Description de la spécialisation</Label>
                <Input value={editing.specialization_desc} onChange={(e)=>setEditing({...editing, specialization_desc: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titre du diplôme</Label>
                <Input value={editing.graduation_title} onChange={(e)=>setEditing({...editing, graduation_title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Date du diplôme (ex: Juin 2026)</Label>
                <Input value={editing.graduation_date} onChange={(e)=>setEditing({...editing, graduation_date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cours clés (un par ligne)</Label>
              <Textarea rows={6} value={coursesText} onChange={(e)=>setCoursesText(e.target.value)} placeholder={"Algorithmes et structures de données\nBases de données\n..."} />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={editing.is_active} onCheckedChange={(v)=>setEditing({...editing, is_active: v})} />
              <Label>Actif</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={onSave} disabled={saving} className="flex items-center gap-2">
                <Save className="w-4 h-4" /> {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button variant="outline" onClick={cancel}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
