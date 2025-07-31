import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle, Heart, Share2, Calendar, User } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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

interface ArticleStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [articleStats, setArticleStats] = useState<Record<string, ArticleStats>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchArticleStats();
    }
  }, [posts]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from("blog_posts")
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            description,
            color
          )
        `)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleStats = async () => {
    try {
      const postIds = posts.map(post => post.id);
      
      // Fetch views
      const { data: viewsData } = await supabase
        .from("article_views")
        .select("article_id")
        .in("article_id", postIds);

      // Fetch likes
      const { data: likesData } = await supabase
        .from("article_likes")
        .select("article_id")
        .in("article_id", postIds);

      // Fetch comments
      const { data: commentsData } = await supabase
        .from("article_comments")
        .select("article_id")
        .eq("approved", true)
        .in("article_id", postIds);

      // Fetch shares
      const { data: sharesData } = await supabase
        .from("article_shares")
        .select("article_id")
        .in("article_id", postIds);

      // Calculate stats for each article
      const stats: Record<string, ArticleStats> = {};
      postIds.forEach(id => {
        stats[id] = {
          views: viewsData?.filter(v => v.article_id === id).length || 0,
          likes: likesData?.filter(l => l.article_id === id).length || 0,
          comments: commentsData?.filter(c => c.article_id === id).length || 0,
          shares: sharesData?.filter(s => s.article_id === id).length || 0,
        };
      });

      setArticleStats(stats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  if (loading) {
    return (
      <section id="blog" className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des articles...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-80 shrink-0">
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Catégories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Tous les articles
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">À propos du blog</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Découvrez mes articles sur le développement web, la data science, 
                    l'intelligence artificielle et le machine learning.
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Blog</h1>
              <p className="text-xl text-muted-foreground">
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.description 
                  : "Explorez mes derniers articles et réflexions sur la tech"
                }
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-mono">
                  // aucun article {selectedCategory ? "dans cette catégorie" : "publié"} pour le moment
                </p>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-2">
                {posts.map((post) => {
                  const stats = articleStats[post.id] || { views: 0, likes: 0, comments: 0, shares: 0 };
                  return (
                    <Card key={post.id} className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/article/${post.slug}`)}>
                      {post.image_url && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {post.categories && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ backgroundColor: `${post.categories.color}20`, color: post.categories.color }}
                            >
                              {post.categories.name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {stats.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {stats.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {stats.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="w-3 h-3" />
                              {stats.shares}
                            </span>
                          </div>
                          <span className="text-primary font-medium group-hover:underline">
                            Lire plus →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};
