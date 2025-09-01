import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Edit2, Plus, Trash2, Loader2 } from "lucide-react";

interface MetaRow {
  id?: string;
  section_key: 'cursus' | 'certifications';
  locale: 'fr' | 'en';
  badge: string | null;
  title: string | null;
  subtitle: string | null;
  is_active: boolean;
}

interface MetaTableRow {
  id: string;
  section_key: 'cursus' | 'certifications';
  locale: 'fr' | 'en';
  badge: string | null;
  title: string | null;
  subtitle: string | null;
  is_active: boolean;
}

const emptyMeta: MetaRow = {
  section_key: 'cursus',
  locale: 'fr',
  badge: '',
  title: '',
  subtitle: '',
  is_active: true,
};

export function HomeSectionsManager() {
  const { toast } = useToast();
  const [rows, setRows] = useState<MetaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MetaRow | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('home_sections_meta').select('*');
        if (error) throw error;
        setRows(((data||[]) as MetaTableRow[]).map(d => ({
          id: d.id,
          section_key: d.section_key,
          locale: d.locale,
          badge: d.badge,
          title: d.title,
          subtitle: d.subtitle,
          is_active: !!d.is_active,
        })));
      } catch (e: unknown) {
        console.error(e);
        toast({ title: 'Erreur', description: e instanceof Error ? e.message : 'Chargement impossible', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        section_key: editing.section_key,
        locale: editing.locale,
        badge: editing.badge || null,
        title: editing.title || null,
        subtitle: editing.subtitle || null,
        is_active: editing.is_active,
      };
      if (editing.id) {
        const { error } = await supabase.from('home_sections_meta').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Métadonnées', description: 'Mise à jour effectuée' });
      } else {
        const { error } = await supabase.from('home_sections_meta').insert([payload]);
        if (error) throw error;
        toast({ title: 'Métadonnées', description: 'Créées avec succès' });
      }
      const { data } = await supabase.from('home_sections_meta').select('*');
      setRows(((data||[]) as MetaTableRow[]).map(d => ({
        id: d.id,
        section_key: d.section_key,
        locale: d.locale,
        badge: d.badge,
        title: d.title,
        subtitle: d.subtitle,
        is_active: !!d.is_active,
      })));
      setEditing(null);
    } catch (e: unknown) {
      console.error(e);
      toast({ title: 'Erreur', description: e instanceof Error ? e.message : 'Échec de la sauvegarde', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const del = async (row: MetaRow) => {
    if (!row.id) return;
    if (!confirm('Supprimer ces métadonnées ?')) return;
    try {
      const { error } = await supabase.from('home_sections_meta').delete().eq('id', row.id);
      if (error) throw error;
      setRows(prev => prev.filter(r => r.id !== row.id));
      toast({ title: 'Métadonnées', description: 'Supprimées' });
    } catch (e: unknown) {
      console.error(e);
      toast({ title: 'Erreur', description: e instanceof Error ? e.message : 'Échec de la suppression', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accueil — Métadonnées des sections</h1>
          <p className="text-muted-foreground">Badge, titre et sous-titre pour Cursus et Certifications</p>
        </div>
        <Button onClick={() => setEditing({ ...emptyMeta })} className="flex items-center gap-2"><Plus className="w-4 h-4"/>Nouveau</Button>
      </div>

      {(['cursus','certifications'] as const).map(section => (
        <Card key={section}>
          <CardHeader>
            <CardTitle>{section === 'cursus' ? 'Cursus' : 'Certifications'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Chargement...</div>
            ) : (
              (['fr','en'] as const).map(loc => {
                const row = rows.find(r => r.section_key === section && r.locale === loc);
                return (
                  <div key={`${section}-${loc}`} className="p-3 rounded border flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{loc.toUpperCase()}</div>
                      <div className="text-sm">
                        <span className="font-medium">Badge:</span> {row?.badge || <span className="text-muted-foreground">(vide)</span>}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Titre:</span> {row?.title || <span className="text-muted-foreground">(vide)</span>}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Sous-titre:</span> {row?.subtitle || <span className="text-muted-foreground">(vide)</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(row ? { ...row } : { ...emptyMeta, section_key: section, locale: loc })}><Edit2 className="w-4 h-4 mr-1"/>Modifier</Button>
                      {row?.id && <Button size="sm" variant="destructive" onClick={() => del(row)}><Trash2 className="w-4 h-4 mr-1"/>Supprimer</Button>}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      ))}

      {editing && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{editing.id ? 'Modifier' : 'Créer'} — métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={editing.section_key} onValueChange={(v) => setEditing({ ...editing, section_key: (v === 'certifications' ? 'certifications' : 'cursus') })}>
                  <SelectTrigger><SelectValue placeholder="Section"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cursus">Cursus</SelectItem>
                    <SelectItem value="certifications">Certifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select value={editing.locale} onValueChange={(v) => setEditing({ ...editing, locale: (v === 'en' ? 'en' : 'fr') })}>
                  <SelectTrigger><SelectValue placeholder="Langue"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Actif</Label>
                <div className="flex items-center gap-2"><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}/> <span>Visible</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input value={editing.badge || ''} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} placeholder="Ex: 📚 Formation en cours" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Titre</Label>
                <Input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Titre de la section" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sous-titre</Label>
              <Input value={editing.subtitle || ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Description courte" />
            </div>

            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="flex items-center gap-2"><Save className="w-4 h-4"/>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
