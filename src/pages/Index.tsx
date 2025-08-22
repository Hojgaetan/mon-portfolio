import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { ContactSection } from "@/components/ContactSection";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { FolderKanban, Newspaper, Building2, ArrowRight, Folder, Shield, Clock, Star } from "lucide-react";
import profilePhoto from "../assets/photo-p.JPG";

interface ProjectPreview {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category?: string | null;
}

interface BlogPostPreview {
  id: string;
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  slug?: string | null;
  created_at?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("hello");
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // States pour aperçus
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projects, setProjects] = useState<ProjectPreview[]>([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [posts, setPosts] = useState<BlogPostPreview[]>([]);

  // Etats pour stats dynamiques
  const [projectsCount, setProjectsCount] = useState<number | null>(null);
  const [publishedPostsCount, setPublishedPostsCount] = useState<number | null>(null);

  // Scroll vers section quand on change d’onglet depuis la navigation
  useEffect(() => {
    const sectionId = activeTab === 'hello' ? 'hero' : activeTab;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  // Gérer navigation via location.state.scrollTo (depuis logo/menu)
  useEffect(() => {
    if (location.state?.scrollTo) {
      setActiveTab(location.state.scrollTo);
    }
  }, [location.state]);

  // Charger 3 projets récents
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const { data, error } = await supabase
          .from("projects")
          .select("id, title, description, image_url, category")
          .order("created_at", { ascending: false })
          .limit(3);
        if (error) {
          console.error("Erreur chargement projets:", error);
          setProjects([]);
          return;
        }
        setProjects((data || []) as ProjectPreview[]);
      } catch (e) {
        console.error("Erreur chargement projets:", e);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadProjects();
  }, []);

  // Charger 3 articles récents
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, title, excerpt, image_url, slug, created_at")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(3);
        if (error) {
          console.error("Erreur chargement articles:", error);
          setPosts([]);
          return;
        }
        setPosts((data || []) as BlogPostPreview[]);
      } catch (e) {
        console.error("Erreur chargement articles:", e);
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };
    loadPosts();
  }, []);

  // Charger les compteurs (projets total, articles publiés)
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const { count: pCount, error: pErr } = await supabase
          .from("projects")
          .select("id", { count: "exact", head: true });
        if (pErr) {
          console.error("Erreur compteur projets:", pErr);
          setProjectsCount(0);
        } else {
          setProjectsCount(typeof pCount === 'number' ? pCount : 0);
        }

        const { count: bCount, error: bErr } = await supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("published", true);
        if (bErr) {
          console.error("Erreur compteur articles:", bErr);
          setPublishedPostsCount(0);
        } else {
          setPublishedPostsCount(typeof bCount === 'number' ? bCount : 0);
        }
      } catch (e) {
        console.error("Erreur chargement compteurs:", e);
        setProjectsCount(0);
        setPublishedPostsCount(0);
      }
    };
    loadCounts();
  }, []);

  const formattedDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen h-auto bg-background flex flex-col">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1">
        {/* Hero aligné au style produits/paiement */}
        <section id="hero" className="scroll-mt-16 relative overflow-hidden bg-gradient-to-br from-background via-background to-accent-blue/5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          <div className="container mx-auto max-w-5xl p-6 relative">
            <div className="text-center py-14">
              <div className="mb-6 flex justify-center">
                <img
                  src={profilePhoto}
                  alt="Photo de profil"
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-2 ring-border shadow-lg"
                />
              </div>
              <Badge className="mb-4 bg-accent-blue/10 text-accent-blue border-accent-blue/20">✨ Salut, je me nommes</Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Joel Gaetan HASSAM OBAH
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Développement web, data et IA — découvrez mes travaux, produits et articles.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 max-w-2xl mx-auto">
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-accent-blue">{projectsCount !== null ? projectsCount.toLocaleString('fr-FR') : '—'}</div>
                  <div className="text-sm text-muted-foreground">Projets récents</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-accent-green">{publishedPostsCount !== null ? publishedPostsCount.toLocaleString('fr-FR') : '—'}</div>
                  <div className="text-sm text-muted-foreground">Articles publiés</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-accent-yellow">24/7</div>
                  <div className="text-sm text-muted-foreground">Accès</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-accent-red">{new Date().getFullYear()}</div>
                  <div className="text-sm text-muted-foreground">Année courante</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liens rapides vers pages clés */}
        <section id="quick-links" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Découvrir</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Accédez rapidement aux sections clés</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-blue/20 bg-gradient-to-br from-card to-accent-blue/5 cursor-pointer" onClick={() => navigate('/produit')}>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <FolderKanban className="h-5 w-5 text-accent-blue" />
                  <CardTitle className="text-base">Produits</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Outils et solutions proposés</CardContent>
              </Card>
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-yellow/20 bg-gradient-to-br from-card to-accent-yellow/5 cursor-pointer" onClick={() => navigate('/projets')}>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <Folder className="h-5 w-5 text-accent-yellow" />
                  <CardTitle className="text-base">Projets</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Sélection de travaux récents</CardContent>
              </Card>
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-green/20 bg-gradient-to-br from-card to-accent-green/5 cursor-pointer" onClick={() => navigate('/blog')}>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <Newspaper className="h-5 w-5 text-accent-green" />
                  <CardTitle className="text-base">Blog</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Articles, notes et idées</CardContent>
              </Card>
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-red/20 bg-gradient-to-br from-card to-accent-red/5 cursor-pointer" onClick={() => navigate('/annuaire')}>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <Building2 className="h-5 w-5 text-accent-red" />
                  <CardTitle className="text-base">Annuaire</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Entreprises et ressources</CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* À propos bref */}
        <section id="about" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">À propos</h2>
                <p className="text-lg text-muted-foreground line-clamp-3">
                  {t('about.bio')}
                </p>
              </div>
              <div className="flex md:justify-end">
                <Button className="bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white shadow-lg transition-all" onClick={() => navigate('/a-propos')}>
                  En savoir plus
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Projets récents */}
        <section id="projects" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Projets récents</h2>
              <p className="text-lg text-muted-foreground">Un aperçu des 3 derniers projets</p>
            </div>

            {loadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0,1,2].map(i => (
                  <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-32 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-muted-foreground">Aucun projet disponible.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <Card key={p.id} className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-blue/20 bg-gradient-to-br from-card to-accent-blue/5">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">{p.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {p.image_url && (
                        <img src={p.image_url} alt={p.title} className="rounded-lg object-cover w-full h-40 mb-3" />
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Button onClick={() => navigate('/projets')} className="bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white shadow-lg">
                Voir tous les projets
              </Button>
            </div>
          </div>
        </section>

        {/* Articles récents */}
        <section id="blog" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Articles récents</h2>
              <p className="text-lg text-muted-foreground">Les 3 derniers billets du blog</p>
            </div>

            {loadingPosts ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0,1,2].map(i => (
                  <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-32 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-muted-foreground">Aucun article publié.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <Card key={post.id} className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-green/20 bg-gradient-to-br from-card to-accent-green/5 cursor-pointer" onClick={() => post.slug && navigate(`/article/${post.slug}`)}>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    <CardHeader>
                      <CardTitle className="text-base font-semibold line-clamp-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {post.image_url && (
                        <img src={post.image_url} alt={post.title} className="rounded-lg object-cover w-full h-40 mb-3" />
                      )}
                      <p className="text-xs text-muted-foreground">{formattedDate(post.created_at)}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3 mt-1">{post.excerpt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Button onClick={() => navigate('/blog')} className="bg-gradient-to-r from-accent-green to-accent-green/80 hover:from-accent-green/90 hover:to-accent-green/70 text-white shadow-lg">
                Lire le blog
              </Button>
            </div>
          </div>
        </section>

        {/* Indicateurs de confiance */}
        <section className="py-12 text-center">
          <h3 className="text-xl font-semibold mb-6">Fiable et sécurisé</h3>
          <div className="flex items-center justify-center gap-8 opacity-80">
            <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4" /><span>Paiement sécurisé</span></div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" /><span>Accès 24/7</span></div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-2 text-sm"><Star className="w-4 h-4" /><span>Qualité soignée</span></div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="border-t scroll-mt-16">
          <ContactSection />
        </section>
      </div>
    </div>
  );
};

export default Index;
