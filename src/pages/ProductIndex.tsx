import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { getAccessPrice } from "@/lib/access";
import { CheckCircle, Star, Users, Clock, Shield } from "lucide-react";

export default function ProductIndex() {
  useEffect(() => {
    document.title = "Produits · Offres";
  }, []);

  const price = getAccessPrice();

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={() => {}} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent-blue/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container mx-auto max-w-5xl p-6 relative">
          <div className="text-center py-12">
            <Badge className="mb-4 bg-accent-blue/10 text-accent-blue border-accent-blue/20">
              🚀 Solutions de prospection B2B
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Accélérez votre prospection au Sénégal
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Des outils simples et efficaces pour identifier et contacter les entreprises qui ont besoin de vos services web.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-blue">500+</div>
                <div className="text-sm text-muted-foreground">Entreprises</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-green">95%</div>
                <div className="text-sm text-muted-foreground">Qualité</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-yellow">24/7</div>
                <div className="text-sm text-muted-foreground">Accès</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-accent-red">1h</div>
                <div className="text-sm text-muted-foreground">Activation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto max-w-5xl p-6">
        <section aria-labelledby="catalog-heading" className="py-12">
          <div className="text-center mb-12">
            <h2 id="catalog-heading" className="text-3xl md:text-4xl font-bold mb-4">
              Notre catalogue
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos solutions conçues spécifiquement pour les développeurs et agences web au Sénégal.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent-blue/20 bg-gradient-to-br from-card to-accent-blue/2">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-4">
                  <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20">
                    🎯 Le plus populaire
                  </Badge>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent-yellow text-accent-yellow" />
                    ))}
                  </div>
                </div>
                
                <CardTitle id="annuaire-title" className="text-2xl md:text-3xl font-bold mb-2">
                  Annuaire d'entreprises sans site web
                </CardTitle>
                <p className="text-accent-blue font-medium">Sénégal • 2025</p>
              </CardHeader>
              
              <CardContent className="space-y-6 relative">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  La base de données la plus complète d'entreprises sénégalaises sans présence web. 
                  Parfait pour identifier vos prospects idéaux et développer votre portefeuille client.
                </p>

                {/* Features */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-blue/5">
                    <CheckCircle className="w-5 h-5 text-accent-blue" />
                    <span className="font-medium">Coordonnées complètes</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-green/5">
                    <Users className="w-5 h-5 text-accent-green" />
                    <span className="font-medium">Recherche avancée</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-yellow/5">
                    <Clock className="w-5 h-5 text-accent-yellow" />
                    <span className="font-medium">Mises à jour régulières</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-red/5">
                    <Shield className="w-5 h-5 text-accent-red" />
                    <span className="font-medium">Données vérifiées</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-accent-blue/10 via-accent-blue/5 to-transparent p-6 rounded-xl border border-accent-blue/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tarif promotionnel</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl md:text-4xl font-bold text-accent-blue">
                          {price.toLocaleString("fr-FR")} F CFA
                        </span>
                        <span className="text-lg text-muted-foreground line-through">10 000 F</span>
                      </div>
                    </div>
                    <Badge className="bg-accent-red/10 text-accent-red border-accent-red/20">
                      -50%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    ⚡ Accès immédiat pendant 1 heure • Activation en quelques minutes
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/produit/annuaire" className="flex-1">
                      <Button size="lg" className="w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white shadow-lg hover:shadow-xl transition-all duration-300" aria-label="Voir le produit annuaire">
                        Découvrir le produit →
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Support 24/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-12 text-center">
          <h3 className="text-xl font-semibold mb-6">Rejoint par des professionnels</h3>
          <div className="flex items-center justify-center gap-8 opacity-60">
            <div className="text-sm">Développeurs freelance</div>
            <div className="w-px h-4 bg-border"></div>
            <div className="text-sm">Agences web</div>
            <div className="w-px h-4 bg-border"></div>
            <div className="text-sm">Consultants IT</div>
          </div>
        </section>
      </div>
    </>
  );
}
