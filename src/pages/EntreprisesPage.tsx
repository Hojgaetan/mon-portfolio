import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
// Paiement Intech
import { startAccessPurchase, pollAccessActivation, type OperatorCode } from "@/lib/access";

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

export default function EntreprisesPage() {
  const [activeTab, setActiveTab] = useState("hello");
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [entreprises, setEntreprises] = useState<EntrepriseRow[]>([]);
  const [q, setQ] = useState("");
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
  // Masquage dynamique anti-capture pour non-admin
  const [isObscured, setIsObscured] = useState<boolean>(true);
  const obscurityTimer = useRef<number | null>(null);

  // Etat du dialogue d’achat
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerOperator, setBuyerOperator] = useState<OperatorCode>("WAVE_SN_API_CASH_IN");
  const [purchasing, setPurchasing] = useState(false);
  const [pendingExtId, setPendingExtId] = useState<string | null>(null);
  const [pendingDeepLink, setPendingDeepLink] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

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
        // Ne pas ouvrir automatiquement d’autres passerelles ici
      } else if (res.authLinkUrl) {
        setPendingDeepLink(res.authLinkUrl);
      } else {
        setPendingDeepLink(null);
      }
      toast("Paiement initié. Terminez-le dans l’application opérateur.");

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
        toast.error("Paiement indisponible: fonction Edge non joignable. Déployez ‘intech-operation’ et vérifiez les secrets.");
      } else {
        toast.error(msg || "Impossible d’initier le paiement.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  // Liste filtrée pour l’affichage
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
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
  }, [q, entreprises, selectedCategory]);

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

  // Voile quand l’onglet est caché (Page Visibility API)
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

  // Révocation si tentative d’impression
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

  // Masquer le contenu (blur) par défaut et ne l'afficher nettement que brièvement après interaction (non-admin)
  useEffect(() => {
    if (isAdmin) {
      setIsObscured(false);
      return;
    }
    setIsObscured(true);
    const onInteract = () => {
      setIsObscured(false);
      if (obscurityTimer.current) window.clearTimeout(obscurityTimer.current);
      obscurityTimer.current = window.setTimeout(() => setIsObscured(true), 1200);
    };
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "mousedown", "touchstart", "wheel"];
    events.forEach((ev) => window.addEventListener(ev, onInteract, { passive: true } as any));
    return () => {
      if (obscurityTimer.current) window.clearTimeout(obscurityTimer.current);
      events.forEach((ev) => window.removeEventListener(ev, onInteract as any));
    };
  }, [isAdmin]);

  useEffect(() => {
    // Rediriger vers le paiement manuel si /annuaire?buy=1 et pas d'accès
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
        <div className="container mx-auto max-w-5xl p-6">Vérification de l'accès...</div>
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
              <CardTitle>Annuaire des entreprises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Connectez-vous pour acheter un accès et consulter la liste des entreprises.</p>
              <Button asChild>
                <Link to="/auth">Se connecter</Link>
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
              <CardTitle>Annuaire des entreprises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                L'accès à la liste des entreprises est réservé aux membres ayant un pass actif.
                Durée: 1 heure. Tarif: {getAccessPrice().toLocaleString("fr-FR")} F CFA.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button asChild>
                  <Link to="/paiement-manuel">Acheter l'accès</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/auth">Changer de compte</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/produit/annuaire">Voir la page produit</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: le contenu est consultable uniquement sur ce site. Le téléchargement et la copie sont limités.
              </p>
            </CardContent>
          </Card>

          {/* Dialogue d’achat conservé mais non déclenché */}
          <Dialog open={purchaseOpen} onOpenChange={(o)=>{ if(!purchasing) setPurchaseOpen(o); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Acheter l’accès</DialogTitle>
                <DialogDescription>
                  Montant: {getAccessPrice().toLocaleString("fr-FR")} F CFA — choisissez votre opérateur et entrez votre numéro.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Opérateur</label>
                    <Select value={buyerOperator} onValueChange={(v)=>setBuyerOperator(v as OperatorCode)}>
                      <SelectTrigger><SelectValue placeholder="Opérateur" /></SelectTrigger>
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
                    <label className="text-sm text-muted-foreground">Téléphone</label>
                    <Input placeholder="Ex: 772345678" value={buyerPhone} onChange={(e)=>setBuyerPhone(e.target.value)} />
                  </div>
                </div>
                {pendingDeepLink && (
                  <div className="text-xs text-muted-foreground">
                    Si la fenêtre ne s’est pas ouverte, <a className="underline" href={pendingDeepLink} target="_blank">cliquez ici</a>.
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={closePurchase} disabled={purchasing}>Annuler</Button>
                  <Button onClick={handleConfirmPurchase} disabled={purchasing}>{purchasing ? "Traitement..." : "Payer"}</Button>
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
      <div
        className="container mx-auto max-w-6xl p-4 sm:p-6 space-y-6 relative"
        {...guardProps}
        style={!isAdmin && isObscured ? { filter: "blur(6px) brightness(0.7)" } : undefined}
      >
        {/* Empêcher l'impression */}
        <style>{`@media print { body { display: none !important; } }`}</style>
        {/* Styles responsives pour watermark */}
        <style>{`
          @media (max-width: 640px) { .wm-text { font-size: 12px; } }
          @media (min-width: 641px) { .wm-text { font-size: 16px; } }
        `}</style>

        {/* Watermark répétitif avec email + horodatage */}
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

        {/* Voile quand l’onglet est caché */}
        {hiddenOverlay && (
          <div aria-hidden className="fixed inset-0 z-[70] bg-black/80 text-white flex items-center justify-center text-center p-6">
            <div>
              <div className="text-lg font-semibold">Contenu protégé</div>
              <div className="text-sm opacity-80 mt-1">L’onglet est inactif. Le contenu est masqué pour limiter la capture.</div>
            </div>
          </div>
        )}

        {/* Alerte discrète quand le masquage dynamique est actif (non-admin) */}
        {!isAdmin && isObscured && !hiddenOverlay && (
          <div aria-hidden className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-[65] px-3 py-1.5 rounded bg-black/70 text-white text-xs shadow">
            Déplacez la souris pour afficher brièvement
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Annuaire des entreprises</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
             {isAdmin ? (
               <Badge variant="default">Accès admin</Badge>
             ) : (
               <>
                 {expiresAt && (
                   <Badge variant="outline">
                     Expire le {new Date(expiresAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                   </Badge>
                 )}
                 {countdown && (
                   <Badge variant="secondary">Reste {countdown}</Badge>
                 )}
               </>
             )}
            <div className="w-full sm:w-64">
               <Input
                 placeholder="Rechercher (nom, catégorie, téléphone...)"
                 value={q}
                 onChange={(e) => setQ(e.target.value)}
               />
             </div>
            <div className="w-full sm:w-64">
               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                 <SelectTrigger>
                   <SelectValue placeholder="Catégorie" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Toutes les catégories</SelectItem>
                   {categories.map((c) => (
                     <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>
         </div>

         {loading ? (
           <div>Chargement...</div>
         ) : filtered.length === 0 ? (
           <div className="text-sm text-muted-foreground">Aucune entreprise trouvée.</div>
         ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {filtered.map((e) => (
               <Card key={e.id} className="overflow-hidden cursor-pointer" onClick={() => openDetails(e)}>
                 <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
                      {e.categorie?.nom || 'Sans catégorie'}
                    </span>
                    <Badge variant="outline">{viewCounts[e.id] ?? 0} vues</Badge>
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate text-foreground">
                      {isAdmin ? e.nom : 'Nom masqué — cliquez pour voir'}
                    </CardTitle>
                  </div>
                </CardHeader>
                 <CardContent className="text-sm text-muted-foreground">
                   {isAdmin ? (
                     <div className="space-y-1">
                       {e.telephone && <div>Téléphone: {e.telephone}</div>}
                       {e.adresse && <div>Adresse: {e.adresse}</div>}
                     </div>
                   ) : (
                     'Cliquez pour voir les détails'
                   )}
                 </CardContent>
               </Card>
             ))}
           </div>
         )}

         {/* Détails entreprise en modal */}
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
                   <span className="text-muted-foreground">Téléphone:</span>
                   <span className="break-all">{selected.telephone}</span>
                 </div>
               )}
               {selected?.adresse && (
                 <div className="flex gap-2">
                   <span className="text-muted-foreground">Adresse:</span>
                   <span className="break-words">{selected.adresse}</span>
                 </div>
               )}
               {selected?.site_web && (
                 <div className="flex gap-2 items-center flex-wrap">
                   <span className="text-muted-foreground">Site:</span>
                   <a href={selected.site_web} target="_blank" rel="noreferrer" className="underline break-all">
                     {selected.site_web}
                   </a>
                   {selected.site_web_valide ? (
                     <Badge className="ml-2">Validé</Badge>
                   ) : (
                     <Badge variant="outline" className="ml-2">Non vérifié</Badge>
                   )}
                 </div>
               )}
               <div className="pt-2">
                 <Badge variant="outline">{viewCounts[selected?.id ?? ""] ?? 0} consultations uniques</Badge>
               </div>
             </div>
           </DialogContent>
         </Dialog>

         <p className="text-xs text-muted-foreground">
           Protection: clic droit/copier désactivés, raccourcis impression/enregistrement bloqués, impression cachée.
           Aucune option d'export n'est proposée.
         </p>
       </div>
    </>
  );
}
