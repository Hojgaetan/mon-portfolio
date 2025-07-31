import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { BlogManager } from "@/components/admin/BlogManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { Resizable } from "re-resizable";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user && event !== 'INITIAL_SESSION') {
          navigate("/auth");
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erreur de déconnexion",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté.",
        });
        navigate("/auth");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "projects":
        return <ProjectsManager />;
      case "blog":
        return <BlogManager />;
      case "users":
        return <UsersManager />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar */}
      <Resizable
        defaultSize={{ width: 280, height: "100%" }}
        minWidth={200}
        maxWidth={400}
        enable={{ right: true }}
        handleStyles={{ right: { right: 0, width: 6, background: 'rgba(0,0,0,0.05)', cursor: 'col-resize', zIndex: 10 } }}
        className="relative h-screen min-h-0 min-w-0"
      >
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
          onSignOut={handleSignOut}
          onNavigateHome={() => navigate("/")}
        />
      </Resizable>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}