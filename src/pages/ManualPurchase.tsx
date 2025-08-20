import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export default function ManualPurchase() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Paiement manuel · Annuaire";

    // Exiger l'authentification
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }
      setUser(user);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth", { replace: true });
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Bonjour, je souhaite acheter l'accès à l'annuaire des entreprises.\n\nMon email : ${user?.email}\n\nMerci de m'indiquer les coordonnées pour le paiement manuel et d'activer mon accès une fois le paiement reçu.`
    );
    window.open(`https://wa.me/221708184010?text=${message}`, '_blank');
  };

  if (!user) return null;

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={() => {}} />
      <div className="container mx-auto max-w-3xl p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold">
              Paiement manuel de l'accès à l'annuaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-muted-foreground">
            <p>
              Vous avez choisi le paiement manuel. Contactez-nous sur WhatsApp pour recevoir les
              coordonnées de paiement et nous envoyer votre preuve. Nous activerons votre accès
              dès validation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter sur WhatsApp
              </Button>
              <Link to="/produits/annuaire">
                <Button variant="outline">Retour à la page produit</Button>
              </Link>
            </div>
            <p className="text-xs opacity-70">
              Astuce: mentionnez l'email de votre compte dans le message pour une activation plus rapide.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
