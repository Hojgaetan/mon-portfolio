import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Info, RefreshCw } from "lucide-react";

interface ExportUsageRow {
  id: string;
  user_id: string;
  kind: string;
  created_at: string;
}

// Composant de suivi de l'usage d'export gratuit Excel (ex: 1 export gratuit par utilisateur)
export function AdminExportUsage() {
  const [row, setRow] = useState<ExportUsageRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [inserting, setInserting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const { data, error } = await supabase
        .from("export_usage")
        .select("id, user_id, kind, created_at")
        .eq("user_id", user.id)
        .eq("kind", "excel_free")
        .maybeSingle();
      if (error) {
        setError(error.message);
      } else {
        setRow(data || null);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleRegisterUsage = async () => {
    if (!userId || row) return; // déjà utilisé ou pas d'utilisateur
    setInserting(true);
    setError(null);
    const { error } = await supabase
      .from("export_usage")
      .insert({ user_id: userId, kind: "excel_free" });
    if (error) {
      setError(error.message);
    } else {
      // Recharger
      const { data } = await supabase
        .from("export_usage")
        .select("id, user_id, kind, created_at")
        .eq("user_id", userId)
        .eq("kind", "excel_free")
        .maybeSingle();
      setRow(data || null);
    }
    setInserting(false);
  };

  const handleRefresh = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("export_usage")
      .select("id, user_id, kind, created_at")
      .eq("user_id", userId)
      .eq("kind", "excel_free")
      .maybeSingle();
    if (error) setError(error.message);
    setRow(data || null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" /> Exports & Usage</h1>
        <p className="text-muted-foreground">Suivi de l'export gratuit Excel par utilisateur. (RLS: chaque utilisateur ne voit que son propre usage).</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Export Excel gratuit</CardTitle>
          <CardDescription>1 utilisation gratuite enregistrée dans la table export_usage (kind = 'excel_free').</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : (
            <>
              {row ? (
                <div className="text-sm">
                  <p className="text-accent-green font-medium">Déjà utilisé</p>
                  <p className="text-muted-foreground mt-1">Le {new Date(row.created_at).toLocaleString("fr-FR")}</p>
                </div>
              ) : (
                <div className="text-sm">
                  <p className="text-accent-yellow font-medium">Pas encore utilisé</p>
                  <p className="text-muted-foreground mt-1">Vous pouvez consommer l'export gratuit.</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button disabled={!!row || inserting || loading || !userId} onClick={handleRegisterUsage}>
                  {inserting ? "Enregistrement..." : row ? "Déjà enregistré" : "Enregistrer l'usage"}
                </Button>
                <Button variant="outline" onClick={handleRefresh} disabled={loading}> <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir</Button>
              </div>
              {error && (
                <div className="text-sm text-accent-red flex items-center gap-2"><Info className="w-4 h-4" /> {error}</div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Notes & Améliorations</CardTitle>
          <CardDescription>Idées pour la suite (admin agrégé).</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li>Ajouter une politique RLS spécifique pour permettre aux admins de voir tous les usages.</li>
            <li>Inclure d'autres kinds (ex: 'pdf_export', 'excel_paid').</li>
            <li>Graphique d'utilisation dans le tableau de bord (répartition des exports).</li>
            <li>Limiter l'export gratuit par date (ex: 1/mois) avec contrainte de duplication temporelle côté SQL.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
