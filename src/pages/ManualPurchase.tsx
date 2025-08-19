import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Copy, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { getActiveAccessPass } from "@/lib/access";

export default function ManualPurchase() {
  const [user, setUser] = useState<User | null>(null);
  const [copiedWave, setCopiedWave] = useState(false);
  const [copiedOrange, setCopiedOrange] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    document.title = "Paiement manuel (désactivé) · Annuaire";

    // Enforce: if user not authenticated, redirect to /auth
    // If user authenticated and already has access, redirect to /annuaire
    // Otherwise, we can optionally redirect to product or annuaire buy flow
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }
      setUser(user);
      const pass = await getActiveAccessPass();
      if (pass) {
        navigate("/annuaire", { replace: true });
        return;
      }
      // No active pass: send user to annuaire with purchase modal
      navigate("/annuaire?buy=1", { replace: true });
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        navigate("/auth", { replace: true });
        return;
      }
      setUser(session.user);
      const pass = await getActiveAccessPass();
      if (pass) navigate("/annuaire", { replace: true });
      else navigate("/annuaire?buy=1", { replace: true });
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

  // This page should never render its legacy content anymore
  return null;
  // Legacy UI removed — redirected above
}