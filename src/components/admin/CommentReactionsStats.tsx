import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

interface CommentReactionsStatsProps {
  commentId: string;
}

export function CommentReactionsStats({ commentId }: CommentReactionsStatsProps) {
  const [reactionsCount, setReactionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReactionsCount = async () => {
      try {
        const { data, error } = await supabase
          .from("comment_reactions")
          .select("id")
          .eq("comment_id", commentId)
          .eq("active", true)
          .eq("reaction_type", "like");

        if (error) {
          console.error("Erreur lors du chargement des réactions:", error);
        } else {
          setReactionsCount(data?.length || 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des réactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReactionsCount();
  }, [commentId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Heart className="w-3 h-3" />
        <span>...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Heart className="w-3 h-3" />
      <span>{reactionsCount} like{reactionsCount > 1 ? 's' : ''}</span>
    </div>
  );
}