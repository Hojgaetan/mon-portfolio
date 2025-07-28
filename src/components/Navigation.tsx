import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "hello", label: "_hello", active: true },
  { id: "about", label: "_à-propos", active: false },
  { id: "projects", label: "_projets", active: false },
  { id: "blog", label: "_blog", active: false },
  { id: "formations", label: "_formations", active: false },
  { id: "services", label: "_services", active: false },
  { id: "contact", label: "_me-contacter", active: false },
];

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-sidebar-background border-b border-sidebar-border">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-accent-foreground font-mono text-sm font-bold">JG</span>
            </div>
            <span className="hidden sm:inline text-sidebar-foreground font-mono text-sm">joel-gaetan-hassam-obah</span>
            <span className="sm:hidden text-sidebar-foreground font-mono text-sm">JG</span>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`font-mono text-sm px-3 py-2 h-12 rounded-none border-r border-sidebar-border ${
                  activeTab === item.id
                    ? "bg-background text-foreground border-b-2 border-accent"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Mobile menu button and Theme Toggle */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <span className="hidden md:inline text-sidebar-foreground font-mono text-sm">_@Hojgaetan</span>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-sidebar-border bg-sidebar-background">
            <div className="py-2 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start font-mono text-sm px-4 py-3 rounded-none ${
                    activeTab === item.id
                      ? "bg-background text-foreground border-l-2 border-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};