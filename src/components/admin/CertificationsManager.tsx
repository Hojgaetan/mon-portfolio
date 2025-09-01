import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plus, Edit2, Trash2, Loader2, ListOrdered } from "lucide-react";

interface CertificationRow {
  id?: string;
  locale: "fr" | "en";
  title: string;
  provider: string;
  progress?: string | null;
  expected?: string | null;
  order_index: number;
  is_active: boolean;
}

interface SkillRow {
  id?: string;
  locale: "fr" | "en";
  label: string;
  icon?: string | null; // emoji or short text
  color_class?: string | null; // tailwind classes
  order_index: number;
  is_active: boolean;
}

// Types lignes Supabase
interface CertificationTableRow {
  id: string;
  locale: "fr" | "en";
  title: string;
  provider: string;
  progress: string | null;
  expected: string | null;
  order_index: number | null;
  is_active: boolean;
}

interface SkillTableRow {
  id: string;
  locale: "fr" | "en";
  label: string;
  icon: string | null;
  color_class: string | null;
  order_index: number | null;
  is_active: boolean;
}

const emptyCert: CertificationRow = {
  locale: "fr",
  title: "",
  provider: "",
  progress: "",
  expected: "",
  order_index: 0,
  is_active: true,
};

const emptySkill: SkillRow = {
  locale: "fr",
  label: "",
  icon: "",
  color_class: "bg-blue-500/20 text-blue-600",
  order_index: 0,
  is_active: true,
};

