import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArticleInteractions } from "@/components/ArticleInteractions";
import { ArticleComments } from "@/components/ArticleComments";
import { RecentArticlesSidebar } from "@/components/RecentArticlesSidebar";
import { ArrowLeft, Eye, Calendar, Clock } from "lucide-react";
import { getClientIP } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category { id: string; name: string; slug: string; color: string; }
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
  const { language, t } = useLanguage();

  const getUserIP = async () => {
    const ip = await getClientIP();
    return ip || "unknown";
  };

  const trackView = useCallback(async (articleId: string) => {
    try {
      const userIP = await getUserIP();
      const userAgent = navigator.userAgent;
      await supabase
        .from("article_views")
        .upsert(
          {
            article_id: articleId,
            ip_address: userIP,
            user_agent: userAgent,
          },
          { onConflict: "article_id,ip_address" }
        );
    } catch (e) {
      console.error("Erreur lors de l'enregistrement de la vue:", e);
    }
  }, []);

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
          setError(t('blog.article.not_found'));
        } else if (data) {
          setPost(data as unknown as BlogPost);
          await trackView(data.id);
          await fetchViews(data.id);
        }
      } catch {
        setError(t('blog.article.not_found'));
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, trackView, t]);

  const fetchViews = async (articleId: string) => {
    try {
      const { data } = await supabase
        .from("article_views")
        .select("id")
        .eq("article_id", articleId);
      setViews(data?.length || 0);
    } catch (e) {
      console.error("Erreur lors du chargement des vues:", e);
    }
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

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
          <h1 className="text-2xl font-bold mb-4">{error || t('blog.article.not_found')}</h1>
          <Button onClick={() => navigate("/blog")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.article.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section with Navigation */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent-blue/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/blog")} 
            className="mb-6 hover:bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.article.back')}
          </Button>
          
          {/* Article Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {post.categories && (
              <Badge
                variant="secondary"
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: (post.categories?.color ?? "") + "15", 
                  color: post.categories?.color,
                  border: `1px solid ${post.categories?.color}30`
                }}
              >
                {post.categories.name}
              </Badge>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                {getReadingTime(post.content)} {t('blog.article.min')}
              </span>
              <span className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <Eye className="w-4 h-4" />
                {views} {t('blog.article.views')}
              </span>
            </div>
          </div>

          {/* Article Title */}
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.image_url && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-64 md:h-96 lg:h-[500px] object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article Content - Left Column */}
          <div className="flex-1 max-w-4xl">
            {/* Article Content */}
            <article className="mb-16">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border border-border/50">
                <div
                  className="prose prose-lg md:prose-xl max-w-none 
                             prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                             prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-6 prose-h1:mt-8
                             prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mb-4 prose-h2:mt-6
                             prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mb-3 prose-h3:mt-5
                             prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                             prose-strong:text-foreground prose-strong:font-semibold
                             prose-a:text-accent-blue prose-a:font-medium prose-a:no-underline 
                             hover:prose-a:text-accent-blue/80 hover:prose-a:underline
                             prose-blockquote:border-l-accent-blue prose-blockquote:bg-muted/30 
                             prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
                             prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                             prose-ul:my-4 prose-ol:my-4 prose-li:my-2
                             prose-img:rounded-xl prose-img:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </article>

            {/* Article Interactions */}
            <div className="mb-12">
              <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
                <ArticleInteractions articleId={post.id} articleTitle={post.title} articleUrl={window.location.href} />
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-12">
              <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
                <ArticleComments articleId={post.id} />
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <RecentArticlesSidebar currentArticleId={post.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
