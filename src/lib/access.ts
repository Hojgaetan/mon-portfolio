import { supabase } from "@/integrations/supabase/client";
import { createOperation, getTransactionStatus } from "@/lib/intech";

export type AccessPass = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "active" | "expired" | "revoked";
  expires_at: string;
  created_at: string;
};

const ACCESS_PRICE_XOF = 1500; // Prix promotionnel valable 24h
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function getActiveAccessPass(): Promise<AccessPass | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("access_pass")
  .select("id,user_id,amount,currency,status,expires_at,created_at")
  .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("Erreur getActiveAccessPass:", error);
    return null;
  }
  return data as AccessPass | null;
}

// --- Nouvelle intégration paiement Intech pour le pass d’accès ---
export type OperatorCode =
  | "WAVE_SN_API_CASH_IN"
  | "ORANGE_SN_API_CASH_IN"
  | "WIZALL_SN_API_CASH_IN"
  | "FREE_SN_WALLET_CASH_IN"
  | "EXPRESSO_SN_WALLET_CASH_IN";

export type StartAccessPurchaseResult = {
  externalTransactionId: string;
  deepLinkUrl?: string;
  authLinkUrl?: string;
  raw?: unknown;
};

function getFunctionsBaseUrlFromClient(): string | null {
  try {
    const SUPABASE_URL = "https://yavxlxrttdcqbknhxiph.supabase.co"; // repris du client
    const u = new URL(SUPABASE_URL);
    const host = u.hostname; // e.g. yavxlxrttdcqbknhxiph.supabase.co
    const projectRef = host.split(".")[0];
    return `https://${projectRef}.functions.supabase.co`;
  } catch {
    return null;
  }
}

export function generateAccessExternalId(userId: string): string {
  return `ACCESSPASS_${userId}_${Date.now()}`;
}

function normalizeIntlPhone(phone: string): string {
  const raw = String(phone).trim();
  // Si commence déjà par +, laisser tel quel
  if (raw.startsWith("+")) return raw;
  // Supprimer non-digits
  const digits = raw.replace(/\D+/g, "");
  // Cas Sénégal: 9 chiffres -> +221XXXXXXXXX
  if (/^\d{9}$/.test(digits)) return `+221${digits}`;
  // 221 + 9 chiffres -> +221XXXXXXXXX
  if (/^221\d{9}$/.test(digits)) return `+${digits}`;
  // Sinon, si vous avez déjà 11-15 digits, préfixer +
  if (/^\d{11,15}$/.test(digits)) return `+${digits}`;
  // Fallback: renvoyer original
  return raw;
}

export async function startAccessPurchase(opts: { phone: string; operator: OperatorCode; amount?: number; }): Promise<StartAccessPurchaseResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentification requise");
  const extId = generateAccessExternalId(user.id);

  // Utilise le callback edge déployé: /intech-callback
  const fnBase = getFunctionsBaseUrlFromClient();
  const callbackUrl = fnBase ? `${fnBase}/intech-callback` : undefined;

  const amount = Number(opts.amount ?? ACCESS_PRICE_XOF);
  const phone = normalizeIntlPhone(opts.phone);

  const payload = {
    phone,
    amount,
    codeService: opts.operator,
    externalTransactionId: extId,
    ...(callbackUrl ? { callbackUrl } : {}),
    data: {},
  } as const;

  const res = await createOperation(payload);
  const deepLinkUrl = (res as any)?.data?.deepLinkUrl as string | undefined;
  const authLinkUrl = (res as any)?.data?.authLinkUrl as string | undefined;
  return { externalTransactionId: extId, deepLinkUrl, authLinkUrl, raw: res };
}

export async function pollAccessActivation(params: { externalTransactionId: string; timeoutMs?: number; intervalMs?: number; }): Promise<AccessPass | null> {
  const timeoutMs = params.timeoutMs ?? 120000; // 2 min
  const intervalMs = params.intervalMs ?? 3000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    // Vérifier si le pass est actif
    const pass = await getActiveAccessPass();
    if (pass) return pass;
    // Optionnel: consulter statut transaction pour diagnostiquer (non bloquant)
    try {
      await getTransactionStatus(params.externalTransactionId);
    } catch (err) {
      console.debug("pollAccessActivation status error", err);
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return null;
}

// Simulation existante conservée pour debug/local
export async function purchaseAccessPass(): Promise<AccessPass> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentification requise");

  // Ici vous pouvez intégrer un vrai paiement. Nous simulons un paiement réussi.
  const expiresAt = new Date(Date.now() + ONE_HOUR_MS).toISOString();

  const { data, error } = await supabase
    .from("access_pass")
    .insert({
      user_id: user.id,
      amount: ACCESS_PRICE_XOF,
      currency: "XOF",
      status: "active",
      expires_at: expiresAt,
    })
    .select("id,user_id,amount,currency,status,expires_at,created_at")
    .single();

  if (error) throw error;
  return data as AccessPass;
}

export function getAccessPrice(): number {
  return ACCESS_PRICE_XOF;
}

export function getPromotionEndTime(): Date {
  // Promotion valable 24h à partir de maintenant
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export function isPromotionActive(): boolean {
  // Pour cet exemple, la promotion est toujours active pendant 24h
  // Vous pouvez ajuster cette logique selon vos besoins
  return true;
}

// Révoque immédiatement le pass actif (utilisé lors d’une tentative de capture)
export async function revokeActivePass(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: pass } = await supabase
    .from("access_pass")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pass?.id) return false;

  const { error } = await supabase
    .from("access_pass")
    .update({ status: "revoked", expires_at: new Date().toISOString() })
    .eq("id", pass.id);

  return !error;
}
