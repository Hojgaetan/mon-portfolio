import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Twitter, Linkedin, Facebook, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { getClientIP } from "@/lib/utils";

interface ArticleInteractionsProps {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
}

export function ArticleInteractions({ articleId, articleTitle, articleUrl }: ArticleInteractionsProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const { toast } = useToast();

  // Génère/récupère un client_id persistant côté navigateur
  const getClientId = () => {
    try {
      const key = "article_client_id";
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

  const fetchInteractionData = useCallback(async () => {
    try {
      const clientId = getClientId();

      // Vérifie si l'utilisateur (client) a liké
      const { data: likeRow, error: likeErr } = await supabase
        .from("article_likes")
        .select("id, active")
        .eq("article_id", articleId)
        .eq("client_id", clientId)
        .maybeSingle();

      if (likeErr) console.warn("like check error", likeErr);
      setLiked(!!likeRow?.active);

      // Total likes (actifs uniquement)
      const { data: likesData, error: likesErr } = await supabase
        .from("article_likes")
        .select("id")
        .eq("article_id", articleId)
        .eq("active", true);

      if (likesErr) console.warn("likes count error", likesErr);
      setLikes(likesData?.length || 0);

      // Total shares
      const { data: sharesData, error: sharesErr } = await supabase
        .from("article_shares")
        .select("id")
        .eq("article_id", articleId);

      if (sharesErr) console.warn("shares count error", sharesErr);
      setShares(sharesData?.length || 0);
    } catch (error) {
      console.error("Erreur lors du chargement des interactions:", error);
    }
  }, [articleId]);

  useEffect(() => {
    fetchInteractionData();
  }, [fetchInteractionData]);

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
          .from("article_likes")
          .update({ active: false })
          .eq("article_id", articleId)
          .eq("client_id", clientId);

        if (error) throw error;
        setLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
        toast({ title: "Like retiré" });
      } else {
        // Vérifier d'abord si un enregistrement existe déjà
        const { data: existingLike, error: checkError } = await supabase
          .from("article_likes")
          .select("id, active")
          .eq("article_id", articleId)
          .eq("client_id", clientId)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingLike) {
          // Mettre à jour l'enregistrement existant
          const { error } = await supabase
            .from("article_likes")
            .update({ active: true, updated_at: new Date().toISOString() })
            .eq("id", existingLike.id);

          if (error) throw error;
        } else {
          // Créer un nouvel enregistrement
          const { error } = await supabase
            .from("article_likes")
            .insert({
              article_id: articleId,
              client_id: clientId,
              ip_address: ip,
              active: true,
            });

          if (error) {
            // Si erreur de contrainte unique, essayer de récupérer et mettre à jour
            if (error.code === '23505') {
              const { data: conflictLike, error: conflictError } = await supabase
                .from("article_likes")
                .select("id")
                .eq("article_id", articleId)
                .eq("ip_address", ip)
                .maybeSingle();

              if (conflictError) throw conflictError;

              if (conflictLike) {
                const { error: updateError } = await supabase
                  .from("article_likes")
                  .update({ 
                    active: true, 
                    client_id: clientId,
                    updated_at: new Date().toISOString() 
                  })
                  .eq("id", conflictLike.id);

                if (updateError) throw updateError;
              }
            } else {
              throw error;
            }
          }
        }

        setLiked(true);
        setLikes(prev => prev + 1);
        toast({ title: "Article aimé !" });
      }
    } catch (error) {
      console.error("Erreur lors du like:", error);
      toast({
        title: "Erreur",
        description: "Impossible de liker l'article",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (platform: string, url: string) => {
    try {
      const clientId = getClientId();
      const userIP = await getUserIP();

      // Trace le partage
      const { error } = await supabase
        .from("article_shares")
        .insert({
          article_id: articleId,
          platform,
          client_id: clientId,
          ip_address: userIP
        });

      if (error) console.warn("share track error", error);

      setShares(prev => prev + 1);

      // Ouvre l'URL de partage
      window.open(url, '_blank', 'width=600,height=400');

      toast({ title: `Partagé sur ${platform}` });
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Lien copié dans le presse-papier" });

      // Trace comme partage de lien
      const clientId = getClientId();
      const userIP = await getUserIP();
      const { error } = await supabase
        .from("article_shares")
        .insert({
          article_id: articleId,
          platform: 'link',
          client_id: clientId,
          ip_address: userIP
        });
      if (error) console.warn("link share track error", error);

      setShares(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={liked ? "accent-red" : "outline"}
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 ${!liked ? 'border-accent-red/20 text-accent-red hover:bg-accent-red/5' : ''}`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {likes}
            </Button>

            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Share2 className="w-4 h-4" />
              {shares}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-accent-sky/20 text-accent-sky hover:bg-accent-sky/5"
              onClick={() => handleShare('twitter', shareUrls.twitter)}
            >
              <Twitter className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-accent-blue/20 text-accent-blue hover:bg-accent-blue/5"
              onClick={() => handleShare('linkedin', shareUrls.linkedin)}
            >
              <Linkedin className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-accent-blue/20 text-accent-blue hover:bg-accent-blue/5"
              onClick={() => handleShare('facebook', shareUrls.facebook)}
            >
              <Facebook className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-accent-green/20 text-accent-green hover:bg-accent-green/5"
              onClick={copyToClipboard}
            >
              <Link2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
