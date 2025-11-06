import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle, Heart, Share2, Calendar, User, ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { sanitizeHTML } from "@/lib/utils";

// Types pour les tables blog (remplaçant les types Supabase manquants)
interface BlogPost {
  id: string;
  created_at: string;
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  slug?: string;
  published: boolean;
  category_id?: string;
  author_id?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

type BlogPostWithRelations = BlogPost & {
  categories: Category | null;
  profiles: Profile | null;
};

interface ArticleStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export const BlogSection: React.FC = () => {
  const [groupedPosts, setGroupedPosts] = useState<Record<string, BlogPostWithRelations[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const categoriesData = await fetchCategories();
      await fetchAllPosts(categoriesData);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      const fetchedCategories = data || [];
      setCategories(fetchedCategories);
      return fetchedCategories;
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      return [];
    }
  };

  const fetchAllPosts = async (fetchedCategories: Category[]) => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`*, categories(*)`)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const allPostsData = data || [];

      const grouped = allPostsData.reduce((acc, post) => {
        const categoryId = post.category_id || "uncategorized";
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(post as BlogPostWithRelations);
        return acc;
      }, {} as Record<string, BlogPostWithRelations[]>);

      setGroupedPosts(grouped);

      // By default, select the category of the most recent post
      if (allPostsData.length > 0) {
        const mostRecentPost = allPostsData[0];
        if (mostRecentPost.category_id) {
          setSelectedCategory(mostRecentPost.category_id);
          setOpenCategories({ [mostRecentPost.category_id]: true });
        }
      } else if (fetchedCategories.length > 0) {
        // Fallback to the first category if no posts exist
        setSelectedCategory(fetchedCategories[0].id);
        setOpenCategories({ [fetchedCategories[0].id]: true });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
    }
  };

  const toggleCategoryFolder = (categoryId: string) => {
    setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handleCategoryClick = (categoryId: string | "all") => {
    setSelectedCategory(categoryId);
    if (categoryId !== "all") {
      const postsInCategory = groupedPosts[categoryId];
      if (postsInCategory && postsInCategory.length > 0) {
        setSelectedPostId(postsInCategory[0].id);
        setOpenCategories(prev => ({ ...prev, [categoryId]: true }));
      }
    }
  };

  const allPosts = Object.values(groupedPosts).flat();
  const currentPost = allPosts.find(p => p.id === selectedPostId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du blog...</p>
        </div>
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground font-mono">// Aucun article disponible</span>
      </div>
    );
  }

  const renderArticlePreview = (post: BlogPostWithRelations) => (
    <div className="prose prose-sm dark:prose-invert max-w-none">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        {post.categories && (
            <Badge
                variant="secondary"
                className="mb-4"
                style={{ backgroundColor: `${post.categories.color}20`, color: post.categories.color }}
            >
                {post.categories.name}
            </Badge>
        )}
        <p className="text-sm text-muted-foreground mb-4">
            Publié le {new Date(post.created_at).toLocaleDateString("fr-FR")}
        </p>
        {post.image_url && (
            <img src={post.image_url} alt={post.title} className="rounded-lg object-cover w-full h-auto aspect-video mb-6 shadow-lg" />
        )}
        <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }} />
        <Button onClick={() => navigate(`/article/${post.slug}`)} className="mt-6">
            Lire l'article complet
        </Button>
    </div>
  );

  return (
    <section id="blog" className="bg-background font-sans">
      <div className="border-t">
        <ResizablePanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
          className="min-h-screen"
        >
          <ResizablePanel defaultSize={isMobile ? 40 : 20} minSize={isMobile ? 30 : 15}>
            <div className="p-4 h-full">
              <h3 className="text-lg mb-4 pl-2">Catégories</h3>
              <ScrollArea className="h-[calc(100%-40px)]">
                <ul className="space-y-1 pr-2">
                  {categories.map((category) => (
                    (groupedPosts[category.id] && groupedPosts[category.id].length > 0) && (
                      <li key={category.id}>
                        <div
                          className="flex items-center cursor-pointer p-2 rounded-md hover:bg-muted"
                          onClick={() => {
                            toggleCategoryFolder(category.id);
                            handleCategoryClick(category.id);
                          }}
                        >
                          {openCategories[category.id] ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                          {openCategories[category.id] ? <FolderOpen className="h-5 w-5 mr-2 text-primary" /> : <Folder className="h-5 w-5 mr-2 text-primary" />}
                          <span>{category.name}</span>
                        </div>
                        {openCategories[category.id] && (
                          <ul className="pl-6 mt-1 border-l border-dashed border-muted-foreground/30">
                            {(groupedPosts[category.id] || []).map((post) => (
                              <li key={post.id}>
                                <div
                                  className={`flex items-center cursor-pointer p-2 rounded-md text-sm ${selectedPostId === post.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                                  onClick={() => handlePostClick(post.id)}
                                >
                                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">{post.title}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          {!isMobile && (
            <>
              <ResizablePanel defaultSize={30} minSize={25}>
                <ScrollArea className="h-full p-4">
                  <h3 className="text-lg mb-4">
                    {categories.find(c => c.id === selectedCategory)?.name || 'Articles'}
                  </h3>
                  <div className="space-y-4">
                    {(groupedPosts[selectedCategory] || []).map(post => (
                      <Card
                        key={post.id}
                        className={`cursor-pointer transition-all hover:shadow-md border-2 hover:border-accent-green/20 ${currentPost?.id === post.id ? 'shadow-lg border-accent-green/30 bg-accent-green/5' : 'border-transparent'}`}
                        onClick={() => handlePostClick(post.id)}
                      >
                        <CardHeader>
                          <CardTitle className="text-base font-normal">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                          {post.categories && (
                              <Badge
                                variant="secondary"
                                className="text-xs mt-2"
                                style={{ backgroundColor: `${post.categories.color}20`, color: post.categories.color }}
                              >
                                {post.categories.name}
                              </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          <ResizablePanel defaultSize={isMobile ? 60 : 50} minSize={30}>
            <ScrollArea className="h-full p-6">
              {currentPost ? renderArticlePreview(currentPost) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-muted-foreground">Sélectionnez un article pour le lire</span>
                </div>
              )}
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </section>
  );
};
