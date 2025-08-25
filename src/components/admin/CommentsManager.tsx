import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, CircleOff, Trash2, Calendar, User, MessageSquare } from "lucide-react";

interface CommentRow {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export function CommentsManager() {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const { toast } = useToast();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("article_comments")
        .select("id, article_id, author_name, author_email, content, approved, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments((data as CommentRow[]) || []);
    } catch (e) {
      console.error("Erreur lors du chargement des commentaires:", e);
      toast({ title: "Erreur", description: "Impossible de charger les commentaires", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const toggleApproved = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from("article_comments")
        .update({ approved })
        .eq("id", id);
      if (error) throw error;
      setComments(prev => prev.map(c => c.id === id ? { ...c, approved } : c));
      toast({ title: approved ? "Commentaire approuvé" : "Commentaire mis en attente" });
    } catch (e) {
      console.error("Erreur update:", e);
      toast({ title: "Erreur", description: "Mise à jour impossible", variant: "destructive" });
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    try {
      const { error } = await supabase
        .from("article_comments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setComments(prev => prev.filter(c => c.id !== id));
      toast({ title: "Commentaire supprimé" });
    } catch (e) {
      console.error("Erreur suppression:", e);
      toast({ title: "Erreur", description: "Suppression impossible", variant: "destructive" });
    }
  };

  const filtered = comments.filter(c =>
    filter === "all" ? true : filter === "approved" ? c.approved : !c.approved
  );

  if (loading) return <div className="flex justify-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Commentaires</h2>
        <div className="flex items-center gap-2">
          <Button variant={filter === "all" ? "secondary" : "ghost"} onClick={() => setFilter("all")}>Tous</Button>
          <Button variant={filter === "pending" ? "secondary" : "ghost"} onClick={() => setFilter("pending")}>En attente</Button>
          <Button variant={filter === "approved" ? "secondary" : "ghost"} onClick={() => setFilter("approved")}>Approuvés</Button>
          <Button variant="outline" onClick={fetchComments}>Rafraîchir</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Aucun commentaire</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className={`transition-colors ${!c.approved ? 'border-accent bg-accent/5' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {c.author_name}
                      <Badge variant={c.approved ? "secondary" : "default"} className={`ml-2 ${!c.approved ? 'bg-accent-blue text-white' : ''}`}>
                        {c.approved ? "Approuvé" : "En attente"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(c.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">Article: {c.article_id}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleApproved(c.id, !c.approved)}>
                      {c.approved ? <CircleOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteComment(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-muted/50 p-3 rounded">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">{c.author_email}</div>
                      <p className="text-sm whitespace-pre-wrap text-foreground mt-1">{c.content}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
