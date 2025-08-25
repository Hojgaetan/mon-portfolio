import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Clock } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface RecentArticle {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  slug: string | null;
  created_at: string;
  categories?: Category;
}

interface RecentArticlesSidebarProps {
  currentArticleId: string;
}

export function RecentArticlesSidebar({ currentArticleId }: RecentArticlesSidebarProps) {
  const [articles, setArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select(`
            id,
            title,
            excerpt,
            image_url,
            slug,
            created_at,
            categories (
              id,
              name,
              slug,
              color
            )
          `)
          .eq("published", true)
          .neq("id", currentArticleId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Erreur lors du chargement des articles récents:", error);
        } else {
          setArticles((data as unknown as RecentArticle[]) || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des articles récents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentArticles();
  }, [currentArticleId]);

  const handleArticleClick = (slug: string | null) => {
    if (slug) {
      navigate(`/article/${slug}`);
    }
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Articles récents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Articles récents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="group cursor-pointer p-3 rounded-lg border border-border/50 hover:border-accent-blue/30 hover:shadow-md transition-all duration-200"
              onClick={() => handleArticleClick(article.slug)}
            >
              {article.image_url && (
                <div className="mb-3">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                {article.categories && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: (article.categories?.color ?? "") + "15",
                      color: article.categories?.color,
                      border: `1px solid ${article.categories?.color}30`
                    }}
                  >
                    {article.categories.name}
                  </Badge>
                )}
                
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-accent-blue transition-colors">
                  {article.title}
                </h4>
                
                {article.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                
                <div className="flex items-center text-xs text-muted-foreground space-x-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(article.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {articles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun autre article disponible
            </p>
          )}
        </CardContent>
      </Card>

      {/* Widget Newsletter ou Call-to-Action */}
      <Card className="bg-gradient-to-br from-accent-blue/5 to-accent-sky/5 border-accent-blue/20">
        <CardContent className="p-4 text-center">
          <h4 className="font-semibold mb-2 text-accent-blue">
            Plus d'articles ?
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Découvrez tous nos articles sur le blog
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="text-sm bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            Voir le blog
          </button>
        </CardContent>
      </Card>
    </div>
  );
}