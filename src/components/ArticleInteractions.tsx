import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Share2, MessageCircle, Twitter, Linkedin, Facebook, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

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

  useEffect(() => {
    fetchInteractionData();
  }, [articleId]);

  const fetchInteractionData = async () => {
    try {
      // Check if user has liked
      const userIP = await getUserIP();
      const { data: likeData } = await supabase
        .from("article_likes")
        .select("id")
        .eq("article_id", articleId)
        .eq("ip_address", userIP)
        .single();

      setLiked(!!likeData);

      // Get total likes
      const { data: likesData } = await supabase
        .from("article_likes")
        .select("id")
        .eq("article_id", articleId);

      setLikes(likesData?.length || 0);

      // Get total shares
      const { data: sharesData } = await supabase
        .from("article_shares")
        .select("id")
        .eq("article_id", articleId);

      setShares(sharesData?.length || 0);
    } catch (error) {
      console.error("Erreur lors du chargement des interactions:", error);
    }
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const handleLike = async () => {
    try {
      const userIP = await getUserIP();
      
      if (liked) {
        // Remove like
        await supabase
          .from("article_likes")
          .delete()
          .eq("article_id", articleId)
          .eq("ip_address", userIP);
        
        setLiked(false);
        setLikes(prev => prev - 1);
        toast({ title: "Like retiré" });
      } else {
        // Add like
        await supabase
          .from("article_likes")
          .insert({
            article_id: articleId,
            ip_address: userIP
          });
        
        setLiked(true);
        setLikes(prev => prev + 1);
        toast({ title: "Article aimé !" });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de liker l'article",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (platform: string, url: string) => {
    try {
      const userIP = await getUserIP();
      
      // Track share
      await supabase
        .from("article_shares")
        .insert({
          article_id: articleId,
          platform,
          ip_address: userIP
        });

      setShares(prev => prev + 1);
      
      // Open share URL
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
      
      // Track as link share
      const userIP = await getUserIP();
      await supabase
        .from("article_shares")
        .insert({
          article_id: articleId,
          platform: 'link',
          ip_address: userIP
        });
      
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