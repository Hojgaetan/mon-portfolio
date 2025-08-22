import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAccessPrice, getActiveAccessPass } from "@/lib/access";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { MessageCircle, CheckCircle, Star, Users, Clock, Shield, Target, TrendingUp, Zap, Award } from "lucide-react";

export default function ProductAnnuaire() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Produit · Annuaire des entreprises";
    
    // Check authentication status
    let subscription: { unsubscribe: () => void } | undefined;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user && user.id) {
        const { data: adminRow } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        setIsAdmin(!!adminRow);
        // If not admin, check if user already has an active pass
        if (!adminRow) {
          const pass = await getActiveAccessPass();
          const active = !!pass;
          setHasAccess(active);
          if (active) {
            // Redirect directly to annuaire if access is already granted
            navigate("/annuaire", { replace: true });
          }
        } else {
          setHasAccess(true);
        }
      } else {
        setIsAdmin(false);
        setHasAccess(false);
      }
    });
    subscription = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && session.user.id) {
        const { data: adminRow } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setIsAdmin(!!adminRow);
        if (!adminRow) {
          const pass = await getActiveAccessPass();
          const active = !!pass;
          setHasAccess(active);
          if (active) navigate("/annuaire", { replace: true });
        } else {
          setHasAccess(true);
        }
      } else {
        setIsAdmin(false);
        setHasAccess(false);
      }
    }).data.subscription;
    return () => subscription?.unsubscribe();
  }, []);

  const price = getAccessPrice();

  const handlePurchase = async () => {
    if (!user) {
      // Redirect to auth page if not logged in
      navigate("/auth");
      return;
    }
    // If user already has access, go straight to annuaire
    const pass = await getActiveAccessPass();
    if (pass || isAdmin) {
      navigate("/annuaire");
      return;
    }
    // Bascule: paiement manuel par défaut
    navigate("/paiement-manuel");
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Bonjour, j'ai besoin d'aide pour accéder à l'annuaire des entreprises.");
    const url = `https://wa.me/221708184010?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={()=>{}} />
      <main role="main" className="container mx-auto max-w-4xl p-6 min-h-screen">
        <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-muted-foreground">
          <ol className="flex flex-wrap gap-2" role="list">
            <li><Link to="/" className="hover:underline">Accueil</Link></li>
            <li aria-hidden>›</li>
            <li><Link to="/produit" className="hover:underline">Produits</Link></li>
            <li aria-hidden>›</li>
            <li aria-current="page" className="text-foreground">Annuaire</li>
          </ol>
        </nav>

        <header className="mb-6" aria-labelledby="page-title">
          <h1 id="page-title" className="text-2xl md:text-3xl font-bold tracking-tight">
            Annuaire des entreprises — Produit
          </h1>
          <p className="text-muted-foreground mt-2">
            Accédez à une base qualifiée d'entreprises sénégalaises sans présence web.
          </p>
        </header>

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
              
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border" aria-live="polite">
                <div className="text-3xl font-bold text-primary mb-2">
                  {price.toLocaleString("fr-FR")} F CFA
                </div>
                <div className="text-sm text-muted-foreground">
                  Accès valable 1 heure • Activation immédiate
                </div>
              </div>

              <ul role="list" className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-lg mx-auto">
                <li className="p-3 rounded-lg bg-muted/20">
                  <div className="text-sm font-medium">Coordonnées</div>
                  <div className="text-xs text-muted-foreground">complètes</div>
                </li>
                <li className="p-3 rounded-lg bg-muted/20">
                  <div className="text-sm font-medium">Recherche</div>
                  <div className="text-xs text-muted-foreground">avancée</div>
                </li>
                <li className="p-3 rounded-lg bg-muted/20">
                  <div className="text-sm font-medium">Données</div>
                  <div className="text-xs text-muted-foreground">mises à jour</div>
                </li>
              </ul>

              <div className="pt-6 space-y-4">
                {isAdmin ? (
                  <div className="text-center">
                    <Link to="/annuaire" className="inline-block">
                      <Button size="lg" className="w-full sm:w-auto px-12 py-3 text-base font-semibold" aria-label="Voir la liste des entreprises">
                        Voir la liste
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto px-12 py-3 text-base font-semibold"
                      onClick={handlePurchase}
                      aria-label={user ? "Acheter l'accès à l'annuaire" : "Se connecter pour acheter l'accès"}
                    >
                      {user ? "Acheter l'accès" : "Se connecter pour acheter"}
                    </Button>
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <Link to="/paiement-manuel" className="underline">
                        Payer manuellement (Wave/Orange Money, activation manuelle)
                      </Link>
                      <div className="flex items-center justify-center gap-2">
                        <span>Besoin d’aide ?</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                          onClick={handleWhatsAppContact}
                          aria-label="Contacter l'assistance sur WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                          Contactez-nous
                        <span className="text-lg text-muted-foreground line-through">10 000 F</span>
                      </div>
                    </div>
                <div className="text-2xl font-bold text-accent-sky">24/7</div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-6 opacity-70">
                Contenu protégé • Consultation uniquement sur le site
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

                      <Star key={i} className="w-4 h-4 fill-accent-yellow text-accent-yellow" />