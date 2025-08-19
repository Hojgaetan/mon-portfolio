import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessPrice, getActiveAccessPass } from "@/lib/access";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { MessageCircle } from "lucide-react";

export default function ProductAnnuaire() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Produit · Annuaire des entreprises";
    
    // Check authentication status
    let subscription;
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
    // Otherwise, open the in-page payment flow on annuaire
    navigate("/annuaire?buy=1");
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Bonjour, j'ai besoin d'aide pour accéder à l'annuaire des entreprises.");
    window.open(`https://wa.me/221708184010?text=${message}`, '_blank');
  };

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

              <div className="pt-6 space-y-4">
                {isAdmin ? (
                  <div className="text-center">
                    <Link to="/annuaire" className="inline-block">
                      <Button size="lg" className="w-full sm:w-auto px-12 py-3 text-base font-semibold">
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
                    >
                      {user ? "Acheter l'accès" : "Se connecter pour acheter"}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <span>Problème de paiement ?</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                        onClick={handleWhatsAppContact}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contactez-nous
                      </Button>
                    </div>
                  </>
                )}
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