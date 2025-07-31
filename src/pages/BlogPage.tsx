import { BlogSection } from "@/components/BlogSection";
import { Navigation } from "@/components/Navigation";
import { useState } from "react";

const BlogPage = () => {
  const [activeTab, setActiveTab] = useState("blog");

  return (
    <div className="min-h-screen h-auto bg-background flex flex-col">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">
        <BlogSection />
      </div>
    </div>
  );
};

export default BlogPage;
