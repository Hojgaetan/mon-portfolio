import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Award, Users, Lock, FileCheck, Headphones, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedSection, ScaleIn } from '@/components/AnimatedSection';

interface Guarantee {
  icon: JSX.Element;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  color: string;
}

const guarantees: Guarantee[] = [
  {
    icon: <Shield className="h-8 w-8 text-accent-blue" />,
    titleFr: 'Code de Qualité',
    titleEn: 'Quality Code',
    descriptionFr: 'Code professionnel, testé et documenté selon les meilleures pratiques Python',
    descriptionEn: 'Professional, tested and documented code following Python best practices',
    color: 'text-accent-blue',
  },
  {
    icon: <Clock className="h-8 w-8 text-accent-green" />,
    titleFr: 'Délais Respectés',
    titleEn: 'Deadlines Met',
    descriptionFr: 'Engagement sur les délais avec un suivi transparent du projet',
    descriptionEn: 'Commitment to deadlines with transparent project tracking',
    color: 'text-accent-green',
  },
  {
    icon: <Lock className="h-8 w-8 text-accent-sky" />,
    titleFr: 'Confidentialité',
    titleEn: 'Confidentiality',
    descriptionFr: 'Respect strict de la confidentialité de vos données et processus métier',
    descriptionEn: 'Strict respect for the confidentiality of your data and business processes',
    color: 'text-accent-sky',
  },
  {
    icon: <Headphones className="h-8 w-8 text-accent-red" />,
    titleFr: 'Support Dédié',
    titleEn: 'Dedicated Support',
    descriptionFr: 'Assistance technique réactive et accompagnement sur le long terme',
    descriptionEn: 'Responsive technical assistance and long-term support',
    color: 'text-accent-red',
  },
  {
    icon: <FileCheck className="h-8 w-8 text-accent-sky" />,
    titleFr: 'Documentation Complète',
    titleEn: 'Complete Documentation',
    descriptionFr: 'Documentation technique et utilisateur détaillée pour une autonomie maximale',
    descriptionEn: 'Detailed technical and user documentation for maximum autonomy',
    color: 'text-accent-sky',
  },
  {
    icon: <Award className="h-8 w-8 text-accent-red" />,
    titleFr: 'Garantie Satisfaction',
    titleEn: 'Satisfaction Guarantee',
    descriptionFr: 'Révisions illimitées jusqu\'à votre entière satisfaction',
    descriptionEn: 'Unlimited revisions until your complete satisfaction',
    color: 'text-accent-red',
  },
  {
    icon: <Zap className="h-8 w-8 text-accent-yellow" />,
    titleFr: 'Performance Optimale',
    titleEn: 'Optimal Performance',
    descriptionFr: 'Solutions optimisées pour la rapidité et l\'efficacité',
    descriptionEn: 'Solutions optimized for speed and efficiency',
    color: 'text-accent-yellow',
  },
  {
    icon: <Users className="h-8 w-8 text-accent-green" />,
    titleFr: 'Formation Incluse',
    titleEn: 'Training Included',
    descriptionFr: 'Formation de vos équipes pour une adoption réussie',
    descriptionEn: 'Team training for successful adoption',
    color: 'text-accent-green',
  },
];

export const GuaranteesSection = () => {
  const { language } = useLanguage();

  return (
    <section id="guarantees" className="py-16 border-t scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection direction="up" delay={0.1}>
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent-yellow/30 text-accent-yellow border-accent-yellow/40">
              {language === 'fr' ? 'Garanties' : 'Guarantees'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {language === 'fr' ? 'Mes Engagements Qualité' : 'My Quality Commitments'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'fr'
                ? 'Des garanties solides pour votre tranquillité d\'esprit et la réussite de votre projet'
                : 'Strong guarantees for your peace of mind and the success of your project'}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((guarantee, index) => (
            <ScaleIn key={index} delay={index * 0.1}>
              <Card className="border-2 hover:border-accent-blue/30 transition-all duration-300 h-full hover:shadow-xl group bg-gradient-to-br from-card to-muted/5">
                <CardHeader>
                  <div className={`mb-4 ${guarantee.color} group-hover:scale-110 transition-transform duration-300`}>
                    {guarantee.icon}
                  </div>
                  <CardTitle className="text-lg">
                    {language === 'fr' ? guarantee.titleFr : guarantee.titleEn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {language === 'fr' ? guarantee.descriptionFr : guarantee.descriptionEn}
                  </p>
                </CardContent>
              </Card>
            </ScaleIn>
          ))}
        </div>

        {/* Section Engagement supplémentaire */}
        <AnimatedSection direction="up" delay={0.3} className="mt-12">
          <Card className="border-2 border-accent-blue/30 bg-gradient-to-br from-accent-blue/5 to-accent-blue/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                {language === 'fr' ? '100% Satisfaction ou Remboursé' : '100% Satisfaction or Refund'}
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {language === 'fr'
                  ? 'Si le livrable ne correspond pas au cahier des charges validé ensemble, je m\'engage à effectuer les corrections nécessaires sans frais supplémentaires jusqu\'à votre entière satisfaction.'
                  : 'If the deliverable does not match the jointly validated specifications, I commit to making the necessary corrections at no additional cost until your complete satisfaction.'}
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
};
