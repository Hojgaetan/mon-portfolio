import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { getAccessPrice } from "@/lib/access";
import { Shield, Calendar, Tag, Download, CheckCircle, ArrowRight, FileSpreadsheet, Users, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductAnnuaire() {
  useEffect(() => {
    document.title = "Annuaire d'entreprises · Produit";
  }, []);

  const price = getAccessPrice();
  const lastUpdate = new Date();
  const { t } = useLanguage();

  return (
    <>
      <Navigation activeTab={"entreprises"} setActiveTab={() => {}} />

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent-blue/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="container mx-auto max-w-5xl p-6 relative">
          <div className="text-center py-12">
            <Badge className="mb-4 bg-accent-blue/10 text-accent-blue border-accent-blue/20">
              📒 {t('product.annuaire.badge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('product.annuaire.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('product.annuaire.subtitle')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                <Calendar className="w-4 h-4" /> {t('product.annuaire.updated')} {lastUpdate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20">
                <Users className="w-4 h-4" /> {t('product.annuaire.count')}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20">
                <FileSpreadsheet className="w-4 h-4" /> {t('product.annuaire.format')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Corps */}
      <main className="container mx-auto max-w-5xl p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Détails produit */}
          <section className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-accent-blue/20 bg-gradient-to-br from-card to-accent-blue/5">
              <CardHeader>
                <CardTitle className="text-2xl">{t('product.annuaire.what_you_get')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-accent-green mt-0.5" /><span>{t('product.annuaire.feature.coords')}</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-accent-green mt-0.5" /><span>{t('product.annuaire.feature.filter')}</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-accent-green mt-0.5" /><span>{t('product.annuaire.feature.normalized')}</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-accent-green mt-0.5" /><span>{t('product.annuaire.feature.updates')}</span></li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge className="bg-accent-sky/10 text-accent-sky border-accent-sky/20"><Tag className="w-3 h-3 mr-1" /> Commerce</Badge>
                  <Badge className="bg-accent-red/10 text-accent-red border-accent-red/20"><Tag className="w-3 h-3 mr-1" /> Services</Badge>
                  <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20"><Tag className="w-3 h-3 mr-1" /> Santé</Badge>
                  <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20"><Tag className="w-3 h-3 mr-1" /> Local</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">{t('product.annuaire.fields')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 border"><span className="text-foreground font-medium">{t('product.annuaire.fields.company')}</span><div className="opacity-80">{t('product.annuaire.fields.example.company')}</div></div>
                  <div className="p-3 rounded-lg bg-muted/50 border"><span className="text-foreground font-medium">{t('product.annuaire.fields.sector')}</span><div className="opacity-80">{t('product.annuaire.fields.example.sector')}</div></div>
                  <div className="p-3 rounded-lg bg-muted/50 border"><span className="text-foreground font-medium">{t('product.annuaire.fields.phone')}</span><div className="opacity-80">{t('product.annuaire.fields.example.phone')}</div></div>
                  <div className="p-3 rounded-lg bg-muted/50 border"><span className="text-foreground font-medium">{t('product.annuaire.fields.location')}</span><div className="opacity-80">{t('product.annuaire.fields.example.location')}</div></div>
                  <div className="p-3 rounded-lg bg-muted/50 border"><span className="text-foreground font-medium">{t('product.annuaire.fields.web_status')}</span><div className="opacity-80">{t('product.annuaire.fields.example.web_status')}</div></div>
                  <div className="p-3 rounded-lg bg-muted/50 border"><span className="text-foreground font-medium">{t('product.annuaire.fields.notes')}</span><div className="opacity-80">{t('product.annuaire.fields.example.notes')}</div></div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Panneau latéral d'achat */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-20 border-2 border-accent-blue/20 bg-gradient-to-b from-card to-accent-blue/5">
              <CardHeader>
                <CardTitle className="text-xl">{t('product.annuaire.sidebar.access_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Accès sécurisé pendant 1 heure au tableau complet. Activation en quelques minutes après paiement.
                </div>
                <div className="bg-accent-blue/5 p-4 rounded-lg border border-accent-blue/10">
                  <div className="text-sm text-muted-foreground">{t('product.annuaire.sidebar.todays_price')}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-accent-blue">{price.toLocaleString('fr-FR')} F CFA</span>
                    <span className="text-muted-foreground line-through">10 000 F</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link to="/paiement-manuel">
                    <Button size="lg" className="w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:from-accent-blue/90 hover:to-accent-blue/70 text-white shadow-lg">
                      {t('product.annuaire.sidebar.buy_now')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                    <Shield className="w-3 h-3" /> {t('product.annuaire.sidebar.secure_fast')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">{t('product.annuaire.sidebar.info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {t('product.annuaire.sidebar.last_update')}: {lastUpdate.toLocaleDateString('fr-FR')}</div>
                <div className="flex items-center gap-2"><Download className="w-4 h-4" /> {t('product.annuaire.sidebar.export_on_request')}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {t('product.annuaire.sidebar.sn_priority')}</div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}
