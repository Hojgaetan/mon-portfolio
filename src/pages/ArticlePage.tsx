import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) {
        setError("Article introuvable");
      } else {
        setPost(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div>Chargement...</div>;
  if (error || !post) return <div>{error || "Article introuvable"}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {post.title}
            <Badge variant={post.published ? "default" : "secondary"}>
              {post.published ? "Publié" : "Brouillon"}
            </Badge>
          </CardTitle>
          <CardDescription>{post.excerpt}</CardDescription>
          <p className="text-xs text-muted-foreground mt-1">
            Publié le {new Date(post.created_at).toLocaleDateString("fr-FR")}
          </p>
        </CardHeader>
        <CardContent>
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="mb-4 rounded w-full" />
          )}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </CardContent>
      </Card>
    </div>
  );
}

