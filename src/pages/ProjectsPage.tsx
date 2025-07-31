import { ProjectsSection } from "@/components/ProjectsSection";
import { Navigation } from "@/components/Navigation";
import { useState } from "react";

const ProjectsPage = () => {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <div className="min-h-screen h-auto bg-background flex flex-col">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">
        <ProjectsSection />
      </div>
    </div>
  );
};

export default ProjectsPage;
