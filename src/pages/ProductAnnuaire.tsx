import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessPrice } from "@/lib/access";
import { Link, useNavigate } from "react-router-dom";

export default function ProductAnnuaire() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Produit · Annuaire des entreprises";
  }, []);

  const price = getAccessPrice();

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={()=>{}} />
      <div className="container mx-auto max-w-3xl p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Accédez à l’annuaire des entreprises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Annuaire qualifié des entreprises avec coordonnées, sites web et catégories.
              Mises à jour régulières et protection des données.
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
              <li>Recherche par nom, téléphone, catégorie.</li>
              <li>Ouverture du site officiel en un clic.</li>
              <li>Historique des consultations (agrégé).</li>
            </ul>
            <div className="p-3 rounded border bg-muted/20">
              <div className="text-lg font-semibold">Tarif: {price.toLocaleString("fr-FR")} F CFA</div>
              <div className="text-xs text-muted-foreground">Accès valable 1 heure. Activation immédiate après paiement.</div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button asChild>
                <Link to="/annuaire?buy=1">Acheter l’accès</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/annuaire">Voir l’annuaire</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/auth">Se connecter</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Le contenu est consultable uniquement sur le site. Le téléchargement/copie est limité.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

