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
    const url = `https://wa.me/221708184010?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!user) return null;

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={() => {}} />
      <main role="main" className="container mx-auto max-w-3xl p-6 min-h-screen flex flex-col items-center justify-start gap-6">
        <nav aria-label="Fil d'Ariane" className="w-full -mb-2 text-sm text-muted-foreground">
          <ol className="flex flex-wrap gap-2" role="list">
            <li><Link to="/" className="hover:underline">Accueil</Link></li>
            <li aria-hidden>›</li>
            <li><Link to="/produit" className="hover:underline">Produits</Link></li>
            <li aria-hidden>›</li>
            <li><Link to="/produit/annuaire" className="hover:underline">Annuaire</Link></li>
            <li aria-hidden>›</li>
            <li aria-current="page" className="text-foreground">Paiement manuel</li>
          </ol>
        </nav>

        <header className="w-full" aria-labelledby="page-title">
          <h1 id="page-title" className="text-2xl md:text-3xl font-bold tracking-tight">
            Paiement manuel de l'accès à l'annuaire
          </h1>
          <p className="text-muted-foreground mt-2 max-w-prose">
            Recevez les coordonnées de paiement et faites activer votre accès d'1 heure une fois le paiement confirmé.
          </p>
        </header>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold">
              Finaliser votre achat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-muted-foreground">
            <p className="max-w-prose">
              Contactez-moi sur WhatsApp pour recevoir les coordonnées de paiement et m'envoyer votre preuve de paiement (capture d'écran). J'activerai votre accès dès validation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                onClick={handleWhatsAppContact}
                aria-label="Contacter sur WhatsApp pour le paiement"
              >
                <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                Contacter sur WhatsApp
              </Button>
              <Link to="/produit/annuaire">
                <Button variant="outline" aria-label="Retour à la page produit annuaire">Retour à la page produit</Button>
              </Link>
            </div>
            <p className="text-xs opacity-70">
              Astuce: mentionnez l'email de votre compte dans le message pour une activation plus rapide.
            </p>
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
