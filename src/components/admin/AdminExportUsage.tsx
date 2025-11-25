import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Info, RefreshCw, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExportUsageRow {
  id: string;
  user_id: string;
  kind: string;
  created_at: string;
  profiles?: {
    email: string;
  };
}

// Composant de suivi de l'usage d'export gratuit Excel (ex: 1 export gratuit par utilisateur)
export function AdminExportUsage() {
  const [row, setRow] = useState<ExportUsageRow | null>(null);
  const [allExports, setAllExports] = useState<ExportUsageRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
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

      // Vérifier si admin
      const { data: adminData } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      const admin = !!adminData;
      setIsAdmin(admin);

      // Charger l'export de l'utilisateur courant
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

      // Si admin, charger tous les exports (nécessite une politique RLS admin ou service_role)
      if (admin) {
        const { data: allData, error: allError } = await supabase
          .from("export_usage")
          .select(`
            id, 
            user_id, 
            kind, 
            created_at,
            profiles!export_usage_user_id_fkey (
              email
            )
          `)
          .eq("kind", "excel_free")
          .order("created_at", { ascending: false });

        if (allError) {
          console.warn("Admin: impossible de charger tous les exports:", allError);
          // Pas bloquant, on continue
        } else {
          setAllExports(allData || []);
        }
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

      {/* Vue Admin: tous les exports */}
      {isAdmin && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Vue Admin: Tous les exports gratuits
              </CardTitle>
              <CardDescription>Liste complète des exports gratuits Excel utilisés par les utilisateurs.</CardDescription>
            </CardHeader>
            <CardContent>
              {allExports.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun export enregistré pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <div className="flex-1">Utilisateur</div>
                    <div className="w-32">Date</div>
                    <div className="w-24 text-right">Type</div>
                  </div>
                  {allExports.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-4 text-sm">
                      <div className="flex-1 font-medium">
                        {exp.profiles?.email || `User ${exp.user_id.slice(0, 8)}...`}
                      </div>
                      <div className="w-32 text-muted-foreground">
                        {new Date(exp.created_at).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="w-24 text-right">
                        <Badge variant="secondary">{exp.kind}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total exports</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent-blue">{allExports.length}</div>
                <p className="text-xs text-muted-foreground">Exports gratuits utilisés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-accent-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent-green">
                  {new Set(allExports.map(e => e.user_id)).size}
                </div>
                <p className="text-xs text-muted-foreground">Ayant utilisé l'export</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
                <FileText className="h-4 w-4 text-accent-yellow" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent-yellow">
                  {allExports.filter(e => {
                    const date = new Date(e.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return date >= weekAgo;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">Derniers 7 jours</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Notes & Améliorations</CardTitle>
          <CardDescription>Idées pour la suite (admin agrégé).</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li>✅ Vue admin de tous les exports implémentée (nécessite relation profiles)</li>
            <li>Inclure d'autres kinds (ex: 'pdf_export', 'excel_paid').</li>
            <li>Graphique d'utilisation dans le tableau de bord (répartition des exports).</li>
            <li>Limiter l'export gratuit par date (ex: 1/mois) avec contrainte de duplication temporelle côté SQL.</li>
            <li>Export CSV des statistiques d'usage pour analyse.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
