import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArticleInteractions } from "@/components/ArticleInteractions";
import { ArticleComments } from "@/components/ArticleComments";
import { ArrowLeft, Eye, Calendar, User, Clock } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  slug: string | null;
  published: boolean | null;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  categories?: Category;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [views, setViews] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select(`
            *,
            categories (
              id,
              name,
              slug,
              color
            )
          `)
          .eq("slug", slug)
          .eq("published", true)
          .single();
          
        if (error) {
          setError("Article introuvable");
        } else {
          setPost(data);
          await trackView(data.id);
          await fetchViews(data.id);
        }
      } catch (error) {
        setError("Article introuvable");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [slug]);

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const trackView = async (articleId: string) => {
    try {
      const userIP = await getUserIP();
      const userAgent = navigator.userAgent;
      
      await supabase
        .from("article_views")
        .insert({
          article_id: articleId,
          ip_address: userIP,
          user_agent: userAgent
        });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la vue:", error);
    }
  };

  const fetchViews = async (articleId: string) => {
    try {
      const { data } = await supabase
        .from("article_views")
        .select("id")
        .eq("article_id", articleId);
      
      setViews(data?.length || 0);
    } catch (error) {
      console.error("Erreur lors du chargement des vues:", error);
    }
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Article introuvable"}</h1>
          <Button onClick={() => navigate('/blog')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au blog
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {post.categories && (
              <Badge 
                variant="secondary" 
                className="text-sm"
                style={{ backgroundColor: `${post.categories.color}20`, color: post.categories.color }}
              >
                {post.categories.name}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long", 
                year: "numeric"
              })}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getReadingTime(post.content)} min de lecture
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {views} vues
            </span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
          )}
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="mb-8">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="mb-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-accent-blue hover:prose-a:text-accent-blue/80"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </article>

        {/* Article Interactions */}
        <div className="mb-8">
          <ArticleInteractions 
            articleId={post.id}
            articleTitle={post.title}
            articleUrl={window.location.href}
          />
        </div>

        {/* Comments Section */}
        <ArticleComments articleId={post.id} />
      </div>
    </div>
  );
}

