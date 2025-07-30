import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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

export const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="blog" className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-accent">Blog</h2>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des articles...</p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section id="blog" className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-accent">Blog</h2>
        <div className="text-center">
          <p className="text-muted-foreground font-mono">// aucun article publié pour le moment</p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-accent">Blog</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <div key={post.id} className="bg-card rounded-lg shadow p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                {post.title}
                <Badge variant={post.published ? "default" : "secondary"}>
                  {post.published ? "Publié" : "Brouillon"}
                </Badge>
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
            </div>
            <button
              className="mt-4 text-primary underline text-sm self-end hover:text-accent transition"
              onClick={() => navigate(`/article/${post.slug}`)}
            >
              Lire plus
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