export function CertificationsManager() {
  const { toast } = useToast();
  const [certs, setCerts] = useState<CertificationRow[]>([]);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingCert, setEditingCert] = useState<CertificationRow | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillRow | null>(null);
  const [saving, setSaving] = useState(false);

  const certsByLocale = useMemo(() => {
    return {
      fr: certs.filter(c => c.locale === 'fr').sort((a,b)=>a.order_index-b.order_index),
      en: certs.filter(c => c.locale === 'en').sort((a,b)=>a.order_index-b.order_index),
    };
  }, [certs]);

  const skillsByLocale = useMemo(() => {
    return {
      fr: skills.filter(s => s.locale === 'fr').sort((a,b)=>a.order_index-b.order_index),
      en: skills.filter(s => s.locale === 'en').sort((a,b)=>a.order_index-b.order_index),
    };
  }, [skills]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [{ data: cData, error: cErr }, { data: sData, error: sErr }] = await Promise.all([
          supabase.from("certifications").select("*"),
          supabase.from("certification_skills").select("*"),
        ]);
        if (cErr) throw cErr;
        if (sErr) throw sErr;
        setCerts(((cData || []) as CertificationTableRow[]).map((c) => ({
          id: c.id,
          locale: c.locale,
          title: c.title,
          provider: c.provider,
          progress: c.progress,
          expected: c.expected,
          order_index: c.order_index ?? 0,
          is_active: !!c.is_active,
        })));
        setSkills(((sData || []) as SkillTableRow[]).map((s) => ({
          id: s.id,
          locale: s.locale,
          label: s.label,
          icon: s.icon,
          color_class: s.color_class,
          order_index: s.order_index ?? 0,
          is_active: !!s.is_active,
        })));
      } catch (e: unknown) {
        console.error(e);
        const msg = e instanceof Error ? e.message : "Chargement impossible";
        toast({ title: "Erreur", description: msg, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const saveCert = async () => {
    if (!editingCert) return;
    setSaving(true);
    try {
      const payload = {
        locale: editingCert.locale,
        title: editingCert.title,
        provider: editingCert.provider,
        progress: editingCert.progress || null,
        expected: editingCert.expected || null,
        order_index: editingCert.order_index || 0,
        is_active: editingCert.is_active,
      };
      if (editingCert.id) {
        const { error } = await supabase.from("certifications").update(payload).eq("id", editingCert.id);
        if (error) throw error;
        toast({ title: "Certification", description: "Mise à jour effectuée" });
      } else {
        const { error } = await supabase.from("certifications").insert([payload]);
        if (error) throw error;
        toast({ title: "Certification", description: "Créée avec succès" });
      }
      const { data } = await supabase.from("certifications").select("*");
      setCerts(((data || []) as CertificationTableRow[]).map((c) => ({
        id: c.id, locale: c.locale, title: c.title, provider: c.provider, progress: c.progress, expected: c.expected, order_index: c.order_index ?? 0, is_active: !!c.is_active,
      })));
      setEditingCert(null);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Échec de la sauvegarde";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteCert = async (row: CertificationRow) => {
    if (!row.id) return;
    if (!confirm("Supprimer cette certification ?")) return;
    try {
      const { error } = await supabase.from("certifications").delete().eq("id", row.id);
      if (error) throw error;
      setCerts(prev => prev.filter(c => c.id !== row.id));
      toast({ title: "Certification", description: "Supprimée" });
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Échec de la suppression";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    }
  };

  const saveSkill = async () => {
    if (!editingSkill) return;
    setSaving(true);
    try {
      const payload = {
        locale: editingSkill.locale,
        label: editingSkill.label,
        icon: editingSkill.icon || null,
        color_class: editingSkill.color_class || null,
        order_index: editingSkill.order_index || 0,
        is_active: editingSkill.is_active,
      };
      if (editingSkill.id) {
        const { error } = await supabase.from("certification_skills").update(payload).eq("id", editingSkill.id);
        if (error) throw error;
        toast({ title: "Compétence", description: "Mise à jour effectuée" });
      } else {
        const { error } = await supabase.from("certification_skills").insert([payload]);
        if (error) throw error;
        toast({ title: "Compétence", description: "Créée avec succès" });
      }
      const { data } = await supabase.from("certification_skills").select("*");
      setSkills(((data || []) as SkillTableRow[]).map((s) => ({
        id: s.id, locale: s.locale, label: s.label, icon: s.icon, color_class: s.color_class, order_index: s.order_index ?? 0, is_active: !!s.is_active,
      })));
      setEditingSkill(null);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Échec de la sauvegarde";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (row: SkillRow) => {
    if (!row.id) return;
    if (!confirm("Supprimer cette compétence ?")) return;
    try {
      const { error } = await supabase.from("certification_skills").delete().eq("id", row.id);
      if (error) throw error;
      setSkills(prev => prev.filter(s => s.id !== row.id));
      toast({ title: "Compétence", description: "Supprimée" });
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
          <h1 className="text-3xl font-bold">Gestion Certifications</h1>
          <p className="text-muted-foreground">Gérez les certifications et les compétences visées (par langue)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditingCert({ ...emptyCert })} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvelle certification
          </Button>
          <Button variant="outline" onClick={() => setEditingSkill({ ...emptySkill })} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvelle compétence
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListOrdered className="w-4 h-4"/>Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Chargement...</div>
            ) : (
              (["fr","en"] as const).map(loc => (
                <div key={loc} className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{loc.toUpperCase()}</div>
                  <div className="space-y-2">
                    {certsByLocale[loc].map((c) => (
                      <div key={c.id} className="p-3 rounded border flex items-center justify-between">
                        <div>
                          <div className="font-medium">{c.title} <span className="text-xs text-muted-foreground">— {c.provider}</span></div>
                          <div className="text-xs text-muted-foreground">{c.progress} {c.expected ? `• ${c.expected}` : ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Ordre {c.order_index}</span>
                          <Button size="sm" variant="outline" onClick={() => setEditingCert({ ...c })}><Edit2 className="w-4 h-4 mr-1"/>Modifier</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteCert(c)}><Trash2 className="w-4 h-4 mr-1"/>Supprimer</Button>
                        </div>
                      </div>
                    ))}
                    {certsByLocale[loc].length === 0 && (
                      <div className="text-sm text-muted-foreground">Aucune certification pour {loc.toUpperCase()}.</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Compétences */}
        <Card>
          <CardHeader>
            <CardTitle>Compétences visées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Chargement...</div>
            ) : (
              (["fr","en"] as const).map(loc => (
                <div key={loc} className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{loc.toUpperCase()}</div>
                  <div className="space-y-2">
                    {skillsByLocale[loc].map((s) => (
                      <div key={s.id} className="p-3 rounded border flex items-center justify-between">
                        <div>
                          <div className="font-medium">{s.icon ? `${s.icon} ` : ''}{s.label}</div>
                          <div className="text-xs text-muted-foreground">{s.color_class}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Ordre {s.order_index}</span>
                          <Button size="sm" variant="outline" onClick={() => setEditingSkill({ ...s })}><Edit2 className="w-4 h-4 mr-1"/>Modifier</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteSkill(s)}><Trash2 className="w-4 h-4 mr-1"/>Supprimer</Button>
                        </div>
                      </div>
                    ))}
                    {skillsByLocale[loc].length === 0 && (
                      <div className="text-sm text-muted-foreground">Aucune compétence pour {loc.toUpperCase()}.</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form certification */}
      {editingCert && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{editingCert.id ? "Modifier la certification" : "Créer une certification"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select value={editingCert.locale} onValueChange={(v)=>setEditingCert({ ...editingCert, locale: (v === 'en' ? 'en' : 'fr') })}>
                  <SelectTrigger><SelectValue placeholder="Langue"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input value={editingCert.title} onChange={(e)=>setEditingCert({ ...editingCert, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Input value={editingCert.provider} onChange={(e)=>setEditingCert({ ...editingCert, provider: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Progression</Label>
                <Input value={editingCert.progress || ''} onChange={(e)=>setEditingCert({ ...editingCert, progress: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Échéance</Label>
                <Input value={editingCert.expected || ''} onChange={(e)=>setEditingCert({ ...editingCert, expected: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input type="number" value={editingCert.order_index} onChange={(e)=>setEditingCert({ ...editingCert, order_index: parseInt(e.target.value||'0',10) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingCert.is_active} onCheckedChange={(v)=>setEditingCert({ ...editingCert, is_active: v })} />
              <Label>Actif</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveCert} disabled={saving} className="flex items-center gap-2"><Save className="w-4 h-4"/>{saving?"Sauvegarde...":"Sauvegarder"}</Button>
              <Button variant="outline" onClick={()=>setEditingCert(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form compétence */}
      {editingSkill && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{editingSkill.id ? "Modifier la compétence" : "Créer une compétence"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select value={editingSkill.locale} onValueChange={(v)=>setEditingSkill({ ...editingSkill, locale: (v === 'en' ? 'en' : 'fr') })}>
                  <SelectTrigger><SelectValue placeholder="Langue"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Libellé</Label>
                <Input value={editingSkill.label} onChange={(e)=>setEditingSkill({ ...editingSkill, label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Icône (emoji)</Label>
                <Input value={editingSkill.icon || ''} onChange={(e)=>setEditingSkill({ ...editingSkill, icon: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Classes de couleur (Tailwind)</Label>
                <Input value={editingSkill.color_class || ''} onChange={(e)=>setEditingSkill({ ...editingSkill, color_class: e.target.value })} placeholder="ex: bg-blue-500/20 text-blue-600" />
              </div>
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input type="number" value={editingSkill.order_index} onChange={(e)=>setEditingSkill({ ...editingSkill, order_index: parseInt(e.target.value||'0',10) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingSkill.is_active} onCheckedChange={(v)=>setEditingSkill({ ...editingSkill, is_active: v })} />
              <Label>Actif</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveSkill} disabled={saving} className="flex items-center gap-2"><Save className="w-4 h-4"/>{saving?"Sauvegarde...":"Sauvegarder"}</Button>
              <Button variant="outline" onClick={()=>setEditingSkill(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
