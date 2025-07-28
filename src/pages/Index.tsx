import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";

const Index = () => {
  const [activeTab, setActiveTab] = useState("hello");

  const renderContent = () => {
    switch (activeTab) {
      case "hello":
        return <HeroSection />;
      case "about":
        return <AboutSection />;
      case "projects":
        return <ProjectsSection />;
      case "formations":
        return <div className="flex items-center justify-center h-full"><span className="text-muted-foreground font-mono">// formations - en cours de développement</span></div>;
      case "services":
        return <div className="flex items-center justify-center h-full"><span className="text-muted-foreground font-mono">// services - en cours de développement</span></div>;
      case "contact":
        return <div className="flex items-center justify-center h-full"><span className="text-muted-foreground font-mono">// contact - en cours de développement</span></div>;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
