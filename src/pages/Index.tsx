import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { ContactSection } from "@/components/ContactSection";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { FolderKanban, Newspaper, ArrowRight, Folder, Shield, Clock, Star, Briefcase, Award, Target, GraduationCap, MapPin, CheckCircle, Users, TrendingUp, Zap, MessageSquare, PhoneCall, Mail, HelpCircle, ChevronDown } from "lucide-react";
// Ajout d'icônes pour les métadonnées
import { Calendar, Tag, BookOpen, BookOpen as BookOpenIcon } from "lucide-react";
import profilePhoto from "../assets/photo-p.JPG";
import warehouse1 from "@/assets/warehouse-1.jpg";
import warehouse2 from "@/assets/warehouse-2.jpg";
import softwareDashboard from "@/assets/software-dashboard.jpg";
import pythonInventory from "@/assets/python-inventory.jpg";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
  
  const carouselPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );
  
  const carouselImages = [warehouse1, softwareDashboard, warehouse2, pythonInventory];

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
        {/* Hero avec carousel */}
        <section id="hero" className="scroll-mt-16 relative overflow-hidden min-h-[600px] md:min-h-[700px]">
          {/* Carousel d'images en arrière-plan */}
          <div className="absolute inset-0 z-0">
            <Carousel
              plugins={[carouselPlugin.current as any]}
              className="w-full h-full"
              opts={{
                loop: true,
              }}
            >
              <CarouselContent className="h-full">
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          
          {/* Overlay sombre pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm z-10" />
          
          {/* Contenu */}
          <div className="container mx-auto max-w-5xl p-6 relative z-20">
            <div className="text-center py-14">
              <div className="mb-6 flex justify-center">
                <img
                  src={profilePhoto}
                  alt="Photo de profil"
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-primary/20 shadow-2xl"
                />
              </div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 shadow-lg">
                {language === 'fr' ? 'Développeur Python Freelance' : 'Freelance Python Developer'}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Joel Gaetan HASSAM OBAH
              </h1>
              <p className="text-lg md:text-xl text-foreground mb-6 max-w-3xl mx-auto leading-relaxed font-semibold">
                {language === 'fr' 
                  ? 'Spécialisé en développement de logiciels de gestion de stock sur mesure en Python pour les PME'
                  : 'Specialized in custom Python inventory management software development for SMEs'}
              </p>
              <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                {language === 'fr'
                  ? 'Solutions complètes de suivi d\'inventaire, alertes automatiques, reporting en temps réel et intégrations ERP'
                  : 'Complete inventory tracking solutions, automated alerts, real-time reporting and ERP integrations'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 max-w-2xl mx-auto">
                <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-primary">{projectsCount !== null ? projectsCount.toLocaleString('fr-FR') : '—'}</div>
                  <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Projets réalisés' : 'Projects completed'}</div>
                </div>
                <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-primary">{publishedPostsCount !== null ? publishedPostsCount.toLocaleString('fr-FR') : '—'}</div>
                  <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Articles publiés' : 'Published articles'}</div>
                </div>
                <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Disponibilité' : 'Availability'}</div>
                </div>
                <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-primary">Python</div>
                  <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Technologie' : 'Technology'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liens rapides - Services de gestion de stock */}
        <section id="quick-links" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {language === 'fr' ? 'Solutions de Gestion de Stock' : 'Inventory Management Solutions'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'fr' 
                  ? 'Des logiciels Python sur mesure pour optimiser la gestion de votre inventaire'
                  : 'Custom Python software to optimize your inventory management'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-primary/5 cursor-pointer" onClick={() => navigate('/produit')}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">
                    {language === 'fr' ? 'Suivi en Temps Réel' : 'Real-Time Tracking'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {language === 'fr' 
                    ? 'Suivez votre inventaire en temps réel avec des tableaux de bord intuitifs'
                    : 'Track your inventory in real-time with intuitive dashboards'}
                </CardContent>
              </Card>
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-primary/5 cursor-pointer" onClick={() => navigate('/services')}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">
                    {language === 'fr' ? 'Alertes Automatiques' : 'Automated Alerts'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {language === 'fr' 
                    ? 'Recevez des alertes automatiques pour les stocks bas et les réapprovisionnements'
                    : 'Receive automatic alerts for low stock and restocking needs'}
                </CardContent>
              </Card>
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-primary/5 cursor-pointer" onClick={() => navigate('/projets')}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">
                    {language === 'fr' ? 'Rapports & Analytics' : 'Reports & Analytics'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {language === 'fr' 
                    ? 'Générez des rapports détaillés et analysez vos données d\'inventaire'
                    : 'Generate detailed reports and analyze your inventory data'}
                </CardContent>
              </Card>
              <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-primary/5 cursor-pointer" onClick={() => navigate('/blog')}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardHeader className="relative flex flex-row items-center gap-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">
                    {language === 'fr' ? 'Intégrations ERP' : 'ERP Integrations'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {language === 'fr' 
                    ? 'Connectez votre système aux ERP et outils existants de votre entreprise'
                    : 'Connect your system to existing ERPs and business tools'}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Processus de travail */}
        <section id="process" className="py-16 border-t scroll-mt-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                {language === 'fr' ? 'Notre Méthode' : 'Our Method'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {language === 'fr' ? 'Comment ça marche ?' : 'How It Works?'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'fr'
                  ? 'Un processus simple et transparent pour transformer vos besoins en solution efficace'
                  : 'A simple and transparent process to turn your needs into an effective solution'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">
                      {language === 'fr' ? '1. Analyse des besoins' : '1. Needs Analysis'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {language === 'fr'
                      ? 'Échange détaillé pour comprendre vos processus et identifier vos besoins spécifiques'
                      : 'Detailed discussion to understand your processes and identify your specific needs'}
                  </CardContent>
                </Card>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30"></div>
              </div>

              <div className="relative">
                <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">
                      {language === 'fr' ? '2. Conception' : '2. Design'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {language === 'fr'
                      ? 'Élaboration d\'une solution sur mesure adaptée à votre entreprise et vos flux'
                      : 'Development of a tailor-made solution adapted to your company and workflows'}
                  </CardContent>
                </Card>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30"></div>
              </div>

              <div className="relative">
                <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">
                      {language === 'fr' ? '3. Développement' : '3. Development'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {language === 'fr'
                      ? 'Développement en Python avec tests réguliers et ajustements selon vos retours'
                      : 'Python development with regular testing and adjustments based on your feedback'}
                  </CardContent>
                </Card>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30"></div>
              </div>

              <div>
                <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">
                      {language === 'fr' ? '4. Déploiement' : '4. Deployment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {language === 'fr'
                      ? 'Mise en production, formation de vos équipes et support continu'
                      : 'Production deployment, team training, and ongoing support'}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* À propos - Freelance Python */}
        <section id="about" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {language === 'fr' ? 'Développeur Python Spécialisé' : 'Specialized Python Developer'}
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {language === 'fr'
                    ? 'Je conçois et développe des logiciels de gestion de stock sur mesure en Python pour les PME. Mon expertise me permet de créer des solutions adaptées aux besoins spécifiques de chaque entreprise, avec un focus sur la performance, la simplicité d\'utilisation et l\'évolutivité.'
                    : 'I design and develop custom inventory management software in Python for SMEs. My expertise allows me to create solutions tailored to each company\'s specific needs, focusing on performance, ease of use, and scalability.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm">Python</Badge>
                  <Badge variant="secondary" className="text-sm">
                    {language === 'fr' ? 'Gestion de Stock' : 'Inventory Management'}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">Django / Flask</Badge>
                  <Badge variant="secondary" className="text-sm">PostgreSQL</Badge>
                  <Badge variant="secondary" className="text-sm">
                    {language === 'fr' ? 'Solutions PME' : 'SME Solutions'}
                  </Badge>
                </div>
              </div>
              <div className="flex md:justify-end">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg transition-all" onClick={() => navigate('/a-propos')}>
                  {language === 'fr' ? 'En savoir plus' : 'Learn more'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section Avantages */}
        <section id="benefits" className="py-16 border-t scroll-mt-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                {language === 'fr' ? 'Avantages' : 'Benefits'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {language === 'fr' ? 'Pourquoi choisir mes services ?' : 'Why Choose My Services?'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'fr'
                  ? 'Des solutions qui apportent une réelle valeur ajoutée à votre entreprise'
                  : 'Solutions that bring real added value to your business'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-accent-green/30 transition-all duration-300 bg-gradient-to-br from-card to-accent-green/5">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-accent-green" />
                  </div>
                  <CardTitle className="text-xl">
                    {language === 'fr' ? 'Réduction des coûts' : 'Cost Reduction'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {language === 'fr'
                      ? 'Optimisez vos niveaux de stock et réduisez les coûts de stockage de 20 à 30%'
                      : 'Optimize your stock levels and reduce storage costs by 20 to 30%'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent-green mt-0.5 flex-shrink-0" />
                      <span>{language === 'fr' ? 'Moins de surstockage' : 'Less overstocking'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent-green mt-0.5 flex-shrink-0" />
                      <span>{language === 'fr' ? 'Réduction des ruptures' : 'Reduced stockouts'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent-green mt-0.5 flex-shrink-0" />
                      <span>{language === 'fr' ? 'Meilleure trésorerie' : 'Better cash flow'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-accent-blue/30 transition-all duration-300 bg-gradient-to-br from-card to-accent-blue/5">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-accent-blue" />
                  </div>
                  <CardTitle className="text-xl">
                    {language === 'fr' ? 'Gain de temps' : 'Time Savings'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {language === 'fr'
                      ? 'Automatisez vos processus et libérez jusqu\'à 15h par semaine'
                      : 'Automate your processes and free up to 15 hours per week'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent-blue mt-0.5 flex-shrink-0" />
                      <span>{language === 'fr' ? 'Saisies automatiques' : 'Automatic entries'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent-blue mt-0.5 flex-shrink-0" />
                      <span>{language === 'fr' ? 'Rapports instantanés' : 'Instant reports'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent-blue mt-0.5 flex-shrink-0" />
                      <span>{language === 'fr' ? 'Alertes proactives' : 'Proactive alerts'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-accent-sky/30 transition-all duration-300 bg-gradient-to-br from-card to-accent-sky/5">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-accent-sky/20 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-accent-sky" />
                  </div>
                  <CardTitle className="text-xl">
                    {language === 'fr' ? 'Fiabilité & Sécurité' : 'Reliability & Security'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {language === 'fr'
                      ? 'Code de qualité professionnelle avec sécurité renforcée'
                      : 'Professional quality code with enhanced security'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{language === 'fr' ? 'Tests automatisés' : 'Automated tests'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{language === 'fr' ? 'Sauvegardes régulières' : 'Regular backups'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{language === 'fr' ? 'Support dédié' : 'Dedicated support'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Cursus - Compétences Python */}
        <section id="cursus" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                {language === 'fr' ? 'Expertise Technique' : 'Technical Expertise'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {language === 'fr' ? 'Technologies & Compétences' : 'Technologies & Skills'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'fr'
                  ? 'Stack technologique moderne pour des solutions performantes et évolutives'
                  : 'Modern tech stack for high-performance and scalable solutions'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Technologies Python */}
              <Card className="relative overflow-hidden border-2 hover:border-primary/30 bg-gradient-to-br from-card to-primary/5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Award className="h-5 w-5" />
                    <CardTitle className="text-xl">
                      {language === 'fr' ? 'Backend & Logique Métier' : 'Backend & Business Logic'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div>
                    <p className="font-semibold mb-2 text-foreground">Python & Frameworks</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Python 3.x</Badge>
                      <Badge variant="outline">Django</Badge>
                      <Badge variant="outline">Flask</Badge>
                      <Badge variant="outline">FastAPI</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2 text-foreground">
                      {language === 'fr' ? 'Bibliothèques de Gestion' : 'Management Libraries'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Pandas</Badge>
                      <Badge variant="outline">SQLAlchemy</Badge>
                      <Badge variant="outline">Celery</Badge>
                      <Badge variant="outline">Redis</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bases de données & Infrastructure */}
              <Card className="relative overflow-hidden border-2 hover:border-primary/30 bg-gradient-to-br from-card to-primary/5 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Target className="h-5 w-5" />
                    <CardTitle className="text-xl">
                      {language === 'fr' ? 'Données & Infrastructure' : 'Data & Infrastructure'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div>
                    <p className="font-semibold mb-2 text-foreground">
                      {language === 'fr' ? 'Bases de Données' : 'Databases'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">PostgreSQL</Badge>
                      <Badge variant="outline">MySQL</Badge>
                      <Badge variant="outline">SQLite</Badge>
                      <Badge variant="outline">MongoDB</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2 text-foreground">
                      {language === 'fr' ? 'Déploiement & DevOps' : 'Deployment & DevOps'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Docker</Badge>
                      <Badge variant="outline">Linux</Badge>
                      <Badge variant="outline">Git</Badge>
                      <Badge variant="outline">CI/CD</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {cursus && (
              <Card className="mt-8 border-2 bg-gradient-to-br from-card to-muted/5">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <GraduationCap className="h-5 w-5" />
                    <CardTitle className="text-xl">{cursus.program}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {cursus.institution}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{cursus.specialization_desc}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">{cursus.status_label}</Badge>
                    <span className="text-muted-foreground">{cursus.year_label}</span>
                  </div>
                </CardContent>
              </Card>
            )}
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
                            <div className={`w-2 h-2 rounded-full ${['bg-accent-yellow','bg-accent-blue','bg-accent-green','bg-accent-red'][idx % 4]}`}></div>
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
                          <div className={`w-10 h-10 rounded-full ${s.color_class || 'bg-accent-blue/20 text-accent-blue'} flex items-center justify-center text-lg`}>
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

        {/* Projets récents - Solutions développées */}
        <section id="projects" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {language === 'fr' ? 'Projets & Réalisations' : 'Projects & Achievements'}
              </h2>
              <p className="text-lg text-muted-foreground">
                {language === 'fr'
                  ? 'Découvrez mes solutions de gestion de stock développées pour des PME'
                  : 'Discover my inventory management solutions developed for SMEs'}
              </p>
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
                        <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-accent-green/15 text-accent-green border border-accent-green/20">{t('common.new')}</span>
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

        {/* Section Témoignages */}
        <section id="testimonials" className="py-16 border-t scroll-mt-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                {language === 'fr' ? 'Témoignages' : 'Testimonials'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {language === 'fr' ? 'Ils me font confiance' : 'They Trust Me'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'fr'
                  ? 'Découvrez les retours d\'expérience de mes clients'
                  : 'Discover feedback from my clients'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-accent-blue/80 flex items-center justify-center text-white font-bold text-lg">
                      AM
                    </div>
                    <div>
                      <CardTitle className="text-base">Aminata M.</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' ? 'Gérante, Commerce de détail' : 'Manager, Retail Business'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">
                    {language === 'fr'
                      ? '"Depuis l\'implémentation du système de gestion de stock, nous avons réduit nos ruptures de 40%. Le système d\'alertes automatiques est un vrai gain de temps !"'
                      : '"Since implementing the inventory management system, we\'ve reduced stockouts by 40%. The automatic alert system is a real time-saver!"'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-green to-accent-green/80 flex items-center justify-center text-white font-bold text-lg">
                      BD
                    </div>
                    <div>
                      <CardTitle className="text-base">Boubacar D.</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' ? 'Directeur logistique, Distribution' : 'Logistics Director, Distribution'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">
                    {language === 'fr'
                      ? '"Une solution sur mesure parfaitement adaptée à nos besoins. Les rapports en temps réel nous permettent de prendre les bonnes décisions rapidement."'
                      : '"A tailor-made solution perfectly adapted to our needs. Real-time reports allow us to make the right decisions quickly."'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-red to-accent-red/80 flex items-center justify-center text-white font-bold text-lg">
                      FK
                    </div>
                    <div>
                      <CardTitle className="text-base">Fatou K.</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' ? 'Responsable achat, Industrie' : 'Purchasing Manager, Industry'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">
                    {language === 'fr'
                      ? '"Professionnel, réactif et à l\'écoute. Le support technique est excellent et les mises à jour régulières apportent toujours des améliorations pertinentes."'
                      : '"Professional, responsive and attentive. Technical support is excellent and regular updates always bring relevant improvements."'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Articles & Ressources */}
        <section id="blog" className="py-16 border-t scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {language === 'fr' ? 'Articles & Ressources' : 'Articles & Resources'}
              </h2>
              <p className="text-lg text-muted-foreground">
                {language === 'fr'
                  ? 'Conseils et bonnes pratiques en gestion de stock et développement Python'
                  : 'Tips and best practices for inventory management and Python development'}
              </p>
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

        {/* Section FAQ */}
        <section id="faq" className="py-16 border-t scroll-mt-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                {language === 'fr' ? 'FAQ' : 'FAQ'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {language === 'fr' ? 'Questions fréquentes' : 'Frequently Asked Questions'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'fr'
                  ? 'Tout ce que vous devez savoir sur mes services'
                  : 'Everything you need to know about my services'}
              </p>
            </div>

            <div className="space-y-4">
              <Card className="border-2 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {language === 'fr' ? 'Quel est le délai de réalisation ?' : 'What is the delivery time?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {language === 'fr'
                    ? 'Le délai varie selon la complexité du projet, généralement entre 2 et 8 semaines. Un planning détaillé est établi dès la phase de conception.'
                    : 'The timeline varies depending on project complexity, typically between 2 and 8 weeks. A detailed schedule is established from the design phase.'}
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {language === 'fr' ? 'Proposez-vous une formation ?' : 'Do you offer training?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {language === 'fr'
                    ? 'Oui, une formation complète est incluse pour vos équipes afin de garantir une prise en main optimale du système. Des sessions de suivi sont également prévues.'
                    : 'Yes, comprehensive training is included for your teams to ensure optimal system adoption. Follow-up sessions are also planned.'}
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {language === 'fr' ? 'Le logiciel peut-il évoluer ?' : 'Can the software evolve?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {language === 'fr'
                    ? 'Absolument. Les solutions développées sont conçues pour être évolutives. Des mises à jour et nouvelles fonctionnalités peuvent être ajoutées selon vos besoins.'
                    : 'Absolutely. The developed solutions are designed to be scalable. Updates and new features can be added according to your needs.'}
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {language === 'fr' ? 'Quel support après la livraison ?' : 'What support after delivery?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {language === 'fr'
                    ? 'Un support technique est disponible avec différentes formules : assistance par email, visio ou intervention sur site selon vos besoins et le contrat de maintenance.'
                    : 'Technical support is available with different options: email assistance, video calls, or on-site intervention depending on your needs and maintenance contract.'}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section CTA forte */}
        <section id="cta" className="py-16 border-t scroll-mt-16">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50"></div>
              <CardContent className="relative py-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {language === 'fr' ? 'Prêt à optimiser votre gestion de stock ?' : 'Ready to Optimize Your Inventory Management?'}
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {language === 'fr'
                    ? 'Discutons de votre projet et trouvons ensemble la solution qui correspond à vos besoins'
                    : 'Let\'s discuss your project and find the solution that fits your needs'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-xl text-lg px-8"
                    onClick={() => {
                      const contactSection = document.getElementById('contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <PhoneCall className="mr-2 h-5 w-5" />
                    {language === 'fr' ? 'Demander un devis' : 'Request a Quote'}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-primary/30 hover:bg-primary/10 text-lg px-8"
                    onClick={() => navigate('/produit')}
                  >
                    <Folder className="mr-2 h-5 w-5" />
                    {language === 'fr' ? 'Voir nos solutions' : 'View Our Solutions'}
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{language === 'fr' ? 'Devis gratuit' : 'Free Quote'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{language === 'fr' ? 'Sans engagement' : 'No Commitment'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{language === 'fr' ? 'Réponse sous 24h' : 'Response within 24h'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Indicateurs de confiance - B2B */}
        <section className="py-12 text-center border-t">
          <h3 className="text-xl font-semibold mb-6">
            {language === 'fr' ? 'Pourquoi me choisir ?' : 'Why Choose Me?'}
          </h3>
          <div className="flex items-center justify-center gap-8 opacity-80 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span>{language === 'fr' ? 'Solutions Sécurisées' : 'Secure Solutions'}</span>
            </div>
            <div className="w-px h-4 bg-border hidden md:block"></div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-primary" />
              <span>{language === 'fr' ? 'Sur Mesure' : 'Tailor-Made'}</span>
            </div>
            <div className="w-px h-4 bg-border hidden md:block"></div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>{language === 'fr' ? 'Support Réactif' : 'Responsive Support'}</span>
            </div>
            <div className="w-px h-4 bg-border hidden md:block"></div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-primary" />
              <span>{language === 'fr' ? 'Code de Qualité' : 'Quality Code'}</span>
            </div>
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
