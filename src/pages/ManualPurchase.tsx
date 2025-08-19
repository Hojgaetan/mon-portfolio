import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Copy, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export default function ManualPurchase() {
  const [user, setUser] = useState<User | null>(null);
  const [copiedWave, setCopiedWave] = useState(false);
  const [copiedOrange, setCopiedOrange] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    document.title = "Paiement Manuel · Annuaire des entreprises";
    
    // Check authentication status
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleCopy = async (text: string, type: 'wave' | 'orange') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'wave') {
        setCopiedWave(true);
        setTimeout(() => setCopiedWave(false), 2000);
      } else {
        setCopiedOrange(true);
        setTimeout(() => setCopiedOrange(false), 2000);
      }
      toast({
        title: "Copié !",
        description: "Le numéro a été copié dans le presse-papiers",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le numéro",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Bonjour, je souhaite acheter l'accès à l'annuaire des entreprises.\n\nMon email : ${user?.email}\n\nJ'ai effectué le paiement de 5000 F CFA. Veuillez trouver la capture d'écran du paiement ci-joint.`
    );
    window.open(`https://wa.me/221708184010?text=${message}`, '_blank');
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={()=>{}} />
      <div className="container mx-auto max-w-4xl p-6 min-h-screen flex items-center justify-center">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl md:text-2xl font-bold leading-tight">
              Paiement Manuel
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Effectuez votre paiement et contactez-nous pour activer votre accès
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Payment Amount */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                5 000 F CFA
              </div>
              <div className="text-sm text-muted-foreground">
                Accès valable 1 heure
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Instructions de paiement :</h3>
              
              {/* Wave Payment */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-600">Wave</div>
                      <div className="text-2xl font-bold font-mono">772 020 430</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy("772020430", "wave")}
                      className="flex items-center gap-2"
                    >
                      {copiedWave ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedWave ? "Copié" : "Copier"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Orange Money Payment */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-orange-600">Orange Money</div>
                      <div className="text-2xl font-bold font-mono">772 020 430</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy("772020430", "orange")}
                      className="flex items-center gap-2"
                    >
                      {copiedOrange ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedOrange ? "Copié" : "Copier"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Prochaines étapes :</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Effectuez le paiement de <strong>5 000 F CFA</strong> via Wave ou Orange Money</li>
                <li>Prenez une capture d'écran de la confirmation de paiement</li>
                <li>Contactez-nous sur WhatsApp avec la capture d'écran</li>
                <li>Votre accès sera activé dans les plus brefs délais</li>
              </ol>
            </div>

            {/* WhatsApp Contact */}
            <div className="pt-4 text-center">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600 px-8"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Envoyer la capture sur WhatsApp
              </Button>
            </div>

            {/* User Info */}
            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              <p>Votre email : <strong>{user.email}</strong></p>
              <p className="mt-1">Assurez-vous que cette adresse email corresponde à celle mentionnée dans votre message WhatsApp</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}