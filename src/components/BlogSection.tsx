import React from "react";

interface BlogPost {
  id: number;
  title: string;
  date: string;
  summary: string;
  content: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Bienvenue sur mon blog !",
    date: "2025-07-28",
    summary: "Découvrez mes réflexions, tutoriels et retours d'expérience sur le développement web et la tech.",
    content: "Ceci est le contenu complet de l'article de bienvenue. Vous pourrez bientôt lire d'autres articles ici !",
  },
  {
    id: 2,
    title: "Comment j'ai construit ce portfolio avec React et Tailwind",
    date: "2025-07-20",
    summary: "Retour sur la conception technique et les choix d'architecture de ce site.",
    content: "Détails techniques, choix de librairies, astuces et bonnes pratiques...",
  },
];

export const BlogSection: React.FC = () => {
  return (
    <section id="blog" className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-accent">Blog</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article key={post.id} className="bg-background border border-border rounded-lg shadow p-6 flex flex-col">
            <h3 className="text-xl font-semibold mb-2 text-foreground">{post.title}</h3>
            <span className="text-xs text-muted-foreground mb-2">{post.date}</span>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{post.summary}</p>
            <button className="self-end text-accent hover:underline text-sm font-mono">Lire plus</button>
          </article>
        ))}
      </div>
    </section>
  );
};

