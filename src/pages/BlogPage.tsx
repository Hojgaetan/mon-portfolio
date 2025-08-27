import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  BookOpen,
  Eye,
  MessageCircle,
  Star,
  Clock,
  Zap
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  created_at: string; // use existing column
  slug: string;
  category_id: string;
  image_url?: string;
  reading_time?: number;
  categories?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  posts_count?: number;
}

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Blog · Articles & Ressources";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          categories (id, name)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Erreur chargement posts:', postsError);
      }

      // Fetch categories with post counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Erreur chargement catégories:', categoriesError);
      }

      if (postsData) setPosts(postsData as unknown as BlogPost[]);
      if (categoriesData) setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.category_id === selectedCategory)
    : posts;

  const featuredPosts = filteredPosts.slice(0, 6);

  return (
    <>
      <Navigation activeTab={"blog"} setActiveTab={() => {}} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent-blue/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container mx-auto max-w-5xl p-6 relative">
          <div className="text-center py-12">
            <Badge className="mb-4 bg-accent-blue/10 text-accent-blue border-accent-blue/20">
              📚 Ressources & Actualités
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Blog & Articles
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Découvrez mes articles, tutoriels et réflexions sur the développement web, les technologies modernes et l'entrepreneuriat digital.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-blue">{posts.length}+</div>
                <div className="text-sm text-muted-foreground">Articles</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-green">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Catégories</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-sky">5min</div>
                <div className="text-sm text-muted-foreground">Lecture</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-red">2x</div>
                <div className="text-sm text-muted-foreground">par semaine</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="container mx-auto max-w-5xl p-6 py-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="h-8"
            >
              Tous les articles
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="h-8"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Articles Section */}
      <div className="container mx-auto max-w-6xl p-6">
        <section aria-labelledby="articles-heading" className="py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des articles...</p>
            </div>
          ) : featuredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun article trouvé</h3>
              <p className="text-muted-foreground">Les articles seront bientôt disponibles.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 id="articles-heading" className="text-3xl md:text-4xl font-bold mb-4">
                  {selectedCategory ? `Articles: ${categories.find(c => c.id === selectedCategory)?.name}` : 'Derniers articles'}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Explorez mes réflexions et découvertes dans le monde du développement web et des technologies.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <Card key={post.id} className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-blue/20 bg-gradient-to-br from-card to-accent-blue/2">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    
                    {post.image_url && (
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-3">
                        {post.categories && (
                          <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                            {post.categories.name}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-accent-yellow text-accent-yellow" />
                          ))}
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-accent-blue transition-colors">
                        {post.title}
                      </CardTitle>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {post.reading_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.reading_time} min</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 relative">
                      <p className="text-muted-foreground leading-relaxed line-clamp-3">
                        {post.excerpt || post.content.substring(0, 150) + '...'}
                      </p>

                      {/* CTA */}
                      <div className="bg-gradient-to-r from-accent-blue/10 via-accent-blue/5 to-transparent p-4 rounded-xl border border-accent-blue/20">
                        <Link to={`/article/${post.slug}`}>
                          <Button size="sm" className="w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                            Lire l'article →
                          </Button>
                        </Link>
                      </div>

                      {/* Interactions */}
                      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Nouveau</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>Commentaires</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Tendance</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Newsletter Section */}
        <section className="py-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Restez informé</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Recevez les derniers articles et tutoriels directement dans votre boîte mail.
          </p>
          <div className="flex items-center justify-center gap-6 opacity-60">
            <div className="text-sm">Tutoriels exclusifs</div>
            <div className="w-px h-4 bg-border"></div>
            <div className="text-sm">Conseils pratiques</div>
            <div className="w-px h-4 bg-border"></div>
            <div className="text-sm">Actualités tech</div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPage;
