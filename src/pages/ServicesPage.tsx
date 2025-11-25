import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import {
    Package,
    Warehouse,
    TrendingUp,
    CheckCircle,
  Star, 
  Clock,
  Shield,
  Zap,
  Briefcase
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServicesPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('services.title');
  }, [t]);

  const openWhatsApp = (serviceTitle: string) => {
    const message = `Bonjour, je souhaite un devis pour: ${serviceTitle} ?`;
    const url = `https://wa.me/221708184010?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const services = [
    {
        id: "supply-chain",
        title: "Gestion de la chaîne d'approvisionnement",
        description: "Solution complète Python pour gérer vos fournisseurs, commandes et livraisons de bout en bout",
        icon: Package,
        price: "À partir de 800 000 F CFA",
        features: [
            "Suivi fournisseurs",
            "Gestion commandes",
            "Traçabilité livraisons",
            "Reporting avancé"
        ],
        badge: "📦 Complet",
        color: "accent-blue"
    },
      {
          id: "inventory",
          title: "Gestion de stock",
          description: "Logiciel Python sur mesure pour suivre vos stocks en temps réel avec alertes automatiques",
          icon: Warehouse,
          price: "À partir de 500 000 F CFA",
          features: [
              "Suivi temps réel",
              "Alertes automatiques",
              "Multi-entrepôts",
              "Rapports détaillés"
          ],
          badge: "🔥 Populaire",
          color: "accent-green"
      },
      {
          id: "optimization",
          title: "Optimisation de la gestion de stock des PME",
          description: "Analyse et optimisation de vos processus de stock avec algorithmes Python pour réduire les coûts",
          icon: TrendingUp,
          price: "À partir de 350 000 F CFA",
          features: [
              "Analyse prédictive",
              "Réduction coûts",
              "Optimisation niveaux",
              "Tableaux de bord"
          ],
          badge: "🚀 Performance",
          color: "accent-sky"
    }
  ];

  return (
    <>
      <Navigation activeTab={"services"} setActiveTab={() => {}} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent-blue/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container mx-auto max-w-5xl p-6 relative">
          <div className="text-center py-12">
            <Badge className="mb-4 bg-accent-blue/10 text-accent-blue border-accent-blue/20">
              <Briefcase className="w-4 h-4 mr-1" /> {t('services.hero.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('services.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('services.hero.subtitle')}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-blue">03+</div>
                <div className="text-sm text-muted-foreground">{t('services.stats.projects')}</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-green">100%</div>
                <div className="text-sm text-muted-foreground">{t('services.stats.satisfaction')}</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-sky">24/7</div>
                <div className="text-sm text-muted-foreground">{t('services.stats.support')}</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-red">15j</div>
                <div className="text-sm text-muted-foreground">{t('services.stats.delivery')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto max-w-6xl p-6">
        <section aria-labelledby="services-heading" className="py-12">
          <div className="text-center mb-12">
            <h2 id="services-heading" className="text-3xl md:text-4xl font-bold mb-4">
              {t('services.section.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('services.section.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className={`relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-${service.color}/20 bg-gradient-to-br from-card to-${service.color}/2`}>
                  <div className={`absolute inset-0 bg-gradient-to-r from-${service.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg`}></div>
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={`bg-${service.color}/10 text-${service.color} border-${service.color}/20`}>
                        {service.badge}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent-yellow text-accent-yellow" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg bg-${service.color}/10`}>
                        <IconComponent className={`w-6 h-6 text-${service.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl md:text-2xl font-bold mb-1">
                          {service.title}
                        </CardTitle>
                        <p className={`text-${service.color} font-medium text-lg`}>{service.price}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 relative">
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3">
                      {service.features.map((feature, index) => (
                        <div key={index} className={`flex items-center gap-2 p-2 rounded-lg bg-${service.color}/5`}>
                          <CheckCircle className={`w-4 h-4 text-${service.color}`} />
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className={`bg-gradient-to-r from-${service.color}/10 via-${service.color}/5 to-transparent p-4 rounded-xl border border-${service.color}/20`}>
                      <Button 
                        size="lg" 
                        onClick={() => openWhatsApp(service.title)}
                        className={`w-full bg-gradient-to-r from-${service.color} to-${service.color}/80 hover:from-${service.color}/90 hover:to-${service.color}/70 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        {t('services.cta.quote')}
                      </Button>
                    </div>

                    {/* Trust indicators */}
                    <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>{t('services.trust.guaranteed')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{t('services.trust.fast_delivery')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{t('services.trust.support_included')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Process Section */}
        <section className="py-12 text-center">
          <h3 className="text-2xl font-bold mb-8">{t('services.process.title')}</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-accent-blue font-bold">1</span>
              </div>
              <h4 className="font-semibold">{t('services.process.step1.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('services.process.step1.desc')}</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-accent-green font-bold">2</span>
              </div>
              <h4 className="font-semibold">{t('services.process.step2.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('services.process.step2.desc')}</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent-sky/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-accent-sky font-bold">3</span>
              </div>
              <h4 className="font-semibold">{t('services.process.step3.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('services.process.step3.desc')}</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-accent-red font-bold">4</span>
              </div>
              <h4 className="font-semibold">{t('services.process.step4.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('services.process.step4.desc')}</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
