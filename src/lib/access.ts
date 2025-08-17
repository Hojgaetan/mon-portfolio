import { supabase } from "@/integrations/supabase/client";

export type AccessPass = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "active" | "expired" | "revoked";
  expires_at: string;
  created_at: string;
};

const ACCESS_PRICE_XOF = 5000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function getActiveAccessPass(): Promise<AccessPass | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("access_pass")
    .select("id,user_id,amount,currency,status,expires_at,created_at")
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
