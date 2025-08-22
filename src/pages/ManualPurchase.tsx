import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Shield, Clock, CheckCircle, Copy, Smartphone, CreditCard, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export default function ManualPurchase() {
  const [user, setUser] = useState<User | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      `🚀 Bonjour ! Je souhaite acheter l'accès à l'annuaire des entreprises.\n\n📧 Mon email : ${user?.email}\n\n💳 J'ai effectué le paiement et je vais vous envoyer la capture d'écran.\n\nMerci d'activer mon accès ! ⚡`
    );
    const url = `https://wa.me/221708184010?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText("772020430");
    setCopiedPhone(true);
    toast({
      title: "Numéro copié !",
      description: "Le numéro 772020430 a été copié dans votre presse-papiers.",
    });
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  if (!user) return null;

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={() => {}} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-accent-green/5 to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="container mx-auto max-w-4xl p-6 relative">
          <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-muted-foreground">
            <ol className="flex flex-wrap gap-2" role="list">
              <li><Link to="/" className="hover:underline transition-colors">Accueil</Link></li>
              <li aria-hidden>›</li>
              <li><Link to="/produit" className="hover:underline transition-colors">Produits</Link></li>
              <li aria-hidden>›</li>
              <li><Link to="/produit/annuaire" className="hover:underline transition-colors">Annuaire</Link></li>
              <li aria-hidden>›</li>
              <li aria-current="page" className="text-foreground font-medium">Paiement</li>
            </ol>
          </nav>

          <header className="text-center py-8" aria-labelledby="page-title">
            <Badge className="mb-4 bg-accent-green/10 text-accent-green border-accent-green/20">
              💳 Paiement sécurisé  
            </Badge>
            <h1 id="page-title" className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Finaliser votre achat
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Processus simple et sécurisé via Wave ou Orange Money. Activation immédiate après confirmation.
            </p>
          </header>
        </div>
      </div>

      <main role="main" className="container mx-auto max-w-4xl p-6">
        {/* Payment Methods */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Wave Payment */}
          <Card className="border-2 border-accent-blue/20 bg-gradient-to-br from-card to-accent-blue/5 hover:border-accent-blue/30 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-accent-blue" />
              </div>
              <CardTitle className="text-xl font-bold text-accent-blue">
                Paiement Wave
              </CardTitle>
              <p className="text-muted-foreground">
                Solution mobile de paiement populaire au Sénégal
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent-blue/5 p-4 rounded-lg border border-accent-blue/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Numéro Wave :</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPhoneNumber}
                    className="border-accent-blue/20 text-accent-blue hover:bg-accent-blue/5"
                  >
                    {copiedPhone ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-2xl font-bold text-accent-blue">772 020 430</div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>Envoyez 5000 F CFA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>Prenez une capture d'écran</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>Contactez-nous sur WhatsApp</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orange Money Payment */}
          <Card className="border-2 border-accent-sky/20 bg-gradient-to-br from-card to-accent-sky/5 hover:border-accent-sky/30 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-accent-sky/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-accent-sky" />
              </div>
              <CardTitle className="text-xl font-bold text-accent-sky">
                Orange Money
              </CardTitle>
              <p className="text-muted-foreground">
                Service de paiement mobile d'Orange
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent-sky/5 p-4 rounded-lg border border-accent-sky/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Numéro Orange Money :</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPhoneNumber}
                    className="border-accent-sky/20 text-accent-sky hover:bg-accent-sky/5"
                  >
                    {copiedPhone ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-2xl font-bold text-accent-sky">772 020 430</div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>Envoyez 5000 F CFA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>Prenez une capture d'écran</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>Contactez-nous sur WhatsApp</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Section */}
        <Card className="max-w-2xl mx-auto shadow-lg border-2 border-accent-green/20 bg-gradient-to-br from-card to-accent-green/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold mb-2">
              💬 Étape finale
            </CardTitle>
            <p className="text-muted-foreground">
              Après avoir effectué votre paiement, contactez-nous pour l'activation
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-accent-green/5 p-6 rounded-lg border border-accent-green/10">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-accent-green" />
                Message automatique préparé
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Votre email sera automatiquement inclus dans le message pour une activation plus rapide.
              </p>
              
              <Button
                size="lg"
                className="w-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleWhatsAppContact}
                aria-label="Contacter sur WhatsApp pour finaliser l'achat"
              >
                <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                Envoyer la capture sur WhatsApp
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
              <Link to="/produit/annuaire" className="flex-1">
                <Button variant="outline" className="w-full" aria-label="Retour à la page produit annuaire">
                  ← Retour au produit
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={copyPhoneNumber}
                className="flex-1 border-accent-blue/20 text-accent-blue hover:bg-accent-blue/5"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier le numéro
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Activation en 5 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section FAQS */}
        <Card className="w-full shadow-md">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-semibold">FAQ — Liste de +500 entreprises sénégalaises sans site web</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <section aria-labelledby="faqs-heading">
              <h2 id="faqs-heading" className="sr-only">Foire aux questions</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground">Quel est le produit exactement et à quel prix ?</h3>
                  <p>
                    Vous obtenez un accès de 1 heure à une liste de plus de 500 entreprises sénégalaises identifiées comme n'ayant pas de présence web.
                    Tarif: 5000 XOF pour 1 heure d'accès sécurisé depuis ce site. Vous pouvez reprendre un créneau quand vous voulez.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">Comment sont collectées les données ?</h3>
                  <p>
                    Les informations proviennent de sources publiques, de prospection terrain/numérique et de contributions directes des entreprises.
                    Nous consolidons et normalisons les coordonnées (téléphone, emails génériques lorsqu'ils existent, WhatsApp pro, adresse) avant publication.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">Quelle garantie sur la fraîcheur des leads ?</h3>
                  <p>
                    Nous opérons des vérifications régulières et retirons les contacts signalés comme obsolètes. En cas de problème manifeste,
                    signalez-nous les entrées concernées pendant votre heure d'accès: nous corrigerons/compléterons rapidement.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">Quelle est la fréquence de mise à jour ?</h3>
                  <p>
                    Les données sont mises à jour de manière continue, avec au minimum une révision mensuelle et des ajouts ponctuels au fil des retours terrain.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">Quels types de contacts sont disponibles ?</h3>
                  <p>
                    Selon disponibilité: numéro de téléphone professionnel, secteur d'activité, localisation. Les contacts de décideurs sont inclus uniquement lorsqu'ils sont publiquement accessibles.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">Comment utiliser cette liste efficacement ?</h3>
                  <p>
                    Filtrez par secteur et zone, préparez un script court et personnalisé, puis contactez en priorité par téléphone ou WhatsApp
                    pour proposer un site vitrine simple avec un délai clair. Enchaînez avec un SMS/WhatsApp de suivi si pas de réponse.
                    Conseil: visez 15–20 contacts qualifiés pendant l'heure d'accès pour maximiser les rendez-vous.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">Quelles sont les limitations d'utilisation ?</h3>
                  <p>
                    Usage commercial autorisé pour votre prospection B2B au Sénégal. Interdits: revente ou republication brute de la liste, envois
                    massifs non sollicités, ou toute utilisation contraire aux lois locales et aux bonnes pratiques anti-spam. Respectez les demandes de désinscription.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">Modalités de paiement et d'accès</h3>
                  <p>
                    Le paiement s'effectue manuellement: cliquez sur « Contacter sur WhatsApp », recevez les coordonnées de paiement, envoyez votre preuve
                    (capture d'écran), puis votre accès d'1 heure est activé sur votre compte sur ce site, généralement en quelques minutes.
                    Besoin d'aide ? Envoyez « DEMO » sur WhatsApp.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">Politique de remboursement</h3>
                  <p>
                    Les accès numériques délivrés ne sont pas remboursables. En cas d'incident technique empêchant l'utilisation ou de données
                    manifestement erronées signalées pendant votre créneau, nous prolongeons l'accès et priorisons la correction.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">Puis-je utiliser ces données pour une offre commerciale immédiate ?</h3>
                  <p>
                    Oui, c'est l'objectif: aider développeurs et agences web à prospecter des entreprises sans site. Restez pertinent et respectueux:
                    privilégiez les messages personnalisés et locaux, mentionnez la valeur concrète (ex: présence Google, WhatsApp Business, vitrine en 72h).
                    Prêt à démarrer ? Utilisez le bouton WhatsApp ci-dessus.
                  </p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
