import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
	FolderKanban,
	Hand,
	Mail,
	Menu,
	User,
	X,
} from "lucide-react";
import logoBeige from "@/assets/logo fond beige 1.png";
import logoNuit from "@/assets/logo fond nuit 1.png";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { PdfIcon } from "./PdfIcon";
import { useLocation, useNavigate } from "react-router-dom";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
	id: string;
	label: string;
	icon: React.ReactElement;
	path?: string;
}

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    // Si l'utilisateur est admin, rediriger automatiquement vers la liste (/annuaire)
    const checkAdminAndRedirect = async () => {
      if (user && user.id) {
        const { data: adminRow } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (adminRow) {
          if (location.pathname !== "/annuaire") {
            navigate("/annuaire");
          }
        }
      }
    };
    checkAdminAndRedirect();
  }, [user, location.pathname, navigate]);
  // Supabase auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription?.unsubscribe();
  }, []);

  const navItems: NavItem[] = [
    { id: "hello", label: t('nav.hello'), icon: <Hand className="h-4 w-4" /> },
    { id: "about", label: t('nav.about'), icon: <User className="h-4 w-4" /> },
    {
      id: "produits",
      label: "Produits",
      icon: <FolderKanban className="h-4 w-4" />,
      path: "/produit",
    },
    /* {
      id: "projects",
      label: t('nav.projects'),
      icon: <FolderKanban className="h-4 w-4" />,
      path: "/projets",
    },
    {
      id: "blog",
      label: t('nav.blog'),
      icon: <Newspaper className="h-4 w-4" />,
      path: "/blog",
    },
    {
      id: "formations",
      label: t('nav.formations'),
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      id: "services",
      label: t('nav.services'),
      icon: <Briefcase className="h-4 w-4" />,
    }, */
    {
      id: "contact",
      label: t('nav.contact'),
      icon: <Mail className="h-4 w-4" />,
    },
  ];


  const handleLogoClick = () => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: "hello" } });
    } else {
      setActiveTab("hello");
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.path) {
      navigate(item.path);
    } else {
      if (location.pathname !== "/") {
        navigate("/", { state: { scrollTo: item.id } });
      } else {
        setActiveTab(item.id);
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-full px-4">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
            <div className="w-8 h-8 rounded-sm flex items-center justify-center overflow-hidden bg-accent">
              <img
                src={theme === "dark" ? logoNuit : logoBeige}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="hidden sm:inline text-sidebar-foreground font-sans text-sm">{t('nav.username')}</span>
            <span className="sm:hidden text-sidebar-foreground font-sans text-sm">{t('nav.username_short')}</span>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center font-sans">
            {navItems.map((item) => {
              const isActive = activeTab === item.id || (item.path && location.pathname.startsWith(item.path));
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`font-sans text-sm px-3 py-2 h-12 rounded-none border-r border-sidebar-border transition-all duration-200 ${
                    isActive
                      ? "bg-background text-accent-blue border-b-2 border-accent-blue hover:bg-accent-blue/10"
                      : "text-sidebar-foreground hover:bg-accent-sky/10 hover:text-accent-sky"
                  }`}
                  onClick={() => handleNavClick(item)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Button>
              );
            })}
            {/* Auth Button Desktop */}
            <Button
              variant="outline"
              className="ml-2 font-sans text-sm px-3 py-2 h-12 rounded-none"
              onClick={async () => {
                if (user) {
                  try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                  } catch {
                    // No-op, but keep user state consistent
                  } finally {
                    setUser(null);
                    navigate('/');
                  }
                } else {
                  navigate('/auth');
                }
              }}
            >
              {user ? 'Se déconnecter' : 'Se connecter'}
            </Button>
          </div>

          {/* Mobile menu button and Theme Toggle */}
          <div className="flex items-center space-x-2">
            <a href="/CV__Joel Gaetan_HASSAM OBAH.pdf" download className="hidden lg:block">
                <Button variant="accent-red" className="h-12 rounded-none px-3 py-2 flex items-center">
                    <PdfIcon className="h-5 w-5 mr-2" />
                    {t('nav.download_cv')}
                </Button>
            </a>
            <div className="flex items-center space-x-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 hover:bg-accent-sky/10 hover:text-accent-sky"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-sidebar-border bg-sidebar-background font-sans">
            <div className="py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id || (item.path && location.pathname.startsWith(item.path));
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start font-sans text-sm px-4 py-3 rounded-none ${
                      isActive
                        ? "bg-background text-foreground border-l-2 border-accent"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                    onClick={() => handleNavClick(item)}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Button>
                );
              })}
              {/* Auth Button Mobile */}
              <Button
                variant="outline"
                className="w-full justify-start font-sans text-sm px-4 py-3 rounded-none"
                onClick={async () => {
                  if (user) {
                    await supabase.auth.signOut();
                    setUser(null);
                    navigate('/');
                  } else {
                    navigate('/auth');
                  }
                }}
              >
                {user ? 'Se déconnecter' : 'Se connecter'}
              </Button>
              <a href="/CV__Joel Gaetan_HASSAM OBAH.pdf" download className="w-full">
                <Button
                  variant="accent-red"
                  className="w-full justify-start font-sans text-sm px-4 py-3 rounded-none"
                >
                  <PdfIcon className="h-5 w-5 mr-2" />
                  {t('nav.download_cv_mobile')}
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
