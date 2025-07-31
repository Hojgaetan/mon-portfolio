import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FolderOpen, 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";

interface DashboardStats {
  totalProjects: number;
  featuredProjects: number;
  totalPosts: number;
  publishedPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

interface RecentProject {
  id: string;
  title: string;
  featured: boolean;
  created_at: string;
}

interface RecentPost {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  categories?: {
    name: string;
    color: string;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    featuredProjects: 0,
    totalPosts: 0,
    publishedPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch projects stats
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title, featured, created_at")
        .order("created_at", { ascending: false });

      // Fetch blog posts stats
      const { data: posts } = await supabase
        .from("blog_posts")
        .select(`
          id, 
          title, 
          published, 
          created_at,
          categories (
            name,
            color
          )
        `)
        .order("created_at", { ascending: false });

      // Fetch interaction stats
      const { data: views } = await supabase.from("article_views").select("id");
      const { data: likes } = await supabase.from("article_likes").select("id");
      const { data: comments } = await supabase.from("article_comments").select("id");
      const { data: shares } = await supabase.from("article_shares").select("id");

      setStats({
        totalProjects: projects?.length || 0,
        featuredProjects: projects?.filter(p => p.featured).length || 0,
        totalPosts: posts?.length || 0,
        publishedPosts: posts?.filter(p => p.published).length || 0,
        totalViews: views?.length || 0,
        totalLikes: likes?.length || 0,
        totalComments: comments?.length || 0,
        totalShares: shares?.length || 0,
      });

      setRecentProjects(projects?.slice(0, 5) || []);
      setRecentPosts(posts?.slice(0, 5) || []);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre portfolio et blog
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.featuredProjects} en vedette
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedPosts} publiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Sur tous les articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLikes + stats.totalComments + stats.totalShares}
            </div>
            <p className="text-xs text-muted-foreground">
              Likes, commentaires, partages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Details */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commentaires</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partages</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShares}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projets récents</CardTitle>
            <CardDescription>
              Vos derniers projets ajoutés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun projet</p>
            ) : (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  {project.featured && (
                    <Badge variant="secondary" className="ml-2">★</Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Articles récents</CardTitle>
            <CardDescription>
              Vos derniers articles de blog
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun article</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString("fr-FR")}
                      </p>
                      {post.categories && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: post.categories.color }}
                        />
                      )}
                    </div>
                  </div>
                  <Badge variant={post.published ? "default" : "secondary"}>
                    {post.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}