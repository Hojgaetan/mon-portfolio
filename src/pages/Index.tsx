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
import { FolderKanban, Newspaper, ArrowRight, Folder, Shield, Clock, Star, Briefcase, Award, Target, GraduationCap, MapPin } from "lucide-react";
// Ajout d'icônes pour les métadonnées
import { Calendar, Tag, BookOpen, BookOpen as BookOpenIcon } from "lucide-react";
import profilePhoto from "../assets/photo-p.JPG";

interface ProjectPreview {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category?: string | null;
  // Métadonnée ajoutée pour affichage
  created_at?: string;
  slug?: string | null;
}

interface BlogPostPreview {
  id: string;
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  slug?: string | null;
  created_at?: string;
}

// Données dynamiques Cursus / Certifications
interface CursusData {
  program: string;
  institution: string;
  year_label: string;
  status_label: string;
  specialization_title: string;
  specialization_desc: string;
  graduation_title: string;
  graduation_date: string;
  courses: string[];
}

interface CertificationRow {
  id: string;
  title: string;
  provider: string;
  progress: string | null;
  expected: string | null;
  order_index: number;
}

interface SkillRow {
  id: string;
  label: string;
  icon: string | null;
  color_class: string | null;
  order_index: number;
}

interface HomeMeta {
  badge: string | null;
  title: string | null;
  subtitle: string | null;
}

// Types locaux pour contraindre les résultats Supabase utilisés ci-dessous
// (évite l'usage de any tout en ne typant que les champs consommés)
type CertificationRecordFromDB = {
  id: string;
  title: string;
  provider: string;
  progress?: string | null;
  expected?: string | null;
  order_index?: number | null;
};

