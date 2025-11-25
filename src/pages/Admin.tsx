import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { BlogManager } from "@/components/admin/BlogManager";
import { AboutManager } from "@/components/admin/AboutManager";
import { ContactMessagesManager } from "@/components/admin/ContactMessagesManager";
import { CategorieManager } from "@/components/admin/CategorieManager";
import { EntrepriseManager } from "@/components/admin/EntrepriseManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AccessManager } from "@/components/admin/AccessManager";
import { CommentsManager } from "@/components/admin/CommentsManager";
import { useLanguage } from "@/contexts/LanguageContext";
import { CursusManager } from "@/components/admin/CursusManager";
import { CertificationsManager } from "@/components/admin/CertificationsManager";
import { HomeSectionsManager } from "@/components/admin/HomeSectionsManager";
import { AdminExportUsage } from "@/components/admin/AdminExportUsage";
import { CommentReactionsStats } from "@/components/admin/CommentReactionsStats"; // réutilisé comme placeholder global

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user && event !== 'INITIAL_SESSION') {
          navigate("/auth");
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Vérifier le statut admin quand l’utilisateur change
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(null);
        setCheckingAdmin(false);
        return;
      }
      try {
        setCheckingAdmin(true);
        const { data, error } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) console.warn(error);
        setIsAdmin(!!data);
      } catch (e) {
        console.warn("Vérification admin échouée:", e);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  // Redirection si non-admin
  useEffect(() => {
    if (!loading && !checkingAdmin && user && isAdmin === false) {
      toast({
        title: t('admin.access_denied.title'),
        description: t('admin.access_denied.desc'),
        variant: "destructive",
      });
      navigate("/");
    }
  }, [loading, checkingAdmin, isAdmin, user, navigate, toast, t]);

  // Lecture du paramètre de query pour persister la section
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get("section");
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, []);

  // Mettre à jour l'URL quand activeSection change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("section", activeSection);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [activeSection]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: t('admin.toast.signout_error'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('admin.toast.signout_success'),
          description: t('admin.toast.signout_success_desc'),
        });
        navigate("/auth");
      }
    } catch (error) {
      toast({
        title: t('admin.toast.generic_error'),
        description: t('admin.toast.generic_error_desc'),
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    // activeSection peut être "overview" ou "group:item"
    switch (activeSection) {
      case "overview":
        return <AdminDashboard />;
      case "content:projects":
        return <ProjectsManager />;
      case "content:blog":
        return <BlogManager />;
      case "content:about":
        return <AboutManager />;
      case "interactions:messages":
        return <ContactMessagesManager />;
      case "interactions:comments":
        return <CommentsManager />;
      case "interactions:reactions":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Réactions aux commentaires</h1>
            <p className="text-muted-foreground">Vue agrégée à construire (placeholder). Exemple ci-dessous pour un commentId spécifique.</p>
            {/* Placeholder démonstration - un ID fictif */}
            <CommentReactionsStats commentId="00000000-0000-0000-0000-000000000000" />
          </div>
        );
      case "content:categories":
        return <CategorieManager />;
      case "catalog:entreprises":
        return <EntrepriseManager />;
      case "catalog:exports":
        return <AdminExportUsage />;
      case "features:cursus":
        return <CursusManager />;
      case "features:certifications":
        return <CertificationsManager />;
      case "content:home_sections":
        return <HomeSectionsManager />;
      case "users:access":
        return <AccessManager />;
      case "users:manage":
        return <UsersManager />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('admin.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar */}
      <div className={`${isCollapsed ? "w-16" : "w-80"} h-screen transition-all duration-200`}>
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={(section) => {
            setActiveSection(section);
            setIsCollapsed(true); // se rétracte après clic
          }}
          user={user}
          onSignOut={handleSignOut}
          onNavigateHome={() => navigate("/")}
          isCollapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
