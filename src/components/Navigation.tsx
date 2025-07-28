import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { id: "hello", label: "_hello", active: true },
  { id: "about", label: "_à-propos", active: false },
  { id: "projects", label: "_projets", active: false },
  { id: "formations", label: "_formations", active: false },
  { id: "services", label: "_services", active: false },
  { id: "contact", label: "_me-contacter", active: false },
];

export const Navigation = () => {
  const [activeTab, setActiveTab] = useState("hello");

  return (
    <nav className="w-full bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-accent-foreground font-mono text-sm font-bold">JG</span>
            </div>
            <span className="text-muted-foreground font-mono text-sm">joel-gaetan-hassam-obah</span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`font-mono text-sm px-4 py-2 ${
                  activeTab === item.id
                    ? "bg-secondary text-secondary-foreground border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="font-mono text-sm">
              🌙
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};