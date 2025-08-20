import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { getAccessPrice } from "@/lib/access";

export default function ProductIndex() {
  useEffect(() => {
    document.title = "Produits · Offres";
  }, []);

  const price = getAccessPrice();

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={() => {}} />
      <div className="container mx-auto max-w-5xl p-6 min-h-screen">
        <header className="mb-6" aria-labelledby="products-heading">
          <h1 id="products-heading" className="text-2xl md:text-3xl font-bold tracking-tight">
            Nos produits
          </h1>
          <p className="text-muted-foreground mt-2">
            Des outils simples et efficaces pour accélérer votre prospection et vos ventes.
          </p>
        </header>

        <section aria-labelledby="catalog-heading" className="grid gap-6 sm:grid-cols-2">
          <h2 id="catalog-heading" className="sr-only">Catalogue</h2>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle id="annuaire-title" className="text-xl md:text-2xl font-semibold">
                Annuaire d'entreprises sans site web (Sénégal)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <article aria-labelledby="annuaire-title">
                <p className="text-muted-foreground">
                  Une base qualifiée d'entreprises sénégalaises sans présence web pour démarcher rapidement.
                </p>

                <ul role="list" className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Coordonnées clés et secteurs</li>
                  <li>Recherche et filtres</li>
                  <li>Mises à jour régulières</li>
                </ul>

                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Tarif</p>
                  <p className="text-2xl font-bold text-primary" aria-live="polite">
                    {price.toLocaleString("fr-FR")} F CFA
                  </p>
                  <p className="text-xs text-muted-foreground">Accès 1 heure • Activation rapide</p>
                </div>

                <div className="pt-2">
                  <Link to="/produit/annuaire" className="inline-block">
                    <Button size="lg" aria-label="Voir le produit annuaire">
                      Découvrir le produit
                    </Button>
                  </Link>
                </div>
              </article>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
