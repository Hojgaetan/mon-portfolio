import { Button } from "@/components/ui/button";

export const ProjectsSection = () => {
  const projects = [
    {
      id: "_revue-hybrides",
      title: "projet 1 // _revue-hybrides",
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    },
    {
      id: "_pba2-camerun",
      title: "projet 2 // _pba2-camerun", 
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop",
    },
    {
      id: "_majorants-academy",
      title: "projet 3 // _majorants-academy",
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality", 
      image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&h=300&fit=crop",
    },
    {
      id: "_revue-hybrides-2",
      title: "projet 1 // _revue-hybrides",
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&h=300&fit=crop",
    },
    {
      id: "_pba2-camerun-2", 
      title: "projet 1 // _revue-hybrides",
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=300&fit=crop",
    },
    {
      id: "_majorants-academy-2",
      title: "projet 1 // _revue-hybrides", 
      description: "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
    },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar-background border-r border-sidebar-border">
        <div className="p-4">
          <div className="space-y-2">
            <div className="text-sidebar-foreground font-mono text-sm mb-4">_projets</div>
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center space-x-2 py-1">
                <span className="w-4 h-4 flex items-center justify-center">📁</span>
                <span className="text-sidebar-foreground font-mono text-sm">{project.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-background">
        <div className="border-b border-border bg-sidebar-background">
          <div className="flex items-center">
            <div className="px-4 py-2 bg-background border-r border-border">
              <span className="font-mono text-sm text-foreground">_projets</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="h-48 bg-muted">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-mono text-sm text-accent mb-2">{project.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full font-mono text-sm bg-accent/10 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    view-project-on-github
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};