import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Shield, Clock, CheckCircle, Copy, Smartphone, CreditCard, ArrowRight } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ManualPurchase() {
  const [user, setUser] = useState<User | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const location = useLocation();
  const isExportFull = new URLSearchParams(location.search).get('export') === '1';

  useEffect(() => {
    document.title = `${isExportFull ? t('manual.export.title') : t('manual.title')} · ${t('annuaire.title')}`;

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
  }, [navigate, t]);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      isExportFull
        ? ` Bonjour ! Je souhaite acheter l'export complet de l'annuaire (5000 F CFA).\n\n Mon email : ${user?.email}\n\n J'ai effectué le paiement et je vais vous envoyer la capture d'écran.\n\nMerci de m'envoyer le fichier Excel complet via WhatsApp.`
        : ` Bonjour ! Je souhaite acheter l'accès à l'annuaire des entreprises.\n\n Mon email : ${user?.email}\n\n J'ai effectué le paiement et je vais vous envoyer la capture d'écran.\n\nMerci d'activer mon accès ! ⚡`
    );
    const url = `https://wa.me/221708184010?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText("772020430");
    setCopiedPhone(true);
    toast({
      title: t('common.copied_title'),
      description: t('common.copied_desc'),
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
          <nav aria-label={t('aria.breadcrumb')} className="mb-8 text-sm text-muted-foreground">
            <ol className="flex flex-wrap gap-2" role="list">
              <li><Link to="/" className="hover:underline transition-colors">{t('manual.breadcrumb.home')}</Link></li>
              <li aria-hidden>›</li>
              <li><Link to="/produit" className="hover:underline transition-colors">{t('manual.breadcrumb.products')}</Link></li>
              <li aria-hidden>›</li>
              <li><Link to="/produit/annuaire" className="hover:underline transition-colors">{t('manual.breadcrumb.directory')}</Link></li>
              <li aria-hidden>›</li>
              <li aria-current="page" className="text-foreground font-medium">{t('manual.breadcrumb.payment')}</li>
            </ol>
          </nav>

          <header className="text-center py-8" aria-labelledby="page-title">
            <Badge className="mb-4 bg-accent-green/10 text-accent-green border-accent-green/20">
              💳 {t('common.secure_payment')}
            </Badge>
            <h1 id="page-title" className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {isExportFull ? t('manual.export.title') : t('manual.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {isExportFull ? t('manual.export.subtitle') : t('manual.subtitle')}
            </p>
          </header>
        </div>
      </div>

      <main role="main" className="container mx-auto max-w-4xl p-6">
        {isExportFull && (
          <div className="mb-6 p-4 rounded-lg border bg-yellow-50 text-yellow-900 border-yellow-200">
            <strong>{t('manual.export.title')}</strong> — {t('manual.export.banner')}
          </div>
        )}
        {/* Payment Methods */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Wave Payment */}
          <Card className="border-2 border-accent-blue/20 bg-gradient-to-br from-card to-accent-blue/5 hover:border-accent-blue/30 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-accent-blue" />
              </div>
              <CardTitle className="text-xl font-bold text-accent-blue">
                {t('manual.wave.title')}
              </CardTitle>
              <p className="text-muted-foreground">
                {t('manual.wave.desc')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent-blue/5 p-4 rounded-lg border border-accent-blue/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{t('manual.number')} Wave :</span>
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
                  <span>{isExportFull ? t('manual.export.sent_amount') : t('manual.sent_amount')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>{t('manual.take_screenshot')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>{isExportFull ? t('manual.export.whatsapp_hint') : t('manual.contact_whatsapp')}</span>
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
                {t('manual.orange.title')}
              </CardTitle>
              <p className="text-muted-foreground">
                {t('manual.orange.desc')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent-sky/5 p-4 rounded-lg border border-accent-sky/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{t('manual.number')} Orange Money :</span>
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
                  <span>{isExportFull ? t('manual.export.sent_amount') : t('manual.sent_amount')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>{t('manual.take_screenshot')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span>{isExportFull ? t('manual.export.whatsapp_hint') : t('manual.contact_whatsapp')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Section */}
        <Card className="max-w-2xl mx-auto shadow-lg border-2 border-accent-green/20 bg-gradient-to-br from-card to-accent-green/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold mb-2">
              {isExportFull ? t('manual.export.final_step') : t('manual.final_step')}
            </CardTitle>
            <p className="text-muted-foreground">
              {isExportFull ? t('manual.export.final_step_desc') : t('manual.final_step_desc')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-accent-green/5 p-6 rounded-lg border border-accent-green/10">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-accent-green" />
                {t('manual.prepared_msg')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isExportFull ? t('manual.export.prepared_msg_desc') : t('manual.prepared_msg_desc')}
              </p>
              
              <Button
                size="lg"
                className="w-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleWhatsAppContact}
                aria-label={t('aria.whatsapp_finalize')}
              >
                <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                {t('manual.btn.send_whatsapp')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
              <Link to="/produit/annuaire" className="flex-1">
                <Button variant="outline" className="w-full" aria-label={t('aria.back_to_product_annuaire')}>
                  {t('manual.btn.back_to_product')}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={copyPhoneNumber}
                className="flex-1 border-accent-blue/20 text-accent-blue hover:bg-accent-blue/5"
              >
                <Copy className="w-4 h-4 mr-2" />
                {t('manual.copy_number')}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>{t('common.secure_payment')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t('manual.activation_fast')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section FAQS */}
        {/* Garder la FAQ en FR pour l'instant; i18n possible plus tard */}
      </main>
    </>
  );
}
