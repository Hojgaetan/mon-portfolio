import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "hello", label: "_hello", active: true },
  { id: "about", label: "_à-propos", active: false },
  { id: "projects", label: "_projets", active: false },
  { id: "formations", label: "_formations", active: false },
  { id: "services", label: "_services", active: false },
  { id: "contact", label: "_me-contacter", active: false },
];

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  return (
    <nav className="w-full bg-sidebar-background border-b border-sidebar-border">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-accent-foreground font-mono text-sm font-bold">JG</span>
            </div>
            <span className="text-sidebar-foreground font-mono text-sm">joel-gaetan-hassam-obah</span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`font-mono text-sm px-4 py-2 h-12 rounded-none border-r border-sidebar-border ${
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

          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <span className="text-sidebar-foreground font-mono text-sm">_@Hojgaetan</span>
          </div>
        </div>
      </div>
    </nav>
  );
};