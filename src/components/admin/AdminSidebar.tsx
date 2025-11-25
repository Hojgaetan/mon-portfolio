import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Users,
  Settings,
  LogOut,
  Home,
  User as UserIcon,
  Mail,
  Building2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Key,
  MessageCircle,
  GraduationCap,
  Award,
  Heart, // ajout pour sous-menu Réactions
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminSidebarProps {
  activeSection: string; // ex: "overview" ou "content:blog"
  setActiveSection: (section: string) => void;
  user: User;
  onSignOut: () => void;
  onNavigateHome: () => void;
  isCollapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
}

// Configuration des menus et sous-menus
const NAV_GROUPS = [
  {
    id: "overview",
    type: "single" as const,
    label: "Aperçu",
    icon: LayoutDashboard,
    section: "overview", // activeSection = "overview"
  },
  {
    id: "content",
    type: "group" as const,
    label: "Contenu",
    icon: FileText,
    items: [
      { id: "blog", label: "Blog", icon: FileText, section: "content:blog" },
      { id: "blog_categories", label: "Catégories Blog", icon: Tag, section: "content:blog_categories" },
      { id: "projects", label: "Projets", icon: FolderOpen, section: "content:projects" },
      { id: "about", label: "À propos", icon: UserIcon, section: "content:about" },
      { id: "categories", label: "Catégories", icon: Tag, section: "content:categories" },
      { id: "home_sections", label: "Accueil (Sections)", icon: Home, section: "content:home_sections" },
    ],
  },
  {
    id: "catalog",
    type: "group" as const,
    label: "Catalogue Entreprises",
    icon: Building2,
    items: [
      { id: "entreprises", label: "Entreprises", icon: Building2, section: "catalog:entreprises" },
      { id: "exports", label: "Exports & Usage", icon: FileText, section: "catalog:exports" },
    ],
  },
  {
    id: "users",
    type: "group" as const,
    label: "Utilisateurs & Accès",
    icon: Users,
    items: [
      { id: "users", label: "Utilisateurs", icon: Users, section: "users:manage" },
      { id: "access", label: "Gestion des accès", icon: Key, section: "users:access" },
    ],
  },
  {
    id: "interactions",
    type: "group" as const,
    label: "Interactions",
    icon: MessageCircle,
    items: [
      { id: "messages", label: "Messages", icon: Mail, section: "interactions:messages" },
      { id: "comments", label: "Commentaires", icon: MessageCircle, section: "interactions:comments" },
      { id: "reactions", label: "Réactions", icon: Heart, section: "interactions:reactions" },
    ],
  },
  {
    id: "features",
    type: "group" as const,
    label: "Caractéristiques",
    icon: Award,
    items: [
      { id: "cursus", label: "Cursus", icon: GraduationCap, section: "features:cursus" },
      { id: "certifications", label: "Certifications", icon: Award, section: "features:certifications" },
    ],
  },
  {
    id: "settings",
    type: "single" as const,
    label: "Paramètres",
    icon: Settings,
    section: "settings", // activeSection = "settings"
  },
] as const;

export function AdminSidebar({
  activeSection,
  setActiveSection,
  user,
  onSignOut,
  onNavigateHome,
  isCollapsed = false,
  setCollapsed = () => {},
}: AdminSidebarProps) {
  // Déterminer le groupe ouvert en fonction de la section active
  const activeGroupId = activeSection.includes(":") ? activeSection.split(":")[0] : activeSection;

  return (
    <div className={`h-full bg-sidebar-background border-r border-sidebar-border flex flex-col ${isCollapsed ? "items-center" : ""}`}>
      {/* Header */}
      <div className={`p-4 border-b border-sidebar-border w-full ${isCollapsed ? "px-2" : ""}`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} space-x-3`}>
          <div className={`flex items-center ${isCollapsed ? "space-x-0" : "space-x-3"}`}>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Administration
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCollapsed && <ThemeToggle />}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed(!isCollapsed)}
              title={isCollapsed ? "Déplier" : "Réduire"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`flex-1 ${isCollapsed ? "p-2" : "p-4"} w-full`}>
        <nav className="space-y-2">
          {/* Itération des groupes */}
          {NAV_GROUPS.map((group) => {
            if (group.type === "single") {
              const Icon = group.icon;
              const isActive = activeSection === group.section;
              return (
                <Button
                  key={group.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} font-sans text-sm transition-colors ${
                    isActive
                      ? "bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue"
                      : "text-sidebar-foreground hover:bg-accent-sky/10 hover:text-accent-sky"
                  }`}
                  onClick={() => setActiveSection(group.section)}
                  title={isCollapsed ? group.label : undefined}
                >
                  <Icon className={`w-4 h-4 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && group.label}
                </Button>
              );
            }

            // Group avec sous-menus
            const GroupIcon = group.icon;
            const isGroupActive = activeGroupId === group.id;

            return (
              <div key={group.id} className="w-full">
                <Button
                  variant={isGroupActive ? "secondary" : "ghost"}
                  className={`w-full ${isCollapsed ? "justify-center" : "justify-between"} font-sans text-sm transition-colors ${
                    isGroupActive
                      ? "bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue"
                      : "text-sidebar-foreground hover:bg-accent-sky/10 hover:text-accent-sky"
                  }`}
                  onClick={() => {
                    // Si réduit, clique sur le groupe ouvre le premier item
                    if (isCollapsed) {
                      const firstItem = group.items[0];
                      setActiveSection(firstItem.section);
                    } else {
                      // En mode étendu, si le groupe est actif, ne change rien; sinon, ouvre le premier item
                      if (!isGroupActive) {
                        const firstItem = group.items[0];
                        setActiveSection(firstItem.section);
                      }
                    }
                  }}
                  title={isCollapsed ? group.label : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-start"}`}>
                    <GroupIcon className={`w-4 h-4 ${isCollapsed ? "" : "mr-3"}`} />
                    {!isCollapsed && group.label}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight className={`w-4 h-4 transition-transform ${isGroupActive ? "rotate-90" : "rotate-0"}`} />
                  )}
                </Button>

                {/* Sous-menus */}
                {!isCollapsed && isGroupActive && (
                  <div className="mt-1 ml-6 space-y-1">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = activeSection === item.section;
                      return (
                        <Button
                          key={`${group.id}-${item.id}`}
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start font-sans text-sm transition-colors ${
                            isActive
                              ? "bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue"
                              : "text-sidebar-foreground hover:bg-accent-sky/10 hover:text-accent-sky"
                          }`}
                          onClick={() => setActiveSection(item.section)}
                        >
                          <ItemIcon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className={`border-t border-sidebar-border w-full ${isCollapsed ? "p-2" : "p-4"} space-y-2`}>
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} text-sidebar-foreground hover:bg-accent-sky/10 hover:text-accent-sky transition-colors`}
          onClick={onNavigateHome}
          title={isCollapsed ? "Voir le site" : undefined}
        >
          <Home className={`w-4 h-4 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && "Voir le site"}
        </Button>
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} text-accent-red hover:bg-accent-red/10 hover:text-accent-red transition-colors`}
          onClick={onSignOut}
          title={isCollapsed ? "Déconnexion" : undefined}
        >
          <LogOut className={`w-4 h-4 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && "Déconnexion"}
        </Button>
      </div>
    </div>
  );
}
