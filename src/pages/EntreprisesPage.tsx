import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getActiveAccessPass, getAccessPrice } from "@/lib/access";
import { revokeActivePass } from "@/lib/access";
import { toast } from "sonner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
// Paiement Intech
import { startAccessPurchase, pollAccessActivation, type OperatorCode } from "@/lib/access";
// Nouveaux imports UI
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ArrowUpDown, Eye, Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, Download, ExternalLink, Globe, Phone, MapPin, Building, Users, Grid3X3, List, Star } from "lucide-react";
import { useExcelExport } from "@/hooks/useExcelExport";
import { Separator } from "@/components/ui/separator";

interface EntrepriseRow {
  id: string;
  nom: string;
  telephone: string | null;
  adresse: string | null;
  site_web: string | null;
  site_web_valide: boolean | null;
  created_at: string;
  categorie_id: string | null;
  categorie?: { id: string | null; nom: string | null } | null;
}
interface Category { id: string; nom: string; }

type SortKey = "recent" | "name" | "category" | "views";

export default function EntreprisesPage() {
  const [activeTab, setActiveTab] = useState("hello");
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [entreprises, setEntreprises] = useState<EntrepriseRow[]>([]);
  const [q, setQ] = useState("");
  // Recherche avec debounce
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [userId, setUserId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hiddenOverlay, setHiddenOverlay] = useState<boolean>(false);
  const [revoking, setRevoking] = useState<boolean>(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<EntrepriseRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // Etat du dialogue d'achat
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerOperator, setBuyerOperator] = useState<OperatorCode>("WAVE_SN_API_CASH_IN");
  const [purchasing, setPurchasing] = useState(false);
  const [pendingExtId, setPendingExtId] = useState<string | null>(null);
  const [pendingDeepLink, setPendingDeepLink] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { exportToExcel, isExporting } = useExcelExport();

  // Debounce search input
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(id);
  }, [q]);

  // Réinitialiser la page lors d'un changement de filtres/recherche/tri
  useEffect(() => { setPage(1); }, [debouncedQ, selectedCategory, sortBy]);

  const formattedDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch { return ""; }
  };

  // Définir fetchEntreprises mémorisé pour les dépendances de hooks
  const fetchEntreprises = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("entreprise")
        .select(`
          id, nom, telephone, adresse, site_web, site_web_valide, created_at, categorie_id,
          categorie ( id, nom )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const raw = (data ?? []) as any[];
      const rows: EntrepriseRow[] = raw.map((r) => ({
        id: r.id,
        nom: r.nom,
        telephone: r.telephone,
        adresse: r.adresse,
        site_web: r.site_web,
        site_web_valide: r.site_web_valide,
        created_at: r.created_at,
        categorie_id: r.categorie_id,
        categorie: Array.isArray(r.categorie) ? (r.categorie[0] ?? null) : (r.categorie ?? null),
      }));
      setEntreprises(rows);
      // Charger les compteurs pour les entreprises affichées
      const ids = rows.map((e) => e.id);
      await fetchViewCounts(ids);
      // Charger les catégories (liste pour le filtre)
      const { data: cats } = await supabase
        .from("categorie")
        .select("id, nom")
        .order("nom");
      if (cats) setCategories(cats as Category[]);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Accès refusé. Achetez un pass pour consulter la liste.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Achat via Intech: ouvertures/confirmations
  const openPurchase = () => setPurchaseOpen(true);
  const closePurchase = () => { if (!purchasing) setPurchaseOpen(false); };
  const handleConfirmPurchase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.info("Veuillez vous connecter.");
        return;
      }
      if (!buyerPhone) {
        toast.info("Entrez votre numéro de téléphone.");
        return;
      }
      setPurchasing(true);
      const res = await startAccessPurchase({ phone: buyerPhone, operator: buyerOperator, amount: getAccessPrice() });
      setPendingExtId(res.externalTransactionId);
      if (res.deepLinkUrl) {
        setPendingDeepLink(res.deepLinkUrl);
        // Ne pas ouvrir automatiquement d'autres passerelles ici
      } else if (res.authLinkUrl) {
        setPendingDeepLink(res.authLinkUrl);
      } else {
        setPendingDeepLink(null);
      }
      toast("Paiement initié. Terminez-le dans l'application opérateur.");

      const pass = await pollAccessActivation({ externalTransactionId: res.externalTransactionId, timeoutMs: 180000, intervalMs: 3000 });
      if (pass) {
        setHasAccess(true);
        setExpiresAt(pass.expires_at);
        setPurchaseOpen(false);
        await fetchEntreprises();
        toast.success("Accès activé pour 1 heure.");
      } else {
        toast.error("Paiement non confirmé à temps. Réessayez.");
      }
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      if (msg && msg.includes("Failed to send a request to the Edge Function")) {
        toast.error("Paiement indisponible: fonction Edge non joignable. Déployez 'intech-operation' et vérifiez les secrets.");
      } else {
        toast.error(msg || "Impossible d'initier le paiement.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  // Liste filtrée pour l'affichage
  const filtered = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    const base = selectedCategory === "all"
      ? entreprises
      : entreprises.filter((e) => e.categorie_id === selectedCategory);
    if (!term) return base;
    return base.filter((e) =>
      [
        e.nom,
        e.telephone || "",
        e.adresse || "",
        e.site_web || "",
        e.categorie?.nom || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [debouncedQ, entreprises, selectedCategory]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "name":
        arr.sort((a, b) => (a.nom || "").localeCompare(b.nom || "", 'fr'));
        break;
      case "category":
        arr.sort((a, b) => (a.categorie?.nom || "").localeCompare(b.categorie?.nom || "", 'fr'));
        break;
      case "views":
        arr.sort((a, b) => (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0));
        break;
      case "recent":
      default:
        arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return arr;
  }, [filtered, sortBy, viewCounts]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      if (!user) {
        setCheckingAccess(false);
        return;
      }
      // Vérifier admin
      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      const admin = !!adminRow;
      setIsAdmin(admin);

      if (admin) {
        setHasAccess(true);
        setExpiresAt(null);
        setCheckingAccess(false);
        await fetchEntreprises();
        setPurchaseOpen(false);
        return;
      }

      const pass = await getActiveAccessPass();
      setHasAccess(!!pass);
      setExpiresAt(pass?.expires_at ?? null);
      setCheckingAccess(false);
      if (pass) {
        await fetchEntreprises();
        setPurchaseOpen(false);
      } else {
        setPurchaseOpen(true);
      }
    };
    init();
  }, [fetchEntreprises]);

  useEffect(() => {
    // Récupère aussi l'email pour le watermark
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    })();
  }, []);

  // Révocation immédiate du pass (tentative de capture/impression)
  const expirePassNow = useCallback(async (_reason: string) => {
    if (isAdmin || revoking) return;
    try {
      setRevoking(true);
      await revokeActivePass();
    } finally {
      setHasAccess(false);
      setEntreprises([]);
      setExpiresAt(null);
      setCountdown(null);
      setRevoking(false);
      toast.error("Accès révoqué: tentative de capture détectée.");
    }
  }, [isAdmin, revoking]);

  // Voile quand l'onglet est caché (Page Visibility API)
  useEffect(() => {
    const onVis = () => setHiddenOverlay(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Voile dès que la fenêtre perd le focus, retiré au retour du focus
  useEffect(() => {
    const onBlur = () => setHiddenOverlay(true);
    const onFocus = () => setHiddenOverlay(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Révocation si tentative d'impression
  useEffect(() => {
    const onBeforePrint = () => expirePassNow('print');
    (window as any).addEventListener('beforeprint', onBeforePrint);
    return () => {
      (window as any).removeEventListener('beforeprint', onBeforePrint);
    };
  }, [expirePassNow]);

  const fetchViewCounts = async (ids: string[]) => {
    if (ids.length === 0) return;
    const { data, error } = await supabase
      .from("entreprise_view")
      .select("entreprise_id")
      .in("entreprise_id", ids);
    if (error) return;
    const counts: Record<string, number> = {};
    (data as { entreprise_id: string }[]).forEach((row) => {
      counts[row.entreprise_id] = (counts[row.entreprise_id] || 0) + 1;
    });
    setViewCounts(counts);
  };

  const refreshOneCount = async (entrepriseId: string) => {
    const { count } = await supabase
      .from("entreprise_view")
      .select("id", { count: "exact", head: true })
      .eq("entreprise_id", entrepriseId);
    if (typeof count === "number") {
      setViewCounts((prev) => ({ ...prev, [entrepriseId]: count }));
    }
  };

  const openDetails = async (e: EntrepriseRow) => {
    setSelected(e);
    setDetailsOpen(true);
    // Enregistrer la consultation unique
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("entreprise_view")
        .upsert({ entreprise_id: e.id, user_id: user.id }, {
          onConflict: "entreprise_id,user_id",
          ignoreDuplicates: true,
        });
      await refreshOneCount(e.id);
    } catch (err) {
      console.warn("Erreur enregistrement vue:", err);
    }
  };

  // Protection basique de consultation: pas de téléchargement, pas de clic droit, pas de sélection
  const guardProps: React.HTMLAttributes<HTMLDivElement> = {
    onContextMenu: (e) => e.preventDefault(),
    onCopy: (e) => e.preventDefault(),
    onKeyDown: (e) => {
      const key = e.key.toLowerCase();
      // Blocage impression/enregistrement/copier
      if ((e.ctrlKey || (e as any).metaKey) && ["p", "s", "c"].includes(key)) {
        e.preventDefault();
        if (key === 'p') expirePassNow('print');
        return;
      }
      // Détection touche Impr. écran (Windows)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        expirePassNow('screenshot');
        return;
      }
      // Détection raccourcis macOS: Cmd+Shift+3/4/5
      if ((e as any).metaKey && (e as any).shiftKey && ["3", "4", "5"].includes(key)) {
        e.preventDefault();
        expirePassNow('screenshot');
        return;
      }
    },
    style: { userSelect: "none" as const },
  };

  // Rafraîchit automatiquement quand le pass expire (pas pour admin)
  useEffect(() => {
    if (!expiresAt || isAdmin) return;
    const expiryMs = new Date(expiresAt).getTime();
    const now = Date.now();
    const delay = Math.max(0, expiryMs - now);

    const id = window.setTimeout(async () => {
      try {
        const pass = await getActiveAccessPass();
        if (!pass) {
          setHasAccess(false);
          setEntreprises([]);
          setExpiresAt(null);
          toast.info("Votre pass a expiré. Renouvelez pour continuer.");
        } else {
          setExpiresAt(pass.expires_at);
        }
      } catch {
        setHasAccess(false);
        setEntreprises([]);
        setExpiresAt(null);
      }
    }, delay);

    return () => clearTimeout(id);
  }, [expiresAt, isAdmin]);

  // Compte à rebours visuel mm:ss (non-admin seulement)
  useEffect(() => {
    if (!expiresAt || isAdmin) {
      setCountdown(null);
      return;
    }
    const expiryMs = new Date(expiresAt).getTime();
    const format = (ms: number) => {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };
    const update = () => {
      const remaining = expiryMs - Date.now();
      setCountdown(format(remaining));
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, isAdmin]);

  useEffect(() => {
    document.title = "Annuaire des entreprises";
  }, []);

  // Rediriger vers le paiement manuel si /annuaire?buy=1 et pas d'accès
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("buy") === "1" && userId && !hasAccess && !checkingAccess) {
      window.history.replaceState({}, "", "/annuaire");
      navigate("/paiement-manuel", { replace: true });
    }
  }, [location.search, userId, hasAccess, checkingAccess, navigate]);

  if (checkingAccess) {
    return (
      <>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="container mx-auto max-w-5xl p-6">{t('annuaire.loading')}</div>
      </>
    );
  }

  if (!userId) {
    return (
      <>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="container mx-auto max-w-2xl p-6 space-y-4 text-center">
          <Card>
            <CardHeader>
              <CardTitle>{t('annuaire.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{t('annuaire.require_login')}</p>
              <Button asChild>
                <Link to="/auth">{t('auth.login')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="container mx-auto max-w-2xl p-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('annuaire.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                {t('annuaire.access_restricted')} {t('annuaire.duration')} {t('annuaire.price_label')} {getAccessPrice().toLocaleString("fr-FR")} F CFA.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button asChild>
                  <Link to="/paiement-manuel">{t('annuaire.btn.buy_access')}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/auth">{t('annuaire.btn.switch_account')}</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/produit/annuaire">{t('annuaire.btn.view_product')}</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('annuaire.note_protection')}
              </p>
            </CardContent>
          </Card>

          {/* Dialogue d'achat conservé mais non déclenché */}
          <Dialog open={purchaseOpen} onOpenChange={(o)=>{ if(!purchasing) setPurchaseOpen(o); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('annuaire.purchase.title')}</DialogTitle>
                <DialogDescription>
                  {t('annuaire.purchase.amount')}: {getAccessPrice().toLocaleString("fr-FR")} F CFA — {t('annuaire.purchase.choose_operator')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">{t('annuaire.purchase.operator')}</label>
                    <Select value={buyerOperator} onValueChange={(v)=>setBuyerOperator(v as OperatorCode)}>
                      <SelectTrigger><SelectValue placeholder={t('annuaire.purchase.operator_placeholder')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WAVE_SN_API_CASH_IN">WAVE</SelectItem>
                        <SelectItem value="ORANGE_SN_API_CASH_IN">Orange Money</SelectItem>
                        <SelectItem value="WIZALL_SN_API_CASH_IN">Wizall</SelectItem>
                        <SelectItem value="FREE_SN_WALLET_CASH_IN">Free Money</SelectItem>
                        <SelectItem value="EXPRESSO_SN_WALLET_CASH_IN">Expresso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">{t('annuaire.purchase.phone')}</label>
                    <Input placeholder={t('annuaire.purchase.phone_placeholder')} value={buyerPhone} onChange={(e)=>setBuyerPhone(e.target.value)} />
                  </div>
                </div>
                {pendingDeepLink && (
                  <div className="text-xs text-muted-foreground">
                    {t('annuaire.purchase.pending_info')} <a className="underline" href={pendingDeepLink} target="_blank">{t('annuaire.purchase.click_here')}</a>.
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={closePurchase} disabled={purchasing}>{t('annuaire.btn.cancel')}</Button>
                  <Button onClick={handleConfirmPurchase} disabled={purchasing}>{purchasing ? t('annuaire.purchase.processing') : t('annuaire.btn.pay')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="container mx-auto max-w-6xl p-0 sm:p-0 relative" {...guardProps}>
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent-sky/5 border-b">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          <div className="relative px-4 sm:px-6 py-8 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
              <Badge className="w-fit bg-accent-sky/10 text-accent-sky border-accent-sky/20">📚 {t('annuaire.hero.badge')}</Badge>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('annuaire.hero.title')}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">{t('annuaire.hero.subtitle')}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-2">
                <div className="text-xl font-bold text-accent-blue">{entreprises.length}</div>
                <div className="text-xs text-muted-foreground">{t('annuaire.stats.companies')}</div>
              </div>
              <div className="text-center p-2">
                <div className="text-xl font-bold text-accent-green">{categories.length}</div>
                <div className="text-xs text-muted-foreground">{t('annuaire.stats.categories')}</div>
              </div>
              <div className="text-center p-2">
                <div className="text-xl font-bold text-accent-sky">{expiresAt ? countdown ?? "—" : "—"}</div>
                <div className="text-xs text-muted-foreground">{t('annuaire.stats.time_left')}</div>
              </div>
              <div className="text-center p-2">
                <div className="text-xl font-bold text-accent-yellow">{new Date().getFullYear()}</div>
                <div className="text-xs text-muted-foreground">{t('annuaire.stats.year')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar collante */}
        <div className="sticky top-12 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex-1 min-w-[220px] relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder={t('annuaire.search.placeholder')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="w-[200px]">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('annuaire.filter.category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('annuaire.filter.category') === 'Catégorie' ? 'Toutes les catégories' : 'All categories'}</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Select value={sortBy} onValueChange={(v)=>setSortBy(v as SortKey)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('annuaire.sort.by')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">{t('annuaire.sort.recent')}</SelectItem>
                    <SelectItem value="name">{t('annuaire.sort.name')}</SelectItem>
                    <SelectItem value="category">{t('annuaire.sort.category')}</SelectItem>
                    <SelectItem value="views">{t('annuaire.sort.views')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" onClick={() => { setQ(""); setSelectedCategory("all"); setSortBy("recent"); }}>
                {t('annuaire.reset')}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const exportData = paged.map(e => ({
                    'Nom': e.nom,
                    'Téléphone': e.telephone || '',
                    'Adresse': e.adresse || '',
                    'Site Web': e.site_web || '',
                    'Site Web Valide': e.site_web_valide ? 'Oui' : 'Non',
                    'Catégorie': e.categorie?.nom || 'Aucune',
                    'Date de création': formattedDate(e.created_at),
                    'Vues': viewCounts[e.id] ?? 0
                  }));
                  exportToExcel(exportData, {
                    filename: 'entreprises_annuaire',
                    sheetName: 'Entreprises'
                  });
                }}
                disabled={isExporting || paged.length === 0}
              >
                <Download className="w-4 h-4 mr-1" />
                {isExporting ? 'Export...' : 'Excel'}
              </Button>
            </div>
          </div>
        </div>

        {/* Corps et overlay */}
        <div className="px-4 sm:px-6 py-6 space-y-6">
          {/* Watermark + overlay */}
          {/* Styles responsives pour watermark */}
          <style>{`
            @media (max-width: 640px) { .wm-text { font-size: 12px; } }
            @media (min-width: 641px) { .wm-text { font-size: 16px; } }
          `}</style>

          {/* Watermark répétitif */}
          <div aria-hidden className="fixed inset-0 pointer-events-none select-none z-[60]" style={{ opacity: 0.12 }}>
            <div className="absolute inset-0" style={{ transform: 'rotate(-30deg)' }}>
              {Array.from({ length: 8 }).map((_, r) => (
                <div key={r} className="flex gap-24" style={{ position: 'absolute', top: `${r * 180}px`, left: 0 }}>
                  {Array.from({ length: 8 }).map((_, c) => (
                    <span key={c} className="wm-text font-bold" style={{ color: '#000' }}>
                      {userEmail ?? 'Utilisateur'} · {new Date().toLocaleDateString('fr-FR')}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Voile quand l'onglet est caché */}
          {hiddenOverlay && (
            <div aria-hidden className="fixed inset-0 z-[70] bg-black/80 text-white flex items-center justify-center text-center p-6">
              <div>
                <div className="text-lg font-semibold">{t('annuaire.protected.title')}</div>
                <div className="text-sm opacity-80 mt-1">{t('annuaire.protected.subtitle')}</div>
              </div>
            </div>
          )}

          {loading ? (
            // ...existing skeleton grid...
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-12">
              <AlertCircle className="w-6 h-6 text-accent-yellow" />
              <div className="text-sm text-muted-foreground">{t('annuaire.empty')}</div>
              <Button variant="outline" size="sm" onClick={() => { setQ(""); setSelectedCategory("all"); setSortBy("recent"); }}>{t('annuaire.reset_filters')}</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paged.map((e) => (
                  <Card key={e.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition" onClick={() => openDetails(e)}>
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
                          {e.categorie?.nom || '—'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-accent-sky">
                          <Eye className="w-3 h-3" />{viewCounts[e.id] ?? 0}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate text-foreground">
                          {isAdmin ? e.nom : t('annuaire.card.hidden_name')}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{t('annuaire.card.added_on')} {formattedDate(e.created_at)}</div>
                      {e.site_web ? (
                        <div className="flex items-center gap-2">
                          <span>{t('annuaire.card.website')}</span>
                          <span className="truncate max-w-[180px]">{e.site_web}</span>
                          {e.site_web_valide ? (
                            <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20">{t('annuaire.card.verified')}</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-accent-red/10 text-accent-red border-accent-red/20">{t('annuaire.card.site_inaccessible')}</Badge>
                          )}
                        </div>
                      ) : (
                        <div><Badge variant="outline" className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20">{t('annuaire.card.no_website')}</Badge></div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                  <ChevronLeft className="w-4 h-4" /> {t('pagination.prev')}
                </Button>
                <div className="text-sm text-muted-foreground">Page {page} / {totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  {t('pagination.next')} <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}

          {/* Détails modal */}
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{selected?.nom}</DialogTitle>
                {selected?.categorie?.nom && (
                  <DialogDescription>Catégorie: {selected.categorie.nom}</DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-2 text-sm">
                {selected?.telephone && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">{t('annuaire.card.phone')}:</span>
                    <span className="break-all">{selected.telephone}</span>
                  </div>
                )}
                {selected?.adresse && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">{t('annuaire.card.address')}:</span>
                    <span className="break-words">{selected.adresse}</span>
                  </div>
                )}
                {selected?.site_web && (
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-muted-foreground">{t('annuaire.card.website')}</span>
                    <a href={selected.site_web} target="_blank" rel="noreferrer" className="underline break-all">
                      {selected.site_web}
                    </a>
                    {selected.site_web_valide ? (
                      <Badge className="ml-2 bg-accent-green/10 text-accent-green border-accent-green/20">{t('annuaire.card.verified')}</Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 bg-accent-red/10 text-accent-red border-accent-red/20">{t('annuaire.card.site_inaccessible')}</Badge>
                    )}
                  </div>
                )}
                <div className="pt-2">
                  <Badge variant="outline" className="bg-accent-sky/10 text-accent-sky border-accent-sky/20">{viewCounts[selected?.id ?? ""] ?? 0} {t('annuaire.card.unique_views')}</Badge>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <p className="text-xs text-muted-foreground">
            {t('annuaire.note_protection')}
          </p>
        </div>
      </div>
    </>
  );
}
