import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
	Briefcase,
	FolderKanban,
	GraduationCap,
	Hand,
	Mail,
	Menu,
	Newspaper,
	Settings,
	User,
	X,
} from "lucide-react";
import logoBeige from "@/assets/logo fond beige 1.png";
import logoNuit from "@/assets/logo fond nuit 1.png";
import { useTheme } from "next-themes";
import { PdfIcon } from "./PdfIcon";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
	{ id: "hello", label: "_hello", icon: <Hand className="h-4 w-4" /> },
	{ id: "about", label: "_à-propos", icon: <User className="h-4 w-4" /> },
	{
		id: "projects",
		label: "_projets",
		icon: <FolderKanban className="h-4 w-4" />,
		path: "/projets",
	},
	{
		id: "blog",
		label: "_blog",
		icon: <Newspaper className="h-4 w-4" />,
		path: "/blog",
	},
	{
		id: "formations",
		label: "_formations",
		icon: <GraduationCap className="h-4 w-4" />,
	},
	{
		id: "services",
		label: "_services",
		icon: <Briefcase className="h-4 w-4" />,
	},
	{
		id: "contact",
		label: "_me-contacter",
		icon: <Mail className="h-4 w-4" />,
	},
];

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

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
            <span className="hidden sm:inline text-sidebar-foreground font-sans text-sm">joel-gaetan-hassam-obah</span>
            <span className="sm:hidden text-sidebar-foreground font-sans text-sm">JG</span>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center font-sans">
            {navItems.map((item) => {
              const isActive = activeTab === item.id || (item.path && location.pathname.startsWith(item.path));
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`font-sans text-sm px-3 py-2 h-12 rounded-none border-r border-sidebar-border ${
                    isActive
                      ? "bg-background text-foreground border-b-2 border-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => handleNavClick(item)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Mobile menu button and Theme Toggle */}
          <div className="flex items-center space-x-2">
            <a href="/CV__Joel%20Gaetan_HASSAM%20OBAH.pdf" download className="hidden lg:block">
                <Button variant="ghost" className="h-12 rounded-none bg-[#df3821] hover:bg-[#df3821]/90 text-white px-3 py-2 flex items-center">
                    <PdfIcon className="h-5 w-5 mr-2" />
                    _telecharger-le-cv
                </Button>
            </a>
            <ThemeToggle />
            <a
              href="/auth"
              className="p-2 text-accent hover:text-accent/80 hidden md:inline-block"
            >
              <Settings className="h-5 w-5" />
            </a>

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
              <a href="/path-to-your-cv.pdf" download className="w-full">
                <Button
                  variant="ghost"
                  className="w-full justify-start font-sans text-sm px-4 py-3 rounded-none bg-[#df3821] hover:bg-[#df3821]/90 text-white"
                >
                  <PdfIcon className="h-5 w-5 mr-2" />
                  _télécharger-cv
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
