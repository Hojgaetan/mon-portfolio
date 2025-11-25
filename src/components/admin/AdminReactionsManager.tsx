import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, RefreshCw, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommentWithReactions {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  article_id: string;
  total_reactions: number;
}

// Vue agrégée des réactions sur tous les commentaires
export function AdminReactionsManager() {
  const [stats, setStats] = useState<{ total: number; byType: Record<string, number> }>({ total: 0, byType: {} });
  const [topComments, setTopComments] = useState<CommentWithReactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer toutes les réactions actives (supposant table comment_reactions)
      const { data: reactions, error: reactionsError } = await supabase
        .from("comment_reactions")
        .select("id, comment_id, reaction_type, active")
        .eq("active", true);

      if (reactionsError) {
        setError(reactionsError.message);
        setLoading(false);
        return;
      }

      // Agréger par type
      const byType: Record<string, number> = {};
      reactions?.forEach((r) => {
        byType[r.reaction_type] = (byType[r.reaction_type] || 0) + 1;
      });

      setStats({ total: reactions?.length || 0, byType });

      // Récupérer les commentaires les plus réagis (top 5)
      // Grouper par comment_id
      const commentCounts: Record<string, number> = {};
      reactions?.forEach((r) => {
        commentCounts[r.comment_id] = (commentCounts[r.comment_id] || 0) + 1;
      });

      const topCommentIds = Object.entries(commentCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      if (topCommentIds.length > 0) {
        const { data: comments, error: commentsError } = await supabase
          .from("article_comments")
          .select("id, content, created_at, author_name, article_id")
          .in("id", topCommentIds);

        if (commentsError) {
          console.warn("Erreur chargement commentaires:", commentsError);
        } else {
          const commentsWithReactions = comments?.map((c) => ({
            ...c,
            total_reactions: commentCounts[c.id] || 0,
          })).sort((a, b) => b.total_reactions - a.total_reactions) || [];
          setTopComments(commentsWithReactions);
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-accent-red" /> Réactions aux commentaires
          </h1>
          <p className="text-muted-foreground">Vue agrégée de toutes les réactions sur les commentaires.</p>
        </div>
        <Button variant="outline" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Rafraîchir
        </Button>
      </div>

      {error && (
        <Card className="border-accent-red">
          <CardContent className="pt-6">
            <p className="text-sm text-accent-red">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: La table comment_reactions doit exister avec les colonnes : id, comment_id, reaction_type, active.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats globales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total réactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-blue">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Sur tous les commentaires</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Types de réactions</CardTitle>
            <Heart className="h-4 w-4 text-accent-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-red">{Object.keys(stats.byType).length}</div>
            <p className="text-xs text-muted-foreground">Différents types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commentaires réactés</CardTitle>
            <MessageCircle className="h-4 w-4 text-accent-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-green">{topComments.length}</div>
            <p className="text-xs text-muted-foreground">Top 5 affichés</p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par type</CardTitle>
          <CardDescription>Nombre de réactions par type</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.byType).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune réaction enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {type === "like" && <Heart className="w-4 h-4 text-accent-red" />}
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top commentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Commentaires les plus réactés</CardTitle>
          <CardDescription>Top 5 des commentaires avec le plus de réactions</CardDescription>
        </CardHeader>
        <CardContent>
          {topComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun commentaire avec réactions.</p>
          ) : (
            <div className="space-y-4">
              {topComments.map((comment, idx) => (
                <div key={comment.id} className="border-l-2 border-accent-blue pl-4 py-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">#{idx + 1} · {comment.author_name}</p>
                      <p className="text-sm mt-1 line-clamp-2">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge className="bg-accent-red text-white flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {comment.total_reactions}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes techniques */}
      <Card>
        <CardHeader>
          <CardTitle>Notes techniques</CardTitle>
          <CardDescription>Prérequis et améliorations possibles</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li>Table requise: <code className="bg-muted px-1 py-0.5 rounded">comment_reactions</code> avec colonnes id, comment_id, reaction_type, active.</li>
            <li>Table requise: <code className="bg-muted px-1 py-0.5 rounded">article_comments</code> avec colonnes id, content, author_name, article_id, created_at.</li>
            <li>Ajouter pagination pour grandes listes.</li>
            <li>Filtrer par période (dernière semaine, mois, etc.).</li>
            <li>Export CSV/Excel des statistiques.</li>
            <li>Graphiques temporels (évolution des réactions).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

