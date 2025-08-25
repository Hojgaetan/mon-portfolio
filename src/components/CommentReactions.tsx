import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getClientIP } from "@/lib/utils";

interface CommentReactionsProps {
  commentId: string;
}

export function CommentReactions({ commentId }: CommentReactionsProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const { toast } = useToast();

  // Génère/récupère un client_id persistant côté navigateur
  const getClientId = () => {
    try {
      const key = "comment_client_id";
      let cid = localStorage.getItem(key);
      if (!cid) {
        const uuid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(key, uuid);
        cid = uuid;
      }
      return cid;
    } catch {
      return "anonymous";
    }
  };

  const fetchReactionData = useCallback(async () => {
    try {
      const clientId = getClientId();

      // Vérifie si l'utilisateur (client) a liké ce commentaire
      const { data: reactionRow, error: reactionErr } = await supabase
        .from("comment_reactions")
        .select("id, active")
        .eq("comment_id", commentId)
        .eq("client_id", clientId)
        .maybeSingle();

      if (reactionErr) console.warn("reaction check error", reactionErr);
      setLiked(!!reactionRow?.active);

      // Total likes (actifs uniquement)
      const { data: likesData, error: likesErr } = await supabase
        .from("comment_reactions")
        .select("id")
        .eq("comment_id", commentId)
        .eq("active", true)
        .eq("reaction_type", "like");

      if (likesErr) console.warn("likes count error", likesErr);
      setLikes(likesData?.length || 0);
    } catch (error) {
      console.error("Erreur lors du chargement des réactions:", error);
    }
  }, [commentId]);

  useEffect(() => {
    fetchReactionData();
  }, [fetchReactionData]);

  const getUserIP = async () => {
    const ip = await getClientIP();
    return ip || 'unknown';
  };

  const handleLike = async () => {
    try {
      const clientId = getClientId();
      const ip = await getUserIP();

      if (liked) {
        // Désactiver le like existant
        const { error } = await supabase
          .from("comment_reactions")
          .update({ active: false })
          .eq("comment_id", commentId)
          .eq("client_id", clientId);

        if (error) throw error;
        setLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
      } else {
        // Vérifier d'abord si un enregistrement existe déjà
        const { data: existingReaction, error: checkError } = await supabase
          .from("comment_reactions")
          .select("id, active")
          .eq("comment_id", commentId)
          .eq("client_id", clientId)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingReaction) {
          // Mettre à jour l'enregistrement existant
          const { error } = await supabase
            .from("comment_reactions")
            .update({ active: true, updated_at: new Date().toISOString() })
            .eq("id", existingReaction.id);

          if (error) throw error;
        } else {
          // Créer un nouvel enregistrement
          const { error } = await supabase
            .from("comment_reactions")
            .insert({
              comment_id: commentId,
              client_id: clientId,
              ip_address: ip,
              reaction_type: "like",
              active: true,
            });

          if (error) {
            // Si erreur de contrainte unique, essayer de récupérer et mettre à jour
            if (error.code === '23505') {
              const { data: conflictReaction, error: conflictError } = await supabase
                .from("comment_reactions")
                .select("id")
                .eq("comment_id", commentId)
                .eq("ip_address", ip)
                .maybeSingle();

              if (conflictError) throw conflictError;

              if (conflictReaction) {
                const { error: updateError } = await supabase
                  .from("comment_reactions")
                  .update({ 
                    active: true, 
                    client_id: clientId,
                    updated_at: new Date().toISOString() 
                  })
                  .eq("id", conflictReaction.id);

                if (updateError) throw updateError;
              }
            } else {
              throw error;
            }
          }
        }

        setLiked(true);
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error("Erreur lors de la réaction:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réagir au commentaire",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant={liked ? "accent-red" : "ghost"}
      size="sm"
      onClick={handleLike}
      className={`flex items-center gap-1 text-xs h-7 px-2 ${
        !liked ? 'text-muted-foreground hover:text-accent-red hover:bg-accent-red/5' : ''
      }`}
    >
      <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
      {likes > 0 && <span>{likes}</span>}
    </Button>
  );
}