import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedSection, ScaleIn } from '@/components/AnimatedSection';
import { useLanguage } from '@/contexts/LanguageContext';

interface TechStack {
  name: string;
  icon?: string;
  color?: string;
  category: 'language' | 'framework' | 'database' | 'tool' | 'other';
}

const techStacks: TechStack[] = [
  // Languages
  { name: 'Python', icon: '🐍', color: 'text-blue-600', category: 'language' },
  { name: 'JavaScript', icon: '⚡', color: 'text-yellow-500', category: 'language' },
  { name: 'TypeScript', icon: '📘', color: 'text-blue-500', category: 'language' },
  { name: 'SQL', icon: '🗄️', color: 'text-gray-600', category: 'language' },

  // Frameworks Python
  { name: 'Django', icon: '🎯', color: 'text-green-700', category: 'framework' },
  { name: 'Flask', icon: '🔥', color: 'text-gray-700', category: 'framework' },
  { name: 'FastAPI', icon: '⚡', color: 'text-teal-600', category: 'framework' },

  // Frontend
  { name: 'React', icon: '⚛️', color: 'text-cyan-500', category: 'framework' },
  { name: 'Tailwind CSS', icon: '🎨', color: 'text-sky-500', category: 'framework' },

  // Databases
  { name: 'PostgreSQL', icon: '🐘', color: 'text-blue-700', category: 'database' },
  { name: 'MySQL', icon: '🐬', color: 'text-orange-600', category: 'database' },
  { name: 'SQLite', icon: '💾', color: 'text-gray-600', category: 'database' },
  { name: 'MongoDB', icon: '🍃', color: 'text-green-600', category: 'database' },
  { name: 'Redis', icon: '🔴', color: 'text-red-600', category: 'database' },

  // Libraries & Tools
  { name: 'Pandas', icon: '🐼', color: 'text-purple-600', category: 'tool' },
  { name: 'SQLAlchemy', icon: '🔗', color: 'text-red-700', category: 'tool' },
  { name: 'Celery', icon: '🌿', color: 'text-green-500', category: 'tool' },
  { name: 'Docker', icon: '🐳', color: 'text-blue-600', category: 'tool' },
  { name: 'Git', icon: '📦', color: 'text-orange-500', category: 'tool' },
  { name: 'Linux', icon: '🐧', color: 'text-yellow-600', category: 'tool' },
];

export const TechStackSection = () => {
  const { language } = useLanguage();

  const categories = {
    language: language === 'fr' ? 'Langages' : 'Languages',
    framework: language === 'fr' ? 'Frameworks' : 'Frameworks',
    database: language === 'fr' ? 'Bases de données' : 'Databases',
    tool: language === 'fr' ? 'Outils & Librairies' : 'Tools & Libraries',
    other: language === 'fr' ? 'Autres' : 'Others',
  };

  const groupedTechs = techStacks.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, TechStack[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedTechs).map(([category, techs], categoryIndex) => (
        <AnimatedSection key={category} direction="up" delay={categoryIndex * 0.1}>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="h-1 w-8 bg-gradient-to-r from-primary to-primary/50 rounded"></span>
              {categories[category as keyof typeof categories]}
            </h3>
            <div className="flex flex-wrap gap-3">
              {techs.map((tech, index) => (
                <ScaleIn key={tech.name} delay={categoryIndex * 0.1 + index * 0.05}>
                  <Badge
                    variant="secondary"
                    className="px-4 py-2 text-sm font-medium hover:scale-105 transition-all duration-300 hover:shadow-md cursor-default"
                  >
                    {tech.icon && <span className="mr-2 text-lg">{tech.icon}</span>}
                    <span className={tech.color}>{tech.name}</span>
                  </Badge>
                </ScaleIn>
              ))}
            </div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
};

interface SkillBadgeProps {
  skill: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  icon?: string;
  delay?: number;
}

export const SkillBadge = ({ skill, level = 'intermediate', icon, delay = 0 }: SkillBadgeProps) => {
  const levelColors = {
    beginner: 'border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-500/50',
    intermediate: 'border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50',
    advanced: 'border-green-500/30 bg-green-500/10 hover:border-green-500/50',
    expert: 'border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50',
  };

  return (
    <ScaleIn delay={delay}>
      <Card className={`border-2 ${levelColors[level]} transition-all duration-300 hover:shadow-lg hover-lift`}>
        <CardContent className="p-4 text-center">
          {icon && <div className="text-3xl mb-2">{icon}</div>}
          <div className="font-semibold">{skill}</div>
          <div className="text-xs text-muted-foreground capitalize mt-1">{level}</div>
        </CardContent>
      </Card>
    </ScaleIn>
  );
};

