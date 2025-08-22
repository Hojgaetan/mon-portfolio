import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { AboutSection } from "@/components/AboutSection";

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="min-h-screen h-auto bg-background flex flex-col">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">
        <AboutSection />
      </div>
    </div>
  );
};

export default AboutPage;

