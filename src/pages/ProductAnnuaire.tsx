import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessPrice } from "@/lib/access";
import { Link } from "react-router-dom";

export default function ProductAnnuaire() {
  useEffect(() => {
    document.title = "Produit · Annuaire des entreprises";
  }, []);

  const price = getAccessPrice();

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={()=>{}} />
      <div className="container mx-auto max-w-4xl p-6 min-h-screen flex items-center justify-center">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl md:text-2xl font-bold leading-tight">
              Listes des entreprises qui n'ont pas encore de site web au Sénégal en 2025
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Accédez à une base de données qualifiée d'entreprises sénégalaises sans présence web.
                Idéal pour le démarchage commercial et les opportunités d'affaires.
              </p>
              
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border">
                <div className="text-3xl font-bold text-primary mb-2">
                  {price.toLocaleString("fr-FR")} F CFA
                </div>
                <div className="text-sm text-muted-foreground">
                  Accès valable 1 heure • Activation immédiate
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-lg mx-auto">
                <div className="p-3 rounded-lg bg-muted/20">
                  <div className="text-sm font-medium">Coordonnées</div>
                  <div className="text-xs text-muted-foreground">complètes</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/20">
                  <div className="text-sm font-medium">Recherche</div>
                  <div className="text-xs text-muted-foreground">avancée</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/20">
                  <div className="text-sm font-medium">Données</div>
                  <div className="text-xs text-muted-foreground">mises à jour</div>
                </div>
              </div>

              <div className="pt-6">
                <Button asChild size="lg" className="w-full sm:w-auto px-12 py-3 text-base font-semibold">
                  <Link to="/annuaire?buy=1">Acheter l'accès</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-6 opacity-70">
                Contenu protégé • Consultation uniquement sur le site
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}