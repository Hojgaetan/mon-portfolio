// @ts-nocheck
// @ts-ignore
declare const Deno: any;

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { verifyWebhookSignature, getIntechEnv } from "../_shared/intechClient.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const ACCESS_PRICE_XOF = Number(Deno.env.get("ACCESS_PRICE_XOF") || 5000);
const ACCESS_DURATION_MS = Number(Deno.env.get("ACCESS_DURATION_MS") || 60 * 60 * 1000); // 1h

function isSuccess(body: any): boolean {
  const status = (body?.status || body?.data?.status || body?.transactionStatus || body?.data?.transactionStatus || "").toString().toUpperCase();
  const code = (body?.code || body?.data?.code || body?.errorCode || body?.data?.errorCode || "").toString().toUpperCase();
  // Large net to catch common success markers seen in various APIs
  const okStatus = ["SUCCESS", "SUCCESSFUL", "COMPLETED", "APPROVED", "PAID"].includes(status);
  const okCode = ["00", "0", "SUCCESS"].includes(code);
  return okStatus || okCode;
}

function parseUserIdFromExtId(extId: string | undefined | null): string | null {
  if (!extId) return null;
  // Expected format: ACCESSPASS_<userId>_<timestamp>
  const parts = extId.split("_");
  if (parts.length >= 3 && parts[0] === "ACCESSPASS") {
    return parts[1] || null;
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return new Response("Missing Supabase admin env", { status: 500 });

  // Optional webhook signature verification if secret present
  const { callbackSecretPresent } = getIntechEnv();
  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch {
    return new Response(JSON.stringify({ ok: false, reason: "invalid_body" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  if (callbackSecretPresent) {
    const signature = req.headers.get("x-intech-signature")
      || req.headers.get("x-signature")
      || req.headers.get("signature")
      || req.headers.get("intech-signature")
      || "";
    if (signature) {
      const ok = await verifyWebhookSignature(rawBody, signature);
      if (!ok) {
        return new Response(JSON.stringify({ ok: false, reason: "invalid_signature" }), { status: 401, headers: { "Content-Type": "application/json" } });
      }
    }
  }

  let payload: any = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ ok: false, reason: "invalid_json" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  // Attempt to read externalTransactionId across shapes
  const externalTransactionId = payload?.externalTransactionId || payload?.data?.externalTransactionId || payload?.transactionId || payload?.data?.transactionId;
  const userId = parseUserIdFromExtId(externalTransactionId);

  // Only handle access pass purchases
  if (!userId) {
    // Not our purchase; acknowledge to avoid retries
    return new Response(JSON.stringify({ ok: true, ignored: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    if (!isSuccess(payload)) {
      // You might log failures in a table later; just ack
      return new Response(JSON.stringify({ ok: true, received: true, status: payload?.status || null }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const amount = Number(payload?.amount || payload?.data?.amount || ACCESS_PRICE_XOF);
    const currency = (payload?.currency || payload?.data?.currency || "XOF").toString();

    // If there is already an active pass, extend it or leave as-is; here we choose to create a new pass starting now
    const expiresAt = new Date(Date.now() + ACCESS_DURATION_MS).toISOString();

    // Optional: ensure there's no overlapping active pass; if exists, we can update expiry instead of insert
    const { data: existing } = await supabase
      .from("access_pass")
      .select("id, expires_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("access_pass")
        .update({ expires_at: expiresAt })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("access_pass")
        .insert({ user_id: userId, amount, currency, status: "active", expires_at: expiresAt });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