type SkillRecordFromDB = {
  id: string;
  label: string;
  icon?: string | null;
  color_class?: string | null;
  order_index?: number | null;
};

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

  // Etats pour Cursus / Certifications dynamiques
  const [cursus, setCursus] = useState<CursusData | null>(null);
  const [certs, setCerts] = useState<CertificationRow[]>([]);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [metaCursus, setMetaCursus] = useState<HomeMeta | null>(null);
  const [metaCert, setMetaCert] = useState<HomeMeta | null>(null);

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
          // Inclure created_at et slug pour l'afficher et la navigation
          .select("id, title, description, image_url, category, created_at, slug")
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
      return new Date(iso).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric', month: 'short', day: '2-digit'
      } as Intl.DateTimeFormatOptions);
    } catch {
      return "";
    }
  };

  // Détermine si une date est récente (7 jours)
  const isNew = (iso?: string) => {
    if (!iso) return false;
    const now = new Date();
    const d = new Date(iso);
    const diff = now.getTime() - d.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

  // Estimation simple du temps de lecture à partir de l'extrait (200 wpm)
  const estimateReadingTime = (text?: string | null) => {
    if (!text) return undefined;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min`;
  };

  // Charger Cursus + Certifications dynamiques selon la langue
  useEffect(() => {
    const loadDynamicSections = async () => {
      try {
        // Cursus
        const { data: cursusData } = await supabase
          .from('education_cursus')
          .select('*')
          .eq('locale', language)
          .eq('is_active', true)
          .maybeSingle();
        if (cursusData) {
          setCursus({
            program: cursusData.program,
            institution: cursusData.institution,
            year_label: cursusData.year_label,
            status_label: cursusData.status_label,
            specialization_title: cursusData.specialization_title,
            specialization_desc: cursusData.specialization_desc,
            graduation_title: cursusData.graduation_title,
            graduation_date: cursusData.graduation_date,
            courses: Array.isArray(cursusData.courses) ? cursusData.courses : [],
          });
        } else {
          setCursus(null);
        }

        // Certifications & Skills
        const [{ data: certsData }, { data: skillsData }, { data: metaCursusData }, { data: metaCertData }] = await Promise.all([
          supabase
            .from('certifications')
            .select('*')
            .eq('locale', language)
            .eq('is_active', true)
            .order('order_index', { ascending: true }),
          supabase
            .from('certification_skills')
            .select('*')
            .eq('locale', language)
            .eq('is_active', true)
            .order('order_index', { ascending: true }),
          supabase
            .from('home_sections_meta')
            .select('*')
            .eq('section_key', 'cursus')
            .eq('locale', language)
            .eq('is_active', true)
            .maybeSingle(),
          supabase
            .from('home_sections_meta')
            .select('*')
            .eq('section_key', 'certifications')
            .eq('locale', language)
            .eq('is_active', true)
            .maybeSingle(),
        ]);
        setCerts(((certsData || []) as CertificationRecordFromDB[]).map((c) => ({
          id: c.id,
          title: c.title,
          provider: c.provider,
          progress: c.progress ?? null,
          expected: c.expected ?? null,
          order_index: c.order_index ?? 0,
        })));
        setSkills(((skillsData || []) as SkillRecordFromDB[]).map((s) => ({
          id: s.id,
          label: s.label,
          icon: s.icon ?? null,
          color_class: s.color_class ?? null,
          order_index: s.order_index ?? 0,
        })));
        setMetaCursus(metaCursusData ? {
          badge: metaCursusData.badge ?? null,
          title: metaCursusData.title ?? null,
          subtitle: metaCursusData.subtitle ?? null,
        } : null);
        setMetaCert(metaCertData ? {
          badge: metaCertData.badge ?? null,
          title: metaCertData.title ?? null,
          subtitle: metaCertData.subtitle ?? null,
        } : null);
      } catch (e) {
        console.warn('Sections dynamiques (cursus/certifs/meta) non chargées:', e);
        setCursus(null);
        setCerts([]);
        setSkills([]);
        setMetaCursus(null);
        setMetaCert(null);
      }
    };
    loadDynamicSections();
  }, [language]);

  return (
    <div className="min-h-screen h-auto bg-background flex flex-col">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1">
        {/* Hero */}
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
              <Badge className="mb-4 bg-accent-blue/10 text-accent-blue border-accent-blue/20">{t('home.greeting')}</Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Joel Gaetan HASSAM OBAH
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                {t('home.subtitle')}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 max-w-2xl mx-auto">
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-accent-blue">{projectsCount !== null ? projectsCount.toLocaleString('fr-FR') : '—'}</div>
                  <div className="text-sm text-muted-foreground">{t('stats.projects_recent')}</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-accent-green">{publishedPostsCount !== null ? publishedPostsCount.toLocaleString('fr-FR') : '—'}</div>
                  <div className="text-sm text-muted-foreground">{t('stats.articles_published')}</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-accent-yellow">24/7</div>
                  <div className="text-sm text-muted-foreground">{t('stats.access')}</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-accent-red">{new Date().getFullYear()}</div>
                  <div className="text-sm text-muted-foreground">{t('stats.current_year')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liens rapides */}
        <section id="quick-links" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('home.discover.title')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('home.discover.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-blue/20 bg-gradient-to-br from-card to-accent-blue/5 cursor-pointer" onClick={() => navigate('/produit')}>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <FolderKanban className="h-5 w-5 text-accent-blue" />
                  <CardTitle className="text-base">{t('quick.products.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{t('quick.products.desc')}</CardContent>
              </Card>
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-red/20 bg-gradient-to-br from-card to-accent-red/5 cursor-pointer" onClick={() => navigate('/services')}>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <Briefcase className="h-5 w-5 text-accent-red" />
                  <CardTitle className="text-base">{t('quick.services.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{t('quick.services.desc')}</CardContent>
              </Card>
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-sky/20 bg-gradient-to-br from-card to-accent-sky/5 cursor-pointer" onClick={() => navigate('/projets')}>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-sky/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <Folder className="h-5 w-5 text-accent-sky" />
                  <CardTitle className="text-base">{t('quick.projects.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{t('quick.projects.desc')}</CardContent>
              </Card>
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-green/20 bg-gradient-to-br from-card to-accent-green/5 cursor-pointer" onClick={() => navigate('/blog')}>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <Newspaper className="h-5 w-5 text-accent-green" />
                  <CardTitle className="text-base">{t('quick.blog.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{t('quick.blog.desc')}</CardContent>
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
                  {t('about.read_more')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section Cursus - pour les recruteurs */}
        <section id="cursus" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20">{metaCursus?.badge || t('cursus.badge')}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{metaCursus?.title || t('cursus.title')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{metaCursus?.subtitle || t('cursus.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informations principales (formation actuelle) */}
              <Card className="relative overflow-hidden border-2 hover:border-accent-yellow/30 bg-gradient-to-br from-card to-accent-yellow/5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-yellow/5 to-transparent opacity-50" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="h-6 w-6 text-accent-yellow" />
                    <CardTitle className="text-xl">{t('cursus.current_studies')}</CardTitle>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{cursus?.program || '—'}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{cursus?.institution || '—'}</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">{t('cursus.year')}</div>
                        <div className="font-semibold">{cursus?.year_label || '—'}</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">{t('cursus.status')}</div>
                        <div className="font-semibold text-green-600">{cursus?.status_label || '—'}</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{t('cursus.specialization')}</h4>
                      <p className="text-muted-foreground">{cursus?.specialization_desc || '—'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{t('cursus.graduation')}</h4>
                      <p className="text-muted-foreground">{cursus?.graduation_date || '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Matières clés uniquement (données formation actuelle retirées) */}
              <Card className="relative overflow-hidden border-2 hover:border-accent-sky/30 bg-gradient-to-br from-card to-accent-sky/5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-sky/5 to-transparent opacity-50" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpenIcon className="h-6 w-6 text-accent-sky" />
                    <CardTitle className="text-xl">{t('cursus.key_courses')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-1 gap-3">
                    {cursus && cursus.courses && cursus.courses.length > 0 ? (
                      cursus.courses.map((label, index) => (
                        <div key={`${label}-${index}`} className="flex items-center gap-3 p-3 bg-background/30 rounded-lg hover:bg-background/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-accent-sky/20 text-accent-sky flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Aucune matière disponible pour le moment.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Certifications - pour les recruteurs */}
        <section id="certifications" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-accent-green/10 text-accent-green border-accent-green/20">{metaCert?.badge || t('certifications.badge')}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{metaCert?.title || t('certifications.title')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{metaCert?.subtitle || t('certifications.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Certifications en cours */}
              <Card className="relative overflow-hidden border-2 hover:border-accent-green/30 bg-gradient-to-br from-card to-accent-green/5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-green/5 to-transparent opacity-50" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="h-6 w-6 text-accent-green" />
                    <CardTitle className="text-xl">{t('certifications.current')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-6">
                    {certs.length > 0 ? (
                      certs.map((c, idx) => (
                        <div key={c.id} className="p-4 bg-background/30 rounded-lg border border-accent-green/10">
                          <h4 className="font-semibold text-foreground mb-1">{c.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{c.provider}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${['bg-yellow-500','bg-blue-500','bg-green-500','bg-purple-500'][idx % 4]}`}></div>
                            <span className="text-sm font-medium">{c.progress || ''}</span>
                          </div>
                          {c.expected && (
                            <p className="text-xs text-muted-foreground">{c.expected}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Aucune certification en cours pour le moment.</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Compétences visées */}
              <Card className="relative overflow-hidden border-2 hover:border-accent-red/30 bg-gradient-to-br from-card to-accent-red/5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-red/5 to-transparent opacity-50" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-6 w-6 text-accent-red" />
                    <CardTitle className="text-xl">{t('certifications.skills')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-1 gap-4">
                    {skills.length > 0 ? (
                      skills.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 bg-background/30 rounded-lg hover:bg-background/50 transition-colors">
                          <div className={`w-10 h-10 rounded-full ${s.color_class || 'bg-blue-500/20 text-blue-600'} flex items-center justify-center text-lg`}>
                            {s.icon || '•'}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{s.label}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Aucune compétence ciblée pour le moment.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Projets récents */}
        <section id="projects" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('projects.recent.title')}</h2>
              <p className="text-lg text-muted-foreground">{t('projects.recent.subtitle')}</p>
            </div>

            {loadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0,1,2].map(i => (
                  <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-32 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-muted-foreground">{t('projects.none')}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <Card
                    key={p.id}
                    className="relative group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-blue/30 bg-gradient-to-br from-card to-accent-blue/5 cursor-pointer"
                    onClick={() => p.slug ? navigate(`/projets/${p.slug}`) : navigate('/projets')}
                  >
                    {/* Image avec overlay */}
                    <div className="relative h-40 w-full">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-95" />
                      {p.category && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent-blue/15 text-accent-blue border border-accent-blue/20">
                          <Tag className="w-3 h-3" /> {p.category}
                        </span>
                      )}
                      {isNew(p.created_at) && (
                        <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-600 border border-green-500/20">{t('common.new')}</span>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold line-clamp-2">{p.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{p.description}</p>
                      {/* Métadonnées */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {p.created_at && (
                          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{formattedDate(p.created_at)}</span>
                        )}
                        {p.category && (
                          <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" />{p.category}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Button onClick={() => navigate('/projets')} className="bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white shadow-lg">
                {t('projects.view_all')}
              </Button>
            </div>
          </div>
        </section>

        {/* Articles récents */}
        <section id="blog" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('blog.recent.title')}</h2>
              <p className="text-lg text-muted-foreground">{t('blog.recent.subtitle')}</p>
            </div>

            {loadingPosts ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0,1,2].map(i => (
                  <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-32 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-muted-foreground">{t('blog.none')}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {posts.map((post) => {
                  const readTime = estimateReadingTime(post.excerpt);
                  return (
                    <Card
                      key={post.id}
                      className="relative group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-green/30 bg-gradient-to-br from-card to-accent-green/5 cursor-pointer"
                      onClick={() => post.slug && navigate(`/article/${post.slug}`)}
                    >
                      {/* Image avec overlay et badge nouveau */}
                      <div className="relative h-40 w-full">
                        {post.image_url ? (
                          <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-95" />
                        {isNew(post.created_at) && (
                          <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-600 border border-green-500/20">{t('common.new')}</span>
                        )}
                      </div>

                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold line-clamp-2">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Métadonnées */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          {post.created_at && (
                            <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{formattedDate(post.created_at)}</span>
                          )}
                          {readTime && (
                            <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3" />{readTime}</span>
                          )}
                        </div>
                        {post.image_url && (
                          <></>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Button onClick={() => navigate('/blog')} className="bg-gradient-to-r from-accent-green to-accent-green/80 hover:from-accent-green/90 hover:to-accent-green/70 text-white shadow-lg">
                {t('blog.read_blog')}
              </Button>
            </div>
          </div>
        </section>

        {/* Indicateurs de confiance */}
        <section className="py-12 text-center">
          <h3 className="text-xl font-semibold mb-6">{t('common.trust_title')}</h3>
          <div className="flex items-center justify-center gap-8 opacity-80">
            <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4" /><span>{t('common.secure_payment')}</span></div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" /><span>{t('common.access_24_7')}</span></div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-2 text-sm"><Star className="w-4 h-4" /><span>{t('common.quality')}</span></div>
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
