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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: User;
  onSignOut: () => void;
  onNavigateHome: () => void;
  isCollapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
}

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "projects", label: "Projets", icon: FolderOpen },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "about", label: "À propos", icon: UserIcon },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "categories", label: "Catégories", icon: Tag },
  { id: "entreprises", label: "Entreprises", icon: Building2 },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar({ 
  activeSection, 
  setActiveSection, 
  user, 
  onSignOut, 
  onNavigateHome,
  isCollapsed = false,
  setCollapsed = () => {},
}: AdminSidebarProps) {
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
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} font-sans text-sm transition-colors ${
                  isActive
                    ? "bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue"
                    : "text-sidebar-foreground hover:bg-accent-sky/10 hover:text-accent-sky"
                }`}
                onClick={() => setActiveSection(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && item.label}
              </Button>
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