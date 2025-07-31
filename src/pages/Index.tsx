import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { BlogSection } from "@/components/BlogSection";
import { ContactSection } from "@/components/ContactSection";

const Index = () => {
  const [activeTab, setActiveTab] = useState("hello");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      setActiveTab(location.state.scrollTo);
    }
  }, [location.state]);

  const renderContent = () => {
    switch (activeTab) {
      case "hello":
        return <HeroSection />;
      case "about":
        return <AboutSection />;
      case "projects":
        return <ProjectsSection />;
      case "blog":
        return <BlogSection />;
      case "formations":
        return <div className="flex items-center justify-center h-full"><span className="text-muted-foreground font-mono">// formations - en cours de développement</span></div>;
      case "services":
        return <div className="flex items-center justify-center h-full"><span className="text-muted-foreground font-mono">// services - en cours de développement</span></div>;
      case "contact":
        return <ContactSection />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="min-h-screen h-auto bg-background flex flex-col">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
