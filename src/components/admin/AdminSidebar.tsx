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
  Mail
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: User;
  onSignOut: () => void;
  onNavigateHome: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "projects", label: "Projets", icon: FolderOpen },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "about", label: "À propos", icon: UserIcon },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar({ 
  activeSection, 
  setActiveSection, 
  user, 
  onSignOut, 
  onNavigateHome 
}: AdminSidebarProps) {
  return (
    <div className="h-full bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <UserIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              Administration
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user.email}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start font-sans text-sm transition-colors ${
                  activeSection === item.id
                    ? "bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue"
                    : "text-sidebar-foreground hover:bg-accent-sky/10 hover:text-accent-sky"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-accent-sky/10 hover:text-accent-sky transition-colors"
          onClick={onNavigateHome}
        >
          <Home className="w-4 h-4 mr-3" />
          Voir le site
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-accent-red hover:bg-accent-red/10 hover:text-accent-red transition-colors"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}